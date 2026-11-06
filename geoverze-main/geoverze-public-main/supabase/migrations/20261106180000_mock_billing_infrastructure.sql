-- ============================================================
-- GVRZE: Mock payment billing infrastructure
-- Migration: 20261106180000_mock_billing_infrastructure.sql
--
-- Root cause: begin_mock_subscription tried to INSERT into
-- billing_payments with:
--   price_snapshot_id = NULL  → violates NOT NULL constraint
--   webhook_event_id = NULL   → violates NOT NULL constraint
--
-- Both columns are NOT NULL FKs into tables that:
--   a) have CHECK constraints allowing only 'razorpay'|'stripe'
--   b) had zero rows (billing_price_snapshots, billing_webhook_events)
--
-- Full dependency chain for billing_payments:
--   billing_payments.price_snapshot_id
--     → billing_price_snapshots (needs billing_provider_price_id
--         → billing_provider_prices [provider constraint: razorpay|stripe]
--       AND billing_provider_plan_instance_id
--         → billing_provider_plan_instances [provider constraint: razorpay|stripe])
--   billing_payments.webhook_event_id
--     → billing_webhook_events [provider constraint: razorpay|stripe]
--
-- Fix:
--   1. Extend provider CHECK constraints to allow 'mock'
--   2. Seed mock billing_provider_prices (6 rows: basic/pro/advance x monthly/annual)
--   3. Seed mock billing_provider_plan_instances (6 rows, one per price)
--   4. Redeploy begin_mock_subscription to build the full chain
--      (webhook_event → price_snapshot → payment) per mock payment attempt
--
-- No existing data is modified, deleted, or recreated.
-- All NOT NULL constraints and FK constraints are preserved.
-- ============================================================

-- ── 1. Extend provider constraints ───────────────────────────────────────────

ALTER TABLE public.billing_provider_prices
  DROP CONSTRAINT billing_provider_prices_provider_allowed;
ALTER TABLE public.billing_provider_prices
  ADD CONSTRAINT billing_provider_prices_provider_allowed
  CHECK (provider = ANY (ARRAY['razorpay'::text, 'stripe'::text, 'mock'::text]));

ALTER TABLE public.billing_provider_plan_instances
  DROP CONSTRAINT billing_provider_plan_instances_provider_allowed;
ALTER TABLE public.billing_provider_plan_instances
  ADD CONSTRAINT billing_provider_plan_instances_provider_allowed
  CHECK (provider = ANY (ARRAY['razorpay'::text, 'stripe'::text, 'mock'::text]));

ALTER TABLE public.billing_webhook_events
  DROP CONSTRAINT billing_webhook_events_provider_allowed;
ALTER TABLE public.billing_webhook_events
  ADD CONSTRAINT billing_webhook_events_provider_allowed
  CHECK (provider = ANY (ARRAY['razorpay'::text, 'stripe'::text, 'mock'::text]));


-- ── 2. Mock billing_provider_prices ──────────────────────────────────────────
-- Catalog prices from subscription_plans (whole rupees → paise for plan instances):
--   basic monthly 99, basic annual 999
--   pro monthly 499, pro annual 3999
--   advance monthly 999, advance annual 8000
-- These rows use deterministic UUIDs (a1b2c300-…) so re-running is idempotent.

INSERT INTO public.billing_provider_prices
  (id, provider, plan_tier, billing_interval, currency,
   pricing_mode, price_lock_policy, rounding_mode, active, metadata)
VALUES
  ('a1b2c300-0000-0000-0001-000000000001', 'mock', 'basic',   'monthly', 'INR',
   'fixed', 'locked_at_signup', 'half_up_minor_unit', true, '{"is_mock":true}'),
  ('a1b2c300-0000-0000-0001-000000000002', 'mock', 'basic',   'annual',  'INR',
   'fixed', 'locked_at_signup', 'half_up_minor_unit', true, '{"is_mock":true}'),
  ('a1b2c300-0000-0000-0001-000000000003', 'mock', 'pro',     'monthly', 'INR',
   'fixed', 'locked_at_signup', 'half_up_minor_unit', true, '{"is_mock":true}'),
  ('a1b2c300-0000-0000-0001-000000000004', 'mock', 'pro',     'annual',  'INR',
   'fixed', 'locked_at_signup', 'half_up_minor_unit', true, '{"is_mock":true}'),
  ('a1b2c300-0000-0000-0001-000000000005', 'mock', 'advance', 'monthly', 'INR',
   'fixed', 'locked_at_signup', 'half_up_minor_unit', true, '{"is_mock":true}'),
  ('a1b2c300-0000-0000-0001-000000000006', 'mock', 'advance', 'annual',  'INR',
   'fixed', 'locked_at_signup', 'half_up_minor_unit', true, '{"is_mock":true}')
ON CONFLICT (id) DO NOTHING;


-- ── 3. Mock billing_provider_plan_instances ───────────────────────────────────
-- charge_amount_minor is in paise (INR minor unit).
-- catalog_usd_amount_cents = 0 (INR-only product, no USD equivalent defined).

INSERT INTO public.billing_provider_plan_instances
  (id, provider, provider_plan_id, billing_provider_price_id,
   charge_currency, charge_amount_minor, billing_interval,
   catalog_usd_amount_cents, metadata)
VALUES
  ('b1b2c300-0000-0000-0001-000000000001', 'mock', 'mock_plan_basic_monthly',
   'a1b2c300-0000-0000-0001-000000000001', 'INR',  9900,   'monthly', 0,
   '{"is_mock":true,"plan_tier":"basic"}'),
  ('b1b2c300-0000-0000-0001-000000000002', 'mock', 'mock_plan_basic_annual',
   'a1b2c300-0000-0000-0001-000000000002', 'INR',  99900,  'annual',  0,
   '{"is_mock":true,"plan_tier":"basic"}'),
  ('b1b2c300-0000-0000-0001-000000000003', 'mock', 'mock_plan_pro_monthly',
   'a1b2c300-0000-0000-0001-000000000003', 'INR',  49900,  'monthly', 0,
   '{"is_mock":true,"plan_tier":"pro"}'),
  ('b1b2c300-0000-0000-0001-000000000004', 'mock', 'mock_plan_pro_annual',
   'a1b2c300-0000-0000-0001-000000000004', 'INR',  399900, 'annual',  0,
   '{"is_mock":true,"plan_tier":"pro"}'),
  ('b1b2c300-0000-0000-0001-000000000005', 'mock', 'mock_plan_advance_monthly',
   'a1b2c300-0000-0000-0001-000000000005', 'INR',  99900,  'monthly', 0,
   '{"is_mock":true,"plan_tier":"advance"}'),
  ('b1b2c300-0000-0000-0001-000000000006', 'mock', 'mock_plan_advance_annual',
   'a1b2c300-0000-0000-0001-000000000006', 'INR',  800000, 'annual',  0,
   '{"is_mock":true,"plan_tier":"advance"}')
ON CONFLICT (id) DO NOTHING;


-- ── 4. Redeploy begin_mock_subscription ───────────────────────────────────────
-- Now builds the full chain per payment:
--   user_subscriptions (pending)
--   → billing_webhook_events (mock event)
--   → billing_price_snapshots (using mock plan instance)
--   → billing_payments (all NOT NULL fields satisfied)

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
AS $func$
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
  -- Auth guard
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Plan guard
  IF NOT EXISTS (SELECT 1 FROM public.subscription_plans WHERE tier = p_plan_tier AND active = true) THEN
    RAISE EXCEPTION 'Unknown or inactive plan: %', p_plan_tier USING ERRCODE = 'P0002';
  END IF;

  -- Interval guard
  IF p_billing_interval NOT IN ('monthly', 'annual') THEN
    RAISE EXCEPTION 'Invalid billing interval: %', p_billing_interval USING ERRCODE = 'P0003';
  END IF;

  -- Amount guard
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
    RETURN json_build_object(
      'subscription_id', v_sub_id,
      'mock_session_id', 'mock_' || v_sub_id::TEXT
    );
  END IF;

  -- Resolve mock plan instance for this plan + interval
  -- (seeded in this migration; deterministic UUIDs)
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
    RAISE EXCEPTION 'No mock plan instance for % %. Ensure migration 20261106180000 has been applied.',
      p_plan_tier, p_billing_interval
    USING ERRCODE = 'P0010';
  END IF;

  -- Cancel any stale pending mock subscriptions for this user
  UPDATE public.user_subscriptions
  SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
  WHERE user_id = v_user_id AND status = 'pending' AND provider_name = 'mock';

  -- Compute period end
  v_period_end := NOW() + CASE p_billing_interval
    WHEN 'annual' THEN INTERVAL '1 year'
    ELSE               INTERVAL '1 month'
  END;

  -- Create pending subscription
  INSERT INTO public.user_subscriptions (
    user_id, plan_tier, billing_interval, status, provider_name,
    started_at, current_period_start, current_period_end, metadata
  ) VALUES (
    v_user_id, p_plan_tier, p_billing_interval, 'pending', 'mock',
    NOW(), NOW(), v_period_end,
    jsonb_build_object(
      'idempotency_key', p_idempotency_key,
      'is_mock',         true,
      'created_at',      NOW()::TEXT
    )
  ) RETURNING id INTO v_sub_id;

  -- Create a mock webhook event (satisfies billing_payments.webhook_event_id NOT NULL)
  v_event_payload := jsonb_build_object(
    'mock',                 true,
    'subscription_id',      v_sub_id::TEXT,
    'plan_tier',            p_plan_tier,
    'billing_interval',     p_billing_interval,
    'charge_amount_minor',  p_charge_amount_minor
  );
  v_event_sha256 := encode(sha256((v_sub_id::TEXT || '_mock_pending')::bytea), 'hex');

  INSERT INTO public.billing_webhook_events (
    provider, provider_event_id, event_type, normalized_event_type,
    provider_subscription_id, payload, payload_sha256,
    processing_status, subscription_id, metadata
  ) VALUES (
    'mock',
    'mock_evt_pending_' || v_sub_id::TEXT,
    'subscription.mock.pending',
    'subscription_pending',
    'mock_sub_' || v_sub_id::TEXT,
    v_event_payload,
    v_event_sha256,
    'processed',
    v_sub_id,
    jsonb_build_object('is_mock', true)
  ) RETURNING id INTO v_event_id;

  -- Create price snapshot for this subscription
  -- (charge_amount_minor = actual client amount including GST)
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
    'half_up_minor_unit', 'locked_at_signup', v_provider_plan_id,
    'initial',
    jsonb_build_object(
      'is_mock',           true,
      'base_amount_minor', p_base_amount_minor,
      'gst_amount_minor',  p_gst_amount_minor
    )
  ) RETURNING id INTO v_snapshot_id;

  -- Backfill snapshot reference on the subscription
  UPDATE public.user_subscriptions
  SET current_price_snapshot_id = v_snapshot_id
  WHERE id = v_sub_id;

  -- Create pending payment with ALL required NOT NULL fields populated
  INSERT INTO public.billing_payments (
    user_id, subscription_id, plan_tier, provider,
    price_snapshot_id,
    provider_payment_id, provider_subscription_id,
    status, charge_amount_minor, charge_currency,
    catalog_usd_amount_cents,
    webhook_event_id,
    metadata
  ) VALUES (
    v_user_id, v_sub_id, p_plan_tier, 'mock',
    v_snapshot_id,
    'mock_pay_' || gen_random_uuid()::TEXT,
    'mock_sub_' || v_sub_id::TEXT,
    'pending', p_charge_amount_minor, 'INR',
    0,
    v_event_id,
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
$func$;

GRANT  EXECUTE ON FUNCTION public.begin_mock_subscription TO authenticated;
REVOKE EXECUTE ON FUNCTION public.begin_mock_subscription FROM anon;
