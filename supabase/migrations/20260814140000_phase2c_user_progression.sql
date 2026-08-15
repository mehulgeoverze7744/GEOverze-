-- Phase 2C — User Progression Persistence
--
-- 1. Creates public.user_progression (XP, level, credits, streaks, lifetime stats).
-- 2. Creates public.quiz_attempts (immutable per-run record).
-- 3. Updates handle_new_user() to also create user_progression row on signup.
-- 4. Backfills user_progression rows for users created before this migration.
-- 5. Creates record_quiz_attempt() SECURITY DEFINER RPC — the ONLY write path
--    for XP and credits. Clients CANNOT update user_progression directly.
--
-- XP Formula (Phase 2C, server-owned):
--   xp_earned = GREATEST(50, correct * 25)
--   - 50 XP minimum per completion  (maps to xpRules.ts "Quiz completion +50 XP")
--   - 25 XP per correct answer       (scales linearly with performance)
--   - No per-quiz configuration needed until quiz content is in DB (Phase 3A)
--
-- Credits in Phase 2C:
--   Solo/practice always earn 0 credits.
--   PvP win-based credit ledger arrives in Phase 3 when Realtime is wired.
--
-- PRESERVES all Phase 2A/2B tables, constraints, triggers, functions, and RLS.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DROP IF EXISTS guards.

-- ============================================================================
-- 1. public.user_progression
-- ============================================================================

create table if not exists public.user_progression (
  user_id          uuid        primary key references auth.users (id) on delete cascade,
  xp               integer     not null default 0,
  level            smallint    not null default 1,
  credits          integer     not null default 0,
  total_quizzes    integer     not null default 0,
  total_correct    integer     not null default 0,
  total_answered   integer     not null default 0,
  current_streak   smallint    not null default 0,
  longest_streak   smallint    not null default 0,
  last_played_date date,
  updated_at       timestamptz not null default now()
);

comment on table public.user_progression is
  'One row per user. Authoritative XP, level, credits, and streak state. '
  'Never written directly by clients — all mutations go through record_quiz_attempt().';

-- Check constraints (idempotent guards)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'progression_xp_non_negative'
      and conrelid = 'public.user_progression'::regclass
  ) then
    alter table public.user_progression
      add constraint progression_xp_non_negative check (xp >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'progression_credits_non_negative'
      and conrelid = 'public.user_progression'::regclass
  ) then
    alter table public.user_progression
      add constraint progression_credits_non_negative check (credits >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'progression_level_min_one'
      and conrelid = 'public.user_progression'::regclass
  ) then
    alter table public.user_progression
      add constraint progression_level_min_one check (level >= 1);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'progression_total_quizzes_non_negative'
      and conrelid = 'public.user_progression'::regclass
  ) then
    alter table public.user_progression
      add constraint progression_total_quizzes_non_negative check (total_quizzes >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'progression_total_correct_non_negative'
      and conrelid = 'public.user_progression'::regclass
  ) then
    alter table public.user_progression
      add constraint progression_total_correct_non_negative check (total_correct >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'progression_total_answered_non_negative'
      and conrelid = 'public.user_progression'::regclass
  ) then
    alter table public.user_progression
      add constraint progression_total_answered_non_negative check (total_answered >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'progression_current_streak_non_negative'
      and conrelid = 'public.user_progression'::regclass
  ) then
    alter table public.user_progression
      add constraint progression_current_streak_non_negative check (current_streak >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'progression_longest_streak_non_negative'
      and conrelid = 'public.user_progression'::regclass
  ) then
    alter table public.user_progression
      add constraint progression_longest_streak_non_negative check (longest_streak >= 0);
  end if;
end $$;

-- Reuse the existing set_updated_at trigger function.
drop trigger if exists user_progression_set_updated_at on public.user_progression;
create trigger user_progression_set_updated_at
  before update on public.user_progression
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- 2. RLS for user_progression
-- ============================================================================

alter table public.user_progression enable row level security;

-- Revoke all direct-write privileges; clients can only SELECT.
-- All mutations are routed through record_quiz_attempt().
revoke all on public.user_progression from anon, authenticated;
grant select on public.user_progression to authenticated;

drop policy if exists progression_select_own on public.user_progression;
create policy progression_select_own
  on public.user_progression
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Admins and super-admins can read all rows (future user management queries).
drop policy if exists progression_select_admin on public.user_progression;
create policy progression_select_admin
  on public.user_progression
  for select
  to authenticated
  using (public.is_admin());

-- NO INSERT policy for clients.
-- NO UPDATE policy for clients.
-- NO DELETE policy for clients.
-- Rows are created by handle_new_user() (trigger, service-role context).
-- Rows are updated only by record_quiz_attempt() (SECURITY DEFINER).

-- ============================================================================
-- 3. public.quiz_attempts
-- ============================================================================

create table if not exists public.quiz_attempts (
  id             uuid        primary key default gen_random_uuid(),
  user_id        uuid        not null references auth.users (id) on delete cascade,
  quiz_id        text        not null,
  mode           text        not null,
  score          integer     not null,
  correct        smallint    not null,
  total          smallint    not null,
  best_streak    smallint    not null default 0,
  xp_earned      integer     not null default 0,
  credits_earned integer     not null default 0,
  duration_ms    integer     not null,
  completed_at   timestamptz not null default now()
);

comment on table public.quiz_attempts is
  'Immutable per-run record. Inserted only by record_quiz_attempt(). '
  'No client UPDATE or DELETE is permitted.';

-- Constraints
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_correct_non_negative'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_correct_non_negative check (correct >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_total_positive'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_total_positive check (total > 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_correct_le_total'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_correct_le_total check (correct <= total);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_best_streak_non_negative'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_best_streak_non_negative check (best_streak >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_duration_positive'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_duration_positive check (duration_ms > 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_score_non_negative'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_score_non_negative check (score >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_xp_earned_non_negative'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_xp_earned_non_negative check (xp_earned >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_credits_earned_non_negative'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_credits_earned_non_negative check (credits_earned >= 0);
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'attempts_mode_allowed'
      and conrelid = 'public.quiz_attempts'::regclass
  ) then
    alter table public.quiz_attempts
      add constraint attempts_mode_allowed
        check (mode in ('solo', 'practice', 'pvp', 'multiplayer'));
  end if;
end $$;

-- Indexes
create index if not exists quiz_attempts_user_completed_idx
  on public.quiz_attempts (user_id, completed_at desc);

create index if not exists quiz_attempts_quiz_id_idx
  on public.quiz_attempts (quiz_id);

-- ============================================================================
-- 4. RLS for quiz_attempts
-- ============================================================================

alter table public.quiz_attempts enable row level security;

revoke all on public.quiz_attempts from anon, authenticated;
grant select, insert on public.quiz_attempts to authenticated;

drop policy if exists attempts_select_own on public.quiz_attempts;
create policy attempts_select_own
  on public.quiz_attempts
  for select
  to authenticated
  using (auth.uid() = user_id);

-- INSERT is allowed but enforced to own user_id.
-- The actual insert is performed by the SECURITY DEFINER function, which means
-- this policy is a defence-in-depth layer — the function itself validates identity.
drop policy if exists attempts_insert_own on public.quiz_attempts;
create policy attempts_insert_own
  on public.quiz_attempts
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- NO UPDATE policy.
-- NO DELETE policy.
-- Rows are immutable once inserted.

-- ============================================================================
-- 5. UPDATE handle_new_user — also insert user_progression row
-- ============================================================================
--
-- CREATE OR REPLACE extends the Phase 2B body without touching the trigger
-- (on_auth_user_created still fires on auth.users INSERT). All existing
-- profile/role creation logic is preserved; user_progression is the addition.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
  requested_country  text;
begin
  requested_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');
  requested_country  := upper(nullif(trim(new.raw_user_meta_data ->> 'country_code'), ''));

  -- Create profile row (Phase 2A/2B).
  begin
    insert into public.profiles (id, username, display_name, country_code)
    values (
      new.id,
      requested_username,
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      requested_country
    )
    on conflict (id) do nothing;
  exception
    when unique_violation then
      -- Username already taken; profile is created without username so signup
      -- is never blocked. User can choose another username later.
      insert into public.profiles (id, display_name, country_code)
      values (
        new.id,
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        requested_country
      )
      on conflict (id) do nothing;
  end;

  -- Grant default role (Phase 2A).
  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  -- Create progression row (Phase 2C).
  insert into public.user_progression (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Runs after every auth.users insert. Creates profile, default "user" role, '
  'and initial user_progression row. Never raises — cannot block signup.';

-- ============================================================================
-- 6. BACKFILL existing users
-- ============================================================================
--
-- Any user who signed up before this migration has no user_progression row.
-- Insert default rows for them. This is a one-time operation; the INSERT ...
-- ON CONFLICT DO NOTHING makes it safe to re-run.

insert into public.user_progression (user_id)
select id from auth.users
where id not in (select user_id from public.user_progression)
on conflict (user_id) do nothing;

-- ============================================================================
-- 7. record_quiz_attempt — SECURITY DEFINER RPC
-- ============================================================================
--
-- The ONLY authoritative write path for XP, credits, and progression state.
-- Called by authenticated clients after completing a quiz.
--
-- SECURITY CONTRACT:
--   - User identity is always taken from auth.uid() — never a client parameter.
--   - XP and credits are calculated server-side only.
--   - Inputs are validated against reasonable bounds.
--   - The entire operation (progression update + attempt insert) is atomic.
--   - anon cannot execute this function.

create or replace function public.record_quiz_attempt(
  _quiz_id    text,
  _mode       text,
  _score      integer,
  _correct    smallint,
  _total      smallint,
  _best_streak smallint,
  _duration_ms integer
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid            uuid;
  v_prog           public.user_progression%rowtype;
  v_xp_earned      integer;
  v_credits_earned integer;
  v_new_xp         integer;
  v_old_level      smallint;
  v_new_level      smallint;
  v_level_up       boolean;
  v_today          date;
  v_new_streak     smallint;
  v_new_longest    smallint;
  v_new_credits    integer;
  v_new_total_q    integer;
  v_new_total_c    integer;
  v_new_total_a    integer;
begin
  -- ---- Identity --------------------------------------------------------
  v_uid := auth.uid();
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  -- ---- Input validation -----------------------------------------------
  if _quiz_id is null or trim(_quiz_id) = '' then
    raise exception 'quiz_id must be non-empty';
  end if;

  if _mode not in ('solo', 'practice', 'pvp', 'multiplayer') then
    raise exception 'Invalid mode: %. Must be one of: solo, practice, pvp, multiplayer', _mode;
  end if;

  if _total is null or _total <= 0 or _total > 100 then
    raise exception 'total must be between 1 and 100, got %', _total;
  end if;

  if _correct is null or _correct < 0 or _correct > _total then
    raise exception 'correct (%) must be between 0 and total (%)', _correct, _total;
  end if;

  if _best_streak is null or _best_streak < 0 or _best_streak > _total then
    raise exception 'best_streak (%) out of valid range [0, %]', _best_streak, _total;
  end if;

  if _score is null or _score < 0 then
    raise exception 'score must be >= 0';
  end if;

  if _duration_ms is null or _duration_ms <= 0 then
    raise exception 'duration_ms must be > 0';
  end if;

  -- Reject implausibly fast submissions: minimum 200 ms average per question.
  -- This catches bots or zero-duration misfires without blocking fast humans.
  if _duration_ms < _total * 200 then
    raise exception
      'Submission rejected: duration_ms (%) is implausibly short for % questions',
      _duration_ms, _total;
  end if;

  -- ---- Server-side reward calculation ---------------------------------
  --
  -- XP formula (Phase 2C):
  --   50 XP minimum for completing any quiz (xpRules "Quiz completion +50 XP")
  --   25 XP per correct answer (scales linearly with performance)
  --   No per-quiz configuration; formula is revised when quiz content reaches DB.
  --
  -- Examples:
  --   10/10 correct  => GREATEST(50, 10*25) = 250 XP
  --    8/10 correct  => GREATEST(50,  8*25) = 200 XP
  --    5/10 correct  => GREATEST(50,  5*25) = 125 XP
  --    0/10 correct  => GREATEST(50,  0*25) =  50 XP
  v_xp_earned := greatest(50, (_correct::integer) * 25);

  -- Credits: 0 for all modes in Phase 2C.
  -- PvP win-based ledger is wired in Phase 3 when Realtime and match tracking land.
  v_credits_earned := 0;

  -- ---- Lock caller's progression row ----------------------------------
  select * into v_prog
  from public.user_progression
  where user_id = v_uid
  for update;

  if not found then
    raise exception 'user_progression row not found for uid %. Run backfill.', v_uid;
  end if;

  -- ---- Derived values -------------------------------------------------
  v_old_level  := v_prog.level;
  v_new_xp     := v_prog.xp + v_xp_earned;
  v_new_credits := v_prog.credits + v_credits_earned;
  v_new_total_q := v_prog.total_quizzes  + 1;
  v_new_total_c := v_prog.total_correct  + _correct;
  v_new_total_a := v_prog.total_answered + _total;

  -- Level from XP. Thresholds match the LEVELS ladder in
  -- src/features/progression/data/levels.ts (levels 12–20) with
  -- evenly-spaced thresholds for levels 1–11.
  v_new_level := (
    case
      when v_new_xp >= 28500 then least(99, 20 + (v_new_xp - 28500) / 2000)
      when v_new_xp >= 26200 then 19
      when v_new_xp >= 24000 then 18
      when v_new_xp >= 22000 then 17
      when v_new_xp >= 20400 then 16
      when v_new_xp >= 19000 then 15
      when v_new_xp >= 18000 then 14
      when v_new_xp >= 17200 then 13
      when v_new_xp >= 16000 then 12
      when v_new_xp >= 14800 then 11
      when v_new_xp >= 13200 then 10
      when v_new_xp >= 12000 then  9
      when v_new_xp >= 10500 then  8
      when v_new_xp >=  8000 then  7
      when v_new_xp >=  5500 then  6
      when v_new_xp >=  3500 then  5
      when v_new_xp >=  2000 then  4
      when v_new_xp >=  1000 then  3
      when v_new_xp >=   500 then  2
      else 1
    end
  )::smallint;

  v_level_up := v_new_level > v_old_level;

  -- Streak calculation.
  v_today := current_date;

  if v_prog.last_played_date is null then
    -- First quiz ever played.
    v_new_streak := 1;
  elsif v_prog.last_played_date = v_today then
    -- Already played today — streak counter unchanged.
    v_new_streak := v_prog.current_streak;
  elsif v_prog.last_played_date = v_today - interval '1 day' then
    -- Played yesterday — continue streak.
    v_new_streak := v_prog.current_streak + 1;
  else
    -- Gap of 2+ days — reset streak to 1.
    v_new_streak := 1;
  end if;

  v_new_longest := greatest(v_prog.longest_streak, v_new_streak);

  -- ---- Atomic write ---------------------------------------------------

  -- 1. Update progression.
  update public.user_progression
  set
    xp               = v_new_xp,
    level            = v_new_level,
    credits          = v_new_credits,
    total_quizzes    = v_new_total_q,
    total_correct    = v_new_total_c,
    total_answered   = v_new_total_a,
    current_streak   = v_new_streak,
    longest_streak   = v_new_longest,
    last_played_date = v_today
  where user_id = v_uid;

  -- 2. Insert immutable attempt record.
  insert into public.quiz_attempts (
    user_id, quiz_id, mode, score,
    correct, total, best_streak,
    xp_earned, credits_earned, duration_ms
  ) values (
    v_uid, _quiz_id, _mode, _score,
    _correct, _total, _best_streak,
    v_xp_earned, v_credits_earned, _duration_ms
  );

  -- ---- Return confirmed server values ---------------------------------
  return jsonb_build_object(
    'xp_earned',      v_xp_earned,
    'credits_earned', v_credits_earned,
    'new_xp',         v_new_xp,
    'new_level',      v_new_level::integer,
    'level_up',       v_level_up,
    'new_streak',     v_new_streak::integer,
    'new_credits',    v_new_credits,
    'total_quizzes',  v_new_total_q,
    'total_correct',  v_new_total_c,
    'total_answered', v_new_total_a
  );
end;
$$;

comment on function public.record_quiz_attempt(text, text, integer, smallint, smallint, smallint, integer) is
  'Authoritative progression write: validates inputs, calculates XP server-side, '
  'updates user_progression atomically, inserts immutable quiz_attempts row. '
  'SECURITY DEFINER; user identity always taken from auth.uid(). anon cannot execute.';

revoke all on function public.record_quiz_attempt(text, text, integer, smallint, smallint, smallint, integer)
  from public, anon;
grant execute on function public.record_quiz_attempt(text, text, integer, smallint, smallint, smallint, integer)
  to authenticated;
