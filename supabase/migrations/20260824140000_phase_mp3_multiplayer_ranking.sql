-- =============================================================================
-- Phase MP3 — Multiplayer Server-Authoritative Ranking
--
-- Adds finish_rank + rankings_finalized_at, finalize_multiplayer_rankings(),
-- updates complete_multiplayer_match_if_ready() and build_multiplayer_room_state().
--
-- Ranking: RANK() OVER (ORDER BY score DESC) — equal scores remain tied.
-- Does not modify PvP RPCs, winner_user_id, XP, or credits.
-- Safe to re-run: CREATE OR REPLACE guards.
-- =============================================================================

-- ---- 1. Schema ----------------------------------------------------------------
alter table public.pvp_participants
  add column if not exists finish_rank smallint;

alter table public.pvp_participants
  drop constraint if exists pvp_participants_finish_rank_check;

alter table public.pvp_participants
  add constraint pvp_participants_finish_rank_check
  check (finish_rank is null or finish_rank >= 1);

alter table public.pvp_rooms
  add column if not exists rankings_finalized_at timestamptz;

comment on column public.pvp_participants.finish_rank is
  'Competition rank stamped at multiplayer match completion. Equal scores share rank.';

comment on column public.pvp_rooms.rankings_finalized_at is
  'When multiplayer finish_rank values were stamped. Immutable after set.';

-- ---- 2. finalize_multiplayer_rankings (internal) ----------------------------
create or replace function public.finalize_multiplayer_rankings(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room               public.pvp_rooms%rowtype;
  v_participant_count  integer;
  v_submitted_count    integer;
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

  if v_room.rankings_finalized_at is not null then
    return;
  end if;

  if v_room.status not in ('playing', 'completed') then
    return;
  end if;

  if v_room.active_player_count is null then
    raise exception 'active_player_count is required for multiplayer ranking';
  end if;

  select count(*) into v_participant_count
  from public.pvp_participants
  where room_id = _room_id;

  if v_participant_count <> v_room.active_player_count then
    raise exception 'Participant count mismatch for multiplayer ranking';
  end if;

  select count(*) into v_submitted_count
  from public.pvp_participants
  where room_id = _room_id
    and submitted_at is not null;

  if v_submitted_count <> v_room.active_player_count then
    raise exception 'Not all participants have submitted';
  end if;

  if exists (
    select 1
    from public.pvp_participants
    where room_id = _room_id
      and score is null
  ) then
    raise exception 'All participants must have scores before ranking';
  end if;

  update public.pvp_participants pp
  set finish_rank = ranked.rank_value
  from (
    select
      id,
      rank() over (order by score desc)::smallint as rank_value
    from public.pvp_participants
    where room_id = _room_id
  ) ranked
  where pp.id = ranked.id;

  update public.pvp_rooms
  set rankings_finalized_at = now()
  where id = _room_id
    and rankings_finalized_at is null;
end;
$$;

comment on function public.finalize_multiplayer_rankings(uuid) is
  'Internal: stamps finish_rank via competition ranking on score. Not client-callable.';

revoke all on function public.finalize_multiplayer_rankings(uuid) from public, anon, authenticated;

-- ---- 3. complete_multiplayer_match_if_ready -----------------------------------
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

  if v_room.rankings_finalized_at is not null then
    return;
  end if;

  -- Recovery: completed room missing rankings (finalize exactly once).
  if v_room.status = 'completed' then
    perform public.finalize_multiplayer_rankings(_room_id);
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

  perform public.finalize_multiplayer_rankings(_room_id);

  update public.pvp_rooms
  set
    status       = 'completed',
    completed_at = coalesce(completed_at, now())
  where id = _room_id;
end;
$$;

comment on function public.complete_multiplayer_match_if_ready(uuid) is
  'Finalizes multiplayer rankings when all active players submit, then marks room completed.';

revoke all on function public.complete_multiplayer_match_if_ready(uuid) from public, anon;

-- ---- 4. build_multiplayer_room_state ------------------------------------------
create or replace function public.build_multiplayer_room_state(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.pvp_rooms%rowtype;
  v_results_public boolean;
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

  -- Recovery: finalize rankings for completed rooms that missed finalization.
  if v_room.status = 'completed' and v_room.rankings_finalized_at is null then
    perform public.complete_multiplayer_match_if_ready(_room_id);

    select * into v_room
    from public.pvp_rooms
    where id = _room_id;
  end if;

  v_results_public := v_room.status = 'completed'
    and v_room.rankings_finalized_at is not null;

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
      'completed_at', v_room.completed_at,
      'rankings_finalized_at', v_room.rankings_finalized_at
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
            when pp.user_id = v_uid or v_results_public then pp.correct
            else null
          end,
          'total', case
            when pp.user_id = v_uid or v_results_public then pp.total
            else null
          end,
          'score', case
            when pp.user_id = v_uid or v_results_public then pp.score
            else null
          end,
          'best_streak', case
            when pp.user_id = v_uid or v_results_public then pp.best_streak
            else null
          end,
          'finish_rank', case
            when v_results_public then pp.finish_rank
            else null
          end
        )
        order by
          case when v_results_public then pp.finish_rank end asc nulls last,
          pp.joined_at
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
  'Authoritative multiplayer room state. Ranks/scores hidden until rankings finalized.';
