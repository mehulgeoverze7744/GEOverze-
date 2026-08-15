-- Phase 2B — Profile persistence & preferences layer.
--
-- 1. Extends public.profiles with avatar_id and age_bracket.
-- 2. Creates public.profile_preferences (interests, skill level, UX prefs).
-- 3. Adds set_age_bracket() SECURITY DEFINER RPC — one-time write only.
-- 4. Updates handle_new_user() to also copy country_code from signup metadata.
--
-- PRESERVES all Phase 2A columns, constraints, triggers, functions, and RLS.
-- Safe to re-run: uses IF NOT EXISTS / CREATE OR REPLACE / DO $$ guards.

-- ============================================================================
-- 1. EXTEND public.profiles
-- ============================================================================

alter table public.profiles
  add column if not exists avatar_id   text,
  add column if not exists age_bracket text not null default 'unset';

-- Check constraints (guarded so re-runs are idempotent)
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_age_bracket_allowed'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_age_bracket_allowed
        check (age_bracket in ('adult', 'minor', 'unset'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_avatar_id_length'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_avatar_id_length
        check (avatar_id is null or char_length(avatar_id) between 1 and 32);
  end if;
end $$;

-- Extend the existing column-level UPDATE grant to include avatar_id.
-- age_bracket is intentionally excluded: it is written only via set_age_bracket().
grant update (avatar_id) on public.profiles to authenticated;

-- ============================================================================
-- 2. set_age_bracket — SECURITY DEFINER RPC
-- ============================================================================
--
-- Allows the authenticated caller to set their own age_bracket ONCE (from
-- 'unset' only). Changing adult → minor or vice versa is a silent no-op.
-- This prevents eligibility manipulation after the gate has been answered.

create or replace function public.set_age_bracket(_bracket text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _bracket not in ('adult', 'minor') then
    raise exception 'Invalid age_bracket value: %', _bracket;
  end if;

  update public.profiles
    set age_bracket = _bracket
  where id = auth.uid()
    and age_bracket = 'unset';
  -- Silent no-op if already set; prevents re-submission exploits.
end;
$$;

comment on function public.set_age_bracket(text) is
  'Sets the caller''s age_bracket from ''unset'' only. Cannot be changed once adult/minor is recorded. SECURITY DEFINER; anon cannot execute.';

revoke all on function public.set_age_bracket(text) from public, anon;
grant execute on function public.set_age_bracket(text) to authenticated;

-- ============================================================================
-- 3. UPDATE handle_new_user — extend to read country_code from metadata
-- ============================================================================
--
-- CREATE OR REPLACE replaces the Phase 2A body without touching the trigger
-- or any other object. All existing logic is preserved; country_code is the
-- only addition.

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
      -- Requested username already taken; profile is created without it
      -- so signup is never blocked. User can choose another username later.
      insert into public.profiles (id, display_name, country_code)
      values (
        new.id,
        nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
        requested_country
      )
      on conflict (id) do nothing;
  end;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Runs after every auth.users insert. Creates the matching profile row (username, display_name, country_code) and grants the default "user" role. Never raises — cannot block signup.';

-- ============================================================================
-- 4. profile_preferences TABLE
-- ============================================================================

create table if not exists public.profile_preferences (
  user_id     uuid        primary key references auth.users (id) on delete cascade,
  interests   text[]      not null default '{}',
  skill_level text,
  locale      text        not null default 'en',
  motion_pref text        not null default 'system',
  units_pref  text        not null default 'metric',
  toggles     jsonb       not null default '{"starfield":true,"soundEffects":true,"notifySeasons":true,"notifyQuizzes":true,"notifyStore":false,"notifyProduct":false,"notifyEmailDigest":true,"publicProfile":true,"showOnLeaderboards":true,"analytics":false}'::jsonb,
  updated_at  timestamptz not null default now()
);

comment on table public.profile_preferences is
  'Per-user UX preferences (interests, skill level, locale, motion, units, toggles). 1:1 with auth.users; created during onboarding.';

-- Constraints
do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'prefs_skill_level_allowed'
      and conrelid = 'public.profile_preferences'::regclass
  ) then
    alter table public.profile_preferences
      add constraint prefs_skill_level_allowed
        check (skill_level is null or skill_level in ('beginner', 'intermediate', 'advanced', 'explorer'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'prefs_motion_allowed'
      and conrelid = 'public.profile_preferences'::regclass
  ) then
    alter table public.profile_preferences
      add constraint prefs_motion_allowed
        check (motion_pref in ('system', 'reduced', 'full'));
  end if;
end $$;

do $$ begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'prefs_units_allowed'
      and conrelid = 'public.profile_preferences'::regclass
  ) then
    alter table public.profile_preferences
      add constraint prefs_units_allowed
        check (units_pref in ('metric', 'imperial'));
  end if;
end $$;

-- Reuse the existing set_updated_at trigger function (no redefinition needed).
drop trigger if exists profile_preferences_set_updated_at on public.profile_preferences;
create trigger profile_preferences_set_updated_at
  before update on public.profile_preferences
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- 5. RLS FOR profile_preferences
-- ============================================================================

alter table public.profile_preferences enable row level security;

revoke all on public.profile_preferences from anon, authenticated;
grant select, insert, update on public.profile_preferences to authenticated;

drop policy if exists prefs_select_own on public.profile_preferences;
create policy prefs_select_own
  on public.profile_preferences
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists prefs_insert_own on public.profile_preferences;
create policy prefs_insert_own
  on public.profile_preferences
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists prefs_update_own on public.profile_preferences;
create policy prefs_update_own
  on public.profile_preferences
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No DELETE policy for normal clients.
-- Row removal happens only through auth.users ON DELETE CASCADE.
