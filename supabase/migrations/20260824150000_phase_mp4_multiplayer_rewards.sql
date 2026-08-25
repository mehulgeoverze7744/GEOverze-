-- =============================================================================
-- Phase MP4 — Multiplayer Reward Settlement
--
-- Adds settle_multiplayer_match_rewards(), integrates settlement into
-- complete_multiplayer_match_if_ready(), and updates build_multiplayer_room_state().
--
-- Credits: Model C best-tier single payout (max 5). XP: GREATEST(50, correct * 25).
-- Does not modify PvP settlement or reward RPCs.
-- Safe to re-run: CREATE OR REPLACE guards.
-- =============================================================================

-- ---- 1. settle_multiplayer_match_rewards --------------------------------------
create or replace function public.settle_multiplayer_match_rewards(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room           public.pvp_rooms%rowtype;
  v_participant    record;
  v_submitted      integer;
  v_month_key      date;
  v_xp_earned      integer;
  v_credits        integer;
  v_winner_id      uuid;
  v_rank1_count    integer;
  v_best_amount    integer := -1;
  v_best_opponent  uuid;
  v_best_tier      smallint;
  v_credit         jsonb;
  v_amount         integer;
  v_opp            record;
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
    raise exception 'Expected % submitted participants, got %',
      v_room.active_player_count, v_submitted;
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
  v_winner_id := null;
  v_best_opponent := null;
  v_best_tier := null;

  select count(*) into v_rank1_count
  from public.pvp_participants
  where room_id = _room_id
    and finish_rank = 1;

  if v_rank1_count = 1 then
    select pp.user_id
    into v_winner_id
    from public.pvp_participants pp
    where pp.room_id = _room_id
      and pp.finish_rank = 1;

    for v_opp in
      select pp.user_id
      from public.pvp_participants pp
      where pp.room_id = _room_id
        and pp.finish_rank > 1
      order by pp.user_id
    loop
      v_credit := public.calculate_pvp_credit_award(
        v_winner_id,
        v_opp.user_id,
        v_month_key
      );
      v_amount := (v_credit->>'amount')::integer;

      if v_amount > v_best_amount then
        v_best_amount := v_amount;
        v_best_opponent := v_opp.user_id;
        v_best_tier := (v_credit->>'win_tier')::smallint;
      elsif v_amount = v_best_amount
        and (v_best_opponent is null or v_opp.user_id < v_best_opponent) then
        v_best_opponent := v_opp.user_id;
        v_best_tier := (v_credit->>'win_tier')::smallint;
      end if;
    end loop;

    if v_best_opponent is not null and v_best_amount > 0 then
      insert into public.credit_transactions (
        user_id, opponent_user_id, room_id, amount, win_tier, month_key
      ) values (
        v_winner_id,
        v_best_opponent,
        _room_id,
        v_best_amount,
        v_best_tier,
        v_month_key
      )
      on conflict (room_id) do nothing;
    end if;
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

    if v_participant.attempt_id is null then
      raise exception 'Participant % missing attempt_id', v_participant.user_id;
    end if;

    v_xp_earned := greatest(50, v_participant.correct::integer * 25);
    v_credits := case
      when v_winner_id is not null
        and v_participant.user_id = v_winner_id
        and v_best_amount > 0
      then v_best_amount
      else 0
    end;

    perform public.apply_user_progression_rewards(
      v_participant.user_id,
      v_participant.correct,
      v_participant.total,
      v_xp_earned,
      v_credits,
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
  'Authoritative multiplayer reward settlement. Best-tier single credit payout; XP for all.';

revoke all on function public.settle_multiplayer_match_rewards(uuid) from public, anon, authenticated;

-- ---- 2. complete_multiplayer_match_if_ready — settlement integration -----------
create or replace function public.complete_multiplayer_match_if_ready(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room      public.pvp_rooms%rowtype;
  v_submitted integer;
begin
  select * into v_room
  from public.pvp_rooms
  where id = _room_id
  for update;

  if not found then
    return;
  end if;

  if v_room.room_mode <> 'multiplayer'::public.room_mode then
    return;
  end if;

  if v_room.rewards_settled_at is not null then
    return;
  end if;

  -- Recovery: completed + rankings finalized, rewards pending.
  if v_room.status = 'completed'
    and v_room.rankings_finalized_at is not null then
    perform public.settle_multiplayer_match_rewards(_room_id);
    return;
  end if;

  -- Rankings finalized but room not yet completed (edge recovery).
  if v_room.rankings_finalized_at is not null then
    if v_room.status <> 'completed' then
      update public.pvp_rooms
      set
        status       = 'completed',
        completed_at = coalesce(completed_at, now())
      where id = _room_id;
    end if;

    perform public.settle_multiplayer_match_rewards(_room_id);
    return;
  end if;

  -- Recovery: completed without rankings.
  if v_room.status = 'completed' then
    perform public.finalize_multiplayer_rankings(_room_id);

    update public.pvp_rooms
    set completed_at = coalesce(completed_at, now())
    where id = _room_id;

    perform public.settle_multiplayer_match_rewards(_room_id);
    return;
  end if;

  if v_room.status <> 'playing' then
    return;
  end if;

  if v_room.active_player_count is null then
    raise exception 'active_player_count is required for multiplayer completion';
  end if;

  select count(*) into v_submitted
  from public.pvp_participants
  where room_id = _room_id
    and submitted_at is not null;

  if v_submitted < v_room.active_player_count then
    return;
  end if;

  perform public.finalize_multiplayer_rankings(_room_id);

  update public.pvp_rooms
  set
    status       = 'completed',
    completed_at = coalesce(completed_at, now())
  where id = _room_id;

  perform public.settle_multiplayer_match_rewards(_room_id);
end;
$$;

comment on function public.complete_multiplayer_match_if_ready(uuid) is
  'Finalizes rankings, completes room, and settles multiplayer rewards when all players submit.';

revoke all on function public.complete_multiplayer_match_if_ready(uuid) from public, anon;

-- ---- 3. build_multiplayer_room_state — reward fields ---------------------------
create or replace function public.build_multiplayer_room_state(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.pvp_rooms%rowtype;
  v_results_public boolean;
  v_rewards_public boolean;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_pvp_room_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  select * into v_room
  from public.pvp_rooms
  where id = _room_id;

  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.room_mode <> 'multiplayer'::public.room_mode then
    raise exception 'Not a multiplayer room';
  end if;

  if v_room.status = 'completed' and v_room.rankings_finalized_at is null then
    perform public.complete_multiplayer_match_if_ready(_room_id);

    select * into v_room
    from public.pvp_rooms
    where id = _room_id;
  end if;

  if v_room.status = 'completed'
    and v_room.rankings_finalized_at is not null
    and v_room.rewards_settled_at is null then
    perform public.complete_multiplayer_match_if_ready(_room_id);

    select * into v_room
    from public.pvp_rooms
    where id = _room_id;
  end if;

  v_results_public := v_room.status = 'completed'
    and v_room.rankings_finalized_at is not null;

  v_rewards_public := v_room.status = 'completed'
    and v_room.rewards_settled_at is not null;

  return jsonb_build_object(
    'room', jsonb_build_object(
      'id', v_room.id,
      'room_code', v_room.room_code,
      'host_user_id', v_room.host_user_id,
      'quiz_id', v_room.quiz_id,
      'status', v_room.status,
      'room_mode', v_room.room_mode,
      'min_players', v_room.min_players,
      'max_players', v_room.max_players,
      'active_player_count', v_room.active_player_count,
      'created_at', v_room.created_at,
      'started_at', v_room.started_at,
      'completed_at', v_room.completed_at,
      'rankings_finalized_at', v_room.rankings_finalized_at,
      'rewards_settled_at', v_room.rewards_settled_at
    ),
    'participants', coalesce((
      select jsonb_agg(
        jsonb_build_object(
          'id', pp.id,
          'user_id', pp.user_id,
          'is_ready', pp.is_ready,
          'joined_at', pp.joined_at,
          'ready_at', pp.ready_at,
          'is_host', pp.user_id = v_room.host_user_id,
          'username', coalesce(p.username, p.display_name, 'player'),
          'display_name', coalesce(p.display_name, p.username, 'Player'),
          'avatar_id', p.avatar_id,
          'level', coalesce(up.level, 1),
          'submitted_at', pp.submitted_at,
          'correct', case
            when pp.user_id = v_uid or v_results_public then pp.correct
            else null
          end,
          'total', case
            when pp.user_id = v_uid or v_results_public then pp.total
            else null
          end,
          'score', case
            when pp.user_id = v_uid or v_results_public then pp.score
            else null
          end,
          'best_streak', case
            when pp.user_id = v_uid or v_results_public then pp.best_streak
            else null
          end,
          'finish_rank', case
            when v_results_public then pp.finish_rank
            else null
          end,
          'xp_earned', case
            when v_rewards_public then pp.xp_earned
            else null
          end,
          'credits_earned', case
            when v_rewards_public then pp.credits_earned
            else null
          end
        )
        order by
          case when v_results_public then pp.finish_rank end asc nulls last,
          pp.joined_at
      )
      from public.pvp_participants pp
      left join public.profiles p on p.id = pp.user_id
      left join public.user_progression up on up.user_id = pp.user_id
      where pp.room_id = _room_id
    ), '[]'::jsonb)
  );
end;
$$;

comment on function public.build_multiplayer_room_state(uuid) is
  'Authoritative multiplayer room state. Rewards visible after rewards_settled_at.';
