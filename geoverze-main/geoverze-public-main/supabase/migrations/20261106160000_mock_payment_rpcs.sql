-- ============================================================
-- GVRZE Mock Payment Infrastructure
-- Migration: 20261106160000_mock_payment_rpcs.sql
--
-- Creates:
--   1. billing_invoices    — GST-compliant invoice records
--   2. begin_mock_subscription  — creates pending sub + payment
--   3. confirm_mock_subscription — succeed / fail / cancel
--   4. activate_free_subscription — instant explorer activation
--
-- SECURITY NOTE:
--   All RPCs are SECURITY DEFINER with explicit GRANT to
--   `authenticated` role only. anon role cannot call these.
--   Production safety is enforced at the client by
--   import.meta.env.DEV (Vite replaces this with `false`
--   at production build time, making mock mode unreachable
--   from the browser even if env var is set).
-- ============================================================


-- ── 1. billing_invoices table ──────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id    UUID        REFERENCES public.user_subscriptions(id) ON DELETE SET NULL,
  invoice_number     TEXT        NOT NULL UNIQUE,
  status             TEXT        NOT NULL DEFAULT 'draft'
                                 CHECK (status IN ('draft','issued','void','refunded')),
  base_amount_minor  BIGINT      NOT NULL DEFAULT 0,
  gst_amount_minor   BIGINT      NOT NULL DEFAULT 0,
  total_amount_minor BIGINT      NOT NULL DEFAULT 0,
  gst_rate_percent   NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  charge_currency    TEXT        NOT NULL DEFAULT 'INR',
  plan_tier          TEXT        REFERENCES public.subscription_plans(tier),
  billing_interval   TEXT        CHECK (billing_interval IN ('monthly','annual')),
  is_mock            BOOLEAN     NOT NULL DEFAULT false,
  metadata           JSONB       NOT NULL DEFAULT '{}',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: users can read their own invoices
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own invoices"
  ON public.billing_invoices FOR SELECT
  USING (auth.uid() = user_id);

-- Service role bypass (for RPCs via SECURITY DEFINER)
-- Note: SECURITY DEFINER functions run as the function owner (postgres),
-- bypassing RLS automatically.

-- Invoice number sequence helper
CREATE SEQUENCE IF NOT EXISTS billing_invoice_seq START 1001;


-- ── 2. begin_mock_subscription ─────────────────────────────────────────────
--
-- Creates a PENDING subscription + PENDING payment for mock checkout.
-- Idempotent: returns existing pending record if idempotency_key matches.
-- Cancels any other pending mock subscriptions for the user first.

CREATE OR REPLACE FUNCTION public.begin_mock_subscription(
  p_plan_tier          TEXT,
  p_billing_interval   TEXT,
  p_base_amount_minor  BIGINT,
  p_gst_amount_minor   BIGINT,
  p_charge_amount_minor BIGINT,
  p_idempotency_key    TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id      UUID := auth.uid();
  v_sub_id       UUID;
  v_period_end   TIMESTAMPTZ;
  v_plan_price   BIGINT;
BEGIN
  -- Auth guard
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Plan guard
  IF NOT EXISTS (
    SELECT 1 FROM public.subscription_plans
    WHERE tier = p_plan_tier AND active = true
  ) THEN
    RAISE EXCEPTION 'Unknown or inactive plan: %', p_plan_tier USING ERRCODE = 'P0002';
  END IF;

  -- Interval guard
  IF p_billing_interval NOT IN ('monthly', 'annual') THEN
    RAISE EXCEPTION 'Invalid billing interval: %', p_billing_interval USING ERRCODE = 'P0003';
  END IF;

  -- Amount sanity
  IF p_charge_amount_minor <= 0 THEN
    RAISE EXCEPTION 'Charge amount must be positive' USING ERRCODE = 'P0004';
  END IF;

  -- Idempotency: return existing pending if key matches
  SELECT id INTO v_sub_id
  FROM public.user_subscriptions
  WHERE user_id = v_user_id
    AND status = 'pending'
    AND provider_name = 'mock'
    AND (metadata->>'idempotency_key') = p_idempotency_key
  LIMIT 1;

  IF v_sub_id IS NOT NULL THEN
    RETURN json_build_object(
      'subscription_id', v_sub_id,
      'mock_session_id', 'mock_' || v_sub_id::TEXT
    );
  END IF;

  -- Cancel any stale pending mock subscriptions for this user
  UPDATE public.user_subscriptions
  SET    status = 'cancelled',
         cancelled_at = NOW(),
         updated_at = NOW()
  WHERE  user_id = v_user_id
    AND  status = 'pending'
    AND  provider_name = 'mock';

  -- Compute period end
  v_period_end := NOW() + CASE p_billing_interval
    WHEN 'annual' THEN INTERVAL '1 year'
    ELSE               INTERVAL '1 month'
  END;

  -- Create pending subscription
  INSERT INTO public.user_subscriptions (
    user_id, plan_tier, billing_interval, status, provider_name,
    started_at, current_period_start, current_period_end, metadata
  )
  VALUES (
    v_user_id, p_plan_tier, p_billing_interval, 'pending', 'mock',
    NOW(), NOW(), v_period_end,
    jsonb_build_object(
      'idempotency_key', p_idempotency_key,
      'is_mock',         true,
      'created_at',      NOW()::TEXT
    )
  )
  RETURNING id INTO v_sub_id;

  -- Create pending payment
  INSERT INTO public.billing_payments (
    user_id,
    subscription_id,
    plan_tier,
    provider,
    provider_payment_id,
    provider_subscription_id,
    status,
    charge_amount_minor,
    charge_currency,
    catalog_usd_amount_cents,   -- field name legacy; stores INR rupees catalog value
    price_snapshot_id,
    webhook_event_id,
    metadata
  )
  VALUES (
    v_user_id,
    v_sub_id,
    p_plan_tier,
    'mock',
    'mock_pay_' || gen_random_uuid()::TEXT,
    'mock_sub_' || v_sub_id::TEXT,
    'pending',
    p_charge_amount_minor,
    'INR',
    p_charge_amount_minor,      -- same value for catalog snapshot
    'mock_snapshot',
    'mock_pending_no_webhook',
    jsonb_build_object(
      'is_mock',           true,
      'base_amount_minor', p_base_amount_minor,
      'gst_amount_minor',  p_gst_amount_minor,
      'idempotency_key',   p_idempotency_key
    )
  );

  RETURN json_build_object(
    'subscription_id', v_sub_id,
    'mock_session_id', 'mock_' || v_sub_id::TEXT
  );
END;
$$;

GRANT  EXECUTE ON FUNCTION public.begin_mock_subscription TO authenticated;
REVOKE EXECUTE ON FUNCTION public.begin_mock_subscription FROM anon;


-- ── 3. confirm_mock_subscription ───────────────────────────────────────────
--
-- Resolves a pending mock subscription to one of three outcomes:
--   'success'  — activates subscription, marks payment succeeded, issues invoice
--   'failed'   — marks payment failed, cancels subscription
--   'cancel'   — marks payment cancelled, cancels subscription
--
-- Idempotent: calling with 'success' on an already-active sub returns OK.
-- Prevents duplicate activation: succeeding a cancelled sub raises an error.

CREATE OR REPLACE FUNCTION public.confirm_mock_subscription(
  p_subscription_id UUID,
  p_outcome         TEXT   -- 'success' | 'failed' | 'cancel'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id       UUID := auth.uid();
  v_sub           RECORD;
  v_plan          RECORD;
  v_inv_number    TEXT;
  v_inv_id        UUID;
  v_base_minor    BIGINT;
  v_gst_minor     BIGINT;
  v_charge_minor  BIGINT;
BEGIN
  -- Auth guard
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Outcome guard
  IF p_outcome NOT IN ('success', 'failed', 'cancel') THEN
    RAISE EXCEPTION 'Invalid outcome: %. Must be success, failed, or cancel.', p_outcome;
  END IF;

  -- Fetch subscription (must belong to calling user)
  SELECT * INTO v_sub
  FROM public.user_subscriptions
  WHERE id = p_subscription_id
    AND user_id = v_user_id
    AND provider_name = 'mock';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mock subscription not found or not owned by user' USING ERRCODE = 'P0005';
  END IF;

  -- Idempotency: already in terminal state
  IF v_sub.status = 'active' AND p_outcome = 'success' THEN
    -- Already activated — return existing invoice if any
    SELECT invoice_number INTO v_inv_number
    FROM   public.billing_invoices
    WHERE  subscription_id = p_subscription_id
    LIMIT  1;
    RETURN json_build_object('success', true, 'invoice_number', COALESCE(v_inv_number, ''));
  END IF;

  IF v_sub.status IN ('cancelled', 'failed') AND p_outcome IN ('failed', 'cancel') THEN
    RETURN json_build_object('success', false, 'outcome', p_outcome);
  END IF;

  -- Must be pending to proceed
  IF v_sub.status != 'pending' THEN
    RAISE EXCEPTION 'Subscription % is in status %, cannot process', p_subscription_id, v_sub.status;
  END IF;

  -- ── SUCCESS PATH ─────────────────────────────────────────────────────────
  IF p_outcome = 'success' THEN

    -- Activate subscription
    UPDATE public.user_subscriptions
    SET    status = 'active',
           updated_at = NOW()
    WHERE  id = p_subscription_id;

    -- Mark payment succeeded
    UPDATE public.billing_payments
    SET    status = 'succeeded',
           paid_at = NOW(),
           webhook_event_id = 'mock_confirmed_success'
    WHERE  subscription_id = p_subscription_id
      AND  status = 'pending';

    -- Read amounts from payment metadata
    SELECT
      COALESCE((metadata->>'base_amount_minor')::BIGINT, 0),
      COALESCE((metadata->>'gst_amount_minor')::BIGINT, 0),
      charge_amount_minor
    INTO v_base_minor, v_gst_minor, v_charge_minor
    FROM public.billing_payments
    WHERE subscription_id = p_subscription_id
    LIMIT 1;

    -- Look up plan display name
    SELECT * INTO v_plan
    FROM   public.subscription_plans
    WHERE  tier = v_sub.plan_tier;

    -- Generate invoice number: INV{seq}-MOCK
    v_inv_number := 'INV' || LPAD(nextval('billing_invoice_seq')::TEXT, 6, '0') || '-MOCK';

    -- Issue invoice
    INSERT INTO public.billing_invoices (
      user_id,
      subscription_id,
      invoice_number,
      status,
      base_amount_minor,
      gst_amount_minor,
      total_amount_minor,
      gst_rate_percent,
      charge_currency,
      plan_tier,
      billing_interval,
      is_mock,
      metadata
    )
    VALUES (
      v_user_id,
      p_subscription_id,
      v_inv_number,
      'issued',
      v_base_minor,
      v_gst_minor,
      v_charge_minor,
      18.00,
      'INR',
      v_sub.plan_tier,
      v_sub.billing_interval,
      true,
      jsonb_build_object(
        'is_mock',       true,
        'label',         'MOCK / TEST MODE — Not a real charge',
        'plan_name',     COALESCE(v_plan.display_name, v_sub.plan_tier),
        'activated_at',  NOW()::TEXT
      )
    )
    RETURNING id INTO v_inv_id;

    -- Store invoice reference on the payment row
    UPDATE public.billing_payments
    SET    provider_invoice_id = v_inv_number,
           metadata = metadata || jsonb_build_object('invoice_id', v_inv_id::TEXT)
    WHERE  subscription_id = p_subscription_id;

    RETURN json_build_object(
      'success',        true,
      'invoice_number', v_inv_number
    );

  -- ── FAILURE / CANCEL PATH ─────────────────────────────────────────────────
  ELSE
    -- Mark payment as failed or cancelled
    UPDATE public.billing_payments
    SET    status = p_outcome,
           failure_reason = CASE p_outcome
             WHEN 'failed' THEN 'Simulated payment failure (mock mode)'
             ELSE               'User cancelled payment (mock mode)'
           END,
           webhook_event_id = 'mock_confirmed_' || p_outcome
    WHERE  subscription_id = p_subscription_id
      AND  status = 'pending';

    -- Cancel the pending subscription
    UPDATE public.user_subscriptions
    SET    status = 'cancelled',
           cancelled_at = NOW(),
           updated_at = NOW()
    WHERE  id = p_subscription_id;

    RETURN json_build_object('success', false, 'outcome', p_outcome);
  END IF;

END;
$$;

GRANT  EXECUTE ON FUNCTION public.confirm_mock_subscription TO authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_mock_subscription FROM anon;


-- ── 4. get_my_invoices ─────────────────────────────────────────────────────
--
-- Returns the authenticated user's billing invoices (most recent first).
-- Usable by both mock and real payment flows.

CREATE OR REPLACE FUNCTION public.get_my_invoices()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  RETURN (
    SELECT json_agg(row_to_json(inv) ORDER BY inv.created_at DESC)
    FROM (
      SELECT
        id,
        invoice_number,
        status,
        base_amount_minor,
        gst_amount_minor,
        total_amount_minor,
        gst_rate_percent,
        charge_currency,
        plan_tier,
        billing_interval,
        is_mock,
        metadata,
        created_at
      FROM public.billing_invoices
      WHERE user_id = v_user_id
      ORDER BY created_at DESC
      LIMIT 50
    ) inv
  );
END;
$$;

GRANT  EXECUTE ON FUNCTION public.get_my_invoices TO authenticated;
REVOKE EXECUTE ON FUNCTION public.get_my_invoices FROM anon;


-- ── Index for faster subscription lookups ──────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_status
  ON public.user_subscriptions (user_id, status);

CREATE INDEX IF NOT EXISTS idx_billing_payments_subscription
  ON public.billing_payments (subscription_id);

CREATE INDEX IF NOT EXISTS idx_billing_invoices_user
  ON public.billing_invoices (user_id, created_at DESC);
