-- =============================================================================
-- Phase P2A — PvP Match Start (ready → playing)
--
-- Adds start_pvp_match() so the host can begin a duel once both players are
-- ready. Clients cannot UPDATE pvp_rooms.status directly.
--
-- Scope: one RPC only. No schema, RLS, publication, or gameplay changes.
-- Safe to re-run.
-- =============================================================================

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

comment on function public.start_pvp_match(uuid) is
  'Host-only transition from ready to playing. Validates full roster, all ready, '
  'and published quiz before setting started_at. Returns authoritative room state.';

revoke all on function public.start_pvp_match(uuid) from public, anon;
grant execute on function public.start_pvp_match(uuid) to authenticated;
