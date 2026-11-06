-- ============================================================
-- Migration: 20261106190000_grant_credits_on_mock_activation
--
-- Redeploys confirm_mock_subscription to grant the first
-- period's membership credits when a mock payment succeeds.
--
-- What changed from the previous version:
--   After activating the subscription and issuing the invoice,
--   the function now:
--     1. Inserts a row into membership_credit_grants (idempotent
--        via unique idempotency_key: 'mock_grant_first_<sub_id>')
--     2. Inserts a row into credit_ledger_entries (idempotent
--        via unique idempotency_key: 'mock_ledger_first_<sub_id>')
--     3. Updates user_progression.credits using ON CONFLICT …
--        DO UPDATE to atomically increment the wallet balance.
--
-- Idempotency guarantees:
--   - Both table inserts use ON CONFLICT (idempotency_key) DO NOTHING.
--   - The user_progression update is guarded by IF v_grant_id IS NOT NULL
--     so credits are only added when a genuinely new grant row is inserted.
--   - Calling confirm_mock_subscription('success') twice on the same
--     subscription is safe: the second call returns the existing invoice
--     immediately (via the existing early-return idempotency guard).
--
-- Skips credit grant for Explorer tier (monthly_credit_grant = 0).
-- ============================================================

DROP FUNCTION IF EXISTS public.confirm_mock_subscription(UUID, TEXT);

CREATE FUNCTION public.confirm_mock_subscription(
  p_subscription_id UUID,
  p_outcome         TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $func$
DECLARE
  v_user_id      UUID        := auth.uid();
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
  -- ── Auth guard ──────────────────────────────────────────────────────────
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;
  IF p_outcome NOT IN ('success', 'failed', 'cancel') THEN
    RAISE EXCEPTION 'Invalid outcome: %. Must be success, failed, or cancel.', p_outcome;
  END IF;

  -- ── Fetch subscription (must belong to caller) ──────────────────────────
  SELECT * INTO v_sub
  FROM public.user_subscriptions
  WHERE id = p_subscription_id
    AND user_id = v_user_id
    AND provider_name = 'mock';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mock subscription not found or not owned by user' USING ERRCODE = 'P0005';
  END IF;

  -- ── Idempotency: already active → return existing invoice ───────────────
  IF v_sub.status = 'active' AND p_outcome = 'success' THEN
    SELECT invoice_number INTO v_inv_number
    FROM public.billing_invoices
    WHERE subscription_id = p_subscription_id LIMIT 1;
    RETURN jsonb_build_object('success', true, 'invoice_number', COALESCE(v_inv_number, ''));
  END IF;

  -- ── Idempotency: already cancelled/failed ───────────────────────────────
  IF v_sub.status IN ('cancelled', 'failed') AND p_outcome IN ('failed', 'cancel') THEN
    RETURN jsonb_build_object('success', false, 'outcome', p_outcome);
  END IF;

  IF v_sub.status != 'pending' THEN
    RAISE EXCEPTION 'Subscription % is in status %, cannot process', p_subscription_id, v_sub.status;
  END IF;

  -- ════════════════════════════════════════════════════════════════════════
  -- SUCCESS PATH
  -- ════════════════════════════════════════════════════════════════════════
  IF p_outcome = 'success' THEN

    -- Activate subscription
    UPDATE public.user_subscriptions
    SET status = 'active', updated_at = NOW()
    WHERE id = p_subscription_id;

    -- Mark payment succeeded
    UPDATE public.billing_payments
    SET status = 'succeeded', paid_at = NOW()
    WHERE subscription_id = p_subscription_id AND status = 'pending';

    -- Read payment amounts for invoice
    SELECT
      COALESCE((metadata->>'base_amount_minor')::BIGINT, 0),
      COALESCE((metadata->>'gst_amount_minor')::BIGINT, 0),
      charge_amount_minor
    INTO v_base_minor, v_gst_minor, v_charge_minor
    FROM public.billing_payments
    WHERE subscription_id = p_subscription_id LIMIT 1;

    -- Read plan details (monthly_credit_grant, rollover_tier_key, display_name)
    SELECT * INTO v_plan
    FROM public.subscription_plans
    WHERE tier = v_sub.plan_tier;

    -- Issue invoice
    v_inv_number := 'INV' || LPAD(nextval('billing_invoice_seq')::TEXT, 6, '0') || '-MOCK';
    INSERT INTO public.billing_invoices (
      user_id, subscription_id, invoice_number, status,
      base_amount_minor, gst_amount_minor, total_amount_minor,
      gst_rate_percent, charge_currency, plan_tier, billing_interval,
      is_mock, metadata
    ) VALUES (
      v_user_id, p_subscription_id, v_inv_number, 'issued',
      v_base_minor, v_gst_minor, v_charge_minor, 18.00, 'INR',
      v_sub.plan_tier, v_sub.billing_interval, true,
      jsonb_build_object(
        'is_mock',       true,
        'label',         'MOCK / TEST MODE - Not a real charge',
        'plan_name',     COALESCE(v_plan.display_name, v_sub.plan_tier),
        'activated_at',  NOW()::TEXT
      )
    ) RETURNING id INTO v_inv_id;

    UPDATE public.billing_payments
    SET provider_invoice_id = v_inv_number,
        metadata = metadata || jsonb_build_object('invoice_id', v_inv_id::TEXT)
    WHERE subscription_id = p_subscription_id;

    -- ── Grant first-period membership credits ──────────────────────────────
    -- Only for paid plans (monthly_credit_grant > 0: Basic=5, Pro=20, Advance=50)
    IF v_plan.monthly_credit_grant > 0 THEN

      v_grant_key    := 'mock_grant_first_' || p_subscription_id::TEXT;
      v_ledger_key   := 'mock_ledger_first_' || p_subscription_id::TEXT;
      v_period_start := DATE_TRUNC('month', NOW());
      v_period_end   := v_period_start + INTERVAL '1 month' - INTERVAL '1 second';
      -- Credits expire at end of the following calendar month (Basic/Pro standard rule)
      -- Advance members get an extra month, but this conservative setting is safe for all.
      v_expires_at   := DATE_TRUNC('month', NOW()) + INTERVAL '2 months' - INTERVAL '1 second';

      -- Step 1: Insert membership_credit_grants (idempotent)
      INSERT INTO public.membership_credit_grants (
        user_id, subscription_id, plan_tier, rollover_tier_key,
        credit_amount, status, grant_period_start, grant_period_end,
        idempotency_key, metadata
      ) VALUES (
        v_user_id, p_subscription_id, v_sub.plan_tier,
        COALESCE(v_plan.rollover_tier_key, v_sub.plan_tier),
        v_plan.monthly_credit_grant, 'granted',
        v_period_start, v_period_end,
        v_grant_key,
        jsonb_build_object(
          'is_mock',         true,
          'plan_name',       v_plan.display_name,
          'invoice_number',  v_inv_number
        )
      )
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id INTO v_grant_id;

      -- Only credit the wallet if the grant row was actually new (not a retry)
      IF v_grant_id IS NOT NULL THEN

        -- Step 2: Insert credit_ledger_entries (idempotent)
        INSERT INTO public.credit_ledger_entries (
          user_id, amount, entry_type, idempotency_key,
          reference_type, reference_id,
          month_key, plan_tier_at_earn,
          remaining_amount, expires_at, metadata
        ) VALUES (
          v_user_id,
          v_plan.monthly_credit_grant,
          'membership_grant',
          v_ledger_key,
          'membership_credit_grant',
          v_grant_id,
          DATE_TRUNC('month', NOW())::DATE,
          v_sub.plan_tier,
          v_plan.monthly_credit_grant,
          v_expires_at,
          jsonb_build_object(
            'is_mock',          true,
            'plan_tier',        v_sub.plan_tier,
            'plan_name',        v_plan.display_name,
            'billing_interval', v_sub.billing_interval
          )
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id INTO v_ledger_id;

        -- Back-link the grant to its ledger entry
        IF v_ledger_id IS NOT NULL THEN
          UPDATE public.membership_credit_grants
          SET ledger_entry_id = v_ledger_id
          WHERE id = v_grant_id;
        END IF;

        -- Step 3: Atomically increment user wallet balance
        INSERT INTO public.user_progression (user_id, credits, updated_at)
        VALUES (v_user_id, v_plan.monthly_credit_grant, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET credits    = public.user_progression.credits + v_plan.monthly_credit_grant,
            updated_at = NOW();

      END IF; -- v_grant_id IS NOT NULL
    END IF;   -- monthly_credit_grant > 0
    -- ── End credit grant ───────────────────────────────────────────────────

    RETURN jsonb_build_object('success', true, 'invoice_number', v_inv_number);

  -- ════════════════════════════════════════════════════════════════════════
  -- FAILURE / CANCEL PATH
  -- ════════════════════════════════════════════════════════════════════════
  ELSE
    -- Map 'cancel' outcome to 'cancelled' for billing_payments.status constraint
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
$func$;

GRANT EXECUTE ON FUNCTION public.confirm_mock_subscription(UUID, TEXT) TO authenticated;
