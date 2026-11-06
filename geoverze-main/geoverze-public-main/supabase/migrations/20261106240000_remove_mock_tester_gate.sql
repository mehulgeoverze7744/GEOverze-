-- ============================================================
-- Migration: 20261106240000_remove_mock_tester_gate
--
-- Purpose:
--   Remove the mock_testers allowlist guard from begin_mock_subscription,
--   confirm_mock_subscription, and cancel_mock_subscription.
--
-- Why:
--   The tester allowlist was added as defence-in-depth, but it
--   blocks friends/testers who have not been manually added to the
--   mock_testers table via the SQL editor.  The correct access
--   control for mock payments is the VITE_MOCK_PAYMENTS /
--   MOCK_PAYMENTS_ENABLED server-side environment variable — only
--   the site admin can set Vercel env vars, so that is the
--   authoritative gate.  Any signed-in user may use mock payments
--   when the environment flag is enabled.
--
-- What is kept:
--   • mock_testers table and RLS (retained as reference data).
--   • get_my_tester_status() RPC (retained; no longer gates checkout).
--   • All duplicate-prevention, idempotency, and is_mock=true
--     labelling logic is unchanged.
--   • Authentication guard (auth.uid() IS NULL → reject) stays.
-- ============================================================

-- ── 1. begin_mock_subscription (no tester gate) ───────────────────────────
DROP FUNCTION IF EXISTS public.begin_mock_subscription(TEXT, TEXT, BIGINT, BIGINT, BIGINT, TEXT);
CREATE FUNCTION public.begin_mock_subscription(
  p_plan_tier           TEXT,
  p_billing_interval    TEXT,
  p_charge_amount_minor BIGINT,
  p_base_amount_minor   BIGINT,
  p_gst_amount_minor    BIGINT,
  p_idempotency_key     TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id           UUID := auth.uid();
  v_sub_id            UUID;
  v_period_end        TIMESTAMPTZ;
  v_price_id          UUID;
  v_plan_instance_id  UUID;
  v_provider_plan_id  TEXT;
  v_event_id          UUID;
  v_snapshot_id       UUID;
  v_event_payload     JSONB;
  v_event_sha256      TEXT;
BEGIN
  -- Auth guard — always required
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- NOTE: tester allowlist check intentionally removed.
  --   Gate is VITE_MOCK_PAYMENTS / MOCK_PAYMENTS_ENABLED in Vercel env vars.

  -- Validate inputs
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE tier = p_plan_tier AND active = true) THEN
    RAISE EXCEPTION 'Unknown or inactive plan: %', p_plan_tier USING ERRCODE = 'P0002';
  END IF;
  IF p_billing_interval NOT IN ('monthly', 'annual') THEN
    RAISE EXCEPTION 'Invalid billing interval: %', p_billing_interval USING ERRCODE = 'P0003';
  END IF;
  IF p_charge_amount_minor <= 0 THEN
    RAISE EXCEPTION 'Charge amount must be positive' USING ERRCODE = 'P0004';
  END IF;

  -- Idempotency: return existing pending if key matches
  SELECT us.id INTO v_sub_id
  FROM public.user_subscriptions us
  WHERE us.user_id = v_user_id
    AND us.status = 'pending'
    AND us.provider_name = 'mock'
    AND (us.metadata->>'idempotency_key') = p_idempotency_key
  LIMIT 1;
  IF v_sub_id IS NOT NULL THEN
    RETURN json_build_object('subscription_id', v_sub_id, 'mock_session_id', 'mock_' || v_sub_id::TEXT);
  END IF;

  -- Case A: same plan already active → return existing (confirm will idempotent-succeed)
  SELECT us.id INTO v_sub_id
  FROM public.user_subscriptions us
  WHERE us.user_id = v_user_id
    AND us.plan_tier = p_plan_tier
    AND us.billing_interval = p_billing_interval
    AND us.status IN ('active', 'trialing', 'past_due')
    AND us.provider_name = 'mock'
  LIMIT 1;
  IF v_sub_id IS NOT NULL THEN
    RETURN json_build_object('subscription_id', v_sub_id, 'mock_session_id', 'mock_' || v_sub_id::TEXT);
  END IF;

  -- Case B: real (non-mock) active subscription — refuse override
  IF EXISTS (
    SELECT 1 FROM public.user_subscriptions
    WHERE user_id = v_user_id
      AND status IN ('active', 'trialing', 'past_due')
      AND COALESCE(provider_name, '') != 'mock'
  ) THEN
    RAISE EXCEPTION 'A real payment subscription is already active. Use the billing page to manage it.' USING ERRCODE = 'P0011';
  END IF;

  -- Case C: active mock subscription for a DIFFERENT plan (plan-change) — cancel old
  UPDATE public.user_subscriptions
  SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
  WHERE user_id = v_user_id
    AND status IN ('active', 'trialing', 'past_due')
    AND provider_name = 'mock';

  -- Cancel any stale pending mock subscriptions
  UPDATE public.user_subscriptions
  SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
  WHERE user_id = v_user_id AND status = 'pending' AND provider_name = 'mock';

  -- Resolve mock plan instance
  SELECT bppi.id, bpp.id, bppi.provider_plan_id
  INTO v_plan_instance_id, v_price_id, v_provider_plan_id
  FROM public.billing_provider_plan_instances bppi
  JOIN public.billing_provider_prices bpp ON bpp.id = bppi.billing_provider_price_id
  WHERE bppi.provider = 'mock'
    AND bpp.provider = 'mock'
    AND bpp.plan_tier = p_plan_tier
    AND bpp.billing_interval = p_billing_interval
    AND bpp.active = true
  LIMIT 1;
  IF v_plan_instance_id IS NULL THEN
    RAISE EXCEPTION 'No mock plan configured for % %. Run the mock infrastructure migration.', p_plan_tier, p_billing_interval USING ERRCODE = 'P0010';
  END IF;

  v_period_end := NOW() + CASE p_billing_interval WHEN 'annual' THEN INTERVAL '1 year' ELSE INTERVAL '1 month' END;

  -- Create pending subscription
  INSERT INTO public.user_subscriptions (
    user_id, plan_tier, billing_interval, status, provider_name,
    started_at, current_period_start, current_period_end, metadata
  ) VALUES (
    v_user_id, p_plan_tier, p_billing_interval, 'pending', 'mock',
    NOW(), NOW(), v_period_end,
    jsonb_build_object('idempotency_key', p_idempotency_key, 'is_mock', true, 'created_at', NOW()::TEXT)
  ) RETURNING id INTO v_sub_id;

  -- Webhook event record
  v_event_payload := jsonb_build_object(
    'mock', true, 'subscription_id', v_sub_id::TEXT,
    'plan_tier', p_plan_tier, 'billing_interval', p_billing_interval,
    'charge_amount_minor', p_charge_amount_minor
  );
  v_event_sha256 := encode(sha256((v_sub_id::TEXT || '_mock_pending')::bytea), 'hex');
  INSERT INTO public.billing_webhook_events (
    provider, provider_event_id, event_type, normalized_event_type,
    provider_subscription_id, payload, payload_sha256,
    processing_status, subscription_id, metadata
  ) VALUES (
    'mock', 'mock_evt_pending_' || v_sub_id::TEXT,
    'subscription.mock.pending', 'subscription_pending',
    'mock_sub_' || v_sub_id::TEXT,
    v_event_payload, v_event_sha256,
    'processed', v_sub_id, jsonb_build_object('is_mock', true)
  ) RETURNING id INTO v_event_id;

  -- Price snapshot
  INSERT INTO public.billing_price_snapshots (
    subscription_id, user_id,
    billing_provider_price_id, billing_provider_plan_instance_id,
    plan_tier, billing_interval,
    catalog_usd_amount_cents, catalog_usd_currency,
    charge_currency, charge_amount_minor,
    rounding_mode, price_lock_policy, provider_plan_id,
    snapshot_reason, metadata
  ) VALUES (
    v_sub_id, v_user_id,
    v_price_id, v_plan_instance_id,
    p_plan_tier, p_billing_interval,
    0, 'USD', 'INR', p_charge_amount_minor,
    'half_up_minor_unit', 'locked_at_signup', v_provider_plan_id,
    'initial',
    jsonb_build_object('is_mock', true, 'base_amount_minor', p_base_amount_minor, 'gst_amount_minor', p_gst_amount_minor)
  ) RETURNING id INTO v_snapshot_id;

  UPDATE public.user_subscriptions SET current_price_snapshot_id = v_snapshot_id WHERE id = v_sub_id;

  -- Pending payment record
  INSERT INTO public.billing_payments (
    user_id, subscription_id, plan_tier, provider,
    price_snapshot_id, provider_payment_id, provider_subscription_id,
    status, charge_amount_minor, charge_currency,
    catalog_usd_amount_cents, webhook_event_id, metadata
  ) VALUES (
    v_user_id, v_sub_id, p_plan_tier, 'mock',
    v_snapshot_id,
    'mock_pay_' || gen_random_uuid()::TEXT,
    'mock_sub_' || v_sub_id::TEXT,
    'pending', p_charge_amount_minor, 'INR',
    0, v_event_id,
    jsonb_build_object(
      'is_mock', true,
      'base_amount_minor',  p_base_amount_minor,
      'gst_amount_minor',   p_gst_amount_minor,
      'idempotency_key',    p_idempotency_key
    )
  );

  RETURN json_build_object('subscription_id', v_sub_id, 'mock_session_id', 'mock_' || v_sub_id::TEXT);
END;
$$;
GRANT EXECUTE ON FUNCTION public.begin_mock_subscription(TEXT, TEXT, BIGINT, BIGINT, BIGINT, TEXT) TO authenticated;

-- ── 2. confirm_mock_subscription (no tester gate) ─────────────────────────
DROP FUNCTION IF EXISTS public.confirm_mock_subscription(UUID, TEXT);
CREATE FUNCTION public.confirm_mock_subscription(
  p_subscription_id UUID,
  p_outcome         TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      UUID := auth.uid();
  v_sub          RECORD;
  v_plan         RECORD;
  v_inv_number   TEXT;
  v_inv_id       UUID;
  v_base_minor   BIGINT;
  v_gst_minor    BIGINT;
  v_charge_minor BIGINT;
  v_pay_status   TEXT;
  v_grant_id     UUID;
  v_ledger_id    UUID;
  v_grant_key    TEXT;
  v_ledger_key   TEXT;
  v_period_start TIMESTAMPTZ;
  v_period_end   TIMESTAMPTZ;
  v_expires_at   TIMESTAMPTZ;
BEGIN
  -- Auth guard
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- NOTE: tester allowlist check intentionally removed.

  IF p_outcome NOT IN ('success', 'failed', 'cancel') THEN
    RAISE EXCEPTION 'Invalid outcome: %. Must be success, failed, or cancel.', p_outcome;
  END IF;

  -- Fetch subscription (must belong to this user, must be mock)
  SELECT * INTO v_sub FROM public.user_subscriptions
  WHERE id = p_subscription_id AND user_id = v_user_id AND provider_name = 'mock';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mock subscription not found or not owned by user' USING ERRCODE = 'P0005';
  END IF;

  -- Idempotency: already active + success → return existing invoice
  IF v_sub.status = 'active' AND p_outcome = 'success' THEN
    SELECT invoice_number INTO v_inv_number FROM public.billing_invoices
    WHERE subscription_id = p_subscription_id LIMIT 1;
    RETURN jsonb_build_object(
      'success', true,
      'invoice_number', COALESCE(v_inv_number, ''),
      'already_active', true
    );
  END IF;

  -- Idempotency: already failed/cancelled + failure → return false
  IF v_sub.status IN ('cancelled', 'failed') AND p_outcome IN ('failed', 'cancel') THEN
    RETURN jsonb_build_object('success', false, 'outcome', p_outcome);
  END IF;

  -- Must be pending to proceed
  IF v_sub.status != 'pending' THEN
    RAISE EXCEPTION 'Subscription % is in status %, cannot process', p_subscription_id, v_sub.status;
  END IF;

  IF p_outcome = 'success' THEN
    -- Block if a real (non-mock) subscription is already active
    IF EXISTS (
      SELECT 1 FROM public.user_subscriptions
      WHERE user_id = v_user_id
        AND status IN ('active', 'trialing', 'past_due')
        AND COALESCE(provider_name, '') != 'mock'
    ) THEN
      RAISE EXCEPTION 'A real payment subscription is already active.' USING ERRCODE = 'P0011';
    END IF;

    -- Cancel any other live mock subs before activating this one
    UPDATE public.user_subscriptions
    SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
    WHERE user_id = v_user_id
      AND status IN ('active', 'trialing', 'past_due')
      AND provider_name = 'mock'
      AND id != p_subscription_id;

    -- Activate subscription
    UPDATE public.user_subscriptions SET status = 'active', updated_at = NOW() WHERE id = p_subscription_id;
    UPDATE public.billing_payments SET status = 'succeeded', paid_at = NOW()
    WHERE subscription_id = p_subscription_id AND status = 'pending';

    -- Read amounts from billing_payments
    SELECT COALESCE((metadata->>'base_amount_minor')::BIGINT, 0),
           COALESCE((metadata->>'gst_amount_minor')::BIGINT, 0),
           charge_amount_minor
    INTO v_base_minor, v_gst_minor, v_charge_minor
    FROM public.billing_payments WHERE subscription_id = p_subscription_id LIMIT 1;

    SELECT * INTO v_plan FROM public.subscription_plans WHERE tier = v_sub.plan_tier;

    -- Issue mock invoice
    v_inv_number := 'INV' || LPAD(nextval('billing_invoice_seq')::TEXT, 6, '0') || '-MOCK';
    INSERT INTO public.billing_invoices (
      user_id, subscription_id, invoice_number, status,
      base_amount_minor, gst_amount_minor, total_amount_minor,
      gst_rate_percent, charge_currency, plan_tier, billing_interval, is_mock, metadata
    ) VALUES (
      v_user_id, p_subscription_id, v_inv_number, 'issued',
      v_base_minor, v_gst_minor, v_charge_minor, 18.00, 'INR',
      v_sub.plan_tier, v_sub.billing_interval, true,
      jsonb_build_object(
        'is_mock', true,
        'label', 'MOCK / TEST MODE — Not a real charge',
        'plan_name', COALESCE(v_plan.display_name, v_sub.plan_tier),
        'activated_at', NOW()::TEXT
      )
    ) RETURNING id INTO v_inv_id;

    UPDATE public.billing_payments
    SET provider_invoice_id = v_inv_number,
        metadata = metadata || jsonb_build_object('invoice_id', v_inv_id::TEXT)
    WHERE subscription_id = p_subscription_id;

    -- ── Credit grant ───────────────────────────────────────────────────
    -- status = 'completed' per membership_credit_grants_status_allowed CHECK
    -- (allowed: pending / completed / skipped / failed)
    IF v_plan.monthly_credit_grant > 0 THEN
      v_grant_key   := 'mock_grant_first_' || p_subscription_id::TEXT;
      v_ledger_key  := 'mock_ledger_first_' || p_subscription_id::TEXT;
      v_period_start := DATE_TRUNC('month', NOW());
      v_period_end  := v_period_start + INTERVAL '1 month' - INTERVAL '1 second';
      v_expires_at  := DATE_TRUNC('month', NOW()) + INTERVAL '2 months' - INTERVAL '1 second';

      INSERT INTO public.membership_credit_grants (
        user_id, subscription_id, plan_tier, rollover_tier_key,
        credit_amount, status, grant_period_start, grant_period_end,
        idempotency_key, metadata
      ) VALUES (
        v_user_id, p_subscription_id, v_sub.plan_tier,
        COALESCE(v_plan.rollover_tier_key, v_sub.plan_tier),
        v_plan.monthly_credit_grant, 'completed', v_period_start, v_period_end,
        v_grant_key,
        jsonb_build_object('is_mock', true, 'plan_name', v_plan.display_name, 'invoice_number', v_inv_number)
      )
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id INTO v_grant_id;

      IF v_grant_id IS NOT NULL THEN
        INSERT INTO public.credit_ledger_entries (
          user_id, amount, entry_type, idempotency_key,
          reference_type, reference_id, month_key, plan_tier_at_earn,
          remaining_amount, expires_at, metadata
        ) VALUES (
          v_user_id, v_plan.monthly_credit_grant, 'membership_grant', v_ledger_key,
          'membership_credit_grant', v_grant_id,
          DATE_TRUNC('month', NOW())::DATE, v_sub.plan_tier,
          v_plan.monthly_credit_grant, v_expires_at,
          jsonb_build_object(
            'is_mock', true, 'plan_tier', v_sub.plan_tier,
            'plan_name', v_plan.display_name, 'billing_interval', v_sub.billing_interval
          )
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id INTO v_ledger_id;

        IF v_ledger_id IS NOT NULL THEN
          UPDATE public.membership_credit_grants SET ledger_entry_id = v_ledger_id WHERE id = v_grant_id;
        END IF;

        INSERT INTO public.user_progression (user_id, credits, updated_at)
        VALUES (v_user_id, v_plan.monthly_credit_grant, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET credits = public.user_progression.credits + v_plan.monthly_credit_grant,
            updated_at = NOW();
      END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'invoice_number', v_inv_number);

  ELSE
    -- Failure / cancellation path
    v_pay_status := CASE p_outcome WHEN 'cancel' THEN 'cancelled' ELSE p_outcome END;
    UPDATE public.billing_payments
    SET status = v_pay_status,
        failure_reason = CASE p_outcome
          WHEN 'failed' THEN 'Simulated payment failure (mock mode)'
          WHEN 'cancel' THEN 'User cancelled payment (mock mode)'
          ELSE 'Mock payment not completed'
        END
    WHERE subscription_id = p_subscription_id AND status = 'pending';
    UPDATE public.user_subscriptions
    SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
    WHERE id = p_subscription_id;
    RETURN jsonb_build_object('success', false, 'outcome', p_outcome);
  END IF;
END;
$$;
GRANT EXECUTE ON FUNCTION public.confirm_mock_subscription(UUID, TEXT) TO authenticated;

-- ── 3. cancel_mock_subscription (no tester gate) ──────────────────────────
DROP FUNCTION IF EXISTS public.cancel_mock_subscription(UUID);
CREATE FUNCTION public.cancel_mock_subscription(p_subscription_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub     RECORD;
BEGIN
  -- Auth guard
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- NOTE: tester allowlist check intentionally removed.

  SELECT * INTO v_sub FROM public.user_subscriptions
  WHERE id = p_subscription_id AND user_id = v_user_id AND provider_name = 'mock';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mock subscription not found or not owned by user.' USING ERRCODE = 'P0005';
  END IF;

  -- Idempotent: already cancelled
  IF v_sub.status IN ('cancelled', 'failed') THEN
    RETURN jsonb_build_object('success', true, 'already_cancelled', true);
  END IF;

  UPDATE public.user_subscriptions
  SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
  WHERE id = p_subscription_id;

  RETURN jsonb_build_object('success', true);
END;
$$;
GRANT EXECUTE ON FUNCTION public.cancel_mock_subscription(UUID) TO authenticated;
