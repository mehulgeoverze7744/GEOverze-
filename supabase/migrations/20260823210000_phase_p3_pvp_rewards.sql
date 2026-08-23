-- =============================================================================
-- Phase P3 — PvP Reward Settlement
--
-- Adds credit ledger, monthly credit scoping, and server-side reward settlement
-- triggered when a PvP match completes. No client claim flow.
--
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE guards.
-- =============================================================================

-- ---- 1. Schema ----------------------------------------------------------------
alter table public.pvp_rooms
  add column if not exists rewards_settled_at timestamptz;

comment on column public.pvp_rooms.rewards_settled_at is
  'When server-side XP/credit settlement completed. Idempotency guard for P3 rewards.';

alter table public.pvp_participants
  add column if not exists xp_earned integer,
  add column if not exists credits_earned integer;

comment on column public.pvp_participants.xp_earned is
  'Authoritative XP awarded at match settlement. Set by settle_pvp_match_rewards().';

comment on column public.pvp_participants.credits_earned is
  'Authoritative PvP credits awarded at settlement (0 for loss/draw).';

alter table public.user_progression
  add column if not exists credits_month_key date;

comment on column public.user_progression.credits_month_key is
  'First day of the calendar month that user_progression.credits currently represents.';

create table if not exists public.credit_transactions (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users (id) on delete cascade,
  opponent_user_id uuid        not null references auth.users (id) on delete cascade,
  room_id          uuid        not null unique references public.pvp_rooms (id) on delete cascade,
  amount           integer     not null constraint credit_transactions_amount_positive check (amount > 0),
  win_tier         smallint    not null constraint credit_transactions_win_tier_range check (win_tier between 1 and 4),
  month_key        date        not null,
  created_at       timestamptz not null default now()
);

comment on table public.credit_transactions is
  'Immutable PvP win credit ledger. One row per winning room. Used for monthly opponent tier lookup.';

create index if not exists credit_transactions_user_opponent_month_idx
  on public.credit_transactions (user_id, opponent_user_id, month_key);

-- ---- 2. RLS for credit_transactions -----------------------------------------
alter table public.credit_transactions enable row level security;

revoke all on public.credit_transactions from anon, authenticated;
grant select on public.credit_transactions to authenticated;

drop policy if exists credit_transactions_select_own on public.credit_transactions;
create policy credit_transactions_select_own
  on public.credit_transactions
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ---- 3. Shared helpers --------------------------------------------------------
create or replace function public.level_from_xp(_xp integer)
returns smallint
language sql
immutable
set search_path = public
as $$
  select (
    case
      when _xp >= 28500 then least(99, 20 + (_xp - 28500) / 2000)
      when _xp >= 26200 then 19
      when _xp >= 24000 then 18
      when _xp >= 22000 then 17
      when _xp >= 20400 then 16
      when _xp >= 19000 then 15
      when _xp >= 18000 then 14
      when _xp >= 17200 then 13
      when _xp >= 16000 then 12
      when _xp >= 14800 then 11
      when _xp >= 13200 then 10
      when _xp >= 12000 then  9
      when _xp >= 10500 then  8
      when _xp >=  8000 then  7
      when _xp >=  5500 then  6
      when _xp >=  3500 then  5
      when _xp >=  2000 then  4
      when _xp >=  1000 then  3
      when _xp >=   500 then  2
      else 1
    end
  )::smallint;
$$;

revoke all on function public.level_from_xp(integer) from public, anon;

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

  case v_prior_wins
    when 0 then v_amount := 5; v_tier := 1;
    when 1 then v_amount := 3; v_tier := 2;
    when 2 then v_amount := 2; v_tier := 3;
    else        v_amount := 1; v_tier := 4;
  end case;

  return jsonb_build_object('amount', v_amount, 'win_tier', v_tier);
end;
$$;

comment on function public.calculate_pvp_credit_award(uuid, uuid, date) is
  'Returns PvP credit amount and win tier from prior monthly wins against the same opponent.';

revoke all on function public.calculate_pvp_credit_award(uuid, uuid, date) from public, anon;

create or replace function public.apply_user_progression_rewards(
  _user_id         uuid,
  _correct         smallint,
  _total           smallint,
  _xp_earned       integer,
  _credits_earned  integer,
  _month_key       date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prog         public.user_progression%rowtype;
  v_new_xp       integer;
  v_new_level    smallint;
  v_old_level    smallint;
  v_new_credits  integer;
  v_new_total_q  integer;
  v_new_total_c  integer;
  v_new_total_a  integer;
  v_new_streak   smallint;
  v_new_longest  smallint;
  v_today        date := current_date;
begin
  select * into v_prog
  from public.user_progression
  where user_id = _user_id
  for update;

  if not found then
    raise exception 'user_progression row not found for uid %. Run backfill.', _user_id;
  end if;

  v_old_level := v_prog.level;
  v_new_xp := v_prog.xp + _xp_earned;

  if v_prog.credits_month_key is null or v_prog.credits_month_key is distinct from _month_key then
    v_new_credits := _credits_earned;
  else
    v_new_credits := v_prog.credits + _credits_earned;
  end if;

  v_new_total_q := v_prog.total_quizzes + 1;
  v_new_total_c := v_prog.total_correct + _correct;
  v_new_total_a := v_prog.total_answered + _total;
  v_new_level := public.level_from_xp(v_new_xp);

  if v_prog.last_played_date is null then
    v_new_streak := 1;
  elsif v_prog.last_played_date = v_today then
    v_new_streak := v_prog.current_streak;
  elsif v_prog.last_played_date = v_today - interval '1 day' then
    v_new_streak := v_prog.current_streak + 1;
  else
    v_new_streak := 1;
  end if;

  v_new_longest := greatest(v_prog.longest_streak, v_new_streak);

  update public.user_progression
  set
    xp               = v_new_xp,
    level            = v_new_level,
    credits          = v_new_credits,
    credits_month_key = _month_key,
    total_quizzes    = v_new_total_q,
    total_correct    = v_new_total_c,
    total_answered   = v_new_total_a,
    current_streak   = v_new_streak,
    longest_streak   = v_new_longest,
    last_played_date = v_today
  where user_id = _user_id;

  return jsonb_build_object(
    'xp_earned',      _xp_earned,
    'credits_earned', _credits_earned,
    'new_xp',         v_new_xp,
    'new_level',      v_new_level::integer,
    'level_up',       v_new_level > v_old_level,
    'new_streak',     v_new_streak::integer,
    'new_credits',    v_new_credits,
    'total_quizzes',  v_new_total_q,
    'total_correct',  v_new_total_c,
    'total_answered', v_new_total_a
  );
end;
$$;

comment on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date
) is
  'Shared progression update for Solo and PvP rewards. Syncs monthly credits bucket via credits_month_key.';

revoke all on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date
) from public, anon;

-- ---- 4. settle_pvp_match_rewards ----------------------------------------------
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
    on conflict (room_id) do nothing;
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
  'Authoritative PvP reward settlement. Idempotent via rewards_settled_at and credit_transactions.room_id.';

revoke all on function public.settle_pvp_match_rewards(uuid) from public, anon;

-- ---- 5. complete_pvp_match_if_ready — integrate settlement --------------------
create or replace function public.complete_pvp_match_if_ready(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room          public.pvp_rooms%rowtype;
  v_submitted     integer;
  v_first_user    uuid;
  v_first_score   integer;
  v_second_user   uuid;
  v_second_score  integer;
  v_winner        uuid;
begin
  select * into v_room
  from public.pvp_rooms
  where id = _room_id
  for update;

  if not found then
    return;
  end if;

  if v_room.status = 'completed' then
    if v_room.rewards_settled_at is null then
      perform public.settle_pvp_match_rewards(_room_id);
    end if;
    return;
  end if;

  if v_room.status <> 'playing' then
    return;
  end if;

  select count(*) into v_submitted
  from public.pvp_participants
  where room_id = _room_id
    and submitted_at is not null;

  if v_submitted < v_room.max_players then
    return;
  end if;

  select pp.user_id, pp.score
  into v_first_user, v_first_score
  from public.pvp_participants pp
  where pp.room_id = _room_id
  order by pp.joined_at
  limit 1;

  select pp.user_id, pp.score
  into v_second_user, v_second_score
  from public.pvp_participants pp
  where pp.room_id = _room_id
  order by pp.joined_at
  offset 1
  limit 1;

  if v_first_score > v_second_score then
    v_winner := v_first_user;
  elsif v_second_score > v_first_score then
    v_winner := v_second_user;
  else
    v_winner := null;
  end if;

  update public.pvp_rooms
  set
    status         = 'completed',
    completed_at   = coalesce(completed_at, now()),
    winner_user_id = v_winner
  where id = _room_id;

  perform public.settle_pvp_match_rewards(_room_id);
end;
$$;

-- ---- 6. build_pvp_room_state — include reward fields --------------------------
create or replace function public.build_pvp_room_state(_room_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.pvp_rooms%rowtype;
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

  return jsonb_build_object(
    'room', jsonb_build_object(
      'id', v_room.id,
      'room_code', v_room.room_code,
      'host_user_id', v_room.host_user_id,
      'quiz_id', v_room.quiz_id,
      'status', v_room.status,
      'max_players', v_room.max_players,
      'created_at', v_room.created_at,
      'started_at', v_room.started_at,
      'completed_at', v_room.completed_at,
      'winner_user_id', v_room.winner_user_id,
      'is_draw', v_room.status = 'completed' and v_room.winner_user_id is null,
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
            when pp.user_id = v_uid or v_room.status = 'completed' then pp.correct
            else null
          end,
          'total', case
            when pp.user_id = v_uid or v_room.status = 'completed' then pp.total
            else null
          end,
          'score', case
            when pp.user_id = v_uid or v_room.status = 'completed' then pp.score
            else null
          end,
          'best_streak', case
            when pp.user_id = v_uid or v_room.status = 'completed' then pp.best_streak
            else null
          end,
          'xp_earned', case
            when v_room.rewards_settled_at is not null then pp.xp_earned
            else null
          end,
          'credits_earned', case
            when v_room.rewards_settled_at is not null then pp.credits_earned
            else null
          end
        )
        order by pp.joined_at
      )
      from public.pvp_participants pp
      left join public.profiles p on p.id = pp.user_id
      left join public.user_progression up on up.user_id = pp.user_id
      where pp.room_id = _room_id
    ), '[]'::jsonb)
  );
end;
$$;

-- ---- 7. Align Solo submit_quiz_attempt with shared progression helper ---------
create or replace function public.submit_quiz_attempt(
  _attempt_id  uuid,
  _quiz_id     text,
  _mode        text,
  _duration_ms integer,
  _answers     jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid            uuid;
  v_prog           public.user_progression%rowtype;
  v_existing       record;
  v_quiz           public.quizzes%rowtype;
  v_question       record;
  v_answer_elem    record;
  v_has_answer     boolean;
  v_sub_skipped    boolean;
  v_sub_value      jsonb;
  v_correct        smallint := 0;
  v_total          smallint := 0;
  v_best_streak    smallint := 0;
  v_current_streak smallint := 0;
  v_score          integer;
  v_is_correct     boolean;
  v_xp_earned      integer;
  v_credits_earned integer := 0;
  v_month_key      date := date_trunc('month', current_date)::date;
  v_progress       jsonb;
begin
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _attempt_id is null then
    raise exception 'attempt_id is required and must not be null';
  end if;

  if _quiz_id is null or trim(_quiz_id) = '' then
    raise exception 'quiz_id must be non-empty';
  end if;

  if _mode not in ('solo', 'practice', 'pvp', 'multiplayer') then
    raise exception 'Invalid mode: %. Must be one of: solo, practice, pvp, multiplayer', _mode;
  end if;

  if _duration_ms is null or _duration_ms <= 0 then
    raise exception 'duration_ms must be > 0';
  end if;

  if _answers is null or jsonb_typeof(_answers) <> 'array' then
    raise exception 'answers must be a JSON array';
  end if;

  select * into v_quiz from public.quizzes where id = _quiz_id;
  if not found then raise exception 'Quiz not found: %', _quiz_id; end if;
  if not v_quiz.is_published then raise exception 'Quiz is not published: %', _quiz_id; end if;

  create temp table _answer_map (
    question_id uuid primary key,
    skipped     boolean not null default false,
    value       jsonb
  ) on commit drop;

  for v_answer_elem in
    select value as elem from jsonb_array_elements(_answers) as value
  loop
    if v_answer_elem.elem->>'question_id' is null then
      raise exception 'Each answer entry must include question_id';
    end if;
    begin
      insert into _answer_map (question_id, skipped, value)
      values (
        (v_answer_elem.elem->>'question_id')::uuid,
        coalesce((v_answer_elem.elem->>'skipped')::boolean, false),
        v_answer_elem.elem->'value'
      );
    exception
      when invalid_text_representation then
        raise exception 'Invalid question_id: %', v_answer_elem.elem->>'question_id';
      when unique_violation then
        raise exception 'Duplicate question_id in answers payload: %', v_answer_elem.elem->>'question_id';
    end;
  end loop;

  if exists (
    select 1 from _answer_map am
    where not exists (
      select 1 from public.quiz_questions qq
      where qq.id = am.question_id and qq.quiz_id = _quiz_id
    )
  ) then
    raise exception 'answers contain question_id not belonging to quiz %', _quiz_id;
  end if;

  for v_question in
    select qq.id, qq.type, qq.answer_id, qq.answer_ids, qq.answer_bool, qq.accepted
    from public.quiz_questions qq
    where qq.quiz_id = _quiz_id
      and qq.type in ('single', 'multiple', 'boolean', 'typed', 'image', 'map')
    order by qq.position
  loop
    v_total := v_total + 1;
    select am.skipped, am.value into v_sub_skipped, v_sub_value
    from _answer_map am where am.question_id = v_question.id;
    v_has_answer := found;
    v_is_correct := public.grade_quiz_answer(
      v_question.type, v_question.answer_id, v_question.answer_ids,
      v_question.answer_bool, v_question.accepted, v_sub_value,
      case when not v_has_answer then true else v_sub_skipped end
    );
    if v_is_correct then
      v_correct := v_correct + 1;
      v_current_streak := v_current_streak + 1;
      v_best_streak := greatest(v_best_streak, v_current_streak);
    else
      v_current_streak := 0;
    end if;
  end loop;

  if v_total <= 0 or v_total > 100 then
    raise exception 'Gradable question count must be between 1 and 100, got %', v_total;
  end if;

  if _duration_ms < v_total * 200 then
    raise exception
      'Submission rejected: duration_ms (%) is implausibly short for % gradable questions',
      _duration_ms, v_total;
  end if;

  v_score := (v_correct::integer * 100) + (v_best_streak::integer * 25);

  select * into v_prog from public.user_progression where user_id = v_uid for update;
  if not found then raise exception 'user_progression row not found for uid %. Run backfill.', v_uid; end if;

  select qa.xp_earned, qa.credits_earned, qa.score, qa.correct, qa.total, qa.best_streak
  into v_existing
  from public.quiz_attempts qa
  where qa.attempt_id = _attempt_id and qa.user_id = v_uid;

  if found then
    return jsonb_build_object(
      'xp_earned', v_existing.xp_earned,
      'credits_earned', v_existing.credits_earned,
      'new_xp', v_prog.xp,
      'new_level', v_prog.level::integer,
      'level_up', false,
      'new_streak', v_prog.current_streak::integer,
      'new_credits', v_prog.credits,
      'total_quizzes', v_prog.total_quizzes,
      'total_correct', v_prog.total_correct,
      'total_answered', v_prog.total_answered,
      'correct', v_existing.correct,
      'total', v_existing.total,
      'score', v_existing.score,
      'best_streak', v_existing.best_streak,
      'duplicate', true
    );
  end if;

  v_xp_earned := greatest(50, v_correct::integer * 25);

  v_progress := public.apply_user_progression_rewards(
    v_uid, v_correct, v_total, v_xp_earned, v_credits_earned, v_month_key
  );

  insert into public.quiz_attempts (
    attempt_id, user_id, quiz_id, mode, score,
    correct, total, best_streak,
    xp_earned, credits_earned, duration_ms
  ) values (
    _attempt_id, v_uid, _quiz_id, _mode, v_score,
    v_correct, v_total, v_best_streak,
    v_xp_earned, v_credits_earned, _duration_ms
  );

  return v_progress || jsonb_build_object(
    'correct', v_correct,
    'total', v_total,
    'score', v_score,
    'best_streak', v_best_streak,
    'duplicate', false
  );
end;
$$;
