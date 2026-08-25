-- =============================================================================
-- Multiplayer Placement Ranking + Placement Credits
--
-- Ranking: ROW_NUMBER() OVER (ORDER BY score DESC, submitted_at ASC)
-- Credits: 1st=5, 2nd=3, 3rd=2, 4+=0 (no opponent-tier logic)
-- Schema: credit_transactions UNIQUE(room_id, user_id); opponent_user_id nullable
-- PvP: ON CONFLICT target updated only (schema compatibility; logic unchanged)
-- Safe to re-run: CREATE OR REPLACE / IF EXISTS guards.
-- =============================================================================

-- ---- 1. credit_transactions schema --------------------------------------------
alter table public.credit_transactions
  drop constraint if exists credit_transactions_room_id_key;

alter table public.credit_transactions
  alter column opponent_user_id drop not null;

alter table public.credit_transactions
  drop constraint if exists credit_transactions_room_user_key;

alter table public.credit_transactions
  add constraint credit_transactions_room_user_key unique (room_id, user_id);

comment on column public.credit_transactions.opponent_user_id is
  'PvP opponent for tier lookup. NULL for multiplayer placement rewards.';

comment on table public.credit_transactions is
  'Immutable win/placement credit ledger. PvP: one row per winner. Multiplayer: up to 3 placement rows.';

-- ---- 2. finalize_multiplayer_rankings -----------------------------------------
create or replace function public.finalize_multiplayer_rankings(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room               public.pvp_rooms%rowtype;
  v_participant_count  integer;
  v_submitted_count    integer;
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

  if v_room.rankings_finalized_at is not null then
    return;
  end if;

  if v_room.status not in ('playing', 'completed') then
    return;
  end if;

  if v_room.active_player_count is null then
    raise exception 'active_player_count is required for multiplayer ranking';
  end if;

  select count(*) into v_participant_count
  from public.pvp_participants
  where room_id = _room_id;

  if v_participant_count <> v_room.active_player_count then
    raise exception 'Participant count mismatch for multiplayer ranking';
  end if;

  select count(*) into v_submitted_count
  from public.pvp_participants
  where room_id = _room_id
    and submitted_at is not null;

  if v_submitted_count <> v_room.active_player_count then
    raise exception 'Not all participants have submitted';
  end if;

  if exists (
    select 1
    from public.pvp_participants
    where room_id = _room_id
      and (score is null or submitted_at is null)
  ) then
    raise exception 'All participants must have scores and submitted_at before ranking';
  end if;

  update public.pvp_participants pp
  set finish_rank = ranked.rank_value
  from (
    select
      id,
      row_number() over (
        order by score desc, submitted_at asc
      )::smallint as rank_value
    from public.pvp_participants
    where room_id = _room_id
  ) ranked
  where pp.id = ranked.id;

  update public.pvp_rooms
  set rankings_finalized_at = now()
  where id = _room_id
    and rankings_finalized_at is null;
end;
$$;

comment on function public.finalize_multiplayer_rankings(uuid) is
  'Internal: unique finish_rank via score DESC, submitted_at ASC. Not client-callable.';

comment on column public.pvp_participants.finish_rank is
  'Unique multiplayer placement (1=best). Tie-break: earlier submitted_at.';

-- ---- 3. settle_multiplayer_match_rewards --------------------------------------
create or replace function public.settle_multiplayer_match_rewards(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room        public.pvp_rooms%rowtype;
  v_participant record;
  v_submitted   integer;
  v_month_key   date;
  v_xp_earned   integer;
  v_credits     integer;
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
    end if;

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
  'Authoritative multiplayer placement rewards: 1st=5, 2nd=3, 3rd=2 credits; XP for all.';

revoke all on function public.settle_multiplayer_match_rewards(uuid) from public, anon, authenticated;

-- ---- 4. PvP settlement — ON CONFLICT target only (schema compatibility) -------
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

    v_credit := public.calculate_pvp_credit_award(v_winner_id, v_loser_id, v_month_key);
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

    if v_winner_id is not null and v_participant.user_id = v_winner_id then
      perform public.apply_user_progression_rewards(
        v_participant.user_id,
        v_participant.correct,
        v_participant.total,
        v_xp_earned,
        v_credits,
        v_month_key
      );
    else
      perform public.apply_user_progression_rewards(
        v_participant.user_id,
        v_participant.correct,
        v_participant.total,
        v_xp_earned,
        0,
        v_month_key
      );
    end if;

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

  if v_winner_id is not null then
    insert into public.credit_transactions (
      user_id, opponent_user_id, room_id, amount, win_tier, month_key
    ) values (
      v_winner_id, v_loser_id, _room_id, v_credits, v_win_tier, v_month_key
    )
    on conflict (room_id, user_id) do nothing;
  end if;

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
  'Authoritative PvP reward settlement. Idempotent via rewards_settled_at and credit_transactions(room_id, user_id).';
