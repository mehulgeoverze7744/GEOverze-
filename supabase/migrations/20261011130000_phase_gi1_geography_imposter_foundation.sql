-- ============================================================
-- Phase GI-1: Geography Imposter — Foundation
-- Social-deduction game: 1 imposter, 2 secret words, 3 clue rounds
-- ============================================================

-- ─────────────────────────────────────────────
-- 1. ENUM TYPES
-- ─────────────────────────────────────────────

do $$ begin
  create type public.imp_room_status as enum (
    'waiting', 'ready', 'playing', 'completed', 'cancelled'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.imp_game_phase as enum (
    'clue', 'discussion', 'voting', 'finalizing', 'reveal'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.imp_word_category as enum (
    'geography_countries',
    'capitals_flags',
    'landmarks_monuments',
    'maps_physical',
    'space_astronomy',
    'planets_universe'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.imp_difficulty as enum ('easy', 'medium', 'hard');
exception when duplicate_object then null; end $$;

do $$ begin
  create type public.imp_player_role as enum ('regular', 'imposter');
exception when duplicate_object then null; end $$;

-- ─────────────────────────────────────────────
-- 2. TABLES
-- ─────────────────────────────────────────────

-- Word bank (no SELECT grants: accessed only via SECURITY DEFINER)
create table if not exists public.imp_word_pairs (
  id         uuid                     primary key default gen_random_uuid(),
  category   public.imp_word_category not null,
  difficulty public.imp_difficulty    not null,
  actual_word   text not null,
  imposter_word text not null,
  created_at timestamptz not null default now()
);

-- Rooms (public state, no secret columns)
create table if not exists public.imp_rooms (
  id             uuid                   primary key default gen_random_uuid(),
  room_code      text                   not null,
  host_user_id   uuid                   not null references auth.users(id) on delete cascade,
  status         public.imp_room_status not null default 'waiting',
  phase          public.imp_game_phase,
  current_round  smallint               not null default 0,
  current_clue_index smallint           not null default 0,
  phase_deadline timestamptz,
  imposter_caught    boolean,           -- null until reveal
  max_players        smallint           not null check (max_players between 3 and 16),
  category           public.imp_word_category,  -- null = any
  difficulty         public.imp_difficulty not null default 'medium',
  clue_turn_seconds  smallint           not null default 20,
  clue_order_1       uuid[]             not null default '{}',
  clue_order_2       uuid[]             not null default '{}',
  clue_order_3       uuid[]             not null default '{}',
  -- Revealed only after finalize (set when phase→reveal):
  revealed_actual_word   text,
  revealed_imposter_word text,
  revealed_imposter_id   uuid references auth.users(id),
  created_at   timestamptz not null default now(),
  started_at   timestamptz,
  completed_at timestamptz,
  constraint imp_rooms_code_format check (room_code ~ '^[A-Z2-9]{6}$')
);
create index if not exists imp_rooms_room_code_idx on public.imp_rooms (room_code);
alter table public.imp_rooms replica identity full;

-- Participants
create table if not exists public.imp_participants (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.imp_rooms(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  is_host     boolean not null default false,
  is_ready    boolean not null default false,
  is_excluded boolean not null default false,
  last_seen_at timestamptz not null default now(),
  joined_at   timestamptz not null default now(),
  constraint imp_participants_room_user_unique unique (room_id, user_id)
);
create index if not exists imp_participants_room_idx on public.imp_participants (room_id);
alter table public.imp_participants replica identity full;

-- Private role assignment (ZERO grants — most sensitive table)
create table if not exists public.imp_roles (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.imp_rooms(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  role        public.imp_player_role not null,
  word_pair_id uuid not null references public.imp_word_pairs(id),
  received_word text not null,   -- actual_word for regulars, imposter_word for imposter
  constraint imp_roles_room_user_unique unique (room_id, user_id)
);
create index if not exists imp_roles_room_idx on public.imp_roles (room_id);
-- NO alter replica identity — no realtime on this table

-- Clues (public once submitted)
create table if not exists public.imp_clues (
  id          uuid primary key default gen_random_uuid(),
  room_id     uuid not null references public.imp_rooms(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  round_number smallint not null check (round_number between 1 and 3),
  clue_text   text,
  skipped     boolean not null default false,
  submitted_at timestamptz not null default now(),
  constraint imp_clues_room_round_user unique (room_id, round_number, user_id)
);
create index if not exists imp_clues_room_idx on public.imp_clues (room_id);
alter table public.imp_clues replica identity full;

-- Discussion chat
create table if not exists public.imp_chat (
  id         uuid primary key default gen_random_uuid(),
  room_id    uuid not null references public.imp_rooms(id) on delete cascade,
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null,
  created_at timestamptz not null default now()
);
create index if not exists imp_chat_room_created_idx on public.imp_chat (room_id, created_at desc);
alter table public.imp_chat replica identity full;

-- Votes (ZERO grants until reveal)
create table if not exists public.imp_votes (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.imp_rooms(id) on delete cascade,
  voter_user_id  uuid not null references auth.users(id) on delete cascade,
  target_user_id uuid not null references auth.users(id) on delete cascade,
  created_at     timestamptz not null default now(),
  constraint imp_votes_room_voter_unique unique (room_id, voter_user_id),
  constraint imp_votes_no_self_vote check (voter_user_id <> target_user_id)
);
create index if not exists imp_votes_room_idx on public.imp_votes (room_id);

-- Scores (computed at finalize, read through build_imp_room_state only)
create table if not exists public.imp_scores (
  id             uuid primary key default gen_random_uuid(),
  room_id        uuid not null references public.imp_rooms(id) on delete cascade,
  user_id        uuid not null references auth.users(id) on delete cascade,
  role           public.imp_player_role,
  clues_submitted int not null default 0,
  vote_target_id uuid references auth.users(id),
  vote_correct   boolean,
  points_for_vote int not null default 0,
  imposter_escaped boolean not null default false,
  escape_bonus    int not null default 0,
  total_points    int not null default 0,
  constraint imp_scores_room_user_unique unique (room_id, user_id)
);
create index if not exists imp_scores_room_idx on public.imp_scores (room_id);

-- ─────────────────────────────────────────────
-- 3. REALTIME PUBLICATION
-- ─────────────────────────────────────────────
do $$ begin
  alter publication supabase_realtime add table public.imp_rooms;
exception when undefined_object then null;
         when duplicate_object   then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.imp_participants;
exception when undefined_object then null;
         when duplicate_object   then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.imp_clues;
exception when undefined_object then null;
         when duplicate_object   then null; end $$;

do $$ begin
  alter publication supabase_realtime add table public.imp_chat;
exception when undefined_object then null;
         when duplicate_object   then null; end $$;

-- ─────────────────────────────────────────────
-- 4. HELPER FUNCTIONS
-- ─────────────────────────────────────────────

-- Revoke from public/anon/authenticated for all helpers before granting precisely.
-- (individual RPCs below handle their own grants)

create or replace function public.is_imp_participant(_room_id uuid, _uid uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.imp_participants
    where room_id = _room_id and user_id = _uid
  );
$$;
revoke all on function public.is_imp_participant(uuid, uuid) from public, anon, authenticated;

create or replace function public.generate_imp_room_code()
returns text
language sql
security definer
set search_path = public
as $$
  select string_agg(
    substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random()*32)+1)::int, 1),
    ''
  )
  from generate_series(1, 6);
$$;
revoke all on function public.generate_imp_room_code() from public, anon, authenticated;

-- Returns the clue order array for the room's current round
create or replace function public.get_imp_clue_order(_room public.imp_rooms)
returns uuid[]
language sql
security definer
set search_path = public
stable
as $$
  select case _room.current_round
    when 1 then _room.clue_order_1
    when 2 then _room.clue_order_2
    when 3 then _room.clue_order_3
    else '{}'::uuid[]
  end;
$$;
revoke all on function public.get_imp_clue_order(public.imp_rooms) from public, anon, authenticated;

-- Mark stale players (60-second grace period expired during play)
create or replace function public.mark_stale_imp_players(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.imp_participants
  set is_excluded = true
  where room_id = _room_id
    and is_excluded = false
    and last_seen_at < now() - interval '60 seconds';
end;
$$;
revoke all on function public.mark_stale_imp_players(uuid) from public, anon, authenticated;

-- Shuffle active participants and store clue order for a round
create or replace function public.generate_imp_clue_order(_room_id uuid, _round smallint)
returns uuid[]
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order uuid[];
begin
  select array_agg(user_id order by random())
  into v_order
  from public.imp_participants
  where room_id = _room_id and is_excluded = false;

  if _round = 1 then
    update public.imp_rooms set clue_order_1 = coalesce(v_order, '{}') where id = _room_id;
  elsif _round = 2 then
    update public.imp_rooms set clue_order_2 = coalesce(v_order, '{}') where id = _room_id;
  elsif _round = 3 then
    update public.imp_rooms set clue_order_3 = coalesce(v_order, '{}') where id = _room_id;
  end if;

  return coalesce(v_order, '{}');
end;
$$;
revoke all on function public.generate_imp_clue_order(uuid, smallint) from public, anon, authenticated;

-- ─────────────────────────────────────────────
-- 5. WORD PAIR SEED (90 pairs, 6 categories × 3 difficulties × 5)
-- ─────────────────────────────────────────────

insert into public.imp_word_pairs (category, difficulty, actual_word, imposter_word) values

-- geography_countries / easy
('geography_countries','easy','BRAZIL','ARGENTINA'),
('geography_countries','easy','CANADA','UNITED STATES'),
('geography_countries','easy','EGYPT','LIBYA'),
('geography_countries','easy','MADAGASCAR','MAURITIUS'),
('geography_countries','easy','MEXICO','COLOMBIA'),
-- geography_countries / medium
('geography_countries','medium','AMAZON BASIN','CONGO BASIN'),
('geography_countries','medium','KAZAKH STEPPE','MONGOLIAN STEPPE'),
('geography_countries','medium','IBERIAN PENINSULA','SCANDINAVIAN PENINSULA'),
('geography_countries','medium','PATAGONIA','PAMPAS'),
('geography_countries','medium','HORN OF AFRICA','CAPE OF GOOD HOPE'),
-- geography_countries / hard
('geography_countries','hard','KYRGYZSTAN','TAJIKISTAN'),
('geography_countries','hard','MESOPOTAMIA','FERTILE CRESCENT'),
('geography_countries','hard','CAUCASUS MOUNTAINS','ZAGROS MOUNTAINS'),
('geography_countries','hard','TRANSYLVANIA','MOLDAVIA'),
('geography_countries','hard','TIMBUKTU','AGADEZ'),

-- capitals_flags / easy
('capitals_flags','easy','TOKYO','BEIJING'),
('capitals_flags','easy','PARIS','BERLIN'),
('capitals_flags','easy','CAIRO','NAIROBI'),
('capitals_flags','easy','MOSCOW','WARSAW'),
('capitals_flags','easy','OTTAWA','CANBERRA'),
-- capitals_flags / medium
('capitals_flags','medium','REYKJAVIK','OSLO'),
('capitals_flags','medium','KATHMANDU','THIMPHU'),
('capitals_flags','medium','BRASILIA','BUENOS AIRES'),
('capitals_flags','medium','OUAGADOUGOU','BAMAKO'),
('capitals_flags','medium','MINSK','CHISINAU'),
-- capitals_flags / hard
('capitals_flags','hard','VADUZ','ANDORRA LA VELLA'),
('capitals_flags','hard','VALLETTA','NICOSIA'),
('capitals_flags','hard','PODGORICA','PRISTINA'),
('capitals_flags','hard','DILI','BANDAR SERI BEGAWAN'),
('capitals_flags','hard','FUNAFUTI','NGERULMUD'),

-- landmarks_monuments / easy
('landmarks_monuments','easy','EIFFEL TOWER','LEANING TOWER OF PISA'),
('landmarks_monuments','easy','GREAT WALL OF CHINA','HADRIAN''S WALL'),
('landmarks_monuments','easy','STATUE OF LIBERTY','STATUE OF CHRIST THE REDEEMER'),
('landmarks_monuments','easy','PYRAMIDS OF GIZA','STEP PYRAMID OF DJOSER'),
('landmarks_monuments','easy','BIG BEN','WESTMINSTER ABBEY'),
-- landmarks_monuments / medium
('landmarks_monuments','medium','TAJ MAHAL','RED FORT'),
('landmarks_monuments','medium','MACHU PICCHU','CHICHEN ITZA'),
('landmarks_monuments','medium','COLOSSEUM','ACROPOLIS OF ATHENS'),
('landmarks_monuments','medium','ANGKOR WAT','BOROBUDUR'),
('landmarks_monuments','medium','STONEHENGE','AVEBURY'),
-- landmarks_monuments / hard
('landmarks_monuments','hard','ALHAMBRA','ALCAZAR OF SEVILLE'),
('landmarks_monuments','hard','HAGIA SOPHIA','BLUE MOSQUE'),
('landmarks_monuments','hard','PETRA','PERSEPOLIS'),
('landmarks_monuments','hard','SIGIRIYA','DAMBULLA CAVE TEMPLE'),
('landmarks_monuments','hard','NAZCA LINES','SAKSAYWAMAN'),

-- maps_physical / easy
('maps_physical','easy','AMAZON RIVER','NILE RIVER'),
('maps_physical','easy','SAHARA DESERT','GOBI DESERT'),
('maps_physical','easy','HIMALAYAS','ANDES MOUNTAINS'),
('maps_physical','easy','EQUATOR','PRIME MERIDIAN'),
('maps_physical','easy','GRAND CANYON','MARIANA TRENCH'),
-- maps_physical / medium
('maps_physical','medium','GREAT BARRIER REEF','BELIZE BARRIER REEF'),
('maps_physical','medium','DEAD SEA','CASPIAN SEA'),
('maps_physical','medium','LAKE VICTORIA','LAKE SUPERIOR'),
('maps_physical','medium','YELLOW RIVER','YANGTZE RIVER'),
('maps_physical','medium','AMAZON RAINFOREST','CONGO RAINFOREST'),
-- maps_physical / hard
('maps_physical','hard','CONTINENTAL SHELF','CONTINENTAL SLOPE'),
('maps_physical','hard','TECTONIC PLATE','FAULT LINE'),
('maps_physical','hard','THERMOCLINE','HALOCLINE'),
('maps_physical','hard','MORAINE','ESKER'),
('maps_physical','hard','ATOLL','SEAMOUNT'),

-- space_astronomy / easy
('space_astronomy','easy','SATURN','JUPITER'),
('space_astronomy','easy','BLACK HOLE','NEUTRON STAR'),
('space_astronomy','easy','MILKY WAY','ANDROMEDA GALAXY'),
('space_astronomy','easy','SOLAR ECLIPSE','LUNAR ECLIPSE'),
('space_astronomy','easy','ASTEROID','COMET'),
-- space_astronomy / medium
('space_astronomy','medium','CONSTELLATION','ASTERISM'),
('space_astronomy','medium','NEBULA','PULSAR'),
('space_astronomy','medium','SUPERNOVA','NOVA'),
('space_astronomy','medium','DARK MATTER','DARK ENERGY'),
('space_astronomy','medium','WORMHOLE','SINGULARITY'),
-- space_astronomy / hard
('space_astronomy','hard','EVENT HORIZON','SCHWARZSCHILD RADIUS'),
('space_astronomy','hard','GRAVITATIONAL LENSING','GRAVITATIONAL WAVES'),
('space_astronomy','hard','COSMIC MICROWAVE BACKGROUND','REDSHIFT'),
('space_astronomy','hard','QUASAR','BLAZAR'),
('space_astronomy','hard','MAGNETAR','PULSAR'),

-- planets_universe / easy
('planets_universe','easy','MARS','VENUS'),
('planets_universe','easy','THE MOON','EUROPA'),
('planets_universe','easy','RED GIANT','WHITE DWARF'),
('planets_universe','easy','ORBIT','ROTATION'),
('planets_universe','easy','SOLAR SYSTEM','GALAXY'),
-- planets_universe / medium
('planets_universe','medium','EXOPLANET','ROGUE PLANET'),
('planets_universe','medium','METEORITE','ASTEROID'),
('planets_universe','medium','SPACE STATION','SATELLITE'),
('planets_universe','medium','BINARY STAR','BROWN DWARF'),
('planets_universe','medium','KUIPER BELT','ASTEROID BELT'),
-- planets_universe / hard
('planets_universe','hard','PARALLAX','PROPER MOTION'),
('planets_universe','hard','HELIOSPHERE','MAGNETOSPHERE'),
('planets_universe','hard','LIGHT YEAR','PARSEC'),
('planets_universe','hard','RED DWARF','YELLOW DWARF'),
('planets_universe','hard','PERIHELION','APHELION')

on conflict do nothing;

-- ─────────────────────────────────────────────
-- 6. CORE RPCs
-- ─────────────────────────────────────────────

-- ── 6a. build_imp_room_state ─────────────────
-- Returns the full room state, filtered for security:
--   • private_info only contains caller's own role+word
--   • votes hidden until reveal
--   • actual_word/imposter_word hidden until reveal
create or replace function public.build_imp_room_state(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid           uuid := auth.uid();
  v_room          public.imp_rooms%rowtype;
  v_participants  jsonb;
  v_clues         jsonb;
  v_chat          jsonb;
  v_private_info  jsonb := null;
  v_vote_status   jsonb := null;
  v_reveal        jsonb := null;
  v_my_role       public.imp_player_role;
  v_my_word       text;
  v_clues_count   int;
  v_voted_count   int;
  v_eligible_count int;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_room from public.imp_rooms where id = _room_id;
  if not found then raise exception 'Room not found'; end if;

  if not public.is_imp_participant(_room_id, v_uid) then
    raise exception 'Not a participant in this room';
  end if;

  -- Participants (public info)
  select jsonb_agg(
    jsonb_build_object(
      'user_id',     p.user_id,
      'is_host',     p.is_host,
      'is_ready',    p.is_ready,
      'is_excluded', p.is_excluded,
      'last_seen_at',p.last_seen_at,
      'joined_at',   p.joined_at,
      'display_name',pr.display_name,
      'avatar_id',   pr.avatar_url
    ) order by p.joined_at
  )
  into v_participants
  from public.imp_participants p
  join public.profiles pr on pr.id = p.user_id
  where p.room_id = _room_id;

  -- Clues (all rounds, visible to everyone)
  select jsonb_agg(
    jsonb_build_object(
      'id',           c.id,
      'user_id',      c.user_id,
      'round_number', c.round_number,
      'clue_text',    c.clue_text,
      'skipped',      c.skipped,
      'submitted_at', c.submitted_at
    ) order by c.round_number, c.submitted_at
  )
  into v_clues
  from public.imp_clues c
  where c.room_id = _room_id;

  -- Chat (last 80 messages)
  select jsonb_agg(msg order by msg->>'created_at')
  into v_chat
  from (
    select jsonb_build_object(
      'id',         ch.id,
      'user_id',    ch.user_id,
      'body',       ch.body,
      'created_at', ch.created_at
    ) as msg
    from public.imp_chat ch
    where ch.room_id = _room_id
    order by ch.created_at desc
    limit 80
  ) sub;

  -- Private info: caller's own role + word (only when game is playing or completed)
  if v_room.status in ('playing', 'completed') then
    select r.role, r.received_word
    into v_my_role, v_my_word
    from public.imp_roles r
    where r.room_id = _room_id and r.user_id = v_uid;

    if found then
      v_private_info := jsonb_build_object(
        'role', v_my_role,
        'received_word', v_my_word
      );
    end if;
  end if;

  -- Vote status (count only, until reveal)
  if v_room.phase in ('voting', 'finalizing', 'reveal') or v_room.status = 'completed' then
    select count(*) into v_voted_count from public.imp_votes where room_id = _room_id;
    select count(*) into v_eligible_count
    from public.imp_participants
    where room_id = _room_id and is_excluded = false;

    if v_room.phase = 'reveal' or v_room.status = 'completed' then
      -- Reveal full vote distribution + scores
      v_vote_status := (
        select jsonb_build_object(
          'voted_count',    v_voted_count,
          'eligible_count', v_eligible_count,
          'distribution', coalesce((
            select jsonb_object_agg(target_user_id::text, vote_count)
            from (
              select target_user_id, count(*) as vote_count
              from public.imp_votes where room_id = _room_id
              group by target_user_id
            ) vd
          ), '{}'::jsonb),
          'you_voted_for', (
            select target_user_id from public.imp_votes
            where room_id = _room_id and voter_user_id = v_uid
          )
        )
      );
    else
      v_vote_status := jsonb_build_object(
        'voted_count',    v_voted_count,
        'eligible_count', v_eligible_count,
        'you_have_voted', exists(
          select 1 from public.imp_votes
          where room_id = _room_id and voter_user_id = v_uid
        )
      );
    end if;
  end if;

  -- Reveal block (only when phase = reveal)
  if v_room.phase = 'reveal' or v_room.status = 'completed' then
    v_reveal := jsonb_build_object(
      'imposter_user_id',    v_room.revealed_imposter_id,
      'actual_word',         v_room.revealed_actual_word,
      'imposter_word',       v_room.revealed_imposter_word,
      'imposter_caught',     v_room.imposter_caught,
      'scores', coalesce((
        select jsonb_agg(
          jsonb_build_object(
            'user_id',         s.user_id,
            'role',            s.role,
            'clues_submitted', s.clues_submitted,
            'vote_target_id',  s.vote_target_id,
            'vote_correct',    s.vote_correct,
            'points_for_vote', s.points_for_vote,
            'imposter_escaped',s.imposter_escaped,
            'escape_bonus',    s.escape_bonus,
            'total_points',    s.total_points
          ) order by s.total_points desc
        )
        from public.imp_scores s where s.room_id = _room_id
      ), '[]'::jsonb)
    );
  end if;

  return jsonb_build_object(
    'server_time',       now(),
    'room', jsonb_build_object(
      'id',                 v_room.id,
      'room_code',          v_room.room_code,
      'host_user_id',       v_room.host_user_id,
      'status',             v_room.status,
      'phase',              v_room.phase,
      'current_round',      v_room.current_round,
      'current_clue_index', v_room.current_clue_index,
      'phase_deadline',     v_room.phase_deadline,
      'imposter_caught',    v_room.imposter_caught,
      'max_players',        v_room.max_players,
      'category',           v_room.category,
      'difficulty',         v_room.difficulty,
      'clue_turn_seconds',  v_room.clue_turn_seconds,
      'clue_order_1',       v_room.clue_order_1,
      'clue_order_2',       v_room.clue_order_2,
      'clue_order_3',       v_room.clue_order_3,
      'created_at',         v_room.created_at,
      'started_at',         v_room.started_at,
      'completed_at',       v_room.completed_at
    ),
    'participants',   coalesce(v_participants, '[]'::jsonb),
    'clues',          coalesce(v_clues, '[]'::jsonb),
    'chat',           coalesce(v_chat, '[]'::jsonb),
    'private_info',   v_private_info,
    'vote_status',    v_vote_status,
    'reveal',         v_reveal
  );
end;
$$;

revoke all on function public.build_imp_room_state(uuid) from public, anon;
grant execute on function public.build_imp_room_state(uuid) to authenticated;

-- ── 6b. create_imp_room ──────────────────────
create or replace function public.create_imp_room(
  _max_players  int,
  _category     text default null,
  _difficulty   text default 'medium'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_code text;
  v_room_id uuid;
  v_cat  public.imp_word_category;
  v_diff public.imp_difficulty;
  v_attempts int := 0;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if _max_players < 3 or _max_players > 16 then
    raise exception 'max_players must be between 3 and 16';
  end if;

  v_cat  := _category::public.imp_word_category;
  v_diff := _difficulty::public.imp_difficulty;

  -- Generate unique room code
  loop
    v_code := public.generate_imp_room_code();
    exit when not exists (
      select 1 from public.imp_rooms where room_code = v_code
        and status in ('waiting','ready','playing')
    );
    v_attempts := v_attempts + 1;
    if v_attempts > 20 then raise exception 'Could not generate unique room code'; end if;
  end loop;

  insert into public.imp_rooms (room_code, host_user_id, max_players, category, difficulty)
  values (v_code, v_uid, _max_players, v_cat, v_diff)
  returning id into v_room_id;

  insert into public.imp_participants (room_id, user_id, is_host)
  values (v_room_id, v_uid, true);

  return public.build_imp_room_state(v_room_id);
end;
$$;

revoke all on function public.create_imp_room(int, text, text) from public, anon;
grant execute on function public.create_imp_room(int, text, text) to authenticated;

-- ── 6c. join_imp_room ───────────────────────
create or replace function public.join_imp_room(_room_code text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_room    public.imp_rooms%rowtype;
  v_count   int;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_room
  from public.imp_rooms
  where room_code = upper(trim(_room_code))
    and status in ('waiting', 'ready')
  order by created_at desc
  limit 1;

  if not found then raise exception 'Room not found or no longer accepting players'; end if;

  -- Already in room?
  if public.is_imp_participant(v_room.id, v_uid) then
    return public.build_imp_room_state(v_room.id);
  end if;

  select count(*) into v_count
  from public.imp_participants where room_id = v_room.id;

  if v_count >= v_room.max_players then
    raise exception 'Room is full';
  end if;

  insert into public.imp_participants (room_id, user_id, is_host)
  values (v_room.id, v_uid, false);

  return public.build_imp_room_state(v_room.id);
end;
$$;

revoke all on function public.join_imp_room(text) from public, anon;
grant execute on function public.join_imp_room(text) to authenticated;

-- ── 6d. set_imp_ready ───────────────────────
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

  update public.imp_participants
  set is_ready = _ready
  where room_id = _room_id and user_id = v_uid;

  -- Update room status
  select count(*) into v_count from public.imp_participants where room_id = _room_id;
  select bool_and(is_ready) into v_all_ready
  from public.imp_participants where room_id = _room_id;

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

-- ── 6e. start_imp_game ─────────────────────
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

  -- Pick a random word pair matching category+difficulty
  select * into v_pair
  from public.imp_word_pairs
  where (v_room.category is null or category = v_room.category)
    and difficulty = v_room.difficulty
  order by random()
  limit 1;

  if not found then
    -- fallback: any word pair
    select * into v_pair from public.imp_word_pairs order by random() limit 1;
  end if;

  -- Gather non-excluded participants in random order
  select array_agg(user_id order by random())
  into v_participants
  from public.imp_participants
  where room_id = _room_id and is_excluded = false;

  -- Pick random imposter
  v_imposter_idx := floor(random() * array_length(v_participants, 1)) + 1;
  v_imposter := v_participants[v_imposter_idx];

  -- Assign roles
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

  -- Generate randomized clue order for round 1
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

-- ── 6f. finalize_imp_game (internal helper) ─
create or replace function public.finalize_imp_game(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_room           public.imp_rooms%rowtype;
  v_imposter_id    uuid;
  v_word_pair_id   uuid;
  v_actual_word    text;
  v_imposter_word  text;
  v_max_votes      bigint;
  v_imposter_votes bigint;
  v_imposter_caught boolean;
  v_top_voted_ids  uuid[];
  v_uid_iter       uuid;
  v_clue_count     int;
  v_vote_target    uuid;
  v_vote_correct   boolean;
  v_pts_vote       int;
  v_escape_bonus   int;
begin
  select * into v_room from public.imp_rooms where id = _room_id for update;
  if v_room.phase <> 'voting' then return; end if;

  -- Prevent double-finalize
  update public.imp_rooms set phase = 'finalizing' where id = _room_id;

  -- Identify imposter + word pair
  select user_id, word_pair_id
  into v_imposter_id, v_word_pair_id
  from public.imp_roles
  where room_id = _room_id and role = 'imposter';

  select actual_word, imposter_word
  into v_actual_word, v_imposter_word
  from public.imp_word_pairs where id = v_word_pair_id;

  -- Count votes on imposter
  select count(*) into v_imposter_votes
  from public.imp_votes where room_id = _room_id and target_user_id = v_imposter_id;

  -- Find the maximum vote count among any player
  select coalesce(max(vc), 0) into v_max_votes
  from (
    select count(*) as vc from public.imp_votes
    where room_id = _room_id group by target_user_id
  ) t;

  -- Players who tied for the top votes
  select array_agg(target_user_id) into v_top_voted_ids
  from (
    select target_user_id from public.imp_votes
    where room_id = _room_id
    group by target_user_id
    having count(*) = v_max_votes
  ) t;

  -- Imposter is uniquely-highest-voted
  v_imposter_caught := (
    v_max_votes > 0
    and array_length(v_top_voted_ids, 1) = 1
    and v_top_voted_ids[1] = v_imposter_id
  );

  -- Insert scores for all participants
  for v_uid_iter in (
    select user_id from public.imp_participants where room_id = _room_id
  ) loop
    -- Count clues submitted by this player
    select count(*) into v_clue_count
    from public.imp_clues
    where room_id = _room_id and user_id = v_uid_iter and skipped = false;

    -- What did they vote for?
    select target_user_id into v_vote_target
    from public.imp_votes where room_id = _room_id and voter_user_id = v_uid_iter;

    v_vote_correct := (v_vote_target = v_imposter_id);
    v_pts_vote     := case when v_vote_correct then 100 else 0 end;
    v_escape_bonus := case when v_uid_iter = v_imposter_id and not v_imposter_caught then 100 else 0 end;

    insert into public.imp_scores (
      room_id, user_id, role, clues_submitted,
      vote_target_id, vote_correct, points_for_vote,
      imposter_escaped, escape_bonus, total_points
    )
    select
      _room_id,
      v_uid_iter,
      r.role,
      v_clue_count,
      v_vote_target,
      v_vote_correct,
      v_pts_vote,
      not v_imposter_caught,
      v_escape_bonus,
      v_pts_vote + v_escape_bonus
    from public.imp_roles r
    where r.room_id = _room_id and r.user_id = v_uid_iter
    on conflict (room_id, user_id) do nothing;
  end loop;

  -- Set reveal columns and transition to completed
  update public.imp_rooms
  set phase                 = 'reveal',
      status                = 'completed',
      imposter_caught        = v_imposter_caught,
      revealed_imposter_id  = v_imposter_id,
      revealed_actual_word  = v_actual_word,
      revealed_imposter_word = v_imposter_word,
      completed_at           = now()
  where id = _room_id;
end;
$$;
revoke all on function public.finalize_imp_game(uuid) from public, anon, authenticated;

-- ── 6g. advance_imp_phase ───────────────────
-- Idempotent server-tick RPC. Called ~every 1.5s by each client.
create or replace function public.advance_imp_phase(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid          uuid := auth.uid();
  v_room         public.imp_rooms%rowtype;
  v_clue_order   uuid[];
  v_current_uid  uuid;
  v_has_submitted boolean;
  v_stale        boolean;
  v_eligible_count int;
  v_voted_count  int;
  v_next_index   int;
  v_order_len    int;
  v_new_order    uuid[];
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not public.is_imp_participant(_room_id, v_uid) then
    raise exception 'Not a participant';
  end if;

  -- Mark players past their grace period
  perform public.mark_stale_imp_players(_room_id);

  -- Check if < 3 eligible players remain (cancel if so)
  select count(*) into v_eligible_count
  from public.imp_participants
  where room_id = _room_id and is_excluded = false;

  select * into v_room from public.imp_rooms where id = _room_id for update;
  if not found then raise exception 'Room not found'; end if;
  if v_room.status <> 'playing' then
    return public.build_imp_room_state(_room_id);
  end if;

  if v_eligible_count < 3 then
    update public.imp_rooms set status = 'cancelled' where id = _room_id;
    return public.build_imp_room_state(_room_id);
  end if;

  -- ── CLUE PHASE ──────────────────────────────
  if v_room.phase = 'clue' then
    v_clue_order := public.get_imp_clue_order(v_room);
    v_order_len  := coalesce(array_length(v_clue_order, 1), 0);

    if v_order_len = 0 then
      -- Degenerate: no order, skip to discussion
      update public.imp_rooms
      set phase = 'discussion', phase_deadline = now() + interval '60 seconds'
      where id = _room_id;
      return public.build_imp_room_state(_room_id);
    end if;

    v_current_uid := v_clue_order[v_room.current_clue_index + 1];

    select exists(
      select 1 from public.imp_clues
      where room_id = _room_id and round_number = v_room.current_round and user_id = v_current_uid
    ) into v_has_submitted;

    -- Is current player stale/excluded?
    select coalesce(is_excluded, true) into v_stale
    from public.imp_participants
    where room_id = _room_id and user_id = v_current_uid;

    if v_has_submitted or v_room.phase_deadline < now() or v_stale then
      -- Skip if needed
      if not v_has_submitted then
        insert into public.imp_clues (room_id, user_id, round_number, clue_text, skipped)
        values (_room_id, v_current_uid, v_room.current_round, null, true)
        on conflict (room_id, round_number, user_id) do nothing;
      end if;

      v_next_index := v_room.current_clue_index + 1;

      if v_next_index >= v_order_len then
        -- Round complete → discussion
        update public.imp_rooms
        set phase = 'discussion',
            phase_deadline = now() + interval '60 seconds'
        where id = _room_id;
      else
        -- Next player
        update public.imp_rooms
        set current_clue_index = v_next_index,
            phase_deadline = now() + make_interval(secs => v_room.clue_turn_seconds)
        where id = _room_id;
      end if;
    end if;

  -- ── DISCUSSION PHASE ────────────────────────
  elsif v_room.phase = 'discussion' then
    if v_room.phase_deadline < now() then
      if v_room.current_round < 3 then
        -- Next round
        v_new_order := public.generate_imp_clue_order(_room_id, (v_room.current_round + 1)::smallint);
        update public.imp_rooms
        set current_round = v_room.current_round + 1,
            current_clue_index = 0,
            phase = 'clue',
            phase_deadline = now() + make_interval(secs => v_room.clue_turn_seconds)
        where id = _room_id;
      else
        -- All 3 rounds done → voting
        update public.imp_rooms
        set phase = 'voting',
            phase_deadline = now() + interval '45 seconds'
        where id = _room_id;
      end if;
    end if;

  -- ── VOTING PHASE ────────────────────────────
  elsif v_room.phase = 'voting' then
    select count(*) into v_voted_count
    from public.imp_votes where room_id = _room_id;

    if v_voted_count >= v_eligible_count or v_room.phase_deadline < now() then
      perform public.finalize_imp_game(_room_id);
    end if;
  end if;

  return public.build_imp_room_state(_room_id);
end;
$$;

revoke all on function public.advance_imp_phase(uuid) from public, anon;
grant execute on function public.advance_imp_phase(uuid) to authenticated;

-- ── 6h. submit_imp_clue ─────────────────────
create or replace function public.submit_imp_clue(_room_id uuid, _clue text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid         uuid := auth.uid();
  v_room        public.imp_rooms%rowtype;
  v_clue_order  uuid[];
  v_current_uid uuid;
  v_my_word     text;
  v_norm_clue   text;
  v_norm_word   text;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not public.is_imp_participant(_room_id, v_uid) then
    raise exception 'Not a participant';
  end if;

  select * into v_room from public.imp_rooms where id = _room_id for update;
  if v_room.status <> 'playing' or v_room.phase <> 'clue' then
    raise exception 'Not in clue phase';
  end if;

  v_clue_order  := public.get_imp_clue_order(v_room);
  v_current_uid := v_clue_order[v_room.current_clue_index + 1];

  if v_uid <> v_current_uid then
    raise exception 'It is not your turn to submit a clue';
  end if;

  -- Already submitted?
  if exists(
    select 1 from public.imp_clues
    where room_id = _room_id and round_number = v_room.current_round and user_id = v_uid
  ) then
    raise exception 'You have already submitted a clue this round';
  end if;

  -- Validate clue
  _clue := trim(_clue);
  if _clue = '' then raise exception 'Clue cannot be empty'; end if;
  if char_length(_clue) > 120 then raise exception 'Clue too long (max 120 characters)'; end if;

  -- Anti-word-leakage: reject if clue exactly matches player's received word
  select received_word into v_my_word
  from public.imp_roles
  where room_id = _room_id and user_id = v_uid;

  v_norm_clue := regexp_replace(lower(trim(_clue)), '\s+', ' ', 'g');
  v_norm_word := regexp_replace(lower(trim(v_my_word)), '\s+', ' ', 'g');

  if v_norm_clue = v_norm_word then
    raise exception 'Your clue cannot be the answer word itself';
  end if;

  -- Insert clue
  insert into public.imp_clues (room_id, user_id, round_number, clue_text, skipped)
  values (_room_id, v_uid, v_room.current_round, _clue, false)
  on conflict (room_id, round_number, user_id) do nothing;

  -- Advance phase (move to next player or discussion)
  return public.advance_imp_phase(_room_id);
end;
$$;

revoke all on function public.submit_imp_clue(uuid, text) from public, anon;
grant execute on function public.submit_imp_clue(uuid, text) to authenticated;

-- ── 6i. send_imp_message ────────────────────
create or replace function public.send_imp_message(_room_id uuid, _body text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid     uuid := auth.uid();
  v_room    public.imp_rooms%rowtype;
  v_last_at timestamptz;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not public.is_imp_participant(_room_id, v_uid) then
    raise exception 'Not a participant';
  end if;

  select * into v_room from public.imp_rooms where id = _room_id;
  if v_room.phase <> 'discussion' then
    raise exception 'Chat is only available during the discussion phase';
  end if;

  -- Rate limit: 1 message per 400 ms
  select max(created_at) into v_last_at
  from public.imp_chat where room_id = _room_id and user_id = v_uid;

  if v_last_at is not null and v_last_at > now() - interval '400 milliseconds' then
    raise exception 'Sending too fast; please wait a moment';
  end if;

  _body := trim(_body);
  if _body = '' then raise exception 'Message cannot be empty'; end if;
  if char_length(_body) > 200 then raise exception 'Message too long (max 200 characters)'; end if;

  insert into public.imp_chat (room_id, user_id, body) values (_room_id, v_uid, _body);

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.send_imp_message(uuid, text) from public, anon;
grant execute on function public.send_imp_message(uuid, text) to authenticated;

-- ── 6j. submit_imp_vote ─────────────────────
create or replace function public.submit_imp_vote(_room_id uuid, _target_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid    uuid := auth.uid();
  v_room   public.imp_rooms%rowtype;
  v_is_eligible boolean;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not public.is_imp_participant(_room_id, v_uid) then
    raise exception 'Not a participant';
  end if;

  select * into v_room from public.imp_rooms where id = _room_id;
  if v_room.phase <> 'voting' then raise exception 'Not in voting phase'; end if;
  if v_room.phase_deadline < now() then raise exception 'Voting period has ended'; end if;

  if v_uid = _target_user_id then raise exception 'You cannot vote for yourself'; end if;

  -- Check caller is not excluded
  select not is_excluded into v_is_eligible
  from public.imp_participants where room_id = _room_id and user_id = v_uid;
  if not coalesce(v_is_eligible, false) then
    raise exception 'You are not eligible to vote';
  end if;

  -- Target must be a non-excluded participant
  if not exists(
    select 1 from public.imp_participants
    where room_id = _room_id and user_id = _target_user_id and is_excluded = false
  ) then
    raise exception 'Invalid vote target';
  end if;

  insert into public.imp_votes (room_id, voter_user_id, target_user_id)
  values (_room_id, v_uid, _target_user_id)
  on conflict (room_id, voter_user_id) do nothing;

  -- Try to finalize if all eligible have voted
  return public.advance_imp_phase(_room_id);
end;
$$;

revoke all on function public.submit_imp_vote(uuid, uuid) from public, anon;
grant execute on function public.submit_imp_vote(uuid, uuid) to authenticated;

-- ── 6k. touch_imp_presence ──────────────────
create or replace function public.touch_imp_presence(_room_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then return; end if;
  update public.imp_participants
  set last_seen_at = now(),
      is_excluded = false
  where room_id = _room_id and user_id = v_uid
    and is_excluded = true and (
      select status from public.imp_rooms where id = _room_id
    ) in ('waiting','ready');
  -- During play: only update last_seen_at (don't un-exclude)
  update public.imp_participants
  set last_seen_at = now()
  where room_id = _room_id and user_id = v_uid;
end;
$$;

revoke all on function public.touch_imp_presence(uuid) from public, anon;
grant execute on function public.touch_imp_presence(uuid) to authenticated;

-- ── 6l. leave_imp_room ──────────────────────
create or replace function public.leave_imp_room(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_room  public.imp_rooms%rowtype;
  v_is_host boolean;
  v_new_host uuid;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;
  if not public.is_imp_participant(_room_id, v_uid) then
    return jsonb_build_object('ok', true);
  end if;

  select * into v_room from public.imp_rooms where id = _room_id for update;

  -- If game is playing, exclude rather than delete
  if v_room.status = 'playing' then
    update public.imp_participants
    set is_excluded = true, last_seen_at = now() - interval '61 seconds'
    where room_id = _room_id and user_id = v_uid;
  else
    delete from public.imp_participants where room_id = _room_id and user_id = v_uid;
  end if;

  select is_host into v_is_host
  from public.imp_participants where room_id = _room_id and user_id = v_uid;

  -- Host migration
  if coalesce(v_is_host, false) and v_room.status not in ('playing','completed','cancelled') then
    select user_id into v_new_host
    from public.imp_participants
    where room_id = _room_id and user_id <> v_uid and is_excluded = false
    order by joined_at
    limit 1;

    if found then
      update public.imp_participants set is_host = true
      where room_id = _room_id and user_id = v_new_host;
      update public.imp_rooms set host_user_id = v_new_host where id = _room_id;
    else
      update public.imp_rooms set status = 'cancelled' where id = _room_id;
    end if;
  end if;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.leave_imp_room(uuid) from public, anon;
grant execute on function public.leave_imp_room(uuid) to authenticated;

-- ── 6m. restart_imp_game ────────────────────
create or replace function public.restart_imp_game(_room_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_room public.imp_rooms%rowtype;
begin
  if v_uid is null then raise exception 'Authentication required'; end if;

  select * into v_room from public.imp_rooms where id = _room_id for update;
  if not found then raise exception 'Room not found'; end if;
  if v_room.host_user_id <> v_uid then raise exception 'Only the host can restart'; end if;
  if v_room.status not in ('completed','cancelled') then raise exception 'Game is not over'; end if;

  -- Reset room state
  update public.imp_rooms
  set status = 'waiting',
      phase  = null,
      current_round = 0,
      current_clue_index = 0,
      phase_deadline = null,
      imposter_caught = null,
      clue_order_1 = '{}',
      clue_order_2 = '{}',
      clue_order_3 = '{}',
      revealed_actual_word = null,
      revealed_imposter_word = null,
      revealed_imposter_id = null,
      started_at = null,
      completed_at = null
  where id = _room_id;

  -- Reset participants
  update public.imp_participants
  set is_ready = false, is_excluded = false, last_seen_at = now()
  where room_id = _room_id;

  -- Delete round data
  delete from public.imp_roles  where room_id = _room_id;
  delete from public.imp_clues  where room_id = _room_id;
  delete from public.imp_chat   where room_id = _room_id;
  delete from public.imp_votes  where room_id = _room_id;
  delete from public.imp_scores where room_id = _room_id;

  return public.build_imp_room_state(_room_id);
end;
$$;

revoke all on function public.restart_imp_game(uuid) from public, anon;
grant execute on function public.restart_imp_game(uuid) to authenticated;

-- ─────────────────────────────────────────────
-- 7. ROW-LEVEL SECURITY
-- ─────────────────────────────────────────────

-- imp_word_pairs — no RLS, no grants (accessed only inside SECURITY DEFINER)
alter table public.imp_word_pairs enable row level security;
revoke all on table public.imp_word_pairs from public, anon, authenticated;

-- imp_roles — no RLS, no grants
alter table public.imp_roles enable row level security;
revoke all on table public.imp_roles from public, anon, authenticated;

-- imp_votes — no RLS, no grants
alter table public.imp_votes enable row level security;
revoke all on table public.imp_votes from public, anon, authenticated;

-- imp_scores — no RLS, no grants
alter table public.imp_scores enable row level security;
revoke all on table public.imp_scores from public, anon, authenticated;

-- imp_rooms — participants can SELECT; no direct mutations
alter table public.imp_rooms enable row level security;
revoke all on table public.imp_rooms from public, anon;
grant select on table public.imp_rooms to authenticated;

drop policy if exists "imp_rooms_select_participant" on public.imp_rooms;
create policy "imp_rooms_select_participant" on public.imp_rooms
  for select to authenticated
  using (
    exists (
      select 1 from public.imp_participants
      where room_id = imp_rooms.id and user_id = auth.uid()
    )
  );

-- imp_participants — participants can SELECT their own room; no direct mutations
alter table public.imp_participants enable row level security;
revoke all on table public.imp_participants from public, anon;
grant select on table public.imp_participants to authenticated;

drop policy if exists "imp_participants_select" on public.imp_participants;
create policy "imp_participants_select" on public.imp_participants
  for select to authenticated
  using (
    room_id in (
      select room_id from public.imp_participants
      where user_id = auth.uid()
    )
  );

-- imp_clues — participants can SELECT
alter table public.imp_clues enable row level security;
revoke all on table public.imp_clues from public, anon;
grant select on table public.imp_clues to authenticated;

drop policy if exists "imp_clues_select" on public.imp_clues;
create policy "imp_clues_select" on public.imp_clues
  for select to authenticated
  using (
    room_id in (
      select room_id from public.imp_participants
      where user_id = auth.uid()
    )
  );

-- imp_chat — participants can SELECT
alter table public.imp_chat enable row level security;
revoke all on table public.imp_chat from public, anon;
grant select on table public.imp_chat to authenticated;

drop policy if exists "imp_chat_select" on public.imp_chat;
create policy "imp_chat_select" on public.imp_chat
  for select to authenticated
  using (
    room_id in (
      select room_id from public.imp_participants
      where user_id = auth.uid()
    )
  );
