-- QA alignment: pricing-card plan limits, competitive mode quotas, challenge payouts, quiz admin.

-- ── 1. Authoritative plan caps (pricing cards) ───────────────────────────────

UPDATE public.subscription_plans
SET
  monthly_quiz_limit = NULL,
  solo_quiz_limit = 8,
  pvp_limit = 1,
  multiplayer_limit = 1,
  monthly_credit_grant = 0,
  credit_rollover_months = 1,
  gstore_discount_bps = 0
WHERE tier = 'explorer';

UPDATE public.subscription_plans
SET
  monthly_quiz_limit = 60,
  solo_quiz_limit = NULL,
  pvp_limit = 1,
  multiplayer_limit = 1,
  monthly_credit_grant = 5,
  credit_rollover_months = 1,
  gstore_discount_bps = 300
WHERE tier = 'basic';

UPDATE public.subscription_plans
SET
  monthly_quiz_limit = NULL,
  solo_quiz_limit = NULL,
  pvp_limit = NULL,
  multiplayer_limit = NULL,
  monthly_credit_grant = 25,
  credit_rollover_months = 1,
  gstore_discount_bps = 1000
WHERE tier = 'pro';

-- ── 2. Competitive modes: require entitlement, not only quota ─────────────────

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
  IF NOT public.check_entitlement('pvp') THEN
    RAISE EXCEPTION 'ENTITLEMENT:pvp' USING HINT = 'Upgrade your plan for PvP duels this month.';
  END IF;
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
  IF NOT public.check_entitlement('multiplayer') THEN
    RAISE EXCEPTION 'ENTITLEMENT:multiplayer' USING HINT = 'Upgrade your plan for multiplayer rooms this month.';
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
  IF NOT public.check_entitlement('pvp') THEN
    RAISE EXCEPTION 'ENTITLEMENT:pvp' USING HINT = 'Upgrade your plan for PvP duels this month.';
  END IF;
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
  IF NOT public.check_entitlement('multiplayer') THEN
    RAISE EXCEPTION 'ENTITLEMENT:multiplayer' USING HINT = 'Upgrade your plan for multiplayer rooms this month.';
  END IF;
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

-- ── 3. Challenge completion: tier gate + optional configured credit payout ───

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
  v_ledger_id uuid;
  v_grant_key text;
  v_ledger_key text;
  v_credits_granted integer := 0;
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
      'reward_pending_configuration', (v_ch.reward_credits <= 0),
      'credits_granted', 0,
      'duplicate', true
    );
  END IF;

  UPDATE public.challenge_participants
  SET status = 'completed', completed_at = now()
  WHERE challenge_id = _challenge_id AND user_id = v_uid
  RETURNING * INTO v_row;

  IF v_ch.reward_credits > 0 THEN
    v_grant_key := 'challenge_reward_' || _challenge_id::text || '_' || v_uid::text;
    v_ledger_key := v_grant_key || '_ledger';

    INSERT INTO public.credit_ledger_entries (
      user_id, amount, entry_type, idempotency_key,
      reference_type, reference_id, month_key, plan_tier_at_earn,
      remaining_amount, expires_at, metadata
    ) VALUES (
      v_uid,
      v_ch.reward_credits,
      'challenge_reward',
      v_ledger_key,
      'membership_challenge',
      _challenge_id,
      date_trunc('month', timezone('utc', now()))::date,
      public.resolve_user_subscription_tier(v_uid),
      v_ch.reward_credits,
      date_trunc('month', timezone('utc', now())) + interval '2 months' - interval '1 second',
      jsonb_build_object(
        'challenge_slug', v_ch.slug,
        'challenge_title', v_ch.title,
        'reward_credits', v_ch.reward_credits
      )
    )
    ON CONFLICT (idempotency_key) DO NOTHING
    RETURNING id INTO v_ledger_id;

    IF v_ledger_id IS NOT NULL THEN
      INSERT INTO public.user_progression (user_id, credits, updated_at)
      VALUES (v_uid, v_ch.reward_credits, now())
      ON CONFLICT (user_id) DO UPDATE
      SET credits = public.user_progression.credits + v_ch.reward_credits,
          updated_at = now();
      v_credits_granted := v_ch.reward_credits;
    END IF;
  END IF;

  RETURN jsonb_build_object(
    'challenge_id', v_row.challenge_id,
    'status', v_row.status,
    'completed_at', v_row.completed_at,
    'reward_credits', v_ch.reward_credits,
    'reward_pending_configuration', (v_ch.reward_credits <= 0),
    'credits_granted', v_credits_granted,
    'duplicate', false
  );
END;
$$;

-- ── 4. Admin quiz access classification ─────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_list_quiz_access()
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN coalesce((
    SELECT jsonb_agg(to_jsonb(q) ORDER BY q.title)
    FROM (
      SELECT
        id,
        title,
        category_id,
        is_published,
        min_access_tier,
        CASE
          WHEN min_access_tier IS NULL THEN 'open'
          WHEN min_access_tier IN ('pro', 'advance') THEN 'pro_exclusive'
          WHEN min_access_tier = 'basic' THEN 'basic'
          ELSE 'explorer'
        END AS access_band
      FROM public.quizzes
      WHERE is_published = true
    ) q
  ), '[]'::jsonb);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_list_quiz_access() TO authenticated;

CREATE OR REPLACE FUNCTION public.admin_set_quiz_access_tier(_quiz_id text, _min_access_tier text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_actor uuid;
BEGIN
  v_actor := public.require_admin();
  IF _quiz_id IS NULL OR trim(_quiz_id) = '' THEN
    RAISE EXCEPTION 'quiz_id is required';
  END IF;
  IF _min_access_tier IS NOT NULL AND _min_access_tier NOT IN ('explorer', 'basic', 'pro', 'advance') THEN
    RAISE EXCEPTION 'Invalid access tier';
  END IF;

  UPDATE public.quizzes
  SET min_access_tier = _min_access_tier, updated_at = now()
  WHERE id = _quiz_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Quiz not found';
  END IF;

  PERFORM public.admin_write_audit_log(
    'set_quiz_access_tier',
    'quizzes',
    _quiz_id,
    jsonb_build_object('min_access_tier', _min_access_tier, 'actor', v_actor)
  );

  RETURN jsonb_build_object('id', _quiz_id, 'min_access_tier', _min_access_tier);
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_set_quiz_access_tier(text, text) TO authenticated;

-- Suggested default gates (idempotent): seasonal atlases and member packs → Pro.
-- Does not change quizzes that already have a tier.
UPDATE public.quizzes
SET min_access_tier = 'pro'
WHERE is_published = true
  AND min_access_tier IS NULL
  AND (
    category_id ILIKE '%atlas%'
    OR category_id ILIKE '%pack%'
    OR title ILIKE '%atlas%'
    OR title ILIKE '%member%'
    OR coalesce(description, '') ILIKE '%atlas%'
  );