-- =============================================================================
-- PAY-1c — Gameplay credit ledger dual-write
--
-- Settlement owns gameplay credits: credit_transactions + credit_ledger_entries.
-- apply_user_progression_rewards() receives _credits_earned := 0 for settlement.
--
-- Does NOT modify historical rows, earning rules, XP, or frontend/admin code.
-- =============================================================================

-- ---- 0. Pre-migration baseline verification -----------------------------------
do $$
declare
  v_ledger_count integer;
  v_ledger_sum   integer;
  v_ct_count     integer;
  v_balance_total integer;
begin
  select count(*)::integer, coalesce(sum(amount), 0)::integer
  into v_ledger_count, v_ledger_sum
  from public.credit_ledger_entries;

  if v_ledger_count <> 79 then
    raise exception 'PAY-1c aborted: expected 79 ledger rows, found %', v_ledger_count;
  end if;

  if v_ledger_sum <> 266 then
    raise exception 'PAY-1c aborted: expected ledger sum 266, found %', v_ledger_sum;
  end if;

  select count(*)::integer into v_ct_count from public.credit_transactions;
  if v_ct_count <> 78 then
    raise exception 'PAY-1c aborted: expected 78 credit_transactions, found %', v_ct_count;
  end if;

  select coalesce(sum(credits), 0)::integer into v_balance_total
  from public.user_progression;

  if v_balance_total <> 266 then
    raise exception 'PAY-1c aborted: expected balance total 266, found %', v_balance_total;
  end if;
end;
$$;

-- ---- 1. settle_pvp_match_rewards — dual-write credits -------------------------
create or replace function public.settle_pvp_match_rewards(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room         public.pvp_rooms%rowtype;
  v_participant  record;
  v_participants integer;
  v_winner_id    uuid;
  v_loser_id     uuid;
  v_month_key    date;
  v_xp_earned    integer;
  v_credits      integer;
  v_win_tier     smallint;
  v_credit       jsonb;
  v_ledger_key   text;
begin
  select * into v_room
  from public.pvp_rooms
  where id = _room_id
  for update;

  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.rewards_settled_at is not null then
    return jsonb_build_object(
      'already_settled', true,
      'room_id', _room_id
    );
  end if;

  if v_room.status <> 'completed' then
    raise exception 'Room is not completed';
  end if;

  if v_room.completed_at is null then
    raise exception 'Room completed_at is required for reward settlement';
  end if;

  select count(*) into v_participants
  from public.pvp_participants
  where room_id = _room_id
    and submitted_at is not null;

  if v_participants <> v_room.max_players then
    raise exception 'Expected % submitted participants, got %', v_room.max_players, v_participants;
  end if;

  v_month_key := date_trunc('month', v_room.completed_at)::date;
  v_winner_id := v_room.winner_user_id;
  v_credits := 0;
  v_win_tier := null;

  if v_winner_id is not null then
    select pp.user_id
    into v_loser_id
    from public.pvp_participants pp
    where pp.room_id = _room_id
      and pp.user_id <> v_winner_id
    limit 1;

    v_credit := public.calculate_pvp_credit_award(
      v_winner_id,
      v_loser_id,
      v_month_key,
      _room_id
    );
    v_credits := (v_credit->>'amount')::integer;
    v_win_tier := (v_credit->>'win_tier')::smallint;
  end if;

  for v_participant in
    select *
    from public.pvp_participants
    where room_id = _room_id
    order by joined_at
  loop
    if v_participant.correct is null or v_participant.total is null then
      raise exception 'Participant % missing graded results', v_participant.user_id;
    end if;

    v_xp_earned := greatest(50, v_participant.correct::integer * 25);

    if v_winner_id is not null
       and v_participant.user_id = v_winner_id
       and v_credits > 0 then
      insert into public.credit_transactions (
        user_id, opponent_user_id, room_id, amount, win_tier, month_key
      ) values (
        v_winner_id, v_loser_id, _room_id, v_credits, v_win_tier, v_month_key
      )
      on conflict (room_id, user_id) do nothing;

      v_ledger_key := 'earn:room:' || _room_id::text || ':' || v_winner_id::text;

      perform public.append_credit_ledger_entry(
        v_winner_id,
        v_credits,
        'earn_pvp',
        v_ledger_key,
        'pvp_room',
        _room_id,
        v_month_key,
        jsonb_build_object(
          'source', 'settle_pvp_match_rewards',
          'room_code', v_room.room_code,
          'opponent_user_id', v_loser_id,
          'win_tier', v_win_tier,
          'room_mode', v_room.room_mode::text
        ),
        v_room.completed_at,
        public.get_user_plan_tier(v_winner_id)
      );
    end if;

    perform public.apply_user_progression_rewards(
      v_participant.user_id,
      v_participant.correct,
      v_participant.total,
      v_xp_earned,
      0,
      v_month_key
    );

    update public.pvp_participants
    set
      xp_earned = v_xp_earned,
      credits_earned = case
        when v_winner_id is not null and v_participant.user_id = v_winner_id then v_credits
        else 0
      end
    where id = v_participant.id;

    insert into public.quiz_attempts (
      attempt_id, user_id, quiz_id, mode, score,
      correct, total, best_streak,
      xp_earned, credits_earned, duration_ms
    ) values (
      v_participant.attempt_id,
      v_participant.user_id,
      v_room.quiz_id,
      'pvp',
      v_participant.score,
      v_participant.correct,
      v_participant.total,
      v_participant.best_streak,
      v_xp_earned,
      case
        when v_winner_id is not null and v_participant.user_id = v_winner_id then v_credits
        else 0
      end,
      v_participant.duration_ms
    )
    on conflict (attempt_id) do nothing;
  end loop;

  update public.pvp_rooms
  set rewards_settled_at = now()
  where id = _room_id;

  return jsonb_build_object(
    'already_settled', false,
    'room_id', _room_id
  );
end;
$$;

comment on function public.settle_pvp_match_rewards(uuid) is
  'Authoritative PvP reward settlement. Dual-writes credit_transactions + credit_ledger_entries. XP via apply with credits=0.';

-- ---- 2. settle_multiplayer_match_rewards — dual-write credits -----------------
create or replace function public.settle_multiplayer_match_rewards(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room         public.pvp_rooms%rowtype;
  v_participant  record;
  v_submitted    integer;
  v_month_key    date;
  v_xp_earned    integer;
  v_credits      integer;
  v_ledger_key   text;
begin
  select * into v_room
  from public.pvp_rooms
  where id = _room_id
  for update;

  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.room_mode <> 'multiplayer'::public.room_mode then
    raise exception 'Not a multiplayer room';
  end if;

  if v_room.rewards_settled_at is not null then
    return jsonb_build_object(
      'already_settled', true,
      'room_id', _room_id
    );
  end if;

  if v_room.status <> 'completed' then
    raise exception 'Room is not completed';
  end if;

  if v_room.rankings_finalized_at is null then
    raise exception 'Rankings must be finalized before reward settlement';
  end if;

  if v_room.completed_at is null then
    raise exception 'Room completed_at is required for reward settlement';
  end if;

  if v_room.active_player_count is null then
    raise exception 'active_player_count is required for multiplayer settlement';
  end if;

  select count(*) into v_submitted
  from public.pvp_participants
  where room_id = _room_id
    and submitted_at is not null;

  if v_submitted <> v_room.active_player_count then
    raise exception 'Expected % submitted participants, got %', v_room.active_player_count, v_submitted;
  end if;

  if exists (
    select 1
    from public.pvp_participants
    where room_id = _room_id
      and finish_rank is null
  ) then
    raise exception 'All participants must have finish_rank before settlement';
  end if;

  v_month_key := date_trunc('month', v_room.completed_at)::date;

  for v_participant in
    select *
    from public.pvp_participants
    where room_id = _room_id
    order by finish_rank asc, joined_at asc
  loop
    if v_participant.correct is null or v_participant.total is null then
      raise exception 'Participant % missing graded results', v_participant.user_id;
    end if;

    if v_participant.attempt_id is null then
      raise exception 'Participant % missing attempt_id', v_participant.user_id;
    end if;

    v_xp_earned := greatest(50, v_participant.correct::integer * 25);
    v_credits := case v_participant.finish_rank
      when 1 then 5
      when 2 then 3
      when 3 then 2
      else 0
    end;

    if v_credits > 0 then
      insert into public.credit_transactions (
        user_id, opponent_user_id, room_id, amount, win_tier, month_key
      ) values (
        v_participant.user_id,
        null,
        _room_id,
        v_credits,
        v_participant.finish_rank,
        v_month_key
      )
      on conflict (room_id, user_id) do nothing;

      v_ledger_key := 'earn:room:' || _room_id::text || ':' || v_participant.user_id::text;

      perform public.append_credit_ledger_entry(
        v_participant.user_id,
        v_credits,
        'earn_multiplayer',
        v_ledger_key,
        'pvp_room',
        _room_id,
        v_month_key,
        jsonb_build_object(
          'source', 'settle_multiplayer_match_rewards',
          'room_code', v_room.room_code,
          'finish_rank', v_participant.finish_rank,
          'room_mode', v_room.room_mode::text
        ),
        v_room.completed_at,
        public.get_user_plan_tier(v_participant.user_id)
      );
    end if;

    perform public.apply_user_progression_rewards(
      v_participant.user_id,
      v_participant.correct,
      v_participant.total,
      v_xp_earned,
      0,
      v_month_key
    );

    update public.pvp_participants
    set
      xp_earned = v_xp_earned,
      credits_earned = v_credits
    where id = v_participant.id;

    update public.quiz_attempts
    set
      xp_earned = v_xp_earned,
      credits_earned = v_credits
    where attempt_id = v_participant.attempt_id;
  end loop;

  update public.pvp_rooms
  set rewards_settled_at = now()
  where id = _room_id;

  return jsonb_build_object(
    'already_settled', false,
    'room_id', _room_id
  );
end;
$$;

comment on function public.settle_multiplayer_match_rewards(uuid) is
  'Authoritative multiplayer reward settlement. Dual-writes credit_transactions + credit_ledger_entries. XP via apply with credits=0.';

-- ---- 3. Re-assert PAY-0/PAY-1b/PAY-1b.1 security hardening --------------------
revoke all on function public.settle_pvp_match_rewards(uuid) from authenticated;
revoke all on function public.settle_multiplayer_match_rewards(uuid) from authenticated;
revoke all on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date, text, text, text, uuid, timestamptz
) from public, anon, authenticated;
revoke all on function public.calculate_pvp_credit_award(uuid, uuid, date, uuid)
  from public, anon, authenticated;
revoke all on function public.append_credit_ledger_entry(
  uuid, integer, text, text, text, uuid, date, jsonb, timestamptz, text
) from public, anon, authenticated;
revoke all on function public.reconcile_user_credits(uuid) from public, anon, authenticated;
revoke all on function public.get_user_plan_tier(uuid) from public, anon, authenticated;
revoke all on function public.compute_credit_expires_at(text, timestamptz)
  from public, anon, authenticated;

-- ---- 4. Post-migration verification -------------------------------------------
do $$
declare
  v_ledger_count integer;
  v_ledger_sum   integer;
  v_ct_count     integer;
  v_balance_total integer;
  v_pvp_def      text;
  v_mp_def       text;
begin
  select count(*)::integer, coalesce(sum(amount), 0)::integer
  into v_ledger_count, v_ledger_sum
  from public.credit_ledger_entries;

  if v_ledger_count <> 79 then
    raise exception 'PAY-1c verify failed: ledger row count % != 79', v_ledger_count;
  end if;

  if v_ledger_sum <> 266 then
    raise exception 'PAY-1c verify failed: ledger sum % != 266', v_ledger_sum;
  end if;

  select count(*)::integer into v_ct_count from public.credit_transactions;
  if v_ct_count <> 78 then
    raise exception 'PAY-1c verify failed: credit_transactions count % != 78', v_ct_count;
  end if;

  select coalesce(sum(credits), 0)::integer into v_balance_total
  from public.user_progression;

  if v_balance_total <> 266 then
    raise exception 'PAY-1c verify failed: balance total % != 266', v_balance_total;
  end if;

  select pg_get_functiondef(p.oid) into v_pvp_def
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'settle_pvp_match_rewards';

  if v_pvp_def not ilike '%append_credit_ledger_entry%' then
    raise exception 'PAY-1c verify failed: settle_pvp_match_rewards missing ledger dual-write';
  end if;

  if v_pvp_def ilike '%v_credits,%v_month_key%' then
    raise exception 'PAY-1c verify failed: settle_pvp_match_rewards still passes credits to apply';
  end if;

  select pg_get_functiondef(p.oid) into v_mp_def
  from pg_proc p
  join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'settle_multiplayer_match_rewards';

  if v_mp_def not ilike '%append_credit_ledger_entry%' then
    raise exception 'PAY-1c verify failed: settle_multiplayer_match_rewards missing ledger dual-write';
  end if;

  if public.compute_credit_expires_at('free', timestamptz '2026-08-10 00:00:00+00')
     is distinct from timestamptz '2026-10-01 00:00:00+00' then
    raise exception 'PAY-1c verify failed: free expiry computation incorrect';
  end if;

  if public.compute_credit_expires_at('pro', timestamptz '2026-08-10 00:00:00+00')
     is distinct from timestamptz '2026-10-01 00:00:00+00' then
    raise exception 'PAY-1c verify failed: pro expiry computation incorrect';
  end if;

  if public.compute_credit_expires_at('advance', timestamptz '2026-08-10 00:00:00+00')
     is distinct from timestamptz '2026-11-01 00:00:00+00' then
    raise exception 'PAY-1c verify failed: advance expiry computation incorrect';
  end if;
end;
$$;
