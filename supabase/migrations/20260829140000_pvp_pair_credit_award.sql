-- =============================================================================
-- PvP pair-game credit award (5 for first completed duel, 1 for rematches)
--
-- Replaces directional winner-vs-opponent win counting in credit_transactions
-- with completed pvp_rooms history between the same two players in the month.
--
-- Draws count toward pair game index but award 0 credits (unchanged settlement).
-- Multiplayer placement 5/3/2/0 is NOT modified.
-- Historical credit_transactions rows are preserved unchanged.
-- Safe to re-run: CREATE OR REPLACE / IF EXISTS guards.
-- =============================================================================

-- ---- 1. calculate_pvp_credit_award — pair completed-game count ----------------
drop function if exists public.calculate_pvp_credit_award(uuid, uuid, date);

create or replace function public.calculate_pvp_credit_award(
  _player_a   uuid,
  _player_b   uuid,
  _month_key  date,
  _room_id    uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_prior_games integer;
  v_amount      integer;
  v_tier        smallint;
begin
  select count(*)
  into v_prior_games
  from public.pvp_rooms r
  where r.room_mode = 'pvp'::public.room_mode
    and r.status = 'completed'
    and r.completed_at is not null
    and r.id <> _room_id
    and date_trunc('month', r.completed_at)::date = _month_key
    and r.completed_at < (
      select pr.completed_at
      from public.pvp_rooms pr
      where pr.id = _room_id
    )
    and exists (
      select 1
      from public.pvp_participants p
      where p.room_id = r.id
        and p.user_id = _player_a
    )
    and exists (
      select 1
      from public.pvp_participants p
      where p.room_id = r.id
        and p.user_id = _player_b
    );

  if v_prior_games = 0 then
    v_amount := 5;
    v_tier := 1;
  else
    v_amount := 1;
    v_tier := 2;
  end if;

  return jsonb_build_object('amount', v_amount, 'win_tier', v_tier);
end;
$$;

comment on function public.calculate_pvp_credit_award(uuid, uuid, date, uuid) is
  'Pair-based PvP credits: first completed duel between players in month = 5, every rematch = 1.';

revoke all on function public.calculate_pvp_credit_award(uuid, uuid, date, uuid) from public, anon;

-- ---- 2. settle_pvp_match_rewards — pass room_id into pair credit calculator ----
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
  'Authoritative PvP reward settlement. Pair-based 5/1 credits. Idempotent via rewards_settled_at and credit_transactions(room_id, user_id).';

revoke all on function public.settle_pvp_match_rewards(uuid) from public, anon;
