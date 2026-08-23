-- =============================================================================
-- Phase P1 — Private-Room PvP Foundation
--
-- Creates pvp_rooms + pvp_participants with server-controlled lifecycle.
-- Mutations go through SECURITY DEFINER RPCs; clients cannot set winners,
-- quiz_id, host, or award XP/credits from PvP rooms.
--
-- Out of scope: gameplay, scoring, rewards, public matchmaking, Multiplayer.
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS guards.
-- =============================================================================

-- ---- 1. Enums ----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'pvp_room_status') then
    create type public.pvp_room_status as enum (
      'waiting',
      'ready',
      'playing',
      'completed',
      'cancelled'
    );
  end if;
end
$$;

comment on type public.pvp_room_status is
  'Server-controlled PvP room lifecycle. Clients cannot UPDATE status directly.';

-- ---- 2. Tables -------------------------------------------------------------
create table if not exists public.pvp_rooms (
  id            uuid                primary key default gen_random_uuid(),
  room_code     text                not null,
  host_user_id  uuid                not null references auth.users (id) on delete cascade,
  quiz_id       text                not null references public.quizzes (id) on delete restrict,
  status        public.pvp_room_status not null default 'waiting',
  max_players   smallint            not null default 2
    constraint pvp_rooms_max_players_pvp check (max_players = 2),
  created_at    timestamptz         not null default now(),
  started_at    timestamptz,
  completed_at  timestamptz,
  constraint pvp_rooms_room_code_format check (room_code ~ '^[A-Z2-9]{6}$')
);

comment on table public.pvp_rooms is
  'Private-code PvP duel rooms. Status transitions are enforced by RPCs only.';

create unique index if not exists pvp_rooms_room_code_active_key
  on public.pvp_rooms (room_code)
  where status in ('waiting', 'ready', 'playing');

create index if not exists pvp_rooms_host_user_id_idx
  on public.pvp_rooms (host_user_id);

create index if not exists pvp_rooms_quiz_id_idx
  on public.pvp_rooms (quiz_id);

create table if not exists public.pvp_participants (
  id         uuid        primary key default gen_random_uuid(),
  room_id    uuid        not null references public.pvp_rooms (id) on delete cascade,
  user_id    uuid        not null references auth.users (id) on delete cascade,
  is_ready   boolean     not null default false,
  joined_at  timestamptz not null default now(),
  ready_at   timestamptz,
  constraint pvp_participants_room_user_unique unique (room_id, user_id)
);

comment on table public.pvp_participants is
  'Players in a PvP room. Ready state is toggled via set_pvp_ready() RPC.';

create index if not exists pvp_participants_room_id_idx
  on public.pvp_participants (room_id);

create index if not exists pvp_participants_user_id_idx
  on public.pvp_participants (user_id);

-- ---- 3. Realtime publication ------------------------------------------------
alter table public.pvp_rooms replica identity full;
alter table public.pvp_participants replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pvp_rooms'
  ) then
    alter publication supabase_realtime add table public.pvp_rooms;
  end if;

  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'pvp_participants'
  ) then
    alter publication supabase_realtime add table public.pvp_participants;
  end if;
end
$$;

-- ---- 4. Helpers --------------------------------------------------------------
create or replace function public.is_pvp_room_participant(_room_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pvp_participants pp
    where pp.room_id = _room_id
      and pp.user_id = _user_id
  );
$$;

revoke all on function public.is_pvp_room_participant(uuid, uuid) from public;
grant execute on function public.is_pvp_room_participant(uuid, uuid) to authenticated;

create or replace function public.generate_pvp_room_code()
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  v_chars  constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_code   text;
  v_i      integer;
  v_exists boolean;
begin
  loop
    v_code := '';
    for v_i in 1..6 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::integer, 1);
    end loop;

    select exists (
      select 1
      from public.pvp_rooms r
      where r.room_code = v_code
        and r.status in ('waiting', 'ready', 'playing')
    ) into v_exists;

    exit when not v_exists;
  end loop;

  return v_code;
end;
$$;

revoke all on function public.generate_pvp_room_code() from public;

create or replace function public.sync_pvp_room_ready_state(_room_id uuid)
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

  if v_room.status not in ('waiting', 'ready') then
    return v_room.status;
  end if;

  select count(*), count(*) filter (where is_ready)
  into v_participants, v_ready
  from public.pvp_participants
  where room_id = _room_id;

  if v_participants >= v_room.max_players and v_ready = v_participants then
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

revoke all on function public.sync_pvp_room_ready_state(uuid) from public;

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

comment on function public.build_pvp_room_state(uuid) is
  'Returns room + participant roster for lobby UI. Caller must be a participant.';

revoke all on function public.build_pvp_room_state(uuid) from public, anon;
grant execute on function public.build_pvp_room_state(uuid) to authenticated;

-- ---- 5. RPCs -----------------------------------------------------------------
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

  insert into public.pvp_rooms (room_code, host_user_id, quiz_id, status, max_players)
  values (v_code, v_uid, _quiz_id, 'waiting', 2)
  returning * into v_room;

  insert into public.pvp_participants (room_id, user_id, is_ready)
  values (v_room.id, v_uid, false);

  return public.build_pvp_room_state(v_room.id);
end;
$$;

comment on function public.create_pvp_room(text) is
  'Creates a private PvP room for a published quiz and adds the host as participant.';

revoke all on function public.create_pvp_room(text) from public, anon;
grant execute on function public.create_pvp_room(text) to authenticated;

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

comment on function public.join_pvp_room(text) is
  'Joins an open private PvP room by code. Rejects full, closed, or duplicate joins.';

revoke all on function public.join_pvp_room(text) from public, anon;
grant execute on function public.join_pvp_room(text) to authenticated;

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

comment on function public.set_pvp_ready(uuid, boolean) is
  'Toggles ready state for the caller and synchronises room status when all players are ready.';

revoke all on function public.set_pvp_ready(uuid, boolean) from public, anon;
grant execute on function public.set_pvp_ready(uuid, boolean) to authenticated;

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

comment on function public.leave_pvp_room(uuid) is
  'Removes the caller from a room. Cancels the room when the host leaves or it becomes empty.';

revoke all on function public.leave_pvp_room(uuid) from public, anon;
grant execute on function public.leave_pvp_room(uuid) to authenticated;

-- ---- 6. Row Level Security ---------------------------------------------------
alter table public.pvp_rooms enable row level security;
alter table public.pvp_participants enable row level security;

revoke all on public.pvp_rooms from anon, authenticated;
revoke all on public.pvp_participants from anon, authenticated;

grant select on public.pvp_rooms to authenticated;
grant select on public.pvp_participants to authenticated;

drop policy if exists pvp_rooms_select_participant on public.pvp_rooms;
create policy pvp_rooms_select_participant
  on public.pvp_rooms
  for select
  to authenticated
  using (public.is_pvp_room_participant(id, auth.uid()));

drop policy if exists pvp_participants_select_room_member on public.pvp_participants;
create policy pvp_participants_select_room_member
  on public.pvp_participants
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.pvp_participants mine
      where mine.room_id = pvp_participants.room_id
        and mine.user_id = auth.uid()
    )
  );

-- No INSERT/UPDATE/DELETE policies: mutations only via SECURITY DEFINER RPCs.
