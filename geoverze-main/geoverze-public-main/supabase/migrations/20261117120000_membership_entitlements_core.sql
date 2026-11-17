-- GVRZE membership entitlements: quiz quotas, Gstore discounts, challenges, admin.
-- Safe to re-run: IF NOT EXISTS / OR REPLACE. Does not drop existing data.

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Plan catalog
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.subscription_plans
  ADD COLUMN IF NOT EXISTS gstore_discount_bps integer NOT NULL DEFAULT 0;

ALTER TABLE public.subscription_plans
  DROP CONSTRAINT IF EXISTS subscription_plans_gstore_discount_bps_range;

ALTER TABLE public.subscription_plans
  ADD CONSTRAINT subscription_plans_gstore_discount_bps_range
  CHECK (gstore_discount_bps >= 0 AND gstore_discount_bps <= 10000);

UPDATE public.subscription_plans SET gstore_discount_bps = 0 WHERE tier = 'explorer';
UPDATE public.subscription_plans SET gstore_discount_bps = 300 WHERE tier = 'basic';
UPDATE public.subscription_plans SET gstore_discount_bps = 1000 WHERE tier IN ('pro', 'advance');

-- Basic keeps Explorer's independent PvP / multiplayer caps (not unlimited rooms).
UPDATE public.subscription_plans
SET
  pvp_limit = coalesce(pvp_limit, 1),
  multiplayer_limit = coalesce(multiplayer_limit, 1)
WHERE tier = 'basic';

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Quiz usage (UTC calendar month)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.membership_quiz_usage (
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  period_start date NOT NULL,
  solo_count integer NOT NULL DEFAULT 0 CHECK (solo_count >= 0),
  pvp_count integer NOT NULL DEFAULT 0 CHECK (pvp_count >= 0),
  multiplayer_count integer NOT NULL DEFAULT 0 CHECK (multiplayer_count >= 0),
  total_count integer NOT NULL DEFAULT 0 CHECK (total_count >= 0),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, period_start)
);

CREATE TABLE IF NOT EXISTS public.membership_quiz_attempt_usage (
  attempt_id uuid PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  mode text NOT NULL CHECK (mode IN ('solo', 'practice', 'pvp', 'multiplayer')),
  period_start date NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS membership_quiz_attempt_usage_user_period_idx
  ON public.membership_quiz_attempt_usage (user_id, period_start);

ALTER TABLE public.membership_quiz_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membership_quiz_attempt_usage ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS membership_quiz_usage_select_own ON public.membership_quiz_usage;
CREATE POLICY membership_quiz_usage_select_own
  ON public.membership_quiz_usage FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS membership_quiz_attempt_usage_select_own ON public.membership_quiz_attempt_usage;
CREATE POLICY membership_quiz_attempt_usage_select_own
  ON public.membership_quiz_attempt_usage FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Member-only challenges
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.membership_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text NOT NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'archived')),
  min_access_tier text NOT NULL DEFAULT 'pro'
    REFERENCES public.subscription_plans (tier),
  reward_credits integer NOT NULL DEFAULT 0 CHECK (reward_credits >= 0),
  reward_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES auth.users (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (ends_at > starts_at)
);

CREATE TABLE IF NOT EXISTS public.challenge_participants (
  challenge_id uuid NOT NULL REFERENCES public.membership_challenges (id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'joined'
    CHECK (status IN ('joined', 'completed', 'expired')),
  joined_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (challenge_id, user_id)
);

CREATE INDEX IF NOT EXISTS membership_challenges_status_window_idx
  ON public.membership_challenges (status, starts_at, ends_at);
CREATE INDEX IF NOT EXISTS challenge_participants_user_idx
  ON public.challenge_participants (user_id);

ALTER TABLE public.membership_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS membership_challenges_select_published ON public.membership_challenges;
CREATE POLICY membership_challenges_select_published
  ON public.membership_challenges FOR SELECT
  USING (
    public.is_admin()
    OR (
      status = 'published'
      AND (SELECT auth.uid()) IS NOT NULL
      AND public.library_tier_rank(public.resolve_user_subscription_tier((SELECT auth.uid())))
          >= public.library_tier_rank(min_access_tier)
    )
  );

DROP POLICY IF EXISTS challenge_participants_select_own ON public.challenge_participants;
CREATE POLICY challenge_participants_select_own
  ON public.challenge_participants FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- Mutations go through SECURITY DEFINER RPCs only.
DROP POLICY IF EXISTS challenge_participants_insert_own ON public.challenge_participants;
CREATE POLICY challenge_participants_insert_own
  ON public.challenge_participants FOR INSERT
  WITH CHECK (false);

-- ─────────────────────────────────────────────────────────────────────────────
-- 4. Gstore membership discount audit (one row per order)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.membership_discount_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL UNIQUE,
  user_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  plan_tier text NOT NULL REFERENCES public.subscription_plans (tier),
  discount_bps integer NOT NULL CHECK (discount_bps >= 0 AND discount_bps <= 10000),
  subtotal_minor bigint NOT NULL CHECK (subtotal_minor >= 0),
  discount_minor bigint NOT NULL CHECK (discount_minor >= 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS membership_discount_records_user_idx
  ON public.membership_discount_records (user_id, created_at DESC);

ALTER TABLE public.membership_discount_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS membership_discount_records_select_own ON public.membership_discount_records;
CREATE POLICY membership_discount_records_select_own
  ON public.membership_discount_records FOR SELECT
  USING (user_id = (SELECT auth.uid()) OR public.is_admin());

-- ─────────────────────────────────────────────────────────────────────────────
-- 5. Optional quiz pack / atlas gate (NULL = open)
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.quizzes
  ADD COLUMN IF NOT EXISTS min_access_tier text REFERENCES public.subscription_plans (tier);

CREATE INDEX IF NOT EXISTS quizzes_min_access_tier_idx
  ON public.quizzes (min_access_tier);

-- ─────────────────────────────────────────────────────────────────────────────
-- 6. Entitlements view (reuses subscription_plans)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE VIEW public.membership_entitlements AS
SELECT
  sp.tier,
  sp.display_name,
  sp.monthly_quiz_limit,
  sp.solo_quiz_limit,
  sp.pvp_limit,
  sp.multiplayer_limit,
  sp.monthly_credit_grant,
  sp.credit_rollover_months,
  sp.gstore_discount_bps,
  CASE
    WHEN public.library_tier_rank(sp.tier) >= public.library_tier_rank('pro') THEN 'full'
    WHEN public.library_tier_rank(sp.tier) >= public.library_tier_rank('basic') THEN 'limited'
    ELSE 'browse'
  END AS library_access,
  (sp.pvp_limit IS NULL OR sp.pvp_limit > 0) AS pvp_access,
  (sp.multiplayer_limit IS NULL OR sp.multiplayer_limit > 0) AS multiplayer_access,
  (public.library_tier_rank(sp.tier) >= public.library_tier_rank('pro')) AS all_atlases,
  (public.library_tier_rank(sp.tier) >= public.library_tier_rank('pro')) AS advanced_analytics,
  (public.library_tier_rank(sp.tier) >= public.library_tier_rank('pro')) AS member_challenges,
  (public.library_tier_rank(sp.tier) >= public.library_tier_rank('advance')) AS creator_studio
FROM public.subscription_plans sp;

GRANT SELECT ON public.membership_entitlements TO authenticated, anon;

-- ─────────────────────────────────────────────────────────────────────────────
-- 7. Helpers
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.membership_calendar_month_start()
RETURNS date
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT date_trunc('month', timezone('utc', now()))::date;
$$;

CREATE OR REPLACE FUNCTION public.normalize_quiz_quota_mode(_mode text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN _mode IN ('solo', 'practice', 'daily') THEN 'solo'
    WHEN _mode = 'pvp' THEN 'pvp'
    WHEN _mode = 'multiplayer' THEN 'multiplayer'
    ELSE NULL
  END;
$$;

CREATE OR REPLACE FUNCTION public.gstore_discount_bps_for_tier(_tier text)
RETURNS integer
LANGUAGE sql
STABLE
SET search_path TO 'public'
AS $$
  SELECT coalesce(
    (SELECT sp.gstore_discount_bps FROM public.subscription_plans sp WHERE sp.tier = _tier),
    0
  );
$$;

CREATE OR REPLACE FUNCTION public.get_gstore_membership_discount_bps()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL THEN
    RETURN 0;
  END IF;
  RETURN public.gstore_discount_bps_for_tier(public.resolve_user_subscription_tier(v_uid));
END;
$$;

REVOKE ALL ON FUNCTION public.get_gstore_membership_discount_bps() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_gstore_membership_discount_bps() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.record_gstore_membership_discount(
  _order_id uuid,
  _user_id uuid,
  _plan_tier text,
  _discount_bps integer,
  _subtotal_minor bigint,
  _discount_minor bigint
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  IF _order_id IS NULL OR _user_id IS NULL THEN
    RAISE EXCEPTION 'order_id and user_id are required';
  END IF;

  INSERT INTO public.membership_discount_records (
    order_id, user_id, plan_tier, discount_bps, subtotal_minor, discount_minor
  ) VALUES (
    _order_id,
    _user_id,
    coalesce(_plan_tier, 'explorer'),
    greatest(coalesce(_discount_bps, 0), 0),
    greatest(coalesce(_subtotal_minor, 0), 0),
    greatest(coalesce(_discount_minor, 0), 0)
  )
  ON CONFLICT (order_id) DO NOTHING
  RETURNING id INTO v_id;

  IF v_id IS NULL THEN
    SELECT id INTO v_id
    FROM public.membership_discount_records
    WHERE order_id = _order_id;
  END IF;
  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.record_gstore_membership_discount(
  uuid, uuid, text, integer, bigint, bigint
) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_gstore_membership_discount(
  uuid, uuid, text, integer, bigint, bigint
) TO service_role;

CREATE OR REPLACE FUNCTION public.quiz_user_can_access_quiz(
  _quiz_id text,
  _user_id uuid DEFAULT auth.uid()
)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.quizzes q
    WHERE q.id = _quiz_id
      AND q.is_published
      AND (
        q.min_access_tier IS NULL
        OR (
          _user_id IS NOT NULL
          AND public.library_tier_rank(public.resolve_user_subscription_tier(_user_id))
              >= public.library_tier_rank(q.min_access_tier)
        )
      )
  );
$$;

CREATE OR REPLACE FUNCTION public.membership_quiz_usage_snapshot(_user_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_period date := public.membership_calendar_month_start();
  v_row public.membership_quiz_usage%ROWTYPE;
BEGIN
  SELECT * INTO v_row
  FROM public.membership_quiz_usage
  WHERE user_id = _user_id AND period_start = v_period;

  RETURN jsonb_build_object(
    'period_start', v_period,
    'solo_count', coalesce(v_row.solo_count, 0),
    'pvp_count', coalesce(v_row.pvp_count, 0),
    'multiplayer_count', coalesce(v_row.multiplayer_count, 0),
    'total_count', coalesce(v_row.total_count, 0)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.assert_quiz_quota_available(_user_id uuid, _mode text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_tier text;
  v_plan public.subscription_plans%ROWTYPE;
  v_mode text := public.normalize_quiz_quota_mode(_mode);
  v_period date := public.membership_calendar_month_start();
  v_usage public.membership_quiz_usage%ROWTYPE;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF v_mode IS NULL THEN
    RAISE EXCEPTION 'Invalid quiz mode: %', _mode;
  END IF;

  v_tier := public.resolve_user_subscription_tier(_user_id);
  SELECT * INTO v_plan FROM public.subscription_plans WHERE tier = v_tier;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Plan tier not found: %', v_tier;
  END IF;

  SELECT * INTO v_usage
  FROM public.membership_quiz_usage
  WHERE user_id = _user_id AND period_start = v_period;

  IF v_plan.monthly_quiz_limit IS NOT NULL
     AND coalesce(v_usage.total_count, 0) >= v_plan.monthly_quiz_limit THEN
    RAISE EXCEPTION 'QUOTA_EXCEEDED:monthly'
      USING HINT = 'Upgrade to continue playing this month.';
  END IF;

  IF v_mode = 'solo'
     AND v_plan.solo_quiz_limit IS NOT NULL
     AND coalesce(v_usage.solo_count, 0) >= v_plan.solo_quiz_limit THEN
    RAISE EXCEPTION 'QUOTA_EXCEEDED:solo'
      USING HINT = 'Upgrade to continue playing solo quizzes this month.';
  END IF;

  IF v_mode = 'pvp'
     AND v_plan.pvp_limit IS NOT NULL
     AND coalesce(v_usage.pvp_count, 0) >= v_plan.pvp_limit THEN
    RAISE EXCEPTION 'QUOTA_EXCEEDED:pvp'
      USING HINT = 'Upgrade for more PvP duels this month.';
  END IF;

  IF v_mode = 'multiplayer'
     AND v_plan.multiplayer_limit IS NOT NULL
     AND coalesce(v_usage.multiplayer_count, 0) >= v_plan.multiplayer_limit THEN
    RAISE EXCEPTION 'QUOTA_EXCEEDED:multiplayer'
      USING HINT = 'Upgrade for more multiplayer rooms this month.';
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.consume_quiz_quota(
  _user_id uuid,
  _mode text,
  _attempt_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_mode text := public.normalize_quiz_quota_mode(_mode);
  v_period date := public.membership_calendar_month_start();
  v_inserted integer := 0;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  IF _attempt_id IS NULL THEN
    RAISE EXCEPTION 'attempt_id is required';
  END IF;
  IF v_mode IS NULL THEN
    RAISE EXCEPTION 'Invalid quiz mode: %', _mode;
  END IF;

  INSERT INTO public.membership_quiz_attempt_usage (attempt_id, user_id, mode, period_start)
  VALUES (_attempt_id, _user_id, v_mode, v_period)
  ON CONFLICT (attempt_id) DO NOTHING;
  GET DIAGNOSTICS v_inserted = ROW_COUNT;

  IF v_inserted = 0 THEN
    RETURN public.membership_quiz_usage_snapshot(_user_id);
  END IF;

  INSERT INTO public.membership_quiz_usage (user_id, period_start)
  VALUES (_user_id, v_period)
  ON CONFLICT (user_id, period_start) DO NOTHING;

  PERFORM 1
  FROM public.membership_quiz_usage
  WHERE user_id = _user_id AND period_start = v_period
  FOR UPDATE;

  PERFORM public.assert_quiz_quota_available(_user_id, v_mode);

  UPDATE public.membership_quiz_usage
  SET
    solo_count = solo_count + CASE WHEN v_mode = 'solo' THEN 1 ELSE 0 END,
    pvp_count = pvp_count + CASE WHEN v_mode = 'pvp' THEN 1 ELSE 0 END,
    multiplayer_count = multiplayer_count + CASE WHEN v_mode = 'multiplayer' THEN 1 ELSE 0 END,
    total_count = total_count + 1,
    updated_at = now()
  WHERE user_id = _user_id AND period_start = v_period;

  RETURN public.membership_quiz_usage_snapshot(_user_id);
END;
$$;

REVOKE ALL ON FUNCTION public.assert_quiz_quota_available(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.consume_quiz_quota(uuid, text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.assert_quiz_quota_available(uuid, text) TO service_role;
GRANT EXECUTE ON FUNCTION public.consume_quiz_quota(uuid, text, uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.check_entitlement(_feature text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tier text;
BEGIN
  IF v_uid IS NULL THEN
    RETURN false;
  END IF;
  v_tier := public.resolve_user_subscription_tier(v_uid);
  RETURN CASE _feature
    WHEN 'limited_library' THEN public.library_tier_rank(v_tier) >= public.library_tier_rank('basic')
    WHEN 'full_library' THEN public.library_tier_rank(v_tier) >= public.library_tier_rank('pro')
    WHEN 'atlases' THEN public.library_tier_rank(v_tier) >= public.library_tier_rank('pro')
    WHEN 'question_packs' THEN public.library_tier_rank(v_tier) >= public.library_tier_rank('pro')
    WHEN 'advanced_analytics' THEN public.library_tier_rank(v_tier) >= public.library_tier_rank('pro')
    WHEN 'member_challenges' THEN public.library_tier_rank(v_tier) >= public.library_tier_rank('pro')
    WHEN 'creator_studio' THEN public.library_tier_rank(v_tier) >= public.library_tier_rank('advance')
    WHEN 'pvp' THEN EXISTS (
      SELECT 1 FROM public.subscription_plans sp
      WHERE sp.tier = v_tier AND (sp.pvp_limit IS NULL OR sp.pvp_limit > 0)
    )
    WHEN 'multiplayer' THEN EXISTS (
      SELECT 1 FROM public.subscription_plans sp
      WHERE sp.tier = v_tier AND (sp.multiplayer_limit IS NULL OR sp.multiplayer_limit > 0)
    )
    WHEN 'gstore_discount' THEN public.gstore_discount_bps_for_tier(v_tier) > 0
    ELSE false
  END;
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_entitlement(text) TO authenticated;

CREATE OR REPLACE FUNCTION public.get_my_membership()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_tier text;
  v_plan public.subscription_plans%ROWTYPE;
  v_sub public.user_subscriptions%ROWTYPE;
  v_usage jsonb;
  v_credits integer := 0;
  v_grant integer := 0;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  v_tier := public.resolve_user_subscription_tier(v_uid);
  SELECT * INTO v_plan FROM public.subscription_plans WHERE tier = v_tier;
  SELECT * INTO v_sub
  FROM public.user_subscriptions us
  WHERE us.user_id = v_uid
    AND us.status IN ('trialing', 'active', 'past_due')
    AND (us.current_period_end IS NULL OR us.current_period_end > now())
  ORDER BY us.current_period_start DESC, us.created_at DESC
  LIMIT 1;

  v_usage := public.membership_quiz_usage_snapshot(v_uid);

  SELECT coalesce(up.credits, 0) INTO v_credits
  FROM public.user_progression up
  WHERE up.user_id = v_uid;

  SELECT coalesce(mcg.credit_amount, 0) INTO v_grant
  FROM public.membership_credit_grants mcg
  WHERE mcg.user_id = v_uid AND mcg.status = 'completed'
  ORDER BY mcg.grant_period_start DESC, mcg.created_at DESC
  LIMIT 1;

  RETURN jsonb_build_object(
    'user_id', v_uid,
    'tier', v_tier,
    'plan_name', v_plan.display_name,
    'status', coalesce(v_sub.status, 'active'),
    'started_at', v_sub.started_at,
    'current_period_start', v_sub.current_period_start,
    'current_period_end', v_sub.current_period_end,
    'renewal_date', v_sub.current_period_end,
    'cancel_at_period_end', coalesce(v_sub.cancel_at_period_end, false),
    'cancelled_at', v_sub.cancelled_at,
    'billing_interval', v_sub.billing_interval,
    'monthly_quiz_limit', v_plan.monthly_quiz_limit,
    'solo_quiz_limit', v_plan.solo_quiz_limit,
    'pvp_limit', v_plan.pvp_limit,
    'multiplayer_limit', v_plan.multiplayer_limit,
    'monthly_credit_grant', v_plan.monthly_credit_grant,
    'credit_rollover_months', v_plan.credit_rollover_months,
    'available_credits', v_credits,
    'period_grant_amount', v_grant,
    'gstore_discount_bps', v_plan.gstore_discount_bps,
    'library_access', CASE
      WHEN public.library_tier_rank(v_tier) >= public.library_tier_rank('pro') THEN 'full'
      WHEN public.library_tier_rank(v_tier) >= public.library_tier_rank('basic') THEN 'limited'
      ELSE 'browse'
    END,
    'pvp_access', (v_plan.pvp_limit IS NULL OR v_plan.pvp_limit > 0),
    'multiplayer_access', (v_plan.multiplayer_limit IS NULL OR v_plan.multiplayer_limit > 0),
    'all_atlases', public.library_tier_rank(v_tier) >= public.library_tier_rank('pro'),
    'advanced_analytics', public.library_tier_rank(v_tier) >= public.library_tier_rank('pro'),
    'member_challenges', public.library_tier_rank(v_tier) >= public.library_tier_rank('pro'),
    'creator_studio', public.library_tier_rank(v_tier) >= public.library_tier_rank('advance'),
    'quiz_usage', v_usage
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_membership() TO authenticated;

CREATE OR REPLACE FUNCTION public.get_remaining_quizzes()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_snap jsonb;
  v_plan public.subscription_plans%ROWTYPE;
  v_tier text;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  v_tier := public.resolve_user_subscription_tier(v_uid);
  SELECT * INTO v_plan FROM public.subscription_plans WHERE tier = v_tier;
  v_snap := public.membership_quiz_usage_snapshot(v_uid);
  RETURN jsonb_build_object(
    'period_start', v_snap->>'period_start',
    'solo_remaining', CASE
      WHEN v_plan.solo_quiz_limit IS NULL THEN NULL
      ELSE greatest(v_plan.solo_quiz_limit - coalesce((v_snap->>'solo_count')::int, 0), 0)
    END,
    'pvp_remaining', CASE
      WHEN v_plan.pvp_limit IS NULL THEN NULL
      ELSE greatest(v_plan.pvp_limit - coalesce((v_snap->>'pvp_count')::int, 0), 0)
    END,
    'multiplayer_remaining', CASE
      WHEN v_plan.multiplayer_limit IS NULL THEN NULL
      ELSE greatest(v_plan.multiplayer_limit - coalesce((v_snap->>'multiplayer_count')::int, 0), 0)
    END,
    'monthly_remaining', CASE
      WHEN v_plan.monthly_quiz_limit IS NULL THEN NULL
      ELSE greatest(v_plan.monthly_quiz_limit - coalesce((v_snap->>'total_count')::int, 0), 0)
    END,
    'unlimited', (v_plan.monthly_quiz_limit IS NULL AND v_plan.solo_quiz_limit IS NULL)
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_remaining_quizzes() TO authenticated;
GRANT EXECUTE ON FUNCTION public.quiz_user_can_access_quiz(text, uuid) TO authenticated;

-- Keep get_my_plan_tier in sync for existing billing clients.
CREATE OR REPLACE FUNCTION public.get_my_plan_tier()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_public_tier text;
  v_rollover_key text;
  v_plan public.subscription_plans;
  v_subscription public.user_subscriptions;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  v_public_tier := public.resolve_user_subscription_tier(v_uid);
  v_rollover_key := public.map_plan_tier_to_rollover_key(v_public_tier);
  SELECT sp.* INTO v_plan FROM public.subscription_plans sp WHERE sp.tier = v_public_tier;
  SELECT us.* INTO v_subscription
  FROM public.user_subscriptions us
  WHERE us.user_id = v_uid
    AND us.status IN ('trialing', 'active', 'past_due')
    AND (us.current_period_end IS NULL OR us.current_period_end > now())
  ORDER BY us.current_period_start DESC, us.created_at DESC
  LIMIT 1;
  RETURN jsonb_build_object(
    'tier', v_public_tier,
    'display_name', v_plan.display_name,
    'rollover_tier_key', v_rollover_key,
    'monthly_price_cents', v_plan.monthly_price_cents,
    'annual_price_cents', v_plan.annual_price_cents,
    'monthly_quiz_limit', v_plan.monthly_quiz_limit,
    'solo_quiz_limit', v_plan.solo_quiz_limit,
    'pvp_limit', v_plan.pvp_limit,
    'multiplayer_limit', v_plan.multiplayer_limit,
    'monthly_credit_grant', v_plan.monthly_credit_grant,
    'credit_rollover_months', v_plan.credit_rollover_months,
    'gstore_discount_bps', v_plan.gstore_discount_bps,
    'is_creator_plan', v_plan.is_creator_plan,
    'subscription', CASE WHEN v_subscription.id IS NULL THEN NULL ELSE jsonb_build_object(
      'id', v_subscription.id,
      'status', v_subscription.status,
      'billing_interval', v_subscription.billing_interval,
      'started_at', v_subscription.started_at,
      'current_period_start', v_subscription.current_period_start,
      'current_period_end', v_subscription.current_period_end,
      'cancel_at_period_end', v_subscription.cancel_at_period_end,
      'cancelled_at', v_subscription.cancelled_at
    ) END
  );
END;
$function$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 8. Wire quota into existing quiz / PvP / multiplayer functions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.trg_consume_quiz_quota_on_attempt()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.quiz_user_can_access_quiz(NEW.quiz_id, NEW.user_id) THEN
    RAISE EXCEPTION 'QUIZ_LOCKED:pro'
      USING HINT = 'This atlas or question pack requires Pro.';
  END IF;
  PERFORM public.consume_quiz_quota(NEW.user_id, NEW.mode, NEW.attempt_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS quiz_attempts_consume_quota ON public.quiz_attempts;
CREATE TRIGGER quiz_attempts_consume_quota
  BEFORE INSERT ON public.quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_consume_quiz_quota_on_attempt();

CREATE OR REPLACE FUNCTION public.trg_consume_quiz_quota_on_pvp_submit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_mode text;
BEGIN
  IF NEW.submitted_at IS NULL OR NEW.attempt_id IS NULL THEN
    RETURN NEW;
  END IF;
  IF OLD.submitted_at IS NOT NULL AND OLD.attempt_id IS NOT DISTINCT FROM NEW.attempt_id THEN
    RETURN NEW;
  END IF;

  SELECT CASE WHEN r.room_mode::text = 'multiplayer' THEN 'multiplayer' ELSE 'pvp' END
    INTO v_mode
  FROM public.pvp_rooms r
  WHERE r.id = NEW.room_id;

  PERFORM public.consume_quiz_quota(NEW.user_id, coalesce(v_mode, 'pvp'), NEW.attempt_id);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS pvp_participants_consume_quota ON public.pvp_participants;
CREATE TRIGGER pvp_participants_consume_quota
  BEFORE UPDATE OF submitted_at, attempt_id ON public.pvp_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.trg_consume_quiz_quota_on_pvp_submit();

-- Recreate room create/join with quota assertion (consume still happens on completion).

CREATE OR REPLACE FUNCTION public.create_pvp_room(_quiz_id text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_quiz public.quizzes%ROWTYPE;
  v_room public.pvp_rooms%ROWTYPE;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF _quiz_id IS NULL OR trim(_quiz_id) = '' THEN RAISE EXCEPTION 'quiz_id must be non-empty'; END IF;
  PERFORM public.assert_quiz_quota_available(v_uid, 'pvp');
  IF NOT public.quiz_user_can_access_quiz(_quiz_id, v_uid) THEN
    RAISE EXCEPTION 'QUIZ_LOCKED:pro' USING HINT = 'This atlas or question pack requires Pro.';
  END IF;
  SELECT * INTO v_quiz FROM public.quizzes WHERE id = _quiz_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quiz not found: %', _quiz_id; END IF;
  IF NOT v_quiz.is_published THEN RAISE EXCEPTION 'Quiz is not published: %', _quiz_id; END IF;
  v_code := public.generate_pvp_room_code();
  INSERT INTO public.pvp_rooms (room_code, host_user_id, quiz_id, status, max_players, room_mode, min_players)
  VALUES (v_code, v_uid, _quiz_id, 'waiting', 2, 'pvp', 2)
  RETURNING * INTO v_room;
  INSERT INTO public.pvp_participants (room_id, user_id, is_ready) VALUES (v_room.id, v_uid, false);
  RETURN public.build_pvp_room_state(v_room.id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.create_multiplayer_room(_quiz_id text, _max_players smallint)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_quiz public.quizzes%ROWTYPE;
  v_room public.pvp_rooms%ROWTYPE;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF _quiz_id IS NULL OR trim(_quiz_id) = '' THEN RAISE EXCEPTION 'quiz_id must be non-empty'; END IF;
  IF _max_players IS NULL OR _max_players < 4 OR _max_players > 16 THEN
    RAISE EXCEPTION 'max_players must be between 4 and 16';
  END IF;
  PERFORM public.assert_quiz_quota_available(v_uid, 'multiplayer');
  IF NOT public.quiz_user_can_access_quiz(_quiz_id, v_uid) THEN
    RAISE EXCEPTION 'QUIZ_LOCKED:pro' USING HINT = 'This atlas or question pack requires Pro.';
  END IF;
  SELECT * INTO v_quiz FROM public.quizzes WHERE id = _quiz_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Quiz not found: %', _quiz_id; END IF;
  IF NOT v_quiz.is_published THEN RAISE EXCEPTION 'Quiz is not published: %', _quiz_id; END IF;
  v_code := public.generate_pvp_room_code();
  INSERT INTO public.pvp_rooms (room_code, host_user_id, quiz_id, status, room_mode, min_players, max_players)
  VALUES (v_code, v_uid, _quiz_id, 'waiting', 'multiplayer', 3, _max_players)
  RETURNING * INTO v_room;
  INSERT INTO public.pvp_participants (room_id, user_id, is_ready) VALUES (v_room.id, v_uid, false);
  RETURN public.build_multiplayer_room_state(v_room.id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.join_pvp_room(_room_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_room public.pvp_rooms%ROWTYPE;
  v_count integer;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  PERFORM public.assert_quiz_quota_available(v_uid, 'pvp');
  v_code := upper(trim(coalesce(_room_code, '')));
  IF v_code = '' OR v_code !~ '^[A-Z2-9]{6}$' THEN RAISE EXCEPTION 'Invalid room code format'; END IF;
  SELECT * INTO v_room
  FROM public.pvp_rooms
  WHERE room_code = v_code AND room_mode = 'pvp'::public.room_mode
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Room not found'; END IF;
  IF v_room.status IN ('completed', 'cancelled') THEN RAISE EXCEPTION 'Room is no longer joinable'; END IF;
  IF v_room.status = 'playing' THEN RAISE EXCEPTION 'Room is already in progress'; END IF;
  IF EXISTS (SELECT 1 FROM public.pvp_participants pp WHERE pp.room_id = v_room.id AND pp.user_id = v_uid) THEN
    RAISE EXCEPTION 'Already in this room';
  END IF;
  SELECT count(*) INTO v_count FROM public.pvp_participants WHERE room_id = v_room.id;
  IF v_count >= v_room.max_players THEN RAISE EXCEPTION 'Room is full'; END IF;
  INSERT INTO public.pvp_participants (room_id, user_id, is_ready) VALUES (v_room.id, v_uid, false);
  IF v_room.status = 'ready' THEN UPDATE public.pvp_rooms SET status = 'waiting' WHERE id = v_room.id; END IF;
  PERFORM public.sync_pvp_room_ready_state(v_room.id);
  RETURN public.build_pvp_room_state(v_room.id);
END;
$function$;

CREATE OR REPLACE FUNCTION public.join_multiplayer_room(_room_code text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_room public.pvp_rooms%ROWTYPE;
  v_count integer;
  v_code text;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  PERFORM public.assert_quiz_quota_available(v_uid, 'multiplayer');
  v_code := upper(trim(coalesce(_room_code, '')));
  IF v_code = '' OR v_code !~ '^[A-Z2-9]{6}$' THEN RAISE EXCEPTION 'Invalid room code format'; END IF;
  SELECT * INTO v_room
  FROM public.pvp_rooms
  WHERE room_code = v_code AND room_mode = 'multiplayer'::public.room_mode
  ORDER BY created_at DESC
  LIMIT 1
  FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Room not found'; END IF;
  IF v_room.status NOT IN ('waiting', 'ready') THEN RAISE EXCEPTION 'Room is no longer joinable'; END IF;
  IF EXISTS (SELECT 1 FROM public.pvp_participants pp WHERE pp.room_id = v_room.id AND pp.user_id = v_uid) THEN
    RAISE EXCEPTION 'Already in this room';
  END IF;
  SELECT count(*) INTO v_count FROM public.pvp_participants WHERE room_id = v_room.id;
  IF v_count >= v_room.max_players THEN RAISE EXCEPTION 'Room is full'; END IF;
  INSERT INTO public.pvp_participants (room_id, user_id, is_ready) VALUES (v_room.id, v_uid, false);
  IF v_room.status = 'ready' THEN UPDATE public.pvp_rooms SET status = 'waiting' WHERE id = v_room.id; END IF;
  PERFORM public.sync_multiplayer_room_ready_state(v_room.id);
  RETURN public.build_multiplayer_room_state(v_room.id);
END;
$function$;

-- ─────────────────────────────────────────────────────────────────────────────
-- 9. Challenges RPCs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.join_membership_challenge(_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ch public.membership_challenges%ROWTYPE;
  v_row public.challenge_participants%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  IF NOT public.check_entitlement('member_challenges') THEN
    RAISE EXCEPTION 'ENTITLEMENT:member_challenges' USING HINT = 'Member-only challenges require Pro.';
  END IF;

  SELECT * INTO v_ch FROM public.membership_challenges WHERE id = _challenge_id FOR UPDATE;
  IF NOT FOUND OR v_ch.status <> 'published' THEN
    RAISE EXCEPTION 'Challenge is not available';
  END IF;
  IF now() < v_ch.starts_at OR now() > v_ch.ends_at THEN
    RAISE EXCEPTION 'Challenge is outside its active window';
  END IF;
  IF public.library_tier_rank(public.resolve_user_subscription_tier(v_uid))
       < public.library_tier_rank(v_ch.min_access_tier) THEN
    RAISE EXCEPTION 'ENTITLEMENT:member_challenges';
  END IF;

  INSERT INTO public.challenge_participants (challenge_id, user_id, status)
  VALUES (_challenge_id, v_uid, 'joined')
  ON CONFLICT (challenge_id, user_id) DO NOTHING
  RETURNING * INTO v_row;

  IF v_row.user_id IS NULL THEN
    SELECT * INTO v_row
    FROM public.challenge_participants
    WHERE challenge_id = _challenge_id AND user_id = v_uid;
  END IF;

  RETURN jsonb_build_object(
    'challenge_id', v_row.challenge_id,
    'status', v_row.status,
    'joined_at', v_row.joined_at,
    'completed_at', v_row.completed_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_membership_challenge(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.complete_membership_challenge(_challenge_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_uid uuid := auth.uid();
  v_ch public.membership_challenges%ROWTYPE;
  v_row public.challenge_participants%ROWTYPE;
BEGIN
  IF v_uid IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;

  SELECT * INTO v_ch FROM public.membership_challenges WHERE id = _challenge_id FOR UPDATE;
  IF NOT FOUND OR v_ch.status <> 'published' THEN
    RAISE EXCEPTION 'Challenge is not available';
  END IF;

  SELECT * INTO v_row
  FROM public.challenge_participants
  WHERE challenge_id = _challenge_id AND user_id = v_uid
  FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Join the challenge before completing it';
  END IF;
  IF v_row.status = 'completed' THEN
    RETURN jsonb_build_object(
      'challenge_id', v_row.challenge_id,
      'status', v_row.status,
      'completed_at', v_row.completed_at,
      'reward_credits', 0,
      'duplicate', true
    );
  END IF;

  UPDATE public.challenge_participants
  SET status = 'completed', completed_at = now()
  WHERE challenge_id = _challenge_id AND user_id = v_uid
  RETURNING * INTO v_row;

  -- Credits are only granted when an authorised reward_credits value is configured.
  -- This function never invents a payout.
  RETURN jsonb_build_object(
    'challenge_id', v_row.challenge_id,
    'status', v_row.status,
    'completed_at', v_row.completed_at,
    'reward_credits', v_ch.reward_credits,
    'reward_pending_configuration', (v_ch.reward_credits <= 0),
    'duplicate', false
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.complete_membership_challenge(uuid) TO authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- 10. Admin RPCs
-- ─────────────────────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_list_memberships(
  _tier text DEFAULT NULL,
  _status text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public', 'auth'
AS $$
DECLARE
  v_period date := public.membership_calendar_month_start();
BEGIN
  PERFORM public.require_admin();
  RETURN coalesce((
    SELECT jsonb_agg(row_to_json(x) ORDER BY x.created_at DESC)
    FROM (
      SELECT
        p.id,
        u.email::text AS email,
        p.username,
        p.display_name,
        coalesce(sub.plan_tier, 'explorer') AS plan_tier,
        coalesce(sub.status, 'none') AS subscription_status,
        sub.started_at,
        sub.current_period_start,
        sub.current_period_end,
        coalesce(sub.cancel_at_period_end, false) AS cancel_at_period_end,
        coalesce(prog.credits, 0) AS credits,
        coalesce(usage.solo_count, 0) AS solo_count,
        coalesce(usage.pvp_count, 0) AS pvp_count,
        coalesce(usage.multiplayer_count, 0) AS multiplayer_count,
        coalesce(usage.total_count, 0) AS monthly_quiz_count,
        p.created_at
      FROM public.profiles p
      JOIN auth.users u ON u.id = p.id
      LEFT JOIN public.user_progression prog ON prog.user_id = p.id
      LEFT JOIN LATERAL (
        SELECT us.plan_tier, us.status, us.started_at, us.current_period_start,
               us.current_period_end, us.cancel_at_period_end
        FROM public.user_subscriptions us
        WHERE us.user_id = p.id
        ORDER BY CASE us.status
          WHEN 'active' THEN 0 WHEN 'trialing' THEN 1 WHEN 'past_due' THEN 2
          WHEN 'pending' THEN 3 ELSE 4
        END, us.updated_at DESC
        LIMIT 1
      ) sub ON true
      LEFT JOIN public.membership_quiz_usage usage
        ON usage.user_id = p.id AND usage.period_start = v_period
      WHERE (_tier IS NULL OR coalesce(sub.plan_tier, 'explorer') = _tier)
        AND (_status IS NULL OR coalesce(sub.status, 'none') = _status)
    ) x
  ), '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_memberships(text, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_library_resource_tier(
  _resource_id uuid,
  _min_access_tier text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor uuid;
  v_slug text;
BEGIN
  v_actor := public.require_admin();
  IF _min_access_tier IS NOT NULL AND _min_access_tier NOT IN ('explorer', 'basic', 'pro', 'advance') THEN
    RAISE EXCEPTION 'Invalid access tier';
  END IF;

  UPDATE public.library_resources
  SET min_access_tier = _min_access_tier, updated_by = v_actor, updated_at = now()
  WHERE id = _resource_id
  RETURNING slug INTO v_slug;

  IF v_slug IS NULL THEN
    RAISE EXCEPTION 'Library resource not found';
  END IF;

  PERFORM public.admin_write_audit_log(
    'set_library_resource_tier',
    'library_resources',
    _resource_id::text,
    jsonb_build_object('slug', v_slug, 'min_access_tier', _min_access_tier)
  );

  RETURN jsonb_build_object('id', _resource_id, 'slug', v_slug, 'min_access_tier', _min_access_tier);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_library_resource_tier(uuid, text) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_upsert_membership_challenge(
  _id uuid,
  _slug text,
  _title text,
  _description text,
  _starts_at timestamptz,
  _ends_at timestamptz,
  _status text,
  _min_access_tier text,
  _reward_credits integer,
  _reward_config jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor uuid;
  v_id uuid;
BEGIN
  v_actor := public.require_admin();
  IF _status NOT IN ('draft', 'published', 'archived') THEN
    RAISE EXCEPTION 'Invalid challenge status';
  END IF;
  IF coalesce(_min_access_tier, 'pro') NOT IN ('explorer', 'basic', 'pro', 'advance') THEN
    RAISE EXCEPTION 'Invalid access tier';
  END IF;

  INSERT INTO public.membership_challenges (
    id, slug, title, description, starts_at, ends_at, status,
    min_access_tier, reward_credits, reward_config, created_by, updated_at
  ) VALUES (
    coalesce(_id, gen_random_uuid()),
    _slug, _title, _description, _starts_at, _ends_at, _status,
    coalesce(_min_access_tier, 'pro'),
    greatest(coalesce(_reward_credits, 0), 0),
    coalesce(_reward_config, '{}'::jsonb),
    v_actor,
    now()
  )
  ON CONFLICT (id) DO UPDATE
  SET
    slug = EXCLUDED.slug,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    starts_at = EXCLUDED.starts_at,
    ends_at = EXCLUDED.ends_at,
    status = EXCLUDED.status,
    min_access_tier = EXCLUDED.min_access_tier,
    reward_credits = EXCLUDED.reward_credits,
    reward_config = EXCLUDED.reward_config,
    updated_at = now()
  RETURNING id INTO v_id;

  PERFORM public.admin_write_audit_log(
    'upsert_membership_challenge',
    'membership_challenges',
    v_id::text,
    jsonb_build_object('slug', _slug, 'status', _status)
  );

  RETURN jsonb_build_object('id', v_id, 'slug', _slug, 'status', _status);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_upsert_membership_challenge(
  uuid, text, text, text, timestamptz, timestamptz, text, text, integer, jsonb
) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_membership_challenges()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN coalesce((
    SELECT jsonb_agg(to_jsonb(c) ORDER BY c.starts_at DESC)
    FROM public.membership_challenges c
  ), '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_membership_challenges() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_update_plan_entitlements(
  _tier text,
  _monthly_quiz_limit integer,
  _solo_quiz_limit integer,
  _pvp_limit integer,
  _multiplayer_limit integer,
  _monthly_credit_grant integer,
  _credit_rollover_months smallint,
  _gstore_discount_bps integer
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.require_admin();
  IF _tier NOT IN ('explorer', 'basic', 'pro') THEN
    RAISE EXCEPTION 'Advance entitlements cannot be activated from admin';
  END IF;
  IF _gstore_discount_bps IS NOT NULL AND (_gstore_discount_bps < 0 OR _gstore_discount_bps > 10000) THEN
    RAISE EXCEPTION 'Invalid discount basis points';
  END IF;

  UPDATE public.subscription_plans
  SET
    monthly_quiz_limit = _monthly_quiz_limit,
    solo_quiz_limit = _solo_quiz_limit,
    pvp_limit = _pvp_limit,
    multiplayer_limit = _multiplayer_limit,
    monthly_credit_grant = coalesce(_monthly_credit_grant, monthly_credit_grant),
    credit_rollover_months = coalesce(_credit_rollover_months, credit_rollover_months),
    gstore_discount_bps = coalesce(_gstore_discount_bps, gstore_discount_bps),
    updated_at = now()
  WHERE tier = _tier;

  PERFORM public.admin_write_audit_log(
    'update_plan_entitlements',
    'subscription_plans',
    _tier,
    jsonb_build_object(
      'monthly_quiz_limit', _monthly_quiz_limit,
      'solo_quiz_limit', _solo_quiz_limit,
      'pvp_limit', _pvp_limit,
      'multiplayer_limit', _multiplayer_limit,
      'monthly_credit_grant', _monthly_credit_grant,
      'gstore_discount_bps', _gstore_discount_bps
    )
  );

  RETURN jsonb_build_object('tier', _tier, 'updated', true);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_plan_entitlements(
  text, integer, integer, integer, integer, integer, smallint, integer
) TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_list_library_access()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN coalesce((
    SELECT jsonb_agg(to_jsonb(r) ORDER BY r.published_at DESC NULLS LAST)
    FROM (
      SELECT id, slug, title, min_access_tier, status, published_at, read_time_minutes
      FROM public.library_resources
      WHERE resource_kind = 'article'
    ) r
  ), '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_library_access() TO authenticated;

-- Seed a published Pro challenge with no credit payout until an admin configures one.
INSERT INTO public.membership_challenges (
  slug, title, description, starts_at, ends_at, status, min_access_tier, reward_credits, reward_config
) VALUES (
  'pro-meridian-circuit',
  'Meridian Circuit',
  'A Pro-only expedition across capitals, climate belts and contested borders. Complete any four eligible quizzes during the challenge window. Rewards are issued only when an administrator configures an authorised payout.',
  date_trunc('month', timezone('utc', now())),
  date_trunc('month', timezone('utc', now())) + interval '2 months',
  'published',
  'pro',
  0,
  '{"completion":{"eligible_quizzes":4},"payout":"unconfigured"}'::jsonb
)
ON CONFLICT (slug) DO NOTHING;
