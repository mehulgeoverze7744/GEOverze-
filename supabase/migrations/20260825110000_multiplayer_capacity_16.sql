-- =============================================================================
-- Multiplayer Capacity Extension — max 16 players
--
-- Extends multiplayer room capacity from 4–8 to 4–16.
-- PvP constraint unchanged. No ranking/reward/settlement changes.
-- Safe to re-run: IF EXISTS / CREATE OR REPLACE guards.
-- =============================================================================

-- ---- 1. pvp_rooms capacity CHECK ----------------------------------------------
alter table public.pvp_rooms
  drop constraint if exists pvp_rooms_mode_capacity_check;

alter table public.pvp_rooms
  add constraint pvp_rooms_mode_capacity_check check (
    (room_mode = 'pvp'::public.room_mode and max_players = 2 and min_players = 2)
    or (
      room_mode = 'multiplayer'::public.room_mode
      and max_players between 4 and 16
      and min_players = 3
    )
  );

-- ---- 2. create_multiplayer_room validation ------------------------------------
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

  if _max_players is null or _max_players < 4 or _max_players > 16 then
    raise exception 'max_players must be between 4 and 16';
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
  'Creates a private multiplayer room for a published quiz. Capacity 4–16; min 3 to start.';
