-- =============================================================================
-- Phase MP1 — Private Multiplayer Room + Lobby Foundation
--
-- Adds room_mode discriminator to shared pvp_rooms / pvp_participants tables.
-- PvP RPC signatures unchanged; minimal room_mode guards prevent cross-mode use.
-- New multiplayer RPCs for private lobby lifecycle through match start.
--
-- Out of scope: gameplay, scoring, rewards, public matchmaking.
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS guards.
-- =============================================================================

-- ---- 1. room_mode enum -------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'room_mode') then
    create type public.room_mode as enum ('pvp', 'multiplayer');
  end if;
end
$$;

comment on type public.room_mode is
  'Discriminator for shared room tables: private 1v1 duel vs private multiplayer lobby.';

-- ---- 2. Schema columns -------------------------------------------------------
alter table public.pvp_rooms
  add column if not exists room_mode public.room_mode not null default 'pvp',
  add column if not exists min_players smallint not null default 2,
  add column if not exists active_player_count smallint;

comment on column public.pvp_rooms.room_mode is
  'Room type: pvp (2-player duel) or multiplayer (3–8 private lobby).';

comment on column public.pvp_rooms.min_players is
  'Minimum participants required before the host may start. PvP=2, multiplayer=3.';

comment on column public.pvp_rooms.active_player_count is
  'Participant count locked at match start. Late joiners rejected once playing.';

-- Backfill existing rows (all pre-MP1 rooms are PvP duels).
update public.pvp_rooms
set
  room_mode   = 'pvp',
  min_players = 2
where room_mode is distinct from 'pvp'::public.room_mode
   or min_players is distinct from 2;

-- Replace single-mode max_players CHECK with mode-aware constraint.
alter table public.pvp_rooms
  drop constraint if exists pvp_rooms_max_players_pvp;

alter table public.pvp_rooms
  drop constraint if exists pvp_rooms_mode_capacity_check;

alter table public.pvp_rooms
  add constraint pvp_rooms_mode_capacity_check check (
    (room_mode = 'pvp'::public.room_mode and max_players = 2 and min_players = 2)
    or (
      room_mode = 'multiplayer'::public.room_mode
      and max_players between 4 and 8
      and min_players = 3
    )
  );

-- ---- 3. Multiplayer ready sync -----------------------------------------------
create or replace function public.sync_multiplayer_room_ready_state(_room_id uuid)
returns public.pvp_room_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room         public.pvp_rooms%rowtype;
  v_participants integer;
  v_ready        integer;
  v_new_status   public.pvp_room_status;
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

  if v_room.status not in ('waiting', 'ready') then
    return v_room.status;
  end if;

  select count(*), count(*) filter (where is_ready)
  into v_participants, v_ready
  from public.pvp_participants
  where room_id = _room_id;

  if v_participants >= v_room.min_players and v_ready = v_participants then
    v_new_status := 'ready';
  else
    v_new_status := 'waiting';
  end if;

  if v_new_status is distinct from v_room.status then
    update public.pvp_rooms
    set status = v_new_status
    where id = _room_id;
  end if;

  return v_new_status;
end;
$$;

revoke all on function public.sync_multiplayer_room_ready_state(uuid) from public;

-- ---- 4. build_multiplayer_room_state -----------------------------------------
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
          'level', coalesce(up.level, 1)
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
  'Authoritative multiplayer lobby state. Caller must be a participant.';

revoke all on function public.build_multiplayer_room_state(uuid) from public, anon;
grant execute on function public.build_multiplayer_room_state(uuid) to authenticated;

-- ---- 5. PvP RPC room_mode guards (signatures unchanged) ----------------------
create or replace function public.create_pvp_room(_quiz_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_quiz  public.quizzes%rowtype;
  v_room  public.pvp_rooms%rowtype;
  v_code  text;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _quiz_id is null or trim(_quiz_id) = '' then
    raise exception 'quiz_id must be non-empty';
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

  v_code := public.generate_pvp_room_code();

  insert into public.pvp_rooms (
    room_code, host_user_id, quiz_id, status, max_players, room_mode, min_players
  )
  values (v_code, v_uid, _quiz_id, 'waiting', 2, 'pvp', 2)
  returning * into v_room;

  insert into public.pvp_participants (room_id, user_id, is_ready)
  values (v_room.id, v_uid, false);

  return public.build_pvp_room_state(v_room.id);
end;
$$;

create or replace function public.join_pvp_room(_room_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_room  public.pvp_rooms%rowtype;
  v_count integer;
  v_code  text;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  v_code := upper(trim(coalesce(_room_code, '')));
  if v_code = '' or v_code !~ '^[A-Z2-9]{6}$' then
    raise exception 'Invalid room code format';
  end if;

  select * into v_room
  from public.pvp_rooms
  where room_code = v_code
    and room_mode = 'pvp'::public.room_mode
  order by created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.status in ('completed', 'cancelled') then
    raise exception 'Room is no longer joinable';
  end if;

  if v_room.status = 'playing' then
    raise exception 'Room is already in progress';
  end if;

  if exists (
    select 1
    from public.pvp_participants pp
    where pp.room_id = v_room.id
      and pp.user_id = v_uid
  ) then
    raise exception 'Already in this room';
  end if;

  select count(*) into v_count
  from public.pvp_participants
  where room_id = v_room.id;

  if v_count >= v_room.max_players then
    raise exception 'Room is full';
  end if;

  insert into public.pvp_participants (room_id, user_id, is_ready)
  values (v_room.id, v_uid, false);

  if v_room.status = 'ready' then
    update public.pvp_rooms
    set status = 'waiting'
    where id = v_room.id;
  end if;

  perform public.sync_pvp_room_ready_state(v_room.id);

  return public.build_pvp_room_state(v_room.id);
end;
$$;

create or replace function public.set_pvp_ready(_room_id uuid, _ready boolean)
returns jsonb
language plpgsql
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

  if _room_id is null then
    raise exception 'room_id is required';
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

  if v_room.room_mode <> 'pvp'::public.room_mode then
    raise exception 'Not a PvP room';
  end if;

  if v_room.status not in ('waiting', 'ready') then
    raise exception 'Room is not accepting ready changes';
  end if;

  update public.pvp_participants
  set
    is_ready = coalesce(_ready, false),
    ready_at = case when coalesce(_ready, false) then now() else null end
  where room_id = _room_id
    and user_id = v_uid;

  perform public.sync_pvp_room_ready_state(_room_id);

  return public.build_pvp_room_state(_room_id);
end;
$$;

create or replace function public.leave_pvp_room(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_room  public.pvp_rooms%rowtype;
  v_count integer;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _room_id is null then
    raise exception 'room_id is required';
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

  if v_room.room_mode <> 'pvp'::public.room_mode then
    raise exception 'Not a PvP room';
  end if;

  delete from public.pvp_participants
  where room_id = _room_id
    and user_id = v_uid;

  select count(*) into v_count
  from public.pvp_participants
  where room_id = _room_id;

  if v_count = 0 or (v_uid = v_room.host_user_id and v_room.status in ('waiting', 'ready')) then
    update public.pvp_rooms
    set status = 'cancelled',
        completed_at = coalesce(completed_at, now())
    where id = _room_id;
  elsif v_room.status = 'ready' then
    update public.pvp_rooms
    set status = 'waiting'
    where id = _room_id;
  end if;

  return jsonb_build_object(
    'room_id', _room_id,
    'left', true,
    'cancelled', v_count = 0 or v_uid = v_room.host_user_id
  );
end;
$$;

create or replace function public.start_pvp_match(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_room         public.pvp_rooms%rowtype;
  v_quiz         public.quizzes%rowtype;
  v_participants integer;
  v_ready        integer;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _room_id is null then
    raise exception 'room_id is required';
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

  if v_room.room_mode <> 'pvp'::public.room_mode then
    raise exception 'Not a PvP room';
  end if;

  if v_room.host_user_id <> v_uid then
    raise exception 'Only the host can start the match';
  end if;

  if v_room.status = 'playing' then
    raise exception 'Match already in progress';
  end if;

  if v_room.status = 'completed' then
    raise exception 'Room is completed';
  end if;

  if v_room.status = 'cancelled' then
    raise exception 'Room is cancelled';
  end if;

  if v_room.status <> 'ready' then
    raise exception 'Room is not ready to start';
  end if;

  select count(*), count(*) filter (where is_ready)
  into v_participants, v_ready
  from public.pvp_participants
  where room_id = _room_id;

  if v_participants <> v_room.max_players then
    raise exception 'Room must have % players before starting', v_room.max_players;
  end if;

  if v_ready <> v_participants then
    raise exception 'All players must be ready before starting';
  end if;

  select * into v_quiz
  from public.quizzes
  where id = v_room.quiz_id;

  if not found then
    raise exception 'Quiz not found: %', v_room.quiz_id;
  end if;

  if not v_quiz.is_published then
    raise exception 'Quiz is not published: %', v_room.quiz_id;
  end if;

  update public.pvp_rooms
  set
    status     = 'playing',
    started_at = now()
  where id = _room_id;

  return public.build_pvp_room_state(_room_id);
end;
$$;

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

  if v_room.room_mode <> 'pvp'::public.room_mode then
    raise exception 'Not a PvP room';
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

-- ---- 6. Multiplayer RPCs -----------------------------------------------------
create or replace function public.create_multiplayer_room(
  _quiz_id text,
  _max_players smallint
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_quiz  public.quizzes%rowtype;
  v_room  public.pvp_rooms%rowtype;
  v_code  text;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _quiz_id is null or trim(_quiz_id) = '' then
    raise exception 'quiz_id must be non-empty';
  end if;

  if _max_players is null or _max_players < 4 or _max_players > 8 then
    raise exception 'max_players must be between 4 and 8';
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

  v_code := public.generate_pvp_room_code();

  insert into public.pvp_rooms (
    room_code,
    host_user_id,
    quiz_id,
    status,
    room_mode,
    min_players,
    max_players
  )
  values (
    v_code,
    v_uid,
    _quiz_id,
    'waiting',
    'multiplayer',
    3,
    _max_players
  )
  returning * into v_room;

  insert into public.pvp_participants (room_id, user_id, is_ready)
  values (v_room.id, v_uid, false);

  return public.build_multiplayer_room_state(v_room.id);
end;
$$;

comment on function public.create_multiplayer_room(text, smallint) is
  'Creates a private multiplayer room for a published quiz. Host is not initially ready.';

revoke all on function public.create_multiplayer_room(text, smallint) from public, anon;
grant execute on function public.create_multiplayer_room(text, smallint) to authenticated;

create or replace function public.join_multiplayer_room(_room_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_room  public.pvp_rooms%rowtype;
  v_count integer;
  v_code  text;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  v_code := upper(trim(coalesce(_room_code, '')));
  if v_code = '' or v_code !~ '^[A-Z2-9]{6}$' then
    raise exception 'Invalid room code format';
  end if;

  select * into v_room
  from public.pvp_rooms
  where room_code = v_code
    and room_mode = 'multiplayer'::public.room_mode
  order by created_at desc
  limit 1
  for update;

  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.status not in ('waiting', 'ready') then
    raise exception 'Room is no longer joinable';
  end if;

  if exists (
    select 1
    from public.pvp_participants pp
    where pp.room_id = v_room.id
      and pp.user_id = v_uid
  ) then
    raise exception 'Already in this room';
  end if;

  select count(*) into v_count
  from public.pvp_participants
  where room_id = v_room.id;

  if v_count >= v_room.max_players then
    raise exception 'Room is full';
  end if;

  insert into public.pvp_participants (room_id, user_id, is_ready)
  values (v_room.id, v_uid, false);

  if v_room.status = 'ready' then
    update public.pvp_rooms
    set status = 'waiting'
    where id = v_room.id;
  end if;

  perform public.sync_multiplayer_room_ready_state(v_room.id);

  return public.build_multiplayer_room_state(v_room.id);
end;
$$;

comment on function public.join_multiplayer_room(text) is
  'Joins an open private multiplayer room by code. Rejects full, closed, or duplicate joins.';

revoke all on function public.join_multiplayer_room(text) from public, anon;
grant execute on function public.join_multiplayer_room(text) to authenticated;

create or replace function public.set_multiplayer_ready(_room_id uuid, _ready boolean)
returns jsonb
language plpgsql
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

  if _room_id is null then
    raise exception 'room_id is required';
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

  if v_room.status not in ('waiting', 'ready') then
    raise exception 'Room is not accepting ready changes';
  end if;

  update public.pvp_participants
  set
    is_ready = coalesce(_ready, false),
    ready_at = case when coalesce(_ready, false) then now() else null end
  where room_id = _room_id
    and user_id = v_uid;

  perform public.sync_multiplayer_room_ready_state(_room_id);

  return public.build_multiplayer_room_state(_room_id);
end;
$$;

comment on function public.set_multiplayer_ready(uuid, boolean) is
  'Toggles ready state for the caller and synchronises multiplayer room status.';

revoke all on function public.set_multiplayer_ready(uuid, boolean) from public, anon;
grant execute on function public.set_multiplayer_ready(uuid, boolean) to authenticated;

create or replace function public.leave_multiplayer_room(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_room  public.pvp_rooms%rowtype;
  v_count integer;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _room_id is null then
    raise exception 'room_id is required';
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

  if v_room.status = 'playing' then
    raise exception 'Cannot leave a match in progress';
  end if;

  delete from public.pvp_participants
  where room_id = _room_id
    and user_id = v_uid;

  select count(*) into v_count
  from public.pvp_participants
  where room_id = _room_id;

  if v_count = 0 or (v_uid = v_room.host_user_id and v_room.status in ('waiting', 'ready')) then
    update public.pvp_rooms
    set status = 'cancelled',
        completed_at = coalesce(completed_at, now())
    where id = _room_id;
  else
    update public.pvp_rooms
    set status = 'waiting'
    where id = _room_id
      and status = 'ready';

    perform public.sync_multiplayer_room_ready_state(_room_id);
  end if;

  return jsonb_build_object(
    'room_id', _room_id,
    'left', true,
    'cancelled', v_count = 0 or v_uid = v_room.host_user_id
  );
end;
$$;

comment on function public.leave_multiplayer_room(uuid) is
  'Removes the caller from a multiplayer lobby. Cancels when host leaves or room is empty.';

revoke all on function public.leave_multiplayer_room(uuid) from public, anon;
grant execute on function public.leave_multiplayer_room(uuid) to authenticated;

create or replace function public.start_multiplayer_match(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_room         public.pvp_rooms%rowtype;
  v_quiz         public.quizzes%rowtype;
  v_participants integer;
  v_ready        integer;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _room_id is null then
    raise exception 'room_id is required';
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

  if v_room.host_user_id <> v_uid then
    raise exception 'Only the host can start the match';
  end if;

  if v_room.status = 'playing' then
    raise exception 'Match already in progress';
  end if;

  if v_room.status = 'completed' then
    raise exception 'Room is completed';
  end if;

  if v_room.status = 'cancelled' then
    raise exception 'Room is cancelled';
  end if;

  if v_room.status <> 'ready' then
    raise exception 'Room is not ready to start';
  end if;

  select count(*), count(*) filter (where is_ready)
  into v_participants, v_ready
  from public.pvp_participants
  where room_id = _room_id;

  if v_participants < v_room.min_players then
    raise exception 'At least % players are required to start', v_room.min_players;
  end if;

  if v_ready <> v_participants then
    raise exception 'All players must be ready before starting';
  end if;

  select * into v_quiz
  from public.quizzes
  where id = v_room.quiz_id;

  if not found then
    raise exception 'Quiz not found: %', v_room.quiz_id;
  end if;

  if not v_quiz.is_published then
    raise exception 'Quiz is not published: %', v_room.quiz_id;
  end if;

  update public.pvp_rooms
  set
    status               = 'playing',
    started_at           = now(),
    active_player_count  = v_participants
  where id = _room_id;

  return public.build_multiplayer_room_state(_room_id);
end;
$$;

comment on function public.start_multiplayer_match(uuid) is
  'Host-only transition from ready to playing. Locks active_player_count at start.';

revoke all on function public.start_multiplayer_match(uuid) from public, anon;
grant execute on function public.start_multiplayer_match(uuid) to authenticated;

-- submit_pvp_attempt guard (signature unchanged)
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

  if v_room.room_mode <> 'pvp'::public.room_mode then
    raise exception 'Not a PvP room';
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
  where id = v_participant.id;

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
