-- ============================================================
-- Migration: 20261106250000_fix_pro_credit_grant_to_25
--
-- Purpose:
--   1. Set subscription_plans.monthly_credit_grant = 25 for Pro
--      (was incorrectly 20).
--   2. Issue idempotent +5 correction grants to existing Pro
--      subscribers (38dbb032, 757345e7) who received 20 instead of 25.
--   3. Fix credit_ledger_entries.metadata to include display_name
--      so the credit history UI shows correct plan labels (not just
--      "Membership membership credits").
--   4. Redeploy confirm_mock_subscription with:
--      • Both display_name AND plan_name in metadata (TS mapper
--        reads display_name; retained plan_name for compatibility).
--      • monthly_credit_grant read live from subscription_plans
--        at activation time, so plan config changes take effect
--        immediately without a code deploy.
--
-- Credit grant rules (unchanged, enforced by SQL):
--   • ADDITIVE: credits = existing_balance + plan.monthly_credit_grant
--   • IDEMPOTENT: ON CONFLICT (idempotency_key) DO NOTHING
--   • NEVER granted for failed or cancelled outcomes
--   • status = 'completed' (CHECK allows: pending/completed/skipped/failed)
-- ============================================================

-- ── 1. Correct the Pro plan credit amount ──────────────────────────────────
UPDATE public.subscription_plans
SET monthly_credit_grant = 25
WHERE tier = 'pro';

-- Plan credit reference after this migration:
--   explorer : 0
--   basic    : 5
--   pro      : 25   ← was 20, corrected here
--   advance  : 50

-- ── 2a. Correct existing Pro grant for user 38dbb032 ──────────────────────
UPDATE public.membership_credit_grants
SET credit_amount = 25,
    metadata = metadata || jsonb_build_object(
      'corrected_to', 25,
      'correction_reason', 'pro_plan_updated_from_20_to_25'
    )
WHERE idempotency_key = 'mock_grant_first_9de9ee25-3e33-4106-863e-ac06b6eb7920';

INSERT INTO public.credit_ledger_entries (
  user_id, amount, entry_type, idempotency_key,
  reference_type, reference_id, month_key, plan_tier_at_earn,
  remaining_amount, expires_at, metadata
) VALUES (
  '38dbb032-4b61-4d6d-8af6-1636c98f1766',
  5,
  'membership_grant',
  'pro_credit_correction_v1_38dbb032',
  'membership_credit_grant',
  (SELECT id FROM public.membership_credit_grants
   WHERE idempotency_key = 'mock_grant_first_9de9ee25-3e33-4106-863e-ac06b6eb7920'),
  DATE_TRUNC('month', NOW())::DATE,
  'pro',
  5,
  DATE_TRUNC('month', NOW()) + INTERVAL '2 months' - INTERVAL '1 second',
  jsonb_build_object(
    'is_mock', true,
    'plan_name', 'Pro',
    'display_name', 'Pro',
    'correction', 'pro_credit_grant_updated_20_to_25',
    'invoice_number', ''
  )
)
ON CONFLICT (idempotency_key) DO NOTHING;

-- Additive wallet correction for 38dbb032 (+5)
INSERT INTO public.user_progression (user_id, credits, updated_at)
VALUES ('38dbb032-4b61-4d6d-8af6-1636c98f1766', 5, NOW())
ON CONFLICT (user_id) DO UPDATE
SET credits = public.user_progression.credits + 5,
    updated_at = NOW();

-- ── 2b. Correct existing Pro grant for user 757345e7 ──────────────────────
UPDATE public.membership_credit_grants
SET credit_amount = 25,
    metadata = metadata || jsonb_build_object(
      'corrected_to', 25,
      'correction_reason', 'pro_plan_updated_from_20_to_25'
    )
WHERE idempotency_key = 'mock_grant_first_370f71b7-2d6b-41dd-8990-9234b0bd6ac8';

INSERT INTO public.credit_ledger_entries (
  user_id, amount, entry_type, idempotency_key,
  reference_type, reference_id, month_key, plan_tier_at_earn,
  remaining_amount, expires_at, metadata
) VALUES (
  '757345e7-f79b-4b62-8416-1c11d5eefdf5',
  5,
  'membership_grant',
  'pro_credit_correction_v1_757345e7',
  'membership_credit_grant',
  (SELECT id FROM public.membership_credit_grants
   WHERE idempotency_key = 'mock_grant_first_370f71b7-2d6b-41dd-8990-9234b0bd6ac8'),
  DATE_TRUNC('month', NOW())::DATE,
  'pro',
  5,
  DATE_TRUNC('month', NOW()) + INTERVAL '2 months' - INTERVAL '1 second',
  jsonb_build_object(
    'is_mock', true,
    'plan_name', 'Pro',
    'display_name', 'Pro',
    'correction', 'pro_credit_grant_updated_20_to_25',
    'invoice_number', ''
  )
)
ON CONFLICT (idempotency_key) DO NOTHING;

-- Additive wallet correction for 757345e7 (+5)
INSERT INTO public.user_progression (user_id, credits, updated_at)
VALUES ('757345e7-f79b-4b62-8416-1c11d5eefdf5', 5, NOW())
ON CONFLICT (user_id) DO UPDATE
SET credits = public.user_progression.credits + 5,
    updated_at = NOW();

-- ── 3. Backfill display_name in existing membership_grant ledger entries ──
-- The SQL RPC was using 'plan_name' but mapCreditLedgerEntry.ts reads 'display_name'.
-- Patch existing rows so the credit history shows correct plan labels.
UPDATE public.credit_ledger_entries
SET metadata = metadata ||
  jsonb_build_object(
    'display_name',
    COALESCE(metadata->>'plan_name', plan_tier_at_earn)
  )
WHERE entry_type = 'membership_grant'
  AND metadata->>'display_name' IS NULL
  AND (metadata->>'plan_name' IS NOT NULL OR plan_tier_at_earn IS NOT NULL);

-- ── 4. Redeploy confirm_mock_subscription with corrected metadata ──────────
-- Changes: metadata now includes both display_name AND plan_name in both
-- membership_credit_grants and credit_ledger_entries inserts.
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
  v_plan_label   TEXT;
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

  -- Idempotency: already active → return existing invoice
  IF v_sub.status = 'active' AND p_outcome = 'success' THEN
    SELECT invoice_number INTO v_inv_number FROM public.billing_invoices
    WHERE subscription_id = p_subscription_id LIMIT 1;
    RETURN jsonb_build_object(
      'success', true,
      'invoice_number', COALESCE(v_inv_number, ''),
      'already_active', true
    );
  END IF;

  -- Idempotency: already failed/cancelled
  IF v_sub.status IN ('cancelled', 'failed') AND p_outcome IN ('failed', 'cancel') THEN
    RETURN jsonb_build_object('success', false, 'outcome', p_outcome);
  END IF;

  IF v_sub.status != 'pending' THEN
    RAISE EXCEPTION 'Subscription % is in status %, cannot process', p_subscription_id, v_sub.status;
  END IF;

  IF p_outcome = 'success' THEN
    -- Block if a real (non-mock) subscription exists
    IF EXISTS (
      SELECT 1 FROM public.user_subscriptions
      WHERE user_id = v_user_id
        AND status IN ('active', 'trialing', 'past_due')
        AND COALESCE(provider_name, '') != 'mock'
    ) THEN
      RAISE EXCEPTION 'A real payment subscription is already active.' USING ERRCODE = 'P0011';
    END IF;

    -- Cancel any other live mock subscriptions before activating this one
    UPDATE public.user_subscriptions
    SET status = 'cancelled', cancelled_at = NOW(), updated_at = NOW()
    WHERE user_id = v_user_id
      AND status IN ('active', 'trialing', 'past_due')
      AND provider_name = 'mock'
      AND id != p_subscription_id;

    -- Activate subscription and mark payment succeeded
    UPDATE public.user_subscriptions SET status = 'active', updated_at = NOW() WHERE id = p_subscription_id;
    UPDATE public.billing_payments SET status = 'succeeded', paid_at = NOW()
    WHERE subscription_id = p_subscription_id AND status = 'pending';

    -- Read amounts from billing_payments metadata
    SELECT COALESCE((metadata->>'base_amount_minor')::BIGINT, 0),
           COALESCE((metadata->>'gst_amount_minor')::BIGINT, 0),
           charge_amount_minor
    INTO v_base_minor, v_gst_minor, v_charge_minor
    FROM public.billing_payments WHERE subscription_id = p_subscription_id LIMIT 1;

    -- Read plan config (monthly_credit_grant is live from subscription_plans)
    SELECT * INTO v_plan FROM public.subscription_plans WHERE tier = v_sub.plan_tier;
    v_plan_label := COALESCE(v_plan.display_name, v_sub.plan_tier);

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
        'plan_name', v_plan_label,
        'display_name', v_plan_label,
        'activated_at', NOW()::TEXT
      )
    ) RETURNING id INTO v_inv_id;

    UPDATE public.billing_payments
    SET provider_invoice_id = v_inv_number,
        metadata = metadata || jsonb_build_object('invoice_id', v_inv_id::TEXT)
    WHERE subscription_id = p_subscription_id;

    -- ── Credit grant ───────────────────────────────────────────────────────
    -- monthly_credit_grant is read LIVE from subscription_plans here.
    -- Changing the plan config takes effect on the next activation — no code deploy needed.
    -- status = 'completed' per membership_credit_grants CHECK constraint.
    -- ADDITIVE: never replaces existing balance.
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
        jsonb_build_object(
          'is_mock', true,
          'plan_name', v_plan_label,
          'display_name', v_plan_label,
          'invoice_number', v_inv_number
        )
      )
      ON CONFLICT (idempotency_key) DO NOTHING
      RETURNING id INTO v_grant_id;

      IF v_grant_id IS NOT NULL THEN
        INSERT INTO public.credit_ledger_entries (
          user_id, amount, entry_type, idempotency_key,
          reference_type, reference_id, month_key, plan_tier_at_earn,
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
            'is_mock', true,
            'plan_name', v_plan_label,
            'display_name', v_plan_label,
            'billing_interval', v_sub.billing_interval,
            'invoice_number', v_inv_number
          )
        )
        ON CONFLICT (idempotency_key) DO NOTHING
        RETURNING id INTO v_ledger_id;

        IF v_ledger_id IS NOT NULL THEN
          UPDATE public.membership_credit_grants SET ledger_entry_id = v_ledger_id WHERE id = v_grant_id;
        END IF;

        -- Additive wallet update — never replaces existing credit balance
        INSERT INTO public.user_progression (user_id, credits, updated_at)
        VALUES (v_user_id, v_plan.monthly_credit_grant, NOW())
        ON CONFLICT (user_id) DO UPDATE
        SET credits = public.user_progression.credits + v_plan.monthly_credit_grant,
            updated_at = NOW();
      END IF;
    END IF;

    RETURN jsonb_build_object('success', true, 'invoice_number', v_inv_number);

  ELSE
    -- Failure / cancellation — zero credits granted
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
