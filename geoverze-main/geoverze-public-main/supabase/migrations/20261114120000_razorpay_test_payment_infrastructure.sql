-- ============================================================
-- GVRZE Razorpay TEST MODE payment infrastructure
-- Migration: 20261114120000_razorpay_test_payment_infrastructure.sql
--
-- Completes the existing Gstore + membership billing schema:
--   1. payment_webhook_events     — idempotent Razorpay event log
--   2. Extra order/payment columns (image snapshot, payment method)
--   3. attach_gstore_razorpay_order / guest variant
--   4. Idempotent confirm_gstore_payment
--   5. fulfill_gstore_order_from_webhook (service_role)
--   6. begin / confirm / apply Razorpay subscriptions
--   7. Seed Razorpay catalog rows (plan IDs filled at runtime)
-- ============================================================

-- ── 1. payment_webhook_events ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_event_id  TEXT        NOT NULL UNIQUE,
  event_type         TEXT        NOT NULL,
  processed          BOOLEAN     NOT NULL DEFAULT false,
  processing_error   TEXT,
  payload            JSONB       NOT NULL DEFAULT '{}'::jsonb,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at       TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS payment_webhook_events_type_idx
  ON public.payment_webhook_events (event_type, created_at DESC);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.payment_webhook_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.payment_webhook_events TO service_role;

-- ── 2. Extra columns (non-destructive) ────────────────────────────────────

ALTER TABLE public.gstore_order_items
  ADD COLUMN IF NOT EXISTS product_image_snapshot TEXT NOT NULL DEFAULT '';

ALTER TABLE public.gstore_payments
  ADD COLUMN IF NOT EXISTS payment_method TEXT;

ALTER TABLE public.gstore_payments
  ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ;

-- ── 3. claim_payment_webhook_event ────────────────────────────────────────
-- Inserts the event if new. Returns processed=true when a duplicate
-- already completed so callers skip work.

CREATE OR REPLACE FUNCTION public.claim_payment_webhook_event(
  p_razorpay_event_id TEXT,
  p_event_type        TEXT,
  p_payload           JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_existing public.payment_webhook_events;
  v_id UUID;
BEGIN
  SELECT * INTO v_existing
  FROM public.payment_webhook_events
  WHERE razorpay_event_id = p_razorpay_event_id;

  IF FOUND THEN
    RETURN jsonb_build_object(
      'id', v_existing.id,
      'duplicate', true,
      'processed', v_existing.processed
    );
  END IF;

  INSERT INTO public.payment_webhook_events (
    razorpay_event_id, event_type, payload, processed
  ) VALUES (
    p_razorpay_event_id, p_event_type, COALESCE(p_payload, '{}'::jsonb), false
  )
  ON CONFLICT (razorpay_event_id) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    SELECT * INTO v_existing
    FROM public.payment_webhook_events
    WHERE razorpay_event_id = p_razorpay_event_id;
    RETURN jsonb_build_object(
      'id', v_existing.id,
      'duplicate', true,
      'processed', v_existing.processed
    );
  END IF;

  RETURN jsonb_build_object('id', v_id, 'duplicate', false, 'processed', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_payment_webhook_event(
  p_id UUID,
  p_processed BOOLEAN,
  p_error TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.payment_webhook_events
  SET processed = p_processed,
      processing_error = p_error,
      processed_at = CASE WHEN p_processed THEN NOW() ELSE processed_at END
  WHERE id = p_id;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_payment_webhook_event FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.mark_payment_webhook_event FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.claim_payment_webhook_event TO service_role;
GRANT EXECUTE ON FUNCTION public.mark_payment_webhook_event TO service_role;

-- ── 4. attach_gstore_razorpay_order ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.attach_gstore_razorpay_order(
  p_order_id UUID,
  p_payment_id UUID,
  p_provider_order_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_order public.gstore_orders;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_order FROM public.gstore_orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0003';
  END IF;
  IF v_order.user_id <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = 'P0004';
  END IF;
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'already_paid', true);
  END IF;

  UPDATE public.gstore_payments
  SET provider_order_id = p_provider_order_id,
      status = 'pending',
      updated_at = NOW()
  WHERE id = p_payment_id AND order_id = p_order_id;

  UPDATE public.gstore_orders
  SET payment_status = 'pending', updated_at = NOW()
  WHERE id = p_order_id AND payment_status IN ('unpaid', 'failed', 'pending');

  RETURN jsonb_build_object('success', true, 'already_paid', false);
END;
$$;

CREATE OR REPLACE FUNCTION public.attach_gstore_razorpay_order_guest(
  p_order_id UUID,
  p_payment_id UUID,
  p_guest_token UUID,
  p_provider_order_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.gstore_orders;
BEGIN
  SELECT * INTO v_order
  FROM public.gstore_orders
  WHERE id = p_order_id AND guest_token = p_guest_token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0003';
  END IF;
  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'already_paid', true);
  END IF;

  UPDATE public.gstore_payments
  SET provider_order_id = p_provider_order_id,
      status = 'pending',
      updated_at = NOW()
  WHERE id = p_payment_id AND order_id = p_order_id;

  UPDATE public.gstore_orders
  SET payment_status = 'pending', updated_at = NOW()
  WHERE id = p_order_id AND payment_status IN ('unpaid', 'failed', 'pending');

  RETURN jsonb_build_object('success', true, 'already_paid', false);
END;
$$;

REVOKE ALL ON FUNCTION public.attach_gstore_razorpay_order FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.attach_gstore_razorpay_order TO authenticated;

REVOKE ALL ON FUNCTION public.attach_gstore_razorpay_order_guest FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.attach_gstore_razorpay_order_guest TO service_role;

-- ── 5. Idempotent confirm_gstore_payment ──────────────────────────────────

CREATE OR REPLACE FUNCTION public.confirm_gstore_payment(
  p_order_id           UUID,
  p_payment_id         UUID,
  p_provider_order_id  TEXT,
  p_provider_payment_id TEXT,
  p_provider_signature  TEXT,
  p_outcome            TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id    UUID;
  v_order      public.gstore_orders;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_order FROM public.gstore_orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0003';
  END IF;
  IF v_order.user_id <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = 'P0004';
  END IF;

  IF p_outcome = 'success' AND v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'outcome', 'success', 'idempotent', true);
  END IF;

  IF p_outcome = 'success' THEN
    UPDATE public.gstore_payments SET
      provider_order_id   = p_provider_order_id,
      provider_payment_id = p_provider_payment_id,
      provider_signature  = p_provider_signature,
      status              = 'paid',
      verified_at         = NOW(),
      updated_at          = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id
      AND status IS DISTINCT FROM 'paid';

    UPDATE public.gstore_orders SET
      payment_status = 'paid',
      order_status   = CASE WHEN order_status = 'pending' THEN 'confirmed' ELSE order_status END,
      updated_at     = NOW()
    WHERE id = p_order_id AND payment_status IS DISTINCT FROM 'paid';

    RETURN jsonb_build_object('success', true, 'outcome', 'success', 'idempotent', false);

  ELSIF p_outcome = 'failed' THEN
    IF v_order.payment_status = 'paid' THEN
      RETURN jsonb_build_object('success', true, 'outcome', 'success', 'idempotent', true);
    END IF;
    UPDATE public.gstore_payments SET status = 'failed', updated_at = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id AND status = 'pending';
    UPDATE public.gstore_orders SET payment_status = 'failed', updated_at = NOW()
    WHERE id = p_order_id AND payment_status <> 'paid';
    RETURN jsonb_build_object('success', false, 'outcome', 'failed');

  ELSIF p_outcome = 'cancel' THEN
    IF v_order.payment_status = 'paid' THEN
      RETURN jsonb_build_object('success', true, 'outcome', 'success', 'idempotent', true);
    END IF;
    -- Leave unpaid/pending so the shopper can retry. Do not cancel the order.
    UPDATE public.gstore_payments SET status = 'pending', updated_at = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id AND status = 'pending';
    RETURN jsonb_build_object('success', false, 'outcome', 'cancelled');

  ELSE
    RAISE EXCEPTION 'Invalid outcome: %', p_outcome USING ERRCODE = 'P0005';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_gstore_payment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_gstore_payment TO authenticated;

-- ── 6. Webhook fulfillment (service_role) ─────────────────────────────────

CREATE OR REPLACE FUNCTION public.fulfill_gstore_order_from_webhook(
  p_provider_order_id   TEXT,
  p_provider_payment_id TEXT,
  p_gstore_order_id     UUID DEFAULT NULL,
  p_gstore_payment_id   UUID DEFAULT NULL,
  p_payment_method      TEXT DEFAULT NULL,
  p_outcome             TEXT DEFAULT 'success'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_payment public.gstore_payments;
  v_order   public.gstore_orders;
BEGIN
  IF p_gstore_payment_id IS NOT NULL THEN
    SELECT * INTO v_payment FROM public.gstore_payments WHERE id = p_gstore_payment_id;
  END IF;
  IF v_payment.id IS NULL AND p_provider_order_id IS NOT NULL THEN
    SELECT * INTO v_payment
    FROM public.gstore_payments
    WHERE provider_order_id = p_provider_order_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  IF v_payment.id IS NULL AND p_gstore_order_id IS NOT NULL THEN
    SELECT * INTO v_payment
    FROM public.gstore_payments
    WHERE order_id = p_gstore_order_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  IF v_payment.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'payment_not_found');
  END IF;

  SELECT * INTO v_order FROM public.gstore_orders WHERE id = v_payment.order_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'order_not_found');
  END IF;

  IF p_outcome = 'success' THEN
    IF v_order.payment_status = 'paid' THEN
      RETURN jsonb_build_object('success', true, 'idempotent', true, 'order_id', v_order.id);
    END IF;

    UPDATE public.gstore_payments SET
      provider_order_id   = COALESCE(p_provider_order_id, provider_order_id),
      provider_payment_id = COALESCE(p_provider_payment_id, provider_payment_id),
      provider_signature  = COALESCE(provider_signature, 'webhook-confirmed'),
      payment_method      = COALESCE(p_payment_method, payment_method),
      status              = 'paid',
      verified_at         = NOW(),
      updated_at          = NOW()
    WHERE id = v_payment.id AND status IS DISTINCT FROM 'paid';

    UPDATE public.gstore_orders SET
      payment_status = 'paid',
      order_status   = CASE WHEN order_status = 'pending' THEN 'confirmed' ELSE order_status END,
      updated_at     = NOW()
    WHERE id = v_order.id AND payment_status IS DISTINCT FROM 'paid';

    RETURN jsonb_build_object('success', true, 'idempotent', false, 'order_id', v_order.id);
  END IF;

  IF v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true, 'order_id', v_order.id);
  END IF;

  UPDATE public.gstore_payments SET status = 'failed', updated_at = NOW()
  WHERE id = v_payment.id AND status = 'pending';
  UPDATE public.gstore_orders SET payment_status = 'failed', updated_at = NOW()
  WHERE id = v_order.id AND payment_status <> 'paid';

  RETURN jsonb_build_object('success', false, 'outcome', 'failed', 'order_id', v_order.id);
END;
$$;

REVOKE ALL ON FUNCTION public.fulfill_gstore_order_from_webhook FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.fulfill_gstore_order_from_webhook TO service_role;

-- ── 7. Seed Razorpay catalog rows (plan IDs filled at checkout) ───────────

INSERT INTO public.billing_provider_plan_instances (
  provider, provider_plan_id, billing_provider_price_id,
  charge_currency, charge_amount_minor, billing_interval,
  catalog_usd_amount_cents, metadata
)
SELECT DISTINCT ON (bpp.plan_tier, bpp.billing_interval)
  'razorpay',
  'pending_plan_' || bpp.id::text,
  bpp.id,
  'INR',
  CASE
    WHEN bpp.plan_tier = 'basic' AND bpp.billing_interval = 'monthly' THEN 9900
    WHEN bpp.plan_tier = 'basic' AND bpp.billing_interval = 'annual' THEN 99900
    WHEN bpp.plan_tier = 'pro' AND bpp.billing_interval = 'monthly' THEN 49900
    WHEN bpp.plan_tier = 'pro' AND bpp.billing_interval = 'annual' THEN 399900
    WHEN bpp.plan_tier = 'advance' AND bpp.billing_interval = 'monthly' THEN 99900
    WHEN bpp.plan_tier = 'advance' AND bpp.billing_interval = 'annual' THEN 800000
    ELSE 49900
  END,
  bpp.billing_interval,
  0,
  jsonb_build_object('plan_tier', bpp.plan_tier)
FROM public.billing_provider_prices bpp
WHERE bpp.provider = 'razorpay'
  AND bpp.active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.billing_provider_plan_instances i
    WHERE i.billing_provider_price_id = bpp.id
  )
ORDER BY bpp.plan_tier, bpp.billing_interval, bpp.id;

CREATE OR REPLACE FUNCTION public.upsert_razorpay_plan_id(
  p_plan_tier TEXT,
  p_billing_interval TEXT,
  p_provider_plan_id TEXT,
  p_charge_amount_minor BIGINT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.billing_provider_plan_instances bppi
  SET provider_plan_id = p_provider_plan_id,
      charge_amount_minor = p_charge_amount_minor
  FROM public.billing_provider_prices bpp
  WHERE bpp.id = bppi.billing_provider_price_id
    AND bppi.provider = 'razorpay'
    AND bpp.provider = 'razorpay'
    AND bpp.plan_tier = p_plan_tier
    AND bpp.billing_interval = p_billing_interval;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_razorpay_plan_id FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_razorpay_plan_id TO service_role;

-- ── 8. begin_razorpay_subscription ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.begin_razorpay_subscription(
  p_plan_tier TEXT,
  p_billing_interval TEXT,
  p_base_amount_minor BIGINT,
  p_gst_amount_minor BIGINT,
  p_charge_amount_minor BIGINT,
  p_provider_subscription_id TEXT,
  p_provider_plan_id TEXT,
  p_idempotency_key TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub_id UUID;
  v_period_end TIMESTAMPTZ;
  v_price_id UUID;
  v_plan_instance_id UUID;
  v_event_id UUID;
  v_snapshot_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE tier = p_plan_tier AND active = true) THEN
    RAISE EXCEPTION 'Unknown or inactive plan: %', p_plan_tier USING ERRCODE = 'P0002';
  END IF;
  IF p_billing_interval NOT IN ('monthly', 'annual') THEN
    RAISE EXCEPTION 'Invalid billing interval' USING ERRCODE = 'P0003';
  END IF;
  IF p_charge_amount_minor <= 0 THEN
    RAISE EXCEPTION 'Charge amount must be positive' USING ERRCODE = 'P0004';
  END IF;

  SELECT us.id INTO v_sub_id
  FROM public.user_subscriptions us
  WHERE us.user_id = v_user_id
    AND us.status = 'pending'
    AND us.provider_name = 'razorpay'
    AND (us.metadata->>'idempotency_key') = p_idempotency_key
  LIMIT 1;

  IF v_sub_id IS NOT NULL THEN
    UPDATE public.user_subscriptions
    SET provider_subscription_id = p_provider_subscription_id,
        updated_at = NOW()
    WHERE id = v_sub_id;
    RETURN jsonb_build_object('subscription_id', v_sub_id, 'idempotent', true);
  END IF;

  SELECT bppi.id, bpp.id
  INTO v_plan_instance_id, v_price_id
  FROM public.billing_provider_plan_instances bppi
  JOIN public.billing_provider_prices bpp ON bpp.id = bppi.billing_provider_price_id
  WHERE bppi.provider = 'razorpay'
    AND bpp.provider = 'razorpay'
    AND bpp.plan_tier = p_plan_tier
    AND bpp.billing_interval = p_billing_interval
    AND bpp.active = true
  LIMIT 1;

  IF v_plan_instance_id IS NULL THEN
    RAISE EXCEPTION 'No Razorpay plan instance for % %', p_plan_tier, p_billing_interval
      USING ERRCODE = 'P0010';
  END IF;

  UPDATE public.user_subscriptions
  SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
  WHERE user_id = v_user_id AND status = 'pending' AND provider_name = 'razorpay';

  v_period_end := NOW() + CASE p_billing_interval
    WHEN 'annual' THEN INTERVAL '1 year'
    ELSE INTERVAL '1 month'
  END;

  INSERT INTO public.user_subscriptions (
    user_id, plan_tier, billing_interval, status, provider_name,
    provider_subscription_id, started_at, current_period_start, current_period_end,
    metadata
  ) VALUES (
    v_user_id, p_plan_tier, p_billing_interval, 'pending', 'razorpay',
    p_provider_subscription_id, NOW(), NOW(), v_period_end,
    jsonb_build_object(
      'idempotency_key', p_idempotency_key,
      'provider_plan_id', p_provider_plan_id,
      'is_mock', false
    )
  )
  RETURNING id INTO v_sub_id;

  INSERT INTO public.billing_webhook_events (
    provider, provider_event_id, event_type, normalized_event_type,
    provider_subscription_id, payload, payload_sha256,
    processing_status, subscription_id, metadata
  ) VALUES (
    'razorpay',
    'rzp_pending_' || v_sub_id::TEXT,
    'subscription.pending',
    'subscription_pending',
    p_provider_subscription_id,
    jsonb_build_object('subscription_id', v_sub_id::TEXT),
    encode(sha256(('rzp_pending_' || v_sub_id::TEXT)::bytea), 'hex'),
    'processed',
    v_sub_id,
    jsonb_build_object('bootstrap', true)
  )
  RETURNING id INTO v_event_id;

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
    0, 'USD',
    'INR', p_charge_amount_minor,
    'half_up_minor_unit', 'locked_at_signup', p_provider_plan_id,
    'initial',
    jsonb_build_object(
      'base_amount_minor', p_base_amount_minor,
      'gst_amount_minor', p_gst_amount_minor
    )
  )
  RETURNING id INTO v_snapshot_id;

  UPDATE public.user_subscriptions
  SET current_price_snapshot_id = v_snapshot_id
  WHERE id = v_sub_id;

  INSERT INTO public.billing_payments (
    user_id, subscription_id, plan_tier, provider,
    price_snapshot_id,
    provider_payment_id, provider_subscription_id,
    status, charge_amount_minor, charge_currency,
    catalog_usd_amount_cents,
    webhook_event_id,
    metadata
  ) VALUES (
    v_user_id, v_sub_id, p_plan_tier, 'razorpay',
    v_snapshot_id,
    'rzp_pending_' || gen_random_uuid()::TEXT,
    p_provider_subscription_id,
    'pending', p_charge_amount_minor, 'INR',
    0,
    v_event_id,
    jsonb_build_object(
      'base_amount_minor', p_base_amount_minor,
      'gst_amount_minor', p_gst_amount_minor,
      'idempotency_key', p_idempotency_key
    )
  );

  RETURN jsonb_build_object('subscription_id', v_sub_id, 'idempotent', false);
END;
$$;

REVOKE ALL ON FUNCTION public.begin_razorpay_subscription FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.begin_razorpay_subscription TO authenticated;

-- ── 9. Credit grant helper (idempotent) ───────────────────────────────────

CREATE OR REPLACE FUNCTION public.grant_razorpay_membership_credits(
  p_user_id UUID,
  p_subscription_id UUID,
  p_plan_tier TEXT,
  p_billing_interval TEXT,
  p_period_key TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_plan RECORD;
  v_grant_id UUID;
  v_ledger_id UUID;
  v_grant_key TEXT := 'rzp_grant_' || p_subscription_id::TEXT || '_' || p_period_key;
  v_ledger_key TEXT := 'rzp_ledger_' || p_subscription_id::TEXT || '_' || p_period_key;
  v_period_start TIMESTAMPTZ := DATE_TRUNC('month', NOW());
  v_period_end TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
BEGIN
  SELECT * INTO v_plan FROM public.subscription_plans WHERE tier = p_plan_tier;
  IF NOT FOUND OR COALESCE(v_plan.monthly_credit_grant, 0) <= 0 THEN
    RETURN false;
  END IF;

  v_period_end := v_period_start + INTERVAL '1 month' - INTERVAL '1 second';
  v_expires_at := DATE_TRUNC('month', NOW()) + INTERVAL '2 months' - INTERVAL '1 second';

  INSERT INTO public.membership_credit_grants (
    user_id, subscription_id, plan_tier, rollover_tier_key,
    credit_amount, status, grant_period_start, grant_period_end,
    idempotency_key, metadata
  ) VALUES (
    p_user_id, p_subscription_id, p_plan_tier,
    COALESCE(v_plan.rollover_tier_key, p_plan_tier),
    v_plan.monthly_credit_grant, 'completed', v_period_start, v_period_end,
    v_grant_key,
    jsonb_build_object('provider', 'razorpay', 'billing_interval', p_billing_interval)
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_grant_id;

  IF v_grant_id IS NULL THEN
    RETURN false;
  END IF;

  INSERT INTO public.credit_ledger_entries (
    user_id, amount, entry_type, idempotency_key,
    reference_type, reference_id, month_key, plan_tier_at_earn,
    remaining_amount, expires_at, metadata
  ) VALUES (
    p_user_id,
    v_plan.monthly_credit_grant,
    'membership_grant',
    v_ledger_key,
    'membership_credit_grant',
    v_grant_id,
    DATE_TRUNC('month', NOW())::DATE,
    p_plan_tier,
    v_plan.monthly_credit_grant,
    v_expires_at,
    jsonb_build_object('provider', 'razorpay')
  )
  ON CONFLICT (idempotency_key) DO NOTHING
  RETURNING id INTO v_ledger_id;

  IF v_ledger_id IS NOT NULL THEN
    UPDATE public.membership_credit_grants
    SET ledger_entry_id = v_ledger_id
    WHERE id = v_grant_id;
  END IF;

  INSERT INTO public.user_progression (user_id, credits, updated_at)
  VALUES (p_user_id, v_plan.monthly_credit_grant, NOW())
  ON CONFLICT (user_id) DO UPDATE
  SET credits = public.user_progression.credits + v_plan.monthly_credit_grant,
      updated_at = NOW();

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.grant_razorpay_membership_credits FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.grant_razorpay_membership_credits TO service_role;

-- ── 10. confirm_razorpay_subscription (authenticated verify path) ─────────

CREATE OR REPLACE FUNCTION public.confirm_razorpay_subscription(
  p_subscription_id UUID,
  p_provider_payment_id TEXT,
  p_provider_subscription_id TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub RECORD;
  v_plan RECORD;
  v_inv_number TEXT;
  v_base_minor BIGINT;
  v_gst_minor BIGINT;
  v_charge_minor BIGINT;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_sub
  FROM public.user_subscriptions
  WHERE id = p_subscription_id
    AND user_id = v_user_id
    AND provider_name = 'razorpay';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Subscription not found' USING ERRCODE = 'P0005';
  END IF;

  IF v_sub.status = 'active' THEN
    RETURN jsonb_build_object('success', true, 'idempotent', true);
  END IF;

  IF v_sub.status NOT IN ('pending', 'incomplete', 'past_due') THEN
    RAISE EXCEPTION 'Subscription % cannot be confirmed from status %', p_subscription_id, v_sub.status;
  END IF;

  UPDATE public.user_subscriptions
  SET status = 'active',
      provider_subscription_id = COALESCE(p_provider_subscription_id, provider_subscription_id),
      current_period_start = NOW(),
      updated_at = NOW()
  WHERE id = p_subscription_id;

  UPDATE public.billing_payments
  SET status = 'succeeded',
      paid_at = NOW(),
      provider_payment_id = p_provider_payment_id
  WHERE subscription_id = p_subscription_id AND status = 'pending';

  SELECT
    COALESCE((metadata->>'base_amount_minor')::BIGINT, 0),
    COALESCE((metadata->>'gst_amount_minor')::BIGINT, 0),
    charge_amount_minor
  INTO v_base_minor, v_gst_minor, v_charge_minor
  FROM public.billing_payments
  WHERE subscription_id = p_subscription_id
  ORDER BY created_at DESC
  LIMIT 1;

  SELECT * INTO v_plan FROM public.subscription_plans WHERE tier = v_sub.plan_tier;
  v_inv_number := 'INV' || LPAD(nextval('billing_invoice_seq')::TEXT, 6, '0');

  INSERT INTO public.billing_invoices (
    user_id, subscription_id, invoice_number, status,
    base_amount_minor, gst_amount_minor, total_amount_minor,
    gst_rate_percent, charge_currency, plan_tier, billing_interval, is_mock, metadata
  ) VALUES (
    v_user_id, p_subscription_id, v_inv_number, 'issued',
    COALESCE(v_base_minor, 0), COALESCE(v_gst_minor, 0), COALESCE(v_charge_minor, 0),
    18.00, 'INR', v_sub.plan_tier, v_sub.billing_interval, false,
    jsonb_build_object('provider', 'razorpay', 'plan_name', COALESCE(v_plan.display_name, v_sub.plan_tier))
  )
  ON CONFLICT (invoice_number) DO NOTHING;

  PERFORM public.grant_razorpay_membership_credits(
    v_user_id, p_subscription_id, v_sub.plan_tier, v_sub.billing_interval, to_char(NOW(), 'YYYY-MM')
  );

  RETURN jsonb_build_object('success', true, 'idempotent', false, 'invoice_number', v_inv_number);
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_razorpay_subscription FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_razorpay_subscription TO authenticated;

-- ── 11. apply_razorpay_subscription_event (webhook / service_role) ────────

CREATE OR REPLACE FUNCTION public.apply_razorpay_subscription_event(
  p_event_type TEXT,
  p_provider_subscription_id TEXT,
  p_provider_payment_id TEXT DEFAULT NULL,
  p_internal_subscription_id UUID DEFAULT NULL,
  p_period_key TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sub RECORD;
  v_status TEXT;
  v_period TEXT;
BEGIN
  IF p_internal_subscription_id IS NOT NULL THEN
    SELECT * INTO v_sub FROM public.user_subscriptions WHERE id = p_internal_subscription_id;
  END IF;
  IF v_sub.id IS NULL AND p_provider_subscription_id IS NOT NULL THEN
    SELECT * INTO v_sub
    FROM public.user_subscriptions
    WHERE provider_subscription_id = p_provider_subscription_id
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  IF v_sub.id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'subscription_not_found');
  END IF;

  v_period := COALESCE(p_period_key, to_char(NOW(), 'YYYY-MM'));

  IF p_event_type IN ('subscription.activated', 'subscription.charged') THEN
    UPDATE public.user_subscriptions
    SET status = 'active',
        provider_subscription_id = COALESCE(p_provider_subscription_id, provider_subscription_id),
        current_period_start = COALESCE(current_period_start, NOW()),
        cancel_at_period_end = CASE WHEN p_event_type = 'subscription.charged' THEN false ELSE cancel_at_period_end END,
        updated_at = NOW()
    WHERE id = v_sub.id
      AND status IN ('pending', 'incomplete', 'past_due', 'active');

    IF p_provider_payment_id IS NOT NULL THEN
      UPDATE public.billing_payments
      SET status = 'succeeded',
          paid_at = COALESCE(paid_at, NOW()),
          provider_payment_id = p_provider_payment_id
      WHERE subscription_id = v_sub.id AND status = 'pending';
    END IF;

    PERFORM public.grant_razorpay_membership_credits(
      v_sub.user_id, v_sub.id, v_sub.plan_tier, v_sub.billing_interval, v_period
    );

    RETURN jsonb_build_object('success', true, 'status', 'active', 'subscription_id', v_sub.id);
  END IF;

  IF p_event_type = 'subscription.pending' THEN
    v_status := 'pending';
  ELSIF p_event_type = 'subscription.halted' THEN
    v_status := 'past_due';
  ELSIF p_event_type IN ('subscription.cancelled', 'subscription.completed') THEN
    v_status := CASE WHEN p_event_type = 'subscription.completed' THEN 'expired' ELSE 'cancelled' END;
  ELSE
    RETURN jsonb_build_object('success', true, 'ignored', true, 'event', p_event_type);
  END IF;

  UPDATE public.user_subscriptions
  SET status = v_status,
      cancelled_at = CASE WHEN v_status IN ('cancelled', 'expired') THEN COALESCE(cancelled_at, NOW()) ELSE cancelled_at END,
      updated_at = NOW()
  WHERE id = v_sub.id;

  RETURN jsonb_build_object('success', true, 'status', v_status, 'subscription_id', v_sub.id);
END;
$$;

REVOKE ALL ON FUNCTION public.apply_razorpay_subscription_event FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.apply_razorpay_subscription_event TO service_role;
