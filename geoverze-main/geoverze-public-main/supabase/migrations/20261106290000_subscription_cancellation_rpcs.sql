-- ============================================================
-- GVRZE: Subscription Cancellation & Reactivation RPCs
-- Migration: 20261106290000_subscription_cancellation_rpcs.sql
--
-- Creates four idempotent, auth-guarded RPCs:
--
--   1. request_cancel_subscription()
--      Sets cancel_at_period_end = true on the user's active subscription.
--      Does NOT immediately terminate access — the sub stays "active" and
--      all benefits remain until current_period_end.
--      Used by both live (Razorpay) and mock flows via the billing screen.
--
--   2. request_reactivate_subscription()
--      Reverses a scheduled cancellation (clears cancel_at_period_end).
--      Idempotent: calling on a non-scheduled sub returns ok=true.
--
--   3. schedule_cancel_mock_subscription(p_subscription_id UUID)
--      Same as (1) but locked to provider_name = 'mock' and scoped to a
--      specific subscription UUID.  Used by the mock-payment server function.
--
--   4. reactivate_mock_subscription(p_subscription_id UUID)
--      Same as (2) but locked to provider_name = 'mock'.
--
-- SECURITY:
--   All RPCs are SECURITY DEFINER.
--   Every function starts with auth.uid() check → rejects anonymous calls.
--   Subscription ownership verified before any UPDATE.
--   GRANT to authenticated only; anon role explicitly excluded.
--
-- IDEMPOTENCY:
--   Double-cancellation returns ok=true (reason=already_cancelled).
--   Double-reactivation returns ok=true (reason=not_scheduled_for_cancellation).
--   Safe to call from frontend retry logic.
--
-- NO SIDE EFFECTS ON OTHER FEATURES:
--   Only user_subscriptions rows owned by auth.uid() are touched.
--   billing_payments, credits, and Gstore orders are untouched.
-- ============================================================


-- ── 1. request_cancel_subscription() ──────────────────────────────────────────
--
-- Sets cancel_at_period_end = true on the user's most recent active
-- subscription.  Preserves status = 'active' so entitlements remain.

CREATE OR REPLACE FUNCTION public.request_cancel_subscription()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub     RECORD;
BEGIN
  -- Auth guard — always required
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Find the most recent active subscription (any provider)
  SELECT *
  INTO v_sub
  FROM public.user_subscriptions
  WHERE user_id = v_user_id
    AND status IN ('active', 'trialing', 'past_due')
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_active_subscription');
  END IF;

  -- Idempotent: already scheduled for cancellation
  IF v_sub.cancel_at_period_end THEN
    RETURN jsonb_build_object(
      'ok',         true,
      'reason',     'already_cancelled',
      'period_end', v_sub.current_period_end
    );
  END IF;

  -- Schedule cancellation — keep status = active, only flip the flag
  UPDATE public.user_subscriptions
  SET
    cancel_at_period_end = true,
    cancelled_at         = NOW(),
    updated_at           = NOW(),
    metadata             = metadata || jsonb_build_object(
      'cancel_requested_at', NOW()::TEXT,
      'cancel_requested_by', 'user_self_service'
    )
  WHERE id = v_sub.id;

  RETURN jsonb_build_object(
    'ok',             true,
    'subscription_id', v_sub.id,
    'period_end',     v_sub.current_period_end
  );
END;
$$;

GRANT  EXECUTE ON FUNCTION public.request_cancel_subscription() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.request_cancel_subscription() FROM anon;


-- ── 2. request_reactivate_subscription() ──────────────────────────────────────
--
-- Clears cancel_at_period_end so the subscription renews automatically.
-- Only valid while the subscription is still active (before period_end).

CREATE OR REPLACE FUNCTION public.request_reactivate_subscription()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub     RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_sub
  FROM public.user_subscriptions
  WHERE user_id = v_user_id
    AND status IN ('active', 'trialing', 'past_due')
  ORDER BY created_at DESC
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_active_subscription');
  END IF;

  -- Idempotent: not scheduled for cancellation
  IF NOT v_sub.cancel_at_period_end THEN
    RETURN jsonb_build_object('ok', true, 'reason', 'not_scheduled_for_cancellation');
  END IF;

  UPDATE public.user_subscriptions
  SET
    cancel_at_period_end = false,
    cancelled_at         = NULL,
    updated_at           = NOW(),
    metadata             = metadata || jsonb_build_object(
      'reactivated_at', NOW()::TEXT,
      'reactivated_by', 'user_self_service'
    )
  WHERE id = v_sub.id;

  RETURN jsonb_build_object(
    'ok',              true,
    'subscription_id', v_sub.id
  );
END;
$$;

GRANT  EXECUTE ON FUNCTION public.request_reactivate_subscription() TO authenticated;
REVOKE EXECUTE ON FUNCTION public.request_reactivate_subscription() FROM anon;


-- ── 3. schedule_cancel_mock_subscription(UUID) ────────────────────────────────
--
-- Mock-specific variant: same cancel-at-period-end behaviour but scoped to a
-- specific subscription UUID and locked to provider_name = 'mock'.
-- Called by scheduleCancelMockSubscriptionFn (server function).

CREATE OR REPLACE FUNCTION public.schedule_cancel_mock_subscription(
  p_subscription_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub     RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Ownership + mock provider check
  SELECT *
  INTO v_sub
  FROM public.user_subscriptions
  WHERE id = p_subscription_id
    AND user_id = v_user_id
    AND provider_name = 'mock';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mock subscription not found or not owned by user.' USING ERRCODE = 'P0005';
  END IF;

  -- Must be active (not already fully cancelled)
  IF v_sub.status NOT IN ('active', 'trialing', 'past_due') THEN
    RETURN jsonb_build_object('ok', false, 'reason', 'no_active_subscription');
  END IF;

  -- Idempotent
  IF v_sub.cancel_at_period_end THEN
    RETURN jsonb_build_object(
      'ok',         true,
      'reason',     'already_cancelled',
      'period_end', v_sub.current_period_end
    );
  END IF;

  UPDATE public.user_subscriptions
  SET
    cancel_at_period_end = true,
    cancelled_at         = NOW(),
    updated_at           = NOW(),
    metadata             = metadata || jsonb_build_object(
      'cancel_requested_at', NOW()::TEXT,
      'cancel_requested_by', 'user_self_service',
      'is_mock',             true
    )
  WHERE id = p_subscription_id;

  RETURN jsonb_build_object(
    'ok',              true,
    'subscription_id', p_subscription_id,
    'period_end',      v_sub.current_period_end
  );
END;
$$;

GRANT  EXECUTE ON FUNCTION public.schedule_cancel_mock_subscription(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.schedule_cancel_mock_subscription(UUID) FROM anon;


-- ── 4. reactivate_mock_subscription(UUID) ─────────────────────────────────────
--
-- Mock-specific variant: clears cancel_at_period_end on a specific mock
-- subscription.  Called by reactivateMockSubscriptionFn (server function).

CREATE OR REPLACE FUNCTION public.reactivate_mock_subscription(
  p_subscription_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_sub     RECORD;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  SELECT *
  INTO v_sub
  FROM public.user_subscriptions
  WHERE id = p_subscription_id
    AND user_id = v_user_id
    AND provider_name = 'mock';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Mock subscription not found or not owned by user.' USING ERRCODE = 'P0005';
  END IF;

  -- Idempotent: not scheduled for cancellation
  IF NOT v_sub.cancel_at_period_end THEN
    RETURN jsonb_build_object('ok', true, 'reason', 'not_scheduled_for_cancellation');
  END IF;

  UPDATE public.user_subscriptions
  SET
    cancel_at_period_end = false,
    cancelled_at         = NULL,
    updated_at           = NOW(),
    metadata             = metadata || jsonb_build_object(
      'reactivated_at', NOW()::TEXT,
      'is_mock',        true
    )
  WHERE id = p_subscription_id;

  RETURN jsonb_build_object(
    'ok',              true,
    'subscription_id', p_subscription_id
  );
END;
$$;

GRANT  EXECUTE ON FUNCTION public.reactivate_mock_subscription(UUID) TO authenticated;
REVOKE EXECUTE ON FUNCTION public.reactivate_mock_subscription(UUID) FROM anon;
