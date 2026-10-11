-- Phase DG1 — Draw & Guess multiplayer foundation.
--
-- A brand-new, PvP/multiplayer-only drawing-and-guessing game mode, built as a
-- wholly separate set of tables/RPCs from the existing `pvp_rooms` /
-- `pvp_participants` schema (different lifecycle: multiple turns per round,
-- a server-held secret word per turn, incremental stroke/chat streams).
--
-- Security model (mirrors the existing PvP/Multiplayer convention):
--   * Every table has RLS enabled with narrow, participant-scoped SELECT
--     policies. There are NO client-facing INSERT/UPDATE/DELETE policies
--     anywhere — every mutation happens through a SECURITY DEFINER RPC that
--     re-validates the caller, the room/turn state, and any payload limits
--     server-side.
--   * `draw_words` (the word bank) and `draw_turns` (which stores the
--     server-held secret word for the active turn) receive ZERO grants to
--     `anon`/`authenticated`. The only way to read them is from inside a
--     SECURITY DEFINER function, which explicitly branches on `auth.uid()`
--     before deciding what a given caller is allowed to see.
--   * `build_draw_room_state` only ever includes `secret_word` /
--     `word_options` in its response when the caller IS the active drawer.
--     Guessers only ever receive a length-preserving masked hint.
--   * Correct guesses never write the matched text anywhere clients can read
--     it — `send_draw_message` records a word-free `guess_correct` system
--     event, so the actual word cannot leak through chat/event history.
--   * `advance_draw_turn` is an idempotent "tick" RPC any connected client
--     may call freely and concurrently; it uses `for update` row locks and
--     server-side `now()` comparisons so duplicate/concurrent calls are safe
--     no-ops after the first valid transition. This removes the need for a
--     dedicated timer/cron process while remaining fully server-authoritative.

-- ============================================================================
-- 1. Enums
-- ============================================================================

do $$ begin
  if not exists (select 1 from pg_type where typname = 'draw_word_category') then
    create type public.draw_word_category as enum (
      'geography_countries',
      'capitals_flags',
      'landmarks_monuments',
      'maps_physical',
      'space_astronomy',
      'planets_universe'
    );
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'draw_difficulty') then
    create type public.draw_difficulty as enum ('easy', 'medium', 'hard');
  end if;
end $$;

do $$ begin
  if not exists (select 1 from pg_type where typname = 'draw_room_status') then
    create type public.draw_room_status as enum (
      'waiting', 'ready', 'playing', 'completed', 'cancelled'
    );
  end if;
end $$;

-- ============================================================================
-- 2. Tables
-- ============================================================================

create table if not exists public.draw_rooms (
  id uuid primary key default gen_random_uuid(),
  room_code text not null,
  host_user_id uuid not null references auth.users(id) on delete cascade,
  status public.draw_room_status not null default 'waiting',
  rounds smallint not null check (rounds in (1, 3, 5)),
  max_players smallint not null check (max_players between 2 and 8),
  categories public.draw_word_category[] not null default '{}',
  difficulty public.draw_difficulty not null default 'medium',
  turn_seconds smallint not null default 80 check (turn_seconds between 30 and 150),
  turn_order uuid[] not null default '{}',
  used_word_ids uuid[] not null default '{}',
  current_round smallint not null default 0,
  current_turn_index smallint not null default 0,
  created_at timestamptz not null default now(),
  started_at timestamptz,
  completed_at timestamptz,
  constraint draw_rooms_room_code_format check (room_code ~ '^[A-Z2-9]{6}$')
);

-- Only one *active* room may hold a given code at a time; finished/cancelled
-- rooms free their code for reuse.
create unique index if not exists draw_rooms_room_code_active_key
  on public.draw_rooms (room_code)
  where status in ('waiting', 'ready', 'playing');

create index if not exists draw_rooms_host_user_id_idx on public.draw_rooms (host_user_id);

alter table public.draw_rooms replica identity full;

create table if not exists public.draw_participants (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.draw_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  is_ready boolean not null default false,
  joined_at timestamptz not null default now(),
  ready_at timestamptz,
  last_seen_at timestamptz not null default now(),
  left_game boolean not null default false,
  total_score integer not null default 0,
  correct_count integer not null default 0,
  turns_drawn integer not null default 0,
  constraint draw_participants_room_user_unique unique (room_id, user_id)
);

create index if not exists draw_participants_room_id_idx on public.draw_participants (room_id);
create index if not exists draw_participants_user_id_idx on public.draw_participants (user_id);

alter table public.draw_participants replica identity full;

-- Word bank. Zero client grants — reachable only from inside SECURITY
-- DEFINER functions. `aliases` holds pre-normalized (lowercase, punctuation
-- free) accepted alternatives, e.g. for "United States" -> {usa, america, us}.
create table if not exists public.draw_words (
  id uuid primary key default gen_random_uuid(),
  category public.draw_word_category not null,
  difficulty public.draw_difficulty not null,
  word text not null,
  aliases text[] not null default '{}',
  constraint draw_words_word_unique unique (word)
);

create index if not exists draw_words_category_difficulty_idx
  on public.draw_words (category, difficulty);

-- One row per drawing turn. `secret_word_id` and `word_option_ids` are never
-- exposed by table grant — only through build_draw_room_state's per-caller
-- branching logic.
create table if not exists public.draw_turns (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.draw_rooms(id) on delete cascade,
  round_number smallint not null,
  turn_number smallint not null,
  drawer_user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'choosing' check (status in ('choosing', 'drawing', 'ended')),
  word_option_ids uuid[] not null default '{}',
  secret_word_id uuid references public.draw_words(id),
  choose_deadline timestamptz,
  turn_started_at timestamptz,
  turn_ends_at timestamptz,
  ended_at timestamptz,
  hint_revealed_count smallint not null default 0,
  created_at timestamptz not null default now(),
  constraint draw_turns_room_turn_unique unique (room_id, turn_number)
);

create index if not exists draw_turns_room_id_idx on public.draw_turns (room_id, turn_number desc);

-- Correct-guess ledger. `room_id` is denormalized so RLS policies on this
-- table never need to read the (ungranted) draw_turns table directly.
create table if not exists public.draw_turn_guesses (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.draw_rooms(id) on delete cascade,
  turn_id uuid not null references public.draw_turns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  correct boolean not null default true,
  guessed_at timestamptz not null default now(),
  points_awarded integer not null default 0,
  constraint draw_turn_guesses_turn_user_unique unique (turn_id, user_id)
);

create index if not exists draw_turn_guesses_turn_id_idx on public.draw_turn_guesses (turn_id);

-- Chat + structured system/game events. `body` only exists for 'chat' rows;
-- every other type is rendered client-side from `payload`, and `payload`
-- NEVER contains the secret word until a 'turn_result' row is written
-- (which only happens once a turn has genuinely ended).
create table if not exists public.draw_events (
  id bigint generated always as identity primary key,
  room_id uuid not null references public.draw_rooms(id) on delete cascade,
  turn_id uuid references public.draw_turns(id) on delete set null,
  type text not null check (
    type in ('chat', 'system', 'guess_correct', 'turn_result', 'round_result', 'game_result')
  ),
  user_id uuid references auth.users(id) on delete set null,
  body text,
  payload jsonb,
  created_at timestamptz not null default now(),
  constraint draw_events_body_length check (body is null or length(body) <= 220)
);

create index if not exists draw_events_room_id_idx on public.draw_events (room_id, id desc);

-- Drawing-stroke stream. `points` is a small jsonb array of {x,y} (0..1
-- normalized canvas coordinates), size-capped inside submit_draw_stroke.
create table if not exists public.draw_strokes (
  id bigint generated always as identity primary key,
  turn_id uuid not null references public.draw_turns(id) on delete cascade,
  room_id uuid not null references public.draw_rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('stroke', 'clear', 'undo')),
  points jsonb,
  color text,
  size smallint,
  tool text check (tool in ('brush', 'eraser')),
  created_at timestamptz not null default now()
);

create index if not exists draw_strokes_turn_id_idx on public.draw_strokes (turn_id, id);

-- ============================================================================
-- 3. Realtime publication
-- ============================================================================

do $$ begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'draw_rooms'
  ) then
    alter publication supabase_realtime add table public.draw_rooms;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'draw_participants'
  ) then
    alter publication supabase_realtime add table public.draw_participants;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'draw_events'
  ) then
    alter publication supabase_realtime add table public.draw_events;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'draw_strokes'
  ) then
    alter publication supabase_realtime add table public.draw_strokes;
  end if;
end $$;

-- ============================================================================
-- 4. Helper functions
-- ============================================================================

create or replace function public.is_draw_room_participant(_room_id uuid, _user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.draw_participants dp
    where dp.room_id = _room_id and dp.user_id = _user_id
  );
$$;

revoke all on function public.is_draw_room_participant(uuid, uuid) from public;
grant execute on function public.is_draw_room_participant(uuid, uuid) to authenticated;

create or replace function public.generate_draw_room_code()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- excludes ambiguous 0/O, 1/I.
  v_code text;
  v_attempt int := 0;
begin
  loop
    v_attempt := v_attempt + 1;
    v_code := '';
    for i in 1..6 loop
      v_code := v_code || substr(v_chars, 1 + floor(random() * length(v_chars))::int, 1);
    end loop;

    if not exists (
      select 1 from public.draw_rooms
      where room_code = v_code and status in ('waiting', 'ready', 'playing')
    ) then
      return v_code;
    end if;

    if v_attempt > 25 then
      raise exception 'Could not allocate a unique room code, please retry';
    end if;
  end loop;
end;
$$;

revoke all on function public.generate_draw_room_code() from public;
grant execute on function public.generate_draw_room_code() to authenticated;

-- Case-insensitive, punctuation-light, whitespace-collapsing normalization
-- used for ALL guess comparisons. Comparisons always run server-side against
-- the DB-held secret word + its alias list, never client-side.
create or replace function public.draw_normalize_text(_text text)
returns text
language sql
immutable
as $$
  select trim(
    regexp_replace(
      regexp_replace(lower(coalesce(_text, '')), '[^a-z0-9 ]', '', 'g'),
      '\s+', ' ', 'g'
    )
  );
$$;

-- Deterministic (seeded by turn id) progressive letter reveal that preserves
-- word/space structure and NEVER reveals the final letter of a word, so the
-- full answer is never shown before the turn genuinely ends.
create or replace function public.draw_mask_word(_word text, _turn_id uuid, _revealed_count int)
returns text
language plpgsql
stable
as $$
declare
  v_chars text[];
  v_letter_positions int[] := '{}';
  v_revealed_set int[];
  v_result text := '';
  v_i int;
  v_len int;
begin
  if _word is null then
    return null;
  end if;

  v_chars := regexp_split_to_array(upper(_word), '');
  v_len := array_length(v_chars, 1);

  for v_i in 1..v_len loop
    if v_chars[v_i] <> ' ' then
      v_letter_positions := array_append(v_letter_positions, v_i);
    end if;
  end loop;

  select coalesce(array_agg(pos order by md5(_turn_id::text || pos::text)), '{}')
  into v_letter_positions
  from unnest(v_letter_positions) as pos;

  v_revealed_set := v_letter_positions[
    1 : greatest(0, least(coalesce(_revealed_count, 0), array_length(v_letter_positions, 1) - 1))
  ];

  for v_i in 1..v_len loop
    if v_chars[v_i] = ' ' then
      v_result := v_result || '   ';
    elsif v_i = any (v_revealed_set) then
      v_result := v_result || v_chars[v_i] || ' ';
    else
      v_result := v_result || '_ ';
    end if;
  end loop;

  return rtrim(v_result);
end;
$$;

-- ============================================================================
-- 5. Word bank seed — curated geography / space / universe vocabulary.
--    Examples only, intentionally expandable; ON CONFLICT keeps re-runs safe.
-- ============================================================================

insert into public.draw_words (category, difficulty, word, aliases) values
  -- geography_countries
  ('geography_countries', 'easy', 'Madagascar', '{}'),
  ('geography_countries', 'easy', 'Canada', '{}'),
  ('geography_countries', 'easy', 'Brazil', '{}'),
  ('geography_countries', 'easy', 'Egypt', '{}'),
  ('geography_countries', 'easy', 'Australia', '{}'),
  ('geography_countries', 'easy', 'United States', array['usa', 'america', 'us', 'the usa']),
  ('geography_countries', 'medium', 'Kazakhstan', '{}'),
  ('geography_countries', 'medium', 'Mongolia', '{}'),
  ('geography_countries', 'medium', 'Patagonia', '{}'),
  ('geography_countries', 'medium', 'Scandinavia', '{}'),
  ('geography_countries', 'medium', 'Archipelago', '{}'),
  ('geography_countries', 'hard', 'Kyrgyzstan', '{}'),
  ('geography_countries', 'hard', 'Timbuktu', '{}'),
  ('geography_countries', 'hard', 'Transylvania', '{}'),
  ('geography_countries', 'hard', 'Mesopotamia', '{}'),
  ('geography_countries', 'hard', 'Caucasus', '{}'),

  -- capitals_flags
  ('capitals_flags', 'easy', 'Tokyo', '{}'),
  ('capitals_flags', 'easy', 'Cairo', '{}'),
  ('capitals_flags', 'easy', 'Paris', '{}'),
  ('capitals_flags', 'easy', 'London', '{}'),
  ('capitals_flags', 'easy', 'Moscow', '{}'),
  ('capitals_flags', 'medium', 'Canberra', '{}'),
  ('capitals_flags', 'medium', 'Reykjavik', '{}'),
  ('capitals_flags', 'medium', 'Brasilia', '{}'),
  ('capitals_flags', 'medium', 'Kathmandu', '{}'),
  ('capitals_flags', 'medium', 'Ottawa', '{}'),
  ('capitals_flags', 'hard', 'Ouagadougou', '{}'),
  ('capitals_flags', 'hard', 'Ljubljana', '{}'),
  ('capitals_flags', 'hard', 'Bratislava', '{}'),
  ('capitals_flags', 'hard', 'Vaduz', '{}'),
  ('capitals_flags', 'hard', 'Nuuk', '{}'),

  -- landmarks_monuments
  ('landmarks_monuments', 'easy', 'Eiffel Tower', array['eiffel', 'the eiffel tower']),
  ('landmarks_monuments', 'easy', 'Great Wall of China', array['great wall', 'the great wall']),
  ('landmarks_monuments', 'easy', 'Statue of Liberty', array['liberty statue', 'the statue of liberty']),
  ('landmarks_monuments', 'easy', 'Pyramids of Giza', array['giza pyramids', 'the pyramids']),
  ('landmarks_monuments', 'easy', 'Big Ben', '{}'),
  ('landmarks_monuments', 'medium', 'Taj Mahal', '{}'),
  ('landmarks_monuments', 'medium', 'Christ the Redeemer', array['christ redeemer']),
  ('landmarks_monuments', 'medium', 'Colosseum', '{}'),
  ('landmarks_monuments', 'medium', 'Machu Picchu', '{}'),
  ('landmarks_monuments', 'medium', 'Stonehenge', '{}'),
  ('landmarks_monuments', 'hard', 'Angkor Wat', '{}'),
  ('landmarks_monuments', 'hard', 'Petra', '{}'),
  ('landmarks_monuments', 'hard', 'Chichen Itza', '{}'),
  ('landmarks_monuments', 'hard', 'Hagia Sophia', '{}'),
  ('landmarks_monuments', 'hard', 'Alhambra', '{}'),

  -- maps_physical
  ('maps_physical', 'easy', 'Equator', '{}'),
  ('maps_physical', 'easy', 'Peninsula', '{}'),
  ('maps_physical', 'easy', 'Waterfall', '{}'),
  ('maps_physical', 'easy', 'Glacier', '{}'),
  ('maps_physical', 'easy', 'Volcano', '{}'),
  ('maps_physical', 'medium', 'Sahara Desert', array['sahara']),
  ('maps_physical', 'medium', 'Amazon River', array['amazon']),
  ('maps_physical', 'medium', 'Himalayas', '{}'),
  ('maps_physical', 'medium', 'Mariana Trench', '{}'),
  ('maps_physical', 'medium', 'Great Barrier Reef', '{}'),
  ('maps_physical', 'hard', 'Isthmus', '{}'),
  ('maps_physical', 'hard', 'Tectonic Plate', '{}'),
  ('maps_physical', 'hard', 'Fjord', '{}'),
  ('maps_physical', 'hard', 'Continental Shelf', '{}'),
  ('maps_physical', 'hard', 'Monsoon', '{}'),

  -- space_astronomy
  ('space_astronomy', 'easy', 'Saturn', '{}'),
  ('space_astronomy', 'easy', 'Jupiter', '{}'),
  ('space_astronomy', 'easy', 'Neptune', '{}'),
  ('space_astronomy', 'easy', 'Comet', '{}'),
  ('space_astronomy', 'easy', 'Asteroid', '{}'),
  ('space_astronomy', 'medium', 'Black Hole', '{}'),
  ('space_astronomy', 'medium', 'Milky Way', '{}'),
  ('space_astronomy', 'medium', 'Supernova', '{}'),
  ('space_astronomy', 'medium', 'Constellation', '{}'),
  ('space_astronomy', 'medium', 'Nebula', '{}'),
  ('space_astronomy', 'hard', 'Wormhole', '{}'),
  ('space_astronomy', 'hard', 'Exoplanet', '{}'),
  ('space_astronomy', 'hard', 'Pulsar', '{}'),
  ('space_astronomy', 'hard', 'Event Horizon', '{}'),
  ('space_astronomy', 'hard', 'Dark Matter', '{}'),

  -- planets_universe
  ('planets_universe', 'easy', 'Mars', '{}'),
  ('planets_universe', 'easy', 'Moon', '{}'),
  ('planets_universe', 'easy', 'Sun', '{}'),
  ('planets_universe', 'easy', 'Earth', '{}'),
  ('planets_universe', 'easy', 'Mercury', '{}'),
  ('planets_universe', 'medium', 'Galaxy', '{}'),
  ('planets_universe', 'medium', 'Meteorite', '{}'),
  ('planets_universe', 'medium', 'Space Station', '{}'),
  ('planets_universe', 'medium', 'Solar Eclipse', '{}'),
  ('planets_universe', 'medium', 'Orbit', '{}'),
  ('planets_universe', 'hard', 'Red Giant', '{}'),
  ('planets_universe', 'hard', 'Light Year', '{}'),
  ('planets_universe', 'hard', 'Gravitational Lensing', '{}'),
  ('planets_universe', 'hard', 'Cosmic Microwave Background', '{}'),
  ('planets_universe', 'hard', 'Parallax', '{}')
on conflict (word) do nothing;

-- ============================================================================
-- 6. Core RPCs
-- ============================================================================

create or replace function public.build_draw_room_state(_room_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
  v_turn public.draw_turns%rowtype;
  v_turn_json jsonb := null;
  v_is_drawer boolean := false;
  v_word_text text;
  v_options jsonb;
  v_correct_ids jsonb;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_draw_room_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  select * into v_room from public.draw_rooms where id = _room_id;
  if not found then
    raise exception 'Room not found';
  end if;

  select * into v_turn from public.draw_turns
  where room_id = _room_id
  order by turn_number desc
  limit 1;

  if found then
    v_is_drawer := (v_turn.drawer_user_id = v_uid);

    select coalesce(jsonb_agg(user_id), '[]'::jsonb) into v_correct_ids
    from public.draw_turn_guesses
    where turn_id = v_turn.id and correct;

    if v_turn.secret_word_id is not null then
      select word into v_word_text from public.draw_words where id = v_turn.secret_word_id;
    end if;

    v_options := null;
    if v_is_drawer and v_turn.status = 'choosing' then
      select coalesce(jsonb_agg(jsonb_build_object('id', w.id, 'word', w.word) order by t.ord), '[]'::jsonb)
      into v_options
      from unnest(v_turn.word_option_ids) with ordinality as t(id, ord)
      join public.draw_words w on w.id = t.id;
    end if;

    v_turn_json := jsonb_build_object(
      'id', v_turn.id,
      'round_number', v_turn.round_number,
      'turn_number', v_turn.turn_number,
      'drawer_user_id', v_turn.drawer_user_id,
      'status', v_turn.status,
      'choose_deadline', v_turn.choose_deadline,
      'turn_started_at', v_turn.turn_started_at,
      'turn_ends_at', v_turn.turn_ends_at,
      'word_length', case when v_word_text is not null then length(v_word_text) else null end,
      'hint', case
        when v_word_text is not null
        then public.draw_mask_word(v_word_text, v_turn.id, v_turn.hint_revealed_count)
        else null
      end,
      'correct_user_ids', v_correct_ids,
      'word_options', v_options,
      'secret_word', case when v_is_drawer then v_word_text else null end
    );
  end if;

  return jsonb_build_object(
    'server_time', now(),
    'room', jsonb_build_object(
      'id', v_room.id,
      'room_code', v_room.room_code,
      'host_user_id', v_room.host_user_id,
      'status', v_room.status,
      'rounds', v_room.rounds,
      'max_players', v_room.max_players,
      'categories', v_room.categories,
      'difficulty', v_room.difficulty,
      'turn_seconds', v_room.turn_seconds,
      'current_round', v_room.current_round,
      'created_at', v_room.created_at,
      'started_at', v_room.started_at,
      'completed_at', v_room.completed_at
    ),
    'participants', coalesce((
      select jsonb_agg(jsonb_build_object(
        'user_id', dp.user_id,
        'username', coalesce(p.username, 'player'),
        'display_name', coalesce(p.display_name, p.username, 'Player'),
        'avatar_id', p.avatar_url,
        'is_host', dp.user_id = v_room.host_user_id,
        'is_ready', dp.is_ready,
        'joined_at', dp.joined_at,
        'total_score', dp.total_score,
        'correct_count', dp.correct_count,
        'turns_drawn', dp.turns_drawn,
        'left_game', dp.left_game,
        'connected', dp.last_seen_at > now() - interval '20 seconds'
      ) order by dp.joined_at)
      from public.draw_participants dp
      left join public.profiles p on p.id = dp.user_id
      where dp.room_id = _room_id
    ), '[]'::jsonb),
    'current_turn', v_turn_json,
    'total_turns', v_room.rounds * (
      select count(*) from public.draw_participants where room_id = _room_id
    ),
    'events', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', e.id, 'type', e.type, 'user_id', e.user_id,
        'body', e.body, 'payload', e.payload, 'created_at', e.created_at
      ) order by e.id asc)
      from (
        select * from public.draw_events where room_id = _room_id order by id desc limit 80
      ) e
    ), '[]'::jsonb)
  );
end;
$$;

revoke all on function public.build_draw_room_state(uuid) from public;
grant execute on function public.build_draw_room_state(uuid) to authenticated;

create or replace function public.sync_draw_room_ready_state(_room_id uuid)
returns public.draw_room_status
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.draw_rooms%rowtype;
  v_count int;
  v_ready int;
  v_new public.draw_room_status;
begin
  select * into v_room from public.draw_rooms where id = _room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.status not in ('waiting', 'ready') then
    return v_room.status;
  end if;

  select count(*), count(*) filter (where is_ready) into v_count, v_ready
  from public.draw_participants where room_id = _room_id;

  if v_count >= 2 and v_ready = v_count then
    v_new := 'ready';
  else
    v_new := 'waiting';
  end if;

  if v_new is distinct from v_room.status then
    update public.draw_rooms set status = v_new where id = _room_id;
  end if;

  return v_new;
end;
$$;

create or replace function public.create_draw_room(
  _rounds smallint,
  _max_players smallint,
  _categories text[],
  _difficulty text,
  _turn_seconds smallint default 80
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
  v_code text;
  v_cats public.draw_word_category[];
  v_diff public.draw_difficulty;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if _rounds is null or _rounds not in (1, 3, 5) then
    raise exception 'Rounds must be 1, 3 or 5';
  end if;

  if _max_players is null or _max_players < 2 or _max_players > 8 then
    raise exception 'Max players must be between 2 and 8';
  end if;

  begin
    v_diff := coalesce(_difficulty, 'medium')::public.draw_difficulty;
  exception when invalid_text_representation then
    raise exception 'Invalid difficulty';
  end;

  if _categories is null or array_length(_categories, 1) is null then
    v_cats := '{}';
  else
    begin
      select array_agg(c::public.draw_word_category) into v_cats
      from unnest(_categories) as c;
    exception when invalid_text_representation then
      raise exception 'Invalid category';
    end;
  end if;

  v_code := public.generate_draw_room_code();

  insert into public.draw_rooms (
    room_code, host_user_id, status, rounds, max_players,
    categories, difficulty, turn_seconds, turn_order,
    current_round, current_turn_index, used_word_ids
  ) values (
    v_code, v_uid, 'waiting', _rounds, _max_players,
    coalesce(v_cats, '{}'), v_diff, coalesce(_turn_seconds, 80), '{}',
    0, 0, '{}'
  )
  returning * into v_room;

  insert into public.draw_participants (room_id, user_id, is_ready)
  values (v_room.id, v_uid, false);

  return public.build_draw_room_state(v_room.id);
end;
$$;

revoke all on function public.create_draw_room(smallint, smallint, text[], text, smallint) from public;
grant execute on function public.create_draw_room(smallint, smallint, text[], text, smallint) to authenticated;

create or replace function public.join_draw_room(_room_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
  v_code text;
  v_count int;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  v_code := upper(trim(coalesce(_room_code, '')));
  if v_code = '' or v_code !~ '^[A-Z2-9]{6}$' then
    raise exception 'Invalid room code format';
  end if;

  select * into v_room from public.draw_rooms
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
    select 1 from public.draw_participants where room_id = v_room.id and user_id = v_uid
  ) then
    raise exception 'You are already in this room';
  end if;

  select count(*) into v_count from public.draw_participants where room_id = v_room.id;
  if v_count >= v_room.max_players then
    raise exception 'Room is full';
  end if;

  insert into public.draw_participants (room_id, user_id, is_ready)
  values (v_room.id, v_uid, false);

  if v_room.status = 'ready' then
    update public.draw_rooms set status = 'waiting' where id = v_room.id;
  end if;

  insert into public.draw_events (room_id, type, user_id, payload)
  values (v_room.id, 'system', v_uid, jsonb_build_object('kind', 'player_joined'));

  perform public.sync_draw_room_ready_state(v_room.id);

  return public.build_draw_room_state(v_room.id);
end;
$$;

revoke all on function public.join_draw_room(text) from public;
grant execute on function public.join_draw_room(text) to authenticated;

create or replace function public.set_draw_ready(_room_id uuid, _ready boolean)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_draw_room_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  select * into v_room from public.draw_rooms where id = _room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.status not in ('waiting', 'ready') then
    raise exception 'Room is not accepting ready changes';
  end if;

  update public.draw_participants
  set is_ready = coalesce(_ready, false),
      ready_at = case when coalesce(_ready, false) then now() else null end
  where room_id = _room_id and user_id = v_uid;

  perform public.sync_draw_room_ready_state(_room_id);

  return public.build_draw_room_state(_room_id);
end;
$$;

revoke all on function public.set_draw_ready(uuid, boolean) from public;
grant execute on function public.set_draw_ready(uuid, boolean) to authenticated;

-- Picks the next eligible drawer (skipping any player who has already left),
-- offers 3 word choices, and opens the choosing window. Bounded loop so a
-- room where everyone has left cannot recurse forever — it just completes.
create or replace function public.begin_draw_turn(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.draw_rooms%rowtype;
  v_round smallint;
  v_index smallint;
  v_order_len smallint;
  v_drawer uuid;
  v_left boolean;
  v_safety int := 0;
  v_turn_number smallint;
  v_words uuid[];
begin
  select * into v_room from public.draw_rooms where id = _room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;

  v_round := v_room.current_round;
  v_index := v_room.current_turn_index;
  v_order_len := array_length(v_room.turn_order, 1);

  if coalesce(v_order_len, 0) = 0 then
    raise exception 'Turn order has not been established';
  end if;

  loop
    v_safety := v_safety + 1;
    if v_safety > (v_order_len * v_room.rounds + 8) then
      update public.draw_rooms set status = 'completed', completed_at = now() where id = _room_id;
      return;
    end if;

    v_drawer := v_room.turn_order[v_index + 1];

    select left_game into v_left
    from public.draw_participants
    where room_id = _room_id and user_id = v_drawer;

    if coalesce(v_left, true) then
      select coalesce(max(turn_number), 0) + 1 into v_turn_number
      from public.draw_turns where room_id = _room_id;

      insert into public.draw_turns (room_id, round_number, turn_number, drawer_user_id, status, ended_at)
      values (_room_id, v_round, v_turn_number, v_drawer, 'ended', now());

      insert into public.draw_events (room_id, type, payload)
      values (_room_id, 'turn_result', jsonb_build_object(
        'word', null, 'drawer_user_id', v_drawer, 'drawer_points', 0,
        'correct_user_ids', '[]'::jsonb, 'skipped', true
      ));

      v_index := v_index + 1;
      if v_index >= v_order_len then
        insert into public.draw_events (room_id, type, payload)
        values (_room_id, 'round_result', jsonb_build_object('round_number', v_round));

        if v_round >= v_room.rounds then
          update public.draw_rooms
          set status = 'completed', completed_at = now(),
              current_round = v_round, current_turn_index = v_index
          where id = _room_id;

          insert into public.draw_events (room_id, type, payload)
          values (_room_id, 'game_result', jsonb_build_object(
            'leaderboard', (
              select coalesce(jsonb_agg(jsonb_build_object(
                'user_id', user_id, 'total_score', total_score,
                'correct_count', correct_count, 'turns_drawn', turns_drawn
              ) order by total_score desc), '[]'::jsonb)
              from public.draw_participants where room_id = _room_id
            )
          ));
          return;
        end if;

        v_round := v_round + 1;
        v_index := 0;
      end if;

      continue;
    end if;

    exit;
  end loop;

  select coalesce(max(turn_number), 0) + 1 into v_turn_number
  from public.draw_turns where room_id = _room_id;

  select coalesce(array_agg(id), '{}') into v_words
  from (
    select id from public.draw_words
    where difficulty = v_room.difficulty
      and (array_length(v_room.categories, 1) is null or category = any (v_room.categories))
      and not (id = any (coalesce(v_room.used_word_ids, '{}')))
    order by random()
    limit 3
  ) w;

  if coalesce(array_length(v_words, 1), 0) < 3 then
    -- Word bank exhausted for this filter combination — allow re-use.
    select coalesce(array_agg(id), '{}') into v_words
    from (
      select id from public.draw_words
      where difficulty = v_room.difficulty
        and (array_length(v_room.categories, 1) is null or category = any (v_room.categories))
      order by random()
      limit 3
    ) w;
  end if;

  if coalesce(array_length(v_words, 1), 0) = 0 then
    raise exception 'No words are available for the selected categories and difficulty';
  end if;

  insert into public.draw_turns (
    room_id, round_number, turn_number, drawer_user_id, status, word_option_ids, choose_deadline
  ) values (
    _room_id, v_round, v_turn_number, v_drawer, 'choosing', v_words, now() + interval '15 seconds'
  );

  update public.draw_rooms
  set status = 'playing', current_round = v_round, current_turn_index = v_index
  where id = _room_id;

  insert into public.draw_events (room_id, type, payload)
  values (_room_id, 'system', jsonb_build_object('kind', 'drawer_turn_start', 'drawer_user_id', v_drawer));
end;
$$;

create or replace function public.advance_draw_room_turn_index(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room public.draw_rooms%rowtype;
  v_order_len int;
  v_next int;
begin
  select * into v_room from public.draw_rooms where id = _room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;

  v_order_len := array_length(v_room.turn_order, 1);
  v_next := v_room.current_turn_index + 1;

  if v_next >= v_order_len then
    insert into public.draw_events (room_id, type, payload)
    values (_room_id, 'round_result', jsonb_build_object('round_number', v_room.current_round));

    if v_room.current_round >= v_room.rounds then
      update public.draw_rooms set status = 'completed', completed_at = now() where id = _room_id;

      insert into public.draw_events (room_id, type, payload)
      values (_room_id, 'game_result', jsonb_build_object(
        'leaderboard', (
          select coalesce(jsonb_agg(jsonb_build_object(
            'user_id', user_id, 'total_score', total_score,
            'correct_count', correct_count, 'turns_drawn', turns_drawn
          ) order by total_score desc), '[]'::jsonb)
          from public.draw_participants where room_id = _room_id
        )
      ));
      return;
    end if;

    update public.draw_rooms
    set current_turn_index = 0, current_round = current_round + 1
    where id = _room_id;
  else
    update public.draw_rooms set current_turn_index = v_next where id = _room_id;
  end if;

  perform public.begin_draw_turn(_room_id);
end;
$$;

create or replace function public.start_draw_game(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
  v_order uuid[];
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select * into v_room from public.draw_rooms where id = _room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.host_user_id <> v_uid then
    raise exception 'Only the host can start the game';
  end if;

  if v_room.status <> 'ready' then
    raise exception 'Room is not ready to start';
  end if;

  select coalesce(array_agg(user_id order by random()), '{}') into v_order
  from public.draw_participants where room_id = _room_id;

  if coalesce(array_length(v_order, 1), 0) < 2 then
    raise exception 'Need at least 2 players to start';
  end if;

  update public.draw_rooms
  set turn_order = v_order, current_round = 1, current_turn_index = 0, started_at = now()
  where id = _room_id;

  perform public.begin_draw_turn(_room_id);

  return public.build_draw_room_state(_room_id);
end;
$$;

revoke all on function public.start_draw_game(uuid) from public;
grant execute on function public.start_draw_game(uuid) to authenticated;

create or replace function public.choose_draw_word(_turn_id uuid, _word_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_turn public.draw_turns%rowtype;
  v_room public.draw_rooms%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select * into v_turn from public.draw_turns where id = _turn_id for update;
  if not found then
    raise exception 'Turn not found';
  end if;

  if v_turn.drawer_user_id <> v_uid then
    raise exception 'Only the active drawer may choose a word';
  end if;

  if v_turn.status <> 'choosing' then
    raise exception 'A word has already been chosen for this turn';
  end if;

  if not (_word_id = any (v_turn.word_option_ids)) then
    raise exception 'Word is not one of the offered options';
  end if;

  select * into v_room from public.draw_rooms where id = v_turn.room_id for update;

  update public.draw_turns
  set secret_word_id = _word_id,
      turn_started_at = now(),
      turn_ends_at = now() + make_interval(secs => v_room.turn_seconds),
      status = 'drawing'
  where id = _turn_id;

  update public.draw_rooms
  set used_word_ids = array_append(coalesce(used_word_ids, '{}'), _word_id)
  where id = v_room.id;

  insert into public.draw_events (room_id, turn_id, type, payload)
  values (v_room.id, _turn_id, 'system', jsonb_build_object('kind', 'word_chosen'));

  return public.build_draw_room_state(v_room.id);
end;
$$;

revoke all on function public.choose_draw_word(uuid, uuid) from public;
grant execute on function public.choose_draw_word(uuid, uuid) to authenticated;

-- Idempotent server tick. Any participant may call this freely/concurrently;
-- `for update` locks + now()-based comparisons make duplicate calls safe
-- no-ops after the first valid transition. Handles: word-choice timeout
-- (auto-pick), drawer disconnect during choosing, turn timeout, early turn
-- end once every eligible guesser is correct, and gradual hint reveal.
create or replace function public.advance_draw_turn(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
  v_turn public.draw_turns%rowtype;
  v_correct_ids uuid[];
  v_correct_count int;
  v_eligible_count int;
  v_drawer_points int;
  v_word_text text;
  v_elapsed_fraction numeric;
  v_target_reveal int;
  v_letters int;
  v_grace interval := interval '20 seconds';
  v_drawer_stale boolean;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_draw_room_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  select * into v_room from public.draw_rooms where id = _room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.status <> 'playing' then
    return public.build_draw_room_state(_room_id);
  end if;

  select * into v_turn from public.draw_turns
  where room_id = _room_id
  order by turn_number desc
  limit 1
  for update;

  if not found then
    return public.build_draw_room_state(_room_id);
  end if;

  select (last_seen_at < now() - v_grace or left_game) into v_drawer_stale
  from public.draw_participants
  where room_id = _room_id and user_id = v_turn.drawer_user_id;

  if v_turn.status = 'choosing' then
    if v_turn.choose_deadline < now() then
      if coalesce(v_drawer_stale, true) then
        update public.draw_turns set status = 'ended', ended_at = now() where id = v_turn.id;

        insert into public.draw_events (room_id, turn_id, type, payload)
        values (_room_id, v_turn.id, 'turn_result', jsonb_build_object(
          'word', null, 'drawer_user_id', v_turn.drawer_user_id, 'drawer_points', 0,
          'correct_user_ids', '[]'::jsonb, 'skipped', true
        ));

        perform public.advance_draw_room_turn_index(_room_id);
      else
        update public.draw_turns
        set secret_word_id = v_turn.word_option_ids[1],
            turn_started_at = now(),
            turn_ends_at = now() + make_interval(secs => v_room.turn_seconds),
            status = 'drawing'
        where id = v_turn.id;

        update public.draw_rooms
        set used_word_ids = array_append(coalesce(used_word_ids, '{}'), v_turn.word_option_ids[1])
        where id = _room_id;

        insert into public.draw_events (room_id, turn_id, type, payload)
        values (_room_id, v_turn.id, 'system', jsonb_build_object('kind', 'word_auto_chosen'));
      end if;
    end if;

  elsif v_turn.status = 'drawing' then
    select coalesce(array_agg(user_id), '{}'), count(*) into v_correct_ids, v_correct_count
    from public.draw_turn_guesses where turn_id = v_turn.id and correct;

    select count(*) into v_eligible_count
    from public.draw_participants
    where room_id = _room_id and user_id <> v_turn.drawer_user_id and left_game = false;

    if coalesce(v_drawer_stale, false)
       or now() >= v_turn.turn_ends_at
       or (v_eligible_count > 0 and coalesce(v_correct_count, 0) >= v_eligible_count)
    then
      select word into v_word_text from public.draw_words where id = v_turn.secret_word_id;
      v_drawer_points := 20 * coalesce(v_correct_count, 0);

      update public.draw_turns set status = 'ended', ended_at = now() where id = v_turn.id;

      update public.draw_participants
      set total_score = total_score + v_drawer_points, turns_drawn = turns_drawn + 1
      where room_id = _room_id and user_id = v_turn.drawer_user_id;

      insert into public.draw_events (room_id, turn_id, type, payload)
      values (_room_id, v_turn.id, 'turn_result', jsonb_build_object(
        'word', v_word_text,
        'drawer_user_id', v_turn.drawer_user_id,
        'drawer_points', v_drawer_points,
        'correct_user_ids', to_jsonb(v_correct_ids),
        'skipped', false
      ));

      perform public.advance_draw_room_turn_index(_room_id);
    else
      v_elapsed_fraction := extract(epoch from (now() - v_turn.turn_started_at)) / v_room.turn_seconds;

      select length(regexp_replace(word, '[^A-Za-z0-9]', '', 'g')) into v_letters
      from public.draw_words where id = v_turn.secret_word_id;

      v_target_reveal := least(
        greatest(coalesce(v_letters, 1) - 2, 0),
        floor(greatest(v_elapsed_fraction, 0) * 4)::int
      );

      if v_target_reveal > v_turn.hint_revealed_count then
        update public.draw_turns set hint_revealed_count = v_target_reveal where id = v_turn.id;
      end if;
    end if;
  end if;

  return public.build_draw_room_state(_room_id);
end;
$$;

revoke all on function public.advance_draw_turn(uuid) from public;
grant execute on function public.advance_draw_turn(uuid) to authenticated;

-- Chat + guess submission in one call. Correct guesses NEVER have their raw
-- text written to any shared/visible row — only a word-free 'guess_correct'
-- system event (payload: {points}) plus the private return value to the
-- caller. This structurally guarantees the word cannot leak via chat history.
create or replace function public.send_draw_message(_room_id uuid, _message text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
  v_turn public.draw_turns%rowtype;
  v_clean text;
  v_normalized text;
  v_secret text;
  v_aliases text[];
  v_already boolean;
  v_rank int;
  v_seconds_remaining numeric;
  v_points int;
  v_last_at timestamptz;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  if not public.is_draw_room_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  v_clean := left(trim(coalesce(_message, '')), 200);
  if v_clean = '' then
    raise exception 'Message cannot be empty';
  end if;

  select max(created_at) into v_last_at
  from public.draw_events
  where room_id = _room_id and user_id = v_uid and type = 'chat';

  if v_last_at is not null and v_last_at > now() - interval '300 milliseconds' then
    raise exception 'Please slow down';
  end if;

  select * into v_room from public.draw_rooms where id = _room_id;

  select * into v_turn from public.draw_turns
  where room_id = _room_id
  order by turn_number desc
  limit 1;

  if found and v_turn.status = 'drawing' and v_turn.drawer_user_id <> v_uid then
    select exists (
      select 1 from public.draw_turn_guesses where turn_id = v_turn.id and user_id = v_uid
    ) into v_already;

    if not v_already then
      select w.word, w.aliases into v_secret, v_aliases
      from public.draw_words w where w.id = v_turn.secret_word_id;

      v_normalized := public.draw_normalize_text(_message);

      if v_secret is not null and (
        v_normalized = public.draw_normalize_text(v_secret)
        or v_normalized = any (coalesce(v_aliases, '{}'))
      ) then
        select count(*) + 1 into v_rank
        from public.draw_turn_guesses where turn_id = v_turn.id and correct;

        v_seconds_remaining := greatest(0, extract(epoch from (v_turn.turn_ends_at - now())));
        v_points := greatest(
          10,
          round(100 * (v_seconds_remaining / greatest(v_room.turn_seconds, 1))) - (5 * (v_rank - 1))
        )::int;

        insert into public.draw_turn_guesses (room_id, turn_id, user_id, correct, guessed_at, points_awarded)
        values (_room_id, v_turn.id, v_uid, true, now(), v_points);

        update public.draw_participants
        set total_score = total_score + v_points, correct_count = correct_count + 1
        where room_id = _room_id and user_id = v_uid;

        insert into public.draw_events (room_id, turn_id, type, user_id, payload)
        values (_room_id, v_turn.id, 'guess_correct', v_uid, jsonb_build_object('points', v_points));

        perform public.advance_draw_turn(_room_id);

        return jsonb_build_object(
          'correct', true, 'points', v_points, 'room_state', public.build_draw_room_state(_room_id)
        );
      end if;
    end if;
  end if;

  insert into public.draw_events (room_id, turn_id, type, user_id, body)
  values (_room_id, (case when found then v_turn.id else null end), 'chat', v_uid, v_clean);

  return jsonb_build_object(
    'correct', false, 'points', 0, 'room_state', public.build_draw_room_state(_room_id)
  );
end;
$$;

revoke all on function public.send_draw_message(uuid, text) from public;
grant execute on function public.send_draw_message(uuid, text) to authenticated;

create or replace function public.submit_draw_stroke(
  _room_id uuid, _turn_id uuid, _kind text, _points jsonb,
  _color text, _size smallint, _tool text
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_turn public.draw_turns%rowtype;
  v_last timestamptz;
  v_id bigint;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select * into v_turn from public.draw_turns where id = _turn_id and room_id = _room_id;
  if not found then
    raise exception 'Turn not found';
  end if;

  if v_turn.drawer_user_id <> v_uid then
    raise exception 'Only the active drawer can draw';
  end if;

  if v_turn.status <> 'drawing' then
    raise exception 'Drawing is not active for this turn';
  end if;

  if _kind not in ('stroke', 'clear', 'undo') then
    raise exception 'Invalid stroke kind';
  end if;

  -- Generic payload-size cap applies to every kind. For kind='stroke' the
  -- payload is an array of {x,y} points; for kind='undo' it is a small
  -- {"remove_ids": [...]} object (the exact chunk ids drawn in the gesture
  -- being undone, known client-side from this drawer's own prior submit
  -- responses) so every client — live or replaying from scratch — can
  -- deterministically filter out the same set of strokes.
  if _points is not null and octet_length(_points::text) > 24000 then
    raise exception 'Stroke payload too large';
  end if;

  if _kind = 'stroke' then
    if _points is null or jsonb_typeof(_points) <> 'array' or jsonb_array_length(_points) = 0 then
      raise exception 'Stroke requires at least one point';
    end if;
    if jsonb_array_length(_points) > 500 then
      raise exception 'Stroke has too many points';
    end if;
  end if;

  select max(created_at) into v_last
  from public.draw_strokes where turn_id = _turn_id and user_id = v_uid;

  if v_last is not null and v_last > now() - interval '80 milliseconds' then
    raise exception 'Drawing too fast';
  end if;

  insert into public.draw_strokes (turn_id, room_id, user_id, kind, points, color, size, tool)
  values (_turn_id, _room_id, v_uid, _kind, _points, _color, _size, _tool)
  returning id into v_id;

  return v_id;
end;
$$;

revoke all on function public.submit_draw_stroke(uuid, uuid, text, jsonb, text, smallint, text) from public;
grant execute on function public.submit_draw_stroke(uuid, uuid, text, jsonb, text, smallint, text) to authenticated;

create or replace function public.fetch_draw_strokes_since(_turn_id uuid, _after_id bigint default 0)
returns setof public.draw_strokes
language sql
stable
security definer
set search_path = public
as $$
  select s.*
  from public.draw_strokes s
  join public.draw_turns t on t.id = s.turn_id
  where s.turn_id = _turn_id
    and s.id > _after_id
    and public.is_draw_room_participant(t.room_id, auth.uid())
  order by s.id asc;
$$;

revoke all on function public.fetch_draw_strokes_since(uuid, bigint) from public;
grant execute on function public.fetch_draw_strokes_since(uuid, bigint) to authenticated;

create or replace function public.touch_draw_presence(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  update public.draw_participants
  set last_seen_at = now()
  where room_id = _room_id and user_id = v_uid;
end;
$$;

revoke all on function public.touch_draw_presence(uuid) from public;
grant execute on function public.touch_draw_presence(uuid) to authenticated;

create or replace function public.leave_draw_room(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
  v_count int;
  v_new_host uuid;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select * into v_room from public.draw_rooms where id = _room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;

  if not public.is_draw_room_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  if v_room.status in ('waiting', 'ready') then
    delete from public.draw_participants where room_id = _room_id and user_id = v_uid;

    select count(*) into v_count from public.draw_participants where room_id = _room_id;

    if v_count = 0 then
      update public.draw_rooms
      set status = 'cancelled', completed_at = coalesce(completed_at, now())
      where id = _room_id;
    else
      if v_room.host_user_id = v_uid then
        select user_id into v_new_host from public.draw_participants
        where room_id = _room_id order by joined_at asc limit 1;

        update public.draw_rooms set host_user_id = v_new_host, status = 'waiting' where id = _room_id;

        insert into public.draw_events (room_id, type, user_id, payload)
        values (_room_id, 'system', v_new_host, jsonb_build_object('kind', 'host_changed'));
      end if;
      perform public.sync_draw_room_ready_state(_room_id);
    end if;

    insert into public.draw_events (room_id, type, user_id, payload)
    values (_room_id, 'system', v_uid, jsonb_build_object('kind', 'player_left'));

    return jsonb_build_object('room_id', _room_id, 'left', true, 'cancelled', v_count = 0);

  elsif v_room.status = 'playing' then
    update public.draw_participants set left_game = true
    where room_id = _room_id and user_id = v_uid;

    if v_room.host_user_id = v_uid then
      select user_id into v_new_host from public.draw_participants
      where room_id = _room_id and user_id <> v_uid and left_game = false
      order by joined_at asc limit 1;

      if v_new_host is not null then
        update public.draw_rooms set host_user_id = v_new_host where id = _room_id;
      end if;
    end if;

    insert into public.draw_events (room_id, type, user_id, payload)
    values (_room_id, 'system', v_uid, jsonb_build_object('kind', 'player_left'));

    perform public.advance_draw_turn(_room_id);

    return jsonb_build_object('room_id', _room_id, 'left', true, 'cancelled', false);
  else
    return jsonb_build_object('room_id', _room_id, 'left', false, 'cancelled', false);
  end if;
end;
$$;

revoke all on function public.leave_draw_room(uuid) from public;
grant execute on function public.leave_draw_room(uuid) to authenticated;

create or replace function public.restart_draw_game(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.draw_rooms%rowtype;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  select * into v_room from public.draw_rooms where id = _room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;

  if v_room.host_user_id <> v_uid then
    raise exception 'Only the host can restart the game';
  end if;

  if v_room.status <> 'completed' then
    raise exception 'The game has not finished yet';
  end if;

  update public.draw_rooms
  set status = 'waiting', current_round = 0, current_turn_index = 0,
      turn_order = '{}', used_word_ids = '{}', started_at = null, completed_at = null
  where id = _room_id;

  update public.draw_participants
  set is_ready = false, ready_at = null, total_score = 0, correct_count = 0,
      turns_drawn = 0, left_game = false
  where room_id = _room_id;

  insert into public.draw_events (room_id, type, payload)
  values (_room_id, 'system', jsonb_build_object('kind', 'game_restarted'));

  return public.build_draw_room_state(_room_id);
end;
$$;

revoke all on function public.restart_draw_game(uuid) from public;
grant execute on function public.restart_draw_game(uuid) to authenticated;

-- ============================================================================
-- 7. Row Level Security
-- ============================================================================

alter table public.draw_rooms enable row level security;
alter table public.draw_participants enable row level security;
alter table public.draw_words enable row level security;
alter table public.draw_turns enable row level security;
alter table public.draw_turn_guesses enable row level security;
alter table public.draw_events enable row level security;
alter table public.draw_strokes enable row level security;

revoke all on public.draw_rooms from anon, authenticated;
revoke all on public.draw_participants from anon, authenticated;
revoke all on public.draw_words from anon, authenticated;
revoke all on public.draw_turns from anon, authenticated;
revoke all on public.draw_turn_guesses from anon, authenticated;
revoke all on public.draw_events from anon, authenticated;
revoke all on public.draw_strokes from anon, authenticated;

-- `draw_words` and `draw_turns` intentionally receive NO grants at all —
-- the word bank and the active secret word are reachable only from inside
-- SECURITY DEFINER functions above.
grant select on public.draw_rooms to authenticated;
grant select on public.draw_participants to authenticated;
grant select on public.draw_turn_guesses to authenticated;
grant select on public.draw_events to authenticated;
grant select on public.draw_strokes to authenticated;

drop policy if exists draw_rooms_select_participant on public.draw_rooms;
create policy draw_rooms_select_participant on public.draw_rooms
  for select to authenticated
  using (public.is_draw_room_participant(id, auth.uid()));

drop policy if exists draw_participants_select_room_member on public.draw_participants;
create policy draw_participants_select_room_member on public.draw_participants
  for select to authenticated
  using (
    exists (
      select 1 from public.draw_participants mine
      where mine.room_id = draw_participants.room_id and mine.user_id = auth.uid()
    )
  );

drop policy if exists draw_turn_guesses_select_room_member on public.draw_turn_guesses;
create policy draw_turn_guesses_select_room_member on public.draw_turn_guesses
  for select to authenticated
  using (public.is_draw_room_participant(room_id, auth.uid()));

drop policy if exists draw_events_select_room_member on public.draw_events;
create policy draw_events_select_room_member on public.draw_events
  for select to authenticated
  using (public.is_draw_room_participant(room_id, auth.uid()));

drop policy if exists draw_strokes_select_room_member on public.draw_strokes;
create policy draw_strokes_select_room_member on public.draw_strokes
  for select to authenticated
  using (public.is_draw_room_participant(room_id, auth.uid()));

-- No INSERT/UPDATE/DELETE policies anywhere: every mutation happens through
-- the SECURITY DEFINER RPCs defined above, exactly like the existing
-- PvP/Multiplayer tables.
