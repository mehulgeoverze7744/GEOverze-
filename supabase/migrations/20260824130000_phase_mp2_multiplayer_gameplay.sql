-- =============================================================================
-- Phase MP2 — Multiplayer Gameplay + Server-Authoritative Grading
--
-- Adds submit_multiplayer_attempt(), complete_multiplayer_match_if_ready(),
-- and updates build_multiplayer_room_state() for score privacy + gameplay fields.
--
-- Reuses grade_quiz_submission(). Does not modify PvP RPCs or reward logic.
-- Out of scope: ranking, winner, XP/credits/progression awards.
-- Safe to re-run: CREATE OR REPLACE guards.
-- =============================================================================

-- ---- 1. complete_multiplayer_match_if_ready ----------------------------------
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

  if v_room.status = 'completed' then
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

  update public.pvp_rooms
  set
    status       = 'completed',
    completed_at = coalesce(completed_at, now())
  where id = _room_id;
end;
$$;

comment on function public.complete_multiplayer_match_if_ready(uuid) is
  'Marks a multiplayer room completed when all active players have submitted. No ranking.';

revoke all on function public.complete_multiplayer_match_if_ready(uuid) from public, anon;

-- ---- 2. submit_multiplayer_attempt -------------------------------------------
create or replace function public.submit_multiplayer_attempt(
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

  if v_room.room_mode <> 'multiplayer'::public.room_mode then
    raise exception 'Not a multiplayer room';
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
        'room_state',  public.build_multiplayer_room_state(_room_id)
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
  where id = v_participant.id;

  insert into public.quiz_attempts (
    attempt_id, user_id, quiz_id, mode, score,
    correct, total, best_streak,
    xp_earned, credits_earned, duration_ms
  ) values (
    _attempt_id,
    v_uid,
    v_room.quiz_id,
    'multiplayer',
    v_score,
    v_correct,
    v_total,
    v_best_streak,
    0,
    0,
    _duration_ms
  )
  on conflict (attempt_id) do nothing;

  perform public.complete_multiplayer_match_if_ready(_room_id);

  return jsonb_build_object(
    'correct',     v_correct,
    'total',       v_total,
    'score',       v_score,
    'best_streak', v_best_streak,
    'duplicate',   false,
    'room_state',  public.build_multiplayer_room_state(_room_id)
  );
end;
$$;

comment on function public.submit_multiplayer_attempt(uuid, uuid, integer, jsonb) is
  'Authoritative multiplayer answer submission. Grades via grade_quiz_submission(); no XP/credits.';

revoke all on function public.submit_multiplayer_attempt(uuid, uuid, integer, jsonb) from public, anon;
grant execute on function public.submit_multiplayer_attempt(uuid, uuid, integer, jsonb) to authenticated;

-- ---- 3. build_multiplayer_room_state — gameplay fields + score privacy -------
create or replace function public.build_multiplayer_room_state(_room_id uuid)
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

  if v_room.room_mode <> 'multiplayer'::public.room_mode then
    raise exception 'Not a multiplayer room';
  end if;

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
      'completed_at', v_room.completed_at
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

comment on function public.build_multiplayer_room_state(uuid) is
  'Authoritative multiplayer room state. Hides opponent scores until completed.';
