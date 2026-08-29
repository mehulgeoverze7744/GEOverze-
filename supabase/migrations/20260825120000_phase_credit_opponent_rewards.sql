-- =============================================================================
-- Credit System v2 — Directional opponent 5/1 rewards
--
-- Replaces PvP 5/3/2/1 tiers and MP4.1 placement 5/3/2/0 with:
--   first win  A→B in calendar month = 5 credits
--   repeat win A→B in calendar month = 1 credit
--
-- Multiplayer: each player defeats every lower-ranked participant; one ledger
-- row per awarded directional pair (room_id, user_id, opponent_user_id).
--
-- Historical credit_transactions are preserved unchanged.
-- Safe to re-run: CREATE OR REPLACE / IF EXISTS guards.
-- =============================================================================

-- ---- 1. credit_transactions uniqueness ----------------------------------------
alter table public.credit_transactions
  drop constraint if exists credit_transactions_room_user_key;

alter table public.credit_transactions
  add constraint credit_transactions_room_user_opponent_key
  unique (room_id, user_id, opponent_user_id);

comment on table public.credit_transactions is
  'Immutable win credit ledger. PvP: one row per winner/opponent. Multiplayer: one row per defeated opponent pair.';

comment on column public.credit_transactions.opponent_user_id is
  'Defeated opponent for directional credit lookup. NULL only on legacy placement rows.';

comment on column public.credit_transactions.win_tier is
  '1 = first win vs opponent this month, 2 = repeat win. Legacy rows may use 3/4.';

-- ---- 2. calculate_pvp_credit_award --------------------------------------------
create or replace function public.calculate_pvp_credit_award(
  _winner_id   uuid,
  _opponent_id uuid,
  _month_key   date
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_prior_wins integer;
  v_amount     integer;
  v_tier       smallint;
begin
  select count(*)
  into v_prior_wins
  from public.credit_transactions ct
  where ct.user_id = _winner_id
    and ct.opponent_user_id = _opponent_id
    and ct.month_key = _month_key;

  if v_prior_wins = 0 then
    v_amount := 5;
    v_tier := 1;
  else
    v_amount := 1;
    v_tier := 2;
  end if;

  return jsonb_build_object('amount', v_amount, 'win_tier', v_tier);
end;
$$;

comment on function public.calculate_pvp_credit_award(uuid, uuid, date) is
  'Directional opponent credits: first win in month = 5, every repeat = 1.';

revoke all on function public.calculate_pvp_credit_award(uuid, uuid, date) from public, anon;

-- ---- 3. settle_pvp_match_rewards ----------------------------------------------
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
    on conflict (room_id, user_id, opponent_user_id) do nothing;
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
  'Authoritative PvP reward settlement. Idempotent via rewards_settled_at and credit_transactions(room_id, user_id, opponent_user_id).';

revoke all on function public.settle_pvp_match_rewards(uuid) from public, anon;

-- ---- 4. settle_multiplayer_match_rewards --------------------------------------
create or replace function public.settle_multiplayer_match_rewards(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room        public.pvp_rooms%rowtype;
  v_participant record;
  v_opponent    record;
  v_submitted   integer;
  v_month_key   date;
  v_xp_earned   integer;
  v_credits     integer;
  v_total       integer;
  v_credit      jsonb;
  v_amount      integer;
  v_tier        smallint;
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
    v_total := 0;

    for v_opponent in
      select pp.user_id, pp.finish_rank
      from public.pvp_participants pp
      where pp.room_id = _room_id
        and pp.finish_rank > v_participant.finish_rank
      order by pp.finish_rank asc, pp.joined_at asc
    loop
      v_credit := public.calculate_pvp_credit_award(
        v_participant.user_id,
        v_opponent.user_id,
        v_month_key
      );
      v_amount := (v_credit->>'amount')::integer;
      v_tier := (v_credit->>'win_tier')::smallint;

      if v_amount > 0 then
        insert into public.credit_transactions (
          user_id, opponent_user_id, room_id, amount, win_tier, month_key
        ) values (
          v_participant.user_id,
          v_opponent.user_id,
          _room_id,
          v_amount,
          v_tier,
          v_month_key
        )
        on conflict (room_id, user_id, opponent_user_id) do nothing;

        v_total := v_total + v_amount;
      end if;
    end loop;

    perform public.apply_user_progression_rewards(
      v_participant.user_id,
      v_participant.correct,
      v_participant.total,
      v_xp_earned,
      v_total,
      v_month_key
    );

    update public.pvp_participants
    set
      xp_earned = v_xp_earned,
      credits_earned = v_total
    where id = v_participant.id;

    update public.quiz_attempts
    set
      xp_earned = v_xp_earned,
      credits_earned = v_total
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
  'Authoritative multiplayer opponent-pair credits: first win = 5, repeat = 1 per defeated opponent; XP for all.';

revoke all on function public.settle_multiplayer_match_rewards(uuid) from public, anon, authenticated;
