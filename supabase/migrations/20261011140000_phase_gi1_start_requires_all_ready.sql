-- Geography Imposter: start only when every eligible player is ready.
-- Also treat excluded players as non-participants for lobby ready-status.

create or replace function public.set_imp_ready(_room_id uuid, _ready boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_room public.imp_rooms%rowtype;
  v_all_ready boolean;
  v_count int;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not public.is_imp_participant(_room_id, v_uid) then
    raise exception 'Not a participant';
  end if;

  select * into v_room from public.imp_rooms where id = _room_id;
  if v_room.status not in ('waiting', 'ready') then
    raise exception 'Game already started';
  end if;

  -- Only the caller can change their own ready flag.
  update public.imp_participants
  set is_ready = _ready
  where room_id = _room_id and user_id = v_uid;

  select count(*) into v_count
  from public.imp_participants
  where room_id = _room_id and is_excluded = false;

  select coalesce(bool_and(is_ready), false) into v_all_ready
  from public.imp_participants
  where room_id = _room_id and is_excluded = false;

  if v_count >= 3 and v_all_ready then
    update public.imp_rooms set status = 'ready' where id = _room_id;
  else
    update public.imp_rooms set status = 'waiting' where id = _room_id;
  end if;

  return public.build_imp_room_state(_room_id);
end;
$$;

revoke all on function public.set_imp_ready(uuid, boolean) from public, anon;
grant execute on function public.set_imp_ready(uuid, boolean) to authenticated;

create or replace function public.start_imp_game(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_room      public.imp_rooms%rowtype;
  v_count     int;
  v_unready   int;
  v_pair      public.imp_word_pairs%rowtype;
  v_participants uuid[];
  v_imposter_idx int;
  v_imposter  uuid;
  v_uid_iter  uuid;
  v_order     uuid[];
  v_first_deadline timestamptz;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_room from public.imp_rooms where id = _room_id for update;
  if not found then raise exception 'Room not found'; end if;
  if v_room.host_user_id <> v_uid then raise exception 'Only the host can start'; end if;
  if v_room.status not in ('waiting','ready') then raise exception 'Game already started'; end if;

  select count(*) into v_count
  from public.imp_participants where room_id = _room_id and is_excluded = false;

  if v_count < 3 then raise exception 'Need at least 3 players to start'; end if;

  select count(*) into v_unready
  from public.imp_participants
  where room_id = _room_id and is_excluded = false and is_ready = false;

  if v_unready > 0 then
    raise exception 'All players must be ready to start';
  end if;

  select * into v_pair
  from public.imp_word_pairs
  where (v_room.category is null or category = v_room.category)
    and difficulty = v_room.difficulty
  order by random()
  limit 1;

  if not found then
    select * into v_pair from public.imp_word_pairs order by random() limit 1;
  end if;

  select array_agg(user_id order by random())
  into v_participants
  from public.imp_participants
  where room_id = _room_id and is_excluded = false;

  v_imposter_idx := floor(random() * array_length(v_participants, 1)) + 1;
  v_imposter := v_participants[v_imposter_idx];

  foreach v_uid_iter in array v_participants loop
    insert into public.imp_roles (room_id, user_id, role, word_pair_id, received_word)
    values (
      _room_id,
      v_uid_iter,
      case when v_uid_iter = v_imposter then 'imposter'::public.imp_player_role
           else 'regular'::public.imp_player_role end,
      v_pair.id,
      case when v_uid_iter = v_imposter then v_pair.imposter_word
           else v_pair.actual_word end
    )
    on conflict (room_id, user_id) do nothing;
  end loop;

  v_order := public.generate_imp_clue_order(_room_id, 1::smallint);
  v_first_deadline := now() + make_interval(secs => v_room.clue_turn_seconds);

  update public.imp_rooms
  set status = 'playing',
      phase  = 'clue',
      current_round = 1,
      current_clue_index = 0,
      phase_deadline = v_first_deadline,
      started_at = now()
  where id = _room_id;

  return public.build_imp_room_state(_room_id);
end;
$$;

revoke all on function public.start_imp_game(uuid) from public, anon;
grant execute on function public.start_imp_game(uuid) to authenticated;
