-- ============================================================
-- GVRZE: Subscription Upgrade (Proration) RPCs
-- Migration: 20261107020000_subscription_upgrade_rpcs.sql
--
-- Creates:
--   1. begin_mock_upgrade   — time-based proration calc, pending upgrade payment
--   2. confirm_mock_upgrade — succeeds/fails upgrade, mutates plan_tier in-place
--
-- Proration formula (GST-inclusive catalog prices):
--   credit_rupees   = current_price × (remaining_secs / total_secs), rounded
--   upgrade_rupees  = max(1, target_price − credit_rupees)
--   base_rupees     = round(upgrade_rupees / 1.18, 2)   [back out 18% GST]
--   gst_rupees      = round(upgrade_rupees − base_rupees, 2)
--   charge_minor    = round(upgrade_rupees × 100)        [paise]
--
-- Tier order guard:
--   explorer(0) < basic(1) < pro(2) < advance(3)
--   Attempting to 'upgrade' to equal or lower tier raises P0007.
--
-- Idempotency:
--   begin_mock_upgrade checks (subscription_id, idempotency_key) in
--   billing_payments.metadata before creating new records.
--   confirm_mock_upgrade checks billing_payments.status before acting.
--
-- Architecture:
--   begin_mock_upgrade does NOT create a new user_subscriptions row.
--   It creates a pending billing_payment linked to the EXISTING active
--   subscription. confirm_mock_upgrade updates the subscription plan_tier
--   in-place on success (period_end is preserved — user paid the difference).
-- ============================================================


-- ── 1. begin_mock_upgrade ────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.begin_mock_upgrade(
  p_target_plan_tier TEXT,
  p_billing_interval  TEXT,
  p_idempotency_key   TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id            UUID           := auth.uid();
  v_sub                RECORD;
  v_current_plan       RECORD;
  v_target_plan        RECORD;
  v_current_tier_ord   INT;
  v_target_tier_ord    INT;
  v_total_secs         DOUBLE PRECISION;
  v_remaining_secs     DOUBLE PRECISION;
  v_credit_ratio       DOUBLE PRECISION;
  v_current_price_rp   NUMERIC;
  v_target_price_rp    NUMERIC;
  v_credit_rp          NUMERIC;
  v_upgrade_rp         NUMERIC;
  v_base_rp            NUMERIC;
  v_gst_rp             NUMERIC;
  v_base_minor         BIGINT;
  v_gst_minor          BIGINT;
  v_charge_minor       BIGINT;
  v_price_id           UUID;
  v_plan_instance_id   UUID;
  v_provider_plan_id   TEXT;
  v_event_id           UUID;
  v_snapshot_id        UUID;
  v_payment_id         UUID;
  v_existing_meta      JSONB;
BEGIN
  -- Auth guard
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Interval guard
  IF p_billing_interval NOT IN ('monthly', 'annual') THEN
    RAISE EXCEPTION 'Invalid billing interval: %', p_billing_interval USING ERRCODE = 'P0003';
  END IF;

  -- Target plan must exist and be active
  SELECT * INTO v_target_plan
  FROM public.subscription_plans
  WHERE tier = p_target_plan_tier AND active = true;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Unknown or inactive plan: %', p_target_plan_tier USING ERRCODE = 'P0002';
  END IF;

  -- Find the user's most recent active mock subscription
  SELECT * INTO v_sub
  FROM public.user_subscriptions
  WHERE user_id = v_user_id
    AND status IN ('active', 'trialing')
    AND provider_name = 'mock'
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No active mock subscription found. Cannot upgrade without an active subscription.' USING ERRCODE = 'P0006';
  END IF;

  -- Tier order check (explorer=0, basic=1, pro=2, advance=3)
  v_current_tier_ord := CASE v_sub.plan_tier
    WHEN 'explorer' THEN 0 WHEN 'basic' THEN 1
    WHEN 'pro'      THEN 2 WHEN 'advance' THEN 3
    ELSE 99
  END;
  v_target_tier_ord := CASE p_target_plan_tier
    WHEN 'explorer' THEN 0 WHEN 'basic' THEN 1
    WHEN 'pro'      THEN 2 WHEN 'advance' THEN 3
    ELSE -1
  END;

  IF v_target_tier_ord <= v_current_tier_ord THEN
    RAISE EXCEPTION 'Target plan % is not an upgrade from current plan %.',
      p_target_plan_tier, v_sub.plan_tier USING ERRCODE = 'P0007';
  END IF;

  -- Billing interval must match current subscription
  IF v_sub.billing_interval != p_billing_interval THEN
    RAISE EXCEPTION 'Billing interval mismatch: current=%, requested=%. Use the same interval as your existing subscription.',
      v_sub.billing_interval, p_billing_interval USING ERRCODE = 'P0008';
  END IF;

  -- Idempotency: return existing pending upgrade payment if key matches
  SELECT bp.id, bp.charge_amount_minor, bp.metadata
  INTO v_payment_id, v_charge_minor, v_existing_meta
  FROM public.billing_payments bp
  WHERE bp.user_id  = v_user_id
    AND bp.subscription_id = v_sub.id
    AND bp.status   = 'pending'
    AND (bp.metadata->>'idempotency_key') = p_idempotency_key
    AND (bp.metadata->>'payment_type')    = 'upgrade'
  LIMIT 1;

  IF v_payment_id IS NOT NULL THEN
    RETURN json_build_object(
      'subscription_id',      v_sub.id,
      'upgrade_payment_id',   v_payment_id,
      'current_plan_tier',    v_sub.plan_tier,
      'target_plan_tier',     p_target_plan_tier,
      'billing_interval',     p_billing_interval,
      'current_price_rupees', (v_existing_meta->>'current_price_rupees')::NUMERIC,
      'target_price_rupees',  (v_existing_meta->>'target_price_rupees')::NUMERIC,
      'credit_rupees',        (v_existing_meta->>'credit_rupees')::NUMERIC,
      'upgrade_rupees',       (v_existing_meta->>'upgrade_rupees')::NUMERIC,
      'base_amount_minor',    (v_existing_meta->>'base_amount_minor')::BIGINT,
      'gst_amount_minor',     (v_existing_meta->>'gst_amount_minor')::BIGINT,
      'charge_amount_minor',  v_charge_minor
    );
  END IF;

  -- Fetch current plan details
  SELECT * INTO v_current_plan
  FROM public.subscription_plans
  WHERE tier = v_sub.plan_tier AND active = true;

  -- Resolve plan prices (catalog stores whole rupees, GST-inclusive)
  v_current_price_rp := CASE p_billing_interval
    WHEN 'annual' THEN COALESCE(v_current_plan.annual_price_cents, v_current_plan.monthly_price_cents * 12)
    ELSE v_current_plan.monthly_price_cents
  END;

  v_target_price_rp := CASE p_billing_interval
    WHEN 'annual' THEN COALESCE(v_target_plan.annual_price_cents, v_target_plan.monthly_price_cents * 12)
    ELSE v_target_plan.monthly_price_cents
  END;

  -- Time-based proration
  v_total_secs     := GREATEST(1, EXTRACT(EPOCH FROM (v_sub.current_period_end - v_sub.current_period_start)));
  v_remaining_secs := GREATEST(0, EXTRACT(EPOCH FROM (v_sub.current_period_end - NOW())));
  v_credit_ratio   := v_remaining_secs / v_total_secs;

  -- Credit = current price × remaining ratio, rounded to nearest rupee
  v_credit_rp  := ROUND(v_current_price_rp::NUMERIC * v_credit_ratio::NUMERIC);

  -- Upgrade amount = target price − credit, minimum ₹1
  v_upgrade_rp := GREATEST(1, v_target_price_rp::NUMERIC - v_credit_rp);

  -- Back out GST (18% inclusive)
  v_base_rp    := ROUND(v_upgrade_rp / 1.18, 2);
  v_gst_rp     := ROUND(v_upgrade_rp - v_base_rp, 2);

  -- Convert to paise (INR minor units)
  v_base_minor   := ROUND(v_base_rp   * 100);
  v_gst_minor    := ROUND(v_gst_rp    * 100);
  v_charge_minor := ROUND(v_upgrade_rp * 100);

  -- Resolve mock plan instance for the TARGET plan
  SELECT bppi.id, bpp.id, bppi.provider_plan_id
  INTO v_plan_instance_id, v_price_id, v_provider_plan_id
  FROM public.billing_provider_plan_instances bppi
  JOIN public.billing_provider_prices bpp ON bpp.id = bppi.billing_provider_price_id
  WHERE bppi.provider = 'mock'
    AND bpp.provider   = 'mock'
    AND bpp.plan_tier  = p_target_plan_tier
    AND bpp.billing_interval = p_billing_interval
    AND bpp.active     = true
  LIMIT 1;

  IF v_plan_instance_id IS NULL THEN
    RAISE EXCEPTION 'No mock plan instance for % %. Ensure migration 20261106180000 has been applied.',
      p_target_plan_tier, p_billing_interval
    USING ERRCODE = 'P0010';
  END IF;

  -- Create a mock webhook event for this upgrade payment
  INSERT INTO public.billing_webhook_events (
    provider, provider_event_id, event_type, normalized_event_type,
    provider_subscription_id, payload, payload_sha256,
    processing_status, subscription_id, metadata
  ) VALUES (
    'mock',
    'mock_evt_upgrade_' || gen_random_uuid()::TEXT,
    'subscription.mock.upgrade_pending',
    'subscription_upgrade_pending',
    'mock_sub_' || v_sub.id::TEXT,
    jsonb_build_object(
      'mock',                 true,
      'subscription_id',      v_sub.id::TEXT,
      'from_plan_tier',       v_sub.plan_tier,
      'to_plan_tier',         p_target_plan_tier,
      'billing_interval',     p_billing_interval,
      'credit_rupees',        v_credit_rp,
      'upgrade_charge_minor', v_charge_minor
    ),
    encode(sha256((v_sub.id::TEXT || '_upgrade_' || p_target_plan_tier || '_' || NOW()::TEXT)::bytea), 'hex'),
    'processed',
    v_sub.id,
    jsonb_build_object('is_mock', true, 'payment_type', 'upgrade')
  ) RETURNING id INTO v_event_id;

  -- Create a price snapshot for the upgrade payment amount
  INSERT INTO public.billing_price_snapshots (
    subscription_id, user_id,
    billing_provider_price_id, billing_provider_plan_instance_id,
    plan_tier, billing_interval,
    catalog_usd_amount_cents, catalog_usd_currency,
    charge_currency, charge_amount_minor,
    rounding_mode, price_lock_policy, provider_plan_id,
    snapshot_reason, metadata
  ) VALUES (
    v_sub.id, v_user_id,
    v_price_id, v_plan_instance_id,
    p_target_plan_tier, p_billing_interval,
    0, 'USD',
    'INR', v_charge_minor,
    'half_up_minor_unit', 'locked_at_signup', v_provider_plan_id,
    'upgrade',
    jsonb_build_object(
      'is_mock',              true,
      'payment_type',         'upgrade',
      'from_plan_tier',       v_sub.plan_tier,
      'to_plan_tier',         p_target_plan_tier,
      'base_amount_minor',    v_base_minor,
      'gst_amount_minor',     v_gst_minor,
      'credit_rupees',        v_credit_rp,
      'upgrade_rupees',       v_upgrade_rp,
      'current_price_rupees', v_current_price_rp,
      'target_price_rupees',  v_target_price_rp
    )
  ) RETURNING id INTO v_snapshot_id;

  -- Create the pending upgrade billing_payment
  INSERT INTO public.billing_payments (
    user_id, subscription_id, plan_tier, provider,
    price_snapshot_id,
    provider_payment_id, provider_subscription_id,
    status, charge_amount_minor, charge_currency,
    catalog_usd_amount_cents,
    webhook_event_id,
    metadata
  ) VALUES (
    v_user_id, v_sub.id, p_target_plan_tier, 'mock',
    v_snapshot_id,
    'mock_upg_pay_' || gen_random_uuid()::TEXT,
    'mock_sub_' || v_sub.id::TEXT,
    'pending', v_charge_minor, 'INR',
    0,
    v_event_id,
    jsonb_build_object(
      'is_mock',              true,
      'payment_type',         'upgrade',
      'idempotency_key',      p_idempotency_key,
      'from_plan_tier',       v_sub.plan_tier,
      'to_plan_tier',         p_target_plan_tier,
      'billing_interval',     p_billing_interval,
      'current_price_rupees', v_current_price_rp,
      'target_price_rupees',  v_target_price_rp,
      'credit_rupees',        v_credit_rp,
      'upgrade_rupees',       v_upgrade_rp,
      'base_amount_minor',    v_base_minor,
      'gst_amount_minor',     v_gst_minor
    )
  ) RETURNING id INTO v_payment_id;

  RETURN json_build_object(
    'subscription_id',      v_sub.id,
    'upgrade_payment_id',   v_payment_id,
    'current_plan_tier',    v_sub.plan_tier,
    'target_plan_tier',     p_target_plan_tier,
    'billing_interval',     p_billing_interval,
    'current_price_rupees', v_current_price_rp,
    'target_price_rupees',  v_target_price_rp,
    'credit_rupees',        v_credit_rp,
    'upgrade_rupees',       v_upgrade_rp,
    'base_amount_minor',    v_base_minor,
    'gst_amount_minor',     v_gst_minor,
    'charge_amount_minor',  v_charge_minor
  );
END;
$$;

GRANT  EXECUTE ON FUNCTION public.begin_mock_upgrade TO authenticated;
REVOKE EXECUTE ON FUNCTION public.begin_mock_upgrade FROM anon;


-- ── 2. confirm_mock_upgrade ──────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.confirm_mock_upgrade(
  p_upgrade_payment_id UUID,
  p_outcome            TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id        UUID := auth.uid();
  v_pay            RECORD;
  v_sub            RECORD;
  v_current_plan   RECORD;
  v_target_plan    RECORD;
  v_from_tier      TEXT;
  v_to_tier        TEXT;
  v_interval       TEXT;
  v_inv_number     TEXT;
  v_inv_id         UUID;
  v_base_minor     BIGINT;
  v_gst_minor      BIGINT;
  v_charge_minor   BIGINT;
  v_pay_status     TEXT;
  v_grant_id       UUID;
  v_ledger_id      UUID;
  v_grant_key      TEXT;
  v_ledger_key     TEXT;
  v_additional_credits INT;
  v_period_start   TIMESTAMPTZ;
  v_period_end     TIMESTAMPTZ;
  v_expires_at     TIMESTAMPTZ;
BEGIN
  -- Auth guard
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Outcome guard
  IF p_outcome NOT IN ('success', 'failed', 'cancel') THEN
    RAISE EXCEPTION 'Invalid outcome: %. Must be success, failed, or cancel.', p_outcome;
  END IF;

  -- Fetch the pending upgrade payment (must belong to caller, must be an upgrade)
  SELECT bp.*
  INTO v_pay
  FROM public.billing_payments bp
  WHERE bp.id      = p_upgrade_payment_id
    AND bp.user_id = v_user_id
    AND bp.provider = 'mock'
    AND (bp.metadata->>'payment_type') = 'upgrade';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Upgrade payment not found or not owned by user' USING ERRCODE = 'P0005';
  END IF;

  -- Extract upgrade metadata
  v_from_tier     := v_pay.metadata->>'from_plan_tier';
  v_to_tier       := v_pay.metadata->>'to_plan_tier';
  v_interval      := v_pay.metadata->>'billing_interval';
  v_base_minor    := (v_pay.metadata->>'base_amount_minor')::BIGINT;
  v_gst_minor     := (v_pay.metadata->>'gst_amount_minor')::BIGINT;
  v_charge_minor  := v_pay.charge_amount_minor;

  -- Idempotency: payment already succeeded
  IF v_pay.status = 'succeeded' AND p_outcome = 'success' THEN
    SELECT invoice_number INTO v_inv_number
    FROM public.billing_invoices
    WHERE subscription_id = v_pay.subscription_id
      AND (metadata->>'payment_type') = 'upgrade'
    ORDER BY created_at DESC LIMIT 1;
    RETURN json_build_object(
      'success', true,
      'invoice_number', COALESCE(v_inv_number, ''),
      'already_active', true
    );
  END IF;

  -- Idempotency: payment already failed/cancelled
  IF v_pay.status IN ('failed', 'cancelled') AND p_outcome IN ('failed', 'cancel') THEN
    RETURN json_build_object('success', false, 'outcome', p_outcome);
  END IF;

  -- Must be pending to proceed
  IF v_pay.status != 'pending' THEN
    RAISE EXCEPTION 'Upgrade payment % is in status %, cannot process', p_upgrade_payment_id, v_pay.status;
  END IF;

  -- ════════════════════════════════════════════════════════════════════════
  -- SUCCESS PATH
  -- ════════════════════════════════════════════════════════════════════════
  IF p_outcome = 'success' THEN

    -- Fetch the subscription we're upgrading
    SELECT * INTO v_sub
    FROM public.user_subscriptions
    WHERE id = v_pay.subscription_id
      AND user_id = v_user_id;

    IF NOT FOUND THEN
      RAISE EXCEPTION 'Subscription not found for upgrade payment' USING ERRCODE = 'P0005';
    END IF;

    -- Mark payment as succeeded
    UPDATE public.billing_payments
    SET status = 'succeeded', paid_at = NOW()
    WHERE id = p_upgrade_payment_id;

    -- Upgrade the subscription plan in-place
    -- period_end stays the same (user already paid for remaining time via credit)
    UPDATE public.user_subscriptions
    SET
      plan_tier  = v_to_tier,
      updated_at = NOW(),
      metadata   = metadata || jsonb_build_object(
        'upgraded_at',        NOW()::TEXT,
        'upgraded_from',      v_from_tier,
        'upgraded_to',        v_to_tier,
        'upgrade_payment_id', p_upgrade_payment_id::TEXT
      )
    WHERE id = v_pay.subscription_id;

    -- Fetch plan details for invoice and credit calculation
    SELECT * INTO v_current_plan FROM public.subscription_plans WHERE tier = v_from_tier;
    SELECT * INTO v_target_plan  FROM public.subscription_plans WHERE tier = v_to_tier;

    -- Issue upgrade invoice
    v_inv_number := 'INV' || LPAD(nextval('billing_invoice_seq')::TEXT, 6, '0') || '-MOCK-UPG';
    INSERT INTO public.billing_invoices (
      user_id, subscription_id, invoice_number, status,
      base_amount_minor, gst_amount_minor, total_amount_minor,
      gst_rate_percent, charge_currency, plan_tier, billing_interval,
      is_mock, metadata
    ) VALUES (
      v_user_id, v_pay.subscription_id, v_inv_number, 'issued',
      v_base_minor, v_gst_minor, v_charge_minor, 18.00, 'INR',
      v_to_tier, v_interval, true,
      jsonb_build_object(
        'is_mock',        true,
        'payment_type',   'upgrade',
        'from_plan_tier', v_from_tier,
        'to_plan_tier',   v_to_tier,
        'credit_rupees',  (v_pay.metadata->>'credit_rupees')::NUMERIC,
        'upgrade_rupees', (v_pay.metadata->>'upgrade_rupees')::NUMERIC,
        'label', 'MOCK / TEST — Upgrade: ' || UPPER(v_from_tier) || ' → ' || UPPER(v_to_tier) || ' — Not a real charge'
      )
    ) RETURNING id INTO v_inv_id;

    -- Link invoice to payment
    UPDATE public.billing_payments
    SET provider_invoice_id = v_inv_number,
        metadata = metadata || jsonb_build_object('invoice_id', v_inv_id::TEXT)
    WHERE id = p_upgrade_payment_id;

    -- Grant ADDITIONAL credits (target_grant − from_grant)
    -- e.g. Basic(5) → Pro(25): grant 20 extra credits
    v_additional_credits := COALESCE(v_target_plan.monthly_credit_grant, 0)
                          - COALESCE(v_current_plan.monthly_credit_grant, 0);

    IF v_additional_credits > 0 THEN
      v_grant_key    := 'mock_upgrade_grant_'  || p_upgrade_payment_id::TEXT;
      v_ledger_key   := 'mock_upgrade_ledger_' || p_upgrade_payment_id::TEXT;
      v_period_start := DATE_TRUNC('month', NOW());
      v_period_end   := v_period_start + INTERVAL '1 month' - INTERVAL '1 second';
      v_expires_at   := DATE_TRUNC('month', NOW()) + INTERVAL '2 months' - INTERVAL '1 second';

      INSERT INTO public.membership_credit_grants (
        user_id, subscription_id, plan_tier, rollover_tier_key,
        credit_amount, status, grant_period_start, grant_period_end,
        idempotency_key, metadata
      ) VALUES (
        v_user_id, v_pay.subscription_id, v_to_tier,
        COALESCE(v_target_plan.rollover_tier_key, v_to_tier),
        v_additional_credits, 'completed',
        v_period_start, v_period_end,
        v_grant_key,
        jsonb_build_object(
          'is_mock',        true,
          'payment_type',   'upgrade',
          'from_plan_tier', v_from_tier,
          'to_plan_tier',   v_to_tier,
          'invoice_number', v_inv_number
        )
      )
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id INTO v_grant_id;

      IF v_grant_id IS NOT NULL THEN
        INSERT INTO public.credit_ledger_entries (
          user_id, amount, entry_type, idempotency_key,
          reference_type, reference_id,
          month_key, plan_tier_at_earn,
          remaining_amount, expires_at, metadata
        ) VALUES (
          v_user_id,
          v_additional_credits,
          'membership_grant',
          v_ledger_key,
          'membership_credit_grant',
          v_grant_id,
          DATE_TRUNC('month', NOW())::DATE,
          v_to_tier,
          v_additional_credits,
          v_expires_at,
          jsonb_build_object(
            'is_mock',        true,
            'payment_type',   'upgrade',
            'from_plan_tier', v_from_tier,
            'to_plan_tier',   v_to_tier
          )
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id INTO v_ledger_id;

        IF v_ledger_id IS NOT NULL THEN
          UPDATE public.membership_credit_grants
          SET ledger_entry_id = v_ledger_id
          WHERE id = v_grant_id;
        END IF;

        -- Atomically add the additional credits to the user wallet
        INSERT INTO public.user_progression (user_id, credits, updated_at)
        VALUES (v_user_id, v_additional_credits, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET credits    = public.user_progression.credits + v_additional_credits,
            updated_at = NOW();
      END IF;
    END IF;

    RETURN json_build_object(
      'success',        true,
      'invoice_number', v_inv_number,
      'already_active', false
    );

  -- ════════════════════════════════════════════════════════════════════════
  -- FAILURE / CANCEL PATH — subscription plan_tier unchanged
  -- ════════════════════════════════════════════════════════════════════════
  ELSE
    v_pay_status := CASE p_outcome WHEN 'cancel' THEN 'cancelled' ELSE p_outcome END;

    UPDATE public.billing_payments
    SET
      status         = v_pay_status,
      failure_reason = CASE p_outcome
        WHEN 'failed' THEN 'Simulated upgrade payment failure (mock mode)'
        WHEN 'cancel' THEN 'User cancelled upgrade payment (mock mode)'
        ELSE 'Upgrade payment not completed'
      END
    WHERE id = p_upgrade_payment_id
      AND status = 'pending';

    RETURN json_build_object('success', false, 'outcome', p_outcome);
  END IF;
END;
$$;

GRANT  EXECUTE ON FUNCTION public.confirm_mock_upgrade TO authenticated;
REVOKE EXECUTE ON FUNCTION public.confirm_mock_upgrade FROM anon;
