-- =============================================================================
-- Phase P2B — PvP Answer Submission + Server-Authoritative Scoring
--
-- Adds participant result columns, winner_user_id on rooms, shared grading
-- helper, and submit_pvp_attempt() RPC. Reuses grade_quiz_answer() from L2.
--
-- Scope: one migration. No rewards, no quiz_attempts writes for PvP.
-- Safe to re-run.
-- =============================================================================

-- ---- 1. Participant result columns ------------------------------------------
alter table public.pvp_participants
  add column if not exists attempt_id   uuid,
  add column if not exists submitted_at timestamptz,
  add column if not exists correct      smallint,
  add column if not exists total        smallint,
  add column if not exists score        integer,
  add column if not exists best_streak  smallint,
  add column if not exists duration_ms  integer;

comment on column public.pvp_participants.attempt_id is
  'Client idempotency key for submit_pvp_attempt(). One submission per participant per room.';

comment on column public.pvp_participants.submitted_at is
  'When the participant submitted answers. Null until submit_pvp_attempt() succeeds.';

-- ---- 2. Room winner column --------------------------------------------------
alter table public.pvp_rooms
  add column if not exists winner_user_id uuid references auth.users (id) on delete set null;

comment on column public.pvp_rooms.winner_user_id is
  'Authoritative duel winner after both players submit. Null when scores are tied (draw).';

-- ---- 3. Shared grading helper (orchestrates grade_quiz_answer per question) -
create or replace function public.grade_quiz_submission(
  _quiz_id     text,
  _answers     jsonb,
  _duration_ms integer,
  _enforce_duration boolean default true
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
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
begin
  if _quiz_id is null or trim(_quiz_id) = '' then
    raise exception 'quiz_id must be non-empty';
  end if;

  if _answers is null or jsonb_typeof(_answers) <> 'array' then
    raise exception 'answers must be a JSON array';
  end if;

  select * into v_quiz
  from public.quizzes
  where id = _quiz_id;

  if not found then
    raise exception 'Quiz not found: %', _quiz_id;
  end if;

  if not v_quiz.is_published then
    raise exception 'Quiz is not published: %', _quiz_id;
  end if;

  create temp table _answer_map (
    question_id uuid primary key,
    skipped     boolean not null default false,
    value       jsonb
  ) on commit drop;

  for v_answer_elem in
    select value as elem
    from jsonb_array_elements(_answers) as value
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
    select 1
    from _answer_map am
    where not exists (
      select 1
      from public.quiz_questions qq
      where qq.id = am.question_id
        and qq.quiz_id = _quiz_id
    )
  ) then
    raise exception 'answers contain question_id not belonging to quiz %', _quiz_id;
  end if;

  for v_question in
    select
      qq.id,
      qq.type,
      qq.answer_id,
      qq.answer_ids,
      qq.answer_bool,
      qq.accepted
    from public.quiz_questions qq
    where qq.quiz_id = _quiz_id
      and qq.type in ('single', 'multiple', 'boolean', 'typed', 'image', 'map')
    order by qq.position
  loop
    v_total := v_total + 1;

    select am.skipped, am.value
    into v_sub_skipped, v_sub_value
    from _answer_map am
    where am.question_id = v_question.id;

    v_has_answer := found;

    v_is_correct := public.grade_quiz_answer(
      v_question.type,
      v_question.answer_id,
      v_question.answer_ids,
      v_question.answer_bool,
      v_question.accepted,
      v_sub_value,
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

  if _enforce_duration and _duration_ms < v_total * 200 then
    raise exception
      'Submission rejected: duration_ms (%) is implausibly short for % gradable questions',
      _duration_ms, v_total;
  end if;

  v_score := (v_correct::integer * 100) + (v_best_streak::integer * 25);

  return jsonb_build_object(
    'correct',     v_correct,
    'total',       v_total,
    'score',       v_score,
    'best_streak', v_best_streak
  );
end;
$$;

comment on function public.grade_quiz_submission(text, jsonb, integer, boolean) is
  'Grades a quiz answer payload using grade_quiz_answer(). Shared by PvP submission.';

revoke all on function public.grade_quiz_submission(text, jsonb, integer, boolean) from public, anon;

-- ---- 4. Match completion helper ---------------------------------------------
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

  if not found or v_room.status <> 'playing' then
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
end;
$$;

revoke all on function public.complete_pvp_match_if_ready(uuid) from public, anon;

-- ---- 5. Update build_pvp_room_state -----------------------------------------
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
      'is_draw', v_room.status = 'completed' and v_room.winner_user_id is null
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

-- ---- 6. submit_pvp_attempt RPC ----------------------------------------------
create or replace function public.submit_pvp_attempt(
  _room_id     uuid,
  _attempt_id  uuid,
  _duration_ms integer,
  _answers     jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_room         public.pvp_rooms%rowtype;
  v_participant  public.pvp_participants%rowtype;
  v_graded       jsonb;
  v_correct      smallint;
  v_total        smallint;
  v_score        integer;
  v_best_streak  smallint;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _room_id is null then
    raise exception 'room_id is required';
  end if;

  if _attempt_id is null then
    raise exception 'attempt_id is required and must not be null';
  end if;

  if _duration_ms is null or _duration_ms <= 0 then
    raise exception 'duration_ms must be > 0';
  end if;

  if not public.is_pvp_room_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  select * into v_room
  from public.pvp_rooms
  where id = _room_id
  for update;

  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.status = 'completed' then
    raise exception 'Match is already completed';
  end if;

  if v_room.status = 'cancelled' then
    raise exception 'Room is cancelled';
  end if;

  if v_room.status <> 'playing' then
    raise exception 'Room is not in progress';
  end if;

  select * into v_participant
  from public.pvp_participants
  where room_id = _room_id
    and user_id = v_uid
  for update;

  if not found then
    raise exception 'Participant not found';
  end if;

  if v_participant.submitted_at is not null then
    if v_participant.attempt_id = _attempt_id then
      return jsonb_build_object(
        'correct',     v_participant.correct,
        'total',       v_participant.total,
        'score',       v_participant.score,
        'best_streak', v_participant.best_streak,
        'duplicate',   true,
        'room_state',  public.build_pvp_room_state(_room_id)
      );
    end if;

    raise exception 'Already submitted for this match';
  end if;

  v_graded := public.grade_quiz_submission(
    v_room.quiz_id,
    _answers,
    _duration_ms,
    true
  );

  v_correct     := (v_graded->>'correct')::smallint;
  v_total       := (v_graded->>'total')::smallint;
  v_score       := (v_graded->>'score')::integer;
  v_best_streak := (v_graded->>'best_streak')::smallint;

  update public.pvp_participants
  set
    attempt_id   = _attempt_id,
    submitted_at = now(),
    correct      = v_correct,
    total        = v_total,
    score        = v_score,
    best_streak  = v_best_streak,
    duration_ms  = _duration_ms
  where room_id = _room_id
    and user_id = v_uid;

  perform public.complete_pvp_match_if_ready(_room_id);

  return jsonb_build_object(
    'correct',     v_correct,
    'total',       v_total,
    'score',       v_score,
    'best_streak', v_best_streak,
    'duplicate',   false,
    'room_state',  public.build_pvp_room_state(_room_id)
  );
end;
$$;

comment on function public.submit_pvp_attempt(uuid, uuid, integer, jsonb) is
  'Authoritative PvP answer submission. Grades via grade_quiz_submission(); '
  'marks participant submitted; completes match when both players finish. '
  'No XP/credits/rewards. attempt_id idempotency per participant per room.';

revoke all on function public.submit_pvp_attempt(uuid, uuid, integer, jsonb) from public, anon;
grant execute on function public.submit_pvp_attempt(uuid, uuid, integer, jsonb) to authenticated;
