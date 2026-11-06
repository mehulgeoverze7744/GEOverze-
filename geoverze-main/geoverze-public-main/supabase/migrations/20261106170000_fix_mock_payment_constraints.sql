-- ============================================================
-- GVRZE: Fix mock payment database constraint violations
-- Migration: 20261106170000_fix_mock_payment_constraints.sql
--
-- Root cause: begin_mock_subscription and confirm_mock_subscription
-- attempted to write values excluded by existing CHECK constraints:
--
--   user_subscriptions.status    → 'pending' was not allowed
--   billing_payments.status      → 'pending' and 'cancelled' were not allowed
--   billing_payments.provider    → 'mock' was not allowed
--
-- Fix: extend each CHECK constraint to include the required values.
-- Existing live data is unaffected (no UPDATE or DELETE).
-- ============================================================

-- 1. user_subscriptions.status — add 'pending'
-- Before: trialing, active, past_due, cancelled, expired, incomplete
-- After:  trialing, active, pending, past_due, cancelled, expired, incomplete
ALTER TABLE public.user_subscriptions
  DROP CONSTRAINT user_subscriptions_status_allowed;
ALTER TABLE public.user_subscriptions
  ADD CONSTRAINT user_subscriptions_status_allowed
  CHECK (status = ANY (ARRAY[
    'trialing'::text,
    'active'::text,
    'pending'::text,
    'past_due'::text,
    'cancelled'::text,
    'expired'::text,
    'incomplete'::text
  ]));

-- 2. billing_payments.status — add 'pending' and 'cancelled'
-- Before: succeeded, failed, refunded, partially_refunded
-- After:  pending, succeeded, failed, cancelled, refunded, partially_refunded
ALTER TABLE public.billing_payments
  DROP CONSTRAINT billing_payments_status_allowed;
ALTER TABLE public.billing_payments
  ADD CONSTRAINT billing_payments_status_allowed
  CHECK (status = ANY (ARRAY[
    'pending'::text,
    'succeeded'::text,
    'failed'::text,
    'cancelled'::text,
    'refunded'::text,
    'partially_refunded'::text
  ]));

-- 3. billing_payments.provider — add 'mock'
-- Before: razorpay, stripe
-- After:  razorpay, stripe, mock
ALTER TABLE public.billing_payments
  DROP CONSTRAINT billing_payments_provider_allowed;
ALTER TABLE public.billing_payments
  ADD CONSTRAINT billing_payments_provider_allowed
  CHECK (provider = ANY (ARRAY[
    'razorpay'::text,
    'stripe'::text,
    'mock'::text
  ]));

-- 4. Redeploy confirm_mock_subscription with 'cancel' → 'cancelled' mapping
--    for billing_payments.status (the allowed value is 'cancelled', not 'cancel').
CREATE OR REPLACE FUNCTION public.confirm_mock_subscription(
  p_subscription_id UUID,
  p_outcome         TEXT   -- 'success' | 'failed' | 'cancel'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $func$
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
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;
  IF p_outcome NOT IN ('success', 'failed', 'cancel') THEN
    RAISE EXCEPTION 'Invalid outcome: %. Must be success, failed, or cancel.', p_outcome;
  END IF;

  SELECT * INTO v_sub FROM public.user_subscriptions
  WHERE id = p_subscription_id AND user_id = v_user_id AND provider_name = 'mock';
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mock subscription not found or not owned by user' USING ERRCODE = 'P0005';
  END IF;

  -- Idempotency: already in a terminal state
  IF v_sub.status = 'active' AND p_outcome = 'success' THEN
    SELECT invoice_number INTO v_inv_number FROM public.billing_invoices
    WHERE subscription_id = p_subscription_id LIMIT 1;
    RETURN json_build_object('success', true, 'invoice_number', COALESCE(v_inv_number, ''));
  END IF;
  IF v_sub.status IN ('cancelled', 'failed') AND p_outcome IN ('failed', 'cancel') THEN
    RETURN json_build_object('success', false, 'outcome', p_outcome);
  END IF;
  IF v_sub.status != 'pending' THEN
    RAISE EXCEPTION 'Subscription % is in status %, cannot process', p_subscription_id, v_sub.status;
  END IF;

  -- ── SUCCESS PATH ─────────────────────────────────────────────────────────
  IF p_outcome = 'success' THEN
    UPDATE public.user_subscriptions SET status = 'active', updated_at = NOW()
    WHERE id = p_subscription_id;

    UPDATE public.billing_payments SET status = 'succeeded', paid_at = NOW()
    WHERE subscription_id = p_subscription_id AND status = 'pending';

    SELECT COALESCE((metadata->>'base_amount_minor')::BIGINT, 0),
           COALESCE((metadata->>'gst_amount_minor')::BIGINT, 0),
           charge_amount_minor
    INTO v_base_minor, v_gst_minor, v_charge_minor
    FROM public.billing_payments WHERE subscription_id = p_subscription_id LIMIT 1;

    SELECT * INTO v_plan FROM public.subscription_plans WHERE tier = v_sub.plan_tier;

    v_inv_number := 'INV' || LPAD(nextval('billing_invoice_seq')::TEXT, 6, '0') || '-MOCK';

    INSERT INTO public.billing_invoices (
      user_id, subscription_id, invoice_number, status,
      base_amount_minor, gst_amount_minor, total_amount_minor,
      gst_rate_percent, charge_currency, plan_tier, billing_interval, is_mock, metadata
    ) VALUES (
      v_user_id, p_subscription_id, v_inv_number, 'issued',
      v_base_minor, v_gst_minor, v_charge_minor,
      18.00, 'INR', v_sub.plan_tier, v_sub.billing_interval, true,
      jsonb_build_object(
        'is_mock',       true,
        'label',         'MOCK / TEST MODE — Not a real charge',
        'plan_name',     COALESCE(v_plan.display_name, v_sub.plan_tier),
        'activated_at',  NOW()::TEXT
      )
    ) RETURNING id INTO v_inv_id;

    UPDATE public.billing_payments
    SET provider_invoice_id = v_inv_number,
        metadata = metadata || jsonb_build_object('invoice_id', v_inv_id::TEXT)
    WHERE subscription_id = p_subscription_id;

    RETURN json_build_object('success', true, 'invoice_number', v_inv_number);

  -- ── FAILURE / CANCEL PATH ─────────────────────────────────────────────────
  ELSE
    -- billing_payments.status allows 'cancelled', not 'cancel'
    v_pay_status := CASE p_outcome WHEN 'cancel' THEN 'cancelled' ELSE p_outcome END;

    UPDATE public.billing_payments
    SET status = v_pay_status,
        failure_reason = CASE p_outcome
          WHEN 'failed' THEN 'Simulated payment failure (mock mode)'
          WHEN 'cancel' THEN 'User cancelled payment (mock mode)'
          ELSE                'Mock payment not completed'
        END
    WHERE subscription_id = p_subscription_id AND status = 'pending';

    UPDATE public.user_subscriptions
    SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
    WHERE id = p_subscription_id;

    RETURN json_build_object('success', false, 'outcome', p_outcome);
  END IF;
END;
$func$;

GRANT  EXECUTE ON FUNCTION public.confirm_mock_subscription TO authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_mock_subscription FROM anon;
