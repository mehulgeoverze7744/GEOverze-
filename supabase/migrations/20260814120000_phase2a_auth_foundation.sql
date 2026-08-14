-- Phase 2A — Foundational authentication & authorization layer for GEOverze.
--
-- Creates:
--   - public.app_role enum
--   - public.profiles       (1:1 with auth.users)
--   - public.user_roles     (role assignments, many-per-user allowed but no duplicates)
--   - public.has_role / public.is_admin   (SECURITY DEFINER helpers, avoid RLS recursion)
--   - public.handle_new_user trigger      (creates profile + default role on signup)
--   - RLS policies for both tables (least privilege)
--
-- Out of scope (by design, per Phase 2A instructions): quizzes, credits, community,
-- store, payments, and every other domain table. Nothing here touches auth.users
-- beyond a single AFTER INSERT trigger; Supabase Auth remains the source of truth
-- for credentials.
--
-- Safe to re-run: every statement is guarded (IF NOT EXISTS / OR REPLACE / DROP ... IF EXISTS).

-- ============================================================================
-- 1. ROLE ENUM
-- ============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_role') then
    create type public.app_role as enum ('user', 'creator', 'admin', 'super_admin');
  end if;
end
$$;

-- ============================================================================
-- 2. PROFILES
-- ============================================================================

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  country_code text,
  date_of_birth date,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (
    username is null or char_length(username) between 3 and 24
  ),
  constraint profiles_username_format check (
    username is null or username ~ '^[a-zA-Z0-9_]+$'
  ),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 500),
  constraint profiles_country_code_format check (
    country_code is null or country_code ~ '^[A-Z]{2}$'
  ),
  constraint profiles_status_allowed check (
    status in ('active', 'suspended', 'banned', 'deleted')
  )
);

comment on table public.profiles is
  'Public profile data for an auth.users row. One-to-one with auth.users; created automatically by handle_new_user().';

-- Case-insensitive uniqueness, but only enforced once a username is set.
create unique index if not exists profiles_username_lower_key
  on public.profiles (lower(username))
  where username is not null;

create index if not exists profiles_status_idx on public.profiles (status);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

-- ============================================================================
-- 3. USER ROLES
-- ============================================================================

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.app_role not null,
  created_at timestamptz not null default now(),
  constraint user_roles_unique_user_role unique (user_id, role)
);

comment on table public.user_roles is
  'Role grants for a user. A user may hold more than one role; the same role cannot be assigned twice.';

create index if not exists user_roles_user_id_idx on public.user_roles (user_id);

-- ============================================================================
-- 4. ROLE-CHECK HELPERS (SECURITY DEFINER — avoids RLS self-recursion)
-- ============================================================================

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  );
$$;

comment on function public.has_role(uuid, public.app_role) is
  'Server-side role check. SECURITY DEFINER so RLS policies on user_roles can call it without recursing into themselves.';

create or replace function public.is_admin(_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(_user_id, 'admin') or public.has_role(_user_id, 'super_admin');
$$;

comment on function public.is_admin(uuid) is
  'True if the given user (defaults to the caller) holds admin or super_admin. Safe to call via RPC from a trusted client for route gating.';

revoke all on function public.has_role(uuid, public.app_role) from public;
revoke all on function public.is_admin(uuid) from public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_admin(uuid) to authenticated;

-- ============================================================================
-- 5. NEW USER PROVISIONING (profile + default role)
-- ============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_username text;
begin
  requested_username := nullif(trim(new.raw_user_meta_data ->> 'username'), '');

  begin
    insert into public.profiles (id, username, display_name)
    values (
      new.id,
      requested_username,
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), '')
    )
    on conflict (id) do nothing;
  exception
    when unique_violation then
      -- Requested username was already taken by another account; keep the
      -- profile creation from ever blocking signup and leave username unset
      -- so the user can choose another one later.
      insert into public.profiles (id, display_name)
      values (new.id, nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''))
      on conflict (id) do nothing;
  end;

  insert into public.user_roles (user_id, role)
  values (new.id, 'user')
  on conflict (user_id, role) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Runs after every auth.users insert. Creates the matching profile row and grants the default "user" role. Never raises, so it cannot block signup.';

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

-- Lock down table-level grants first; RLS policies below layer on top of these.
revoke all on public.profiles from anon, authenticated;
revoke all on public.user_roles from anon, authenticated;

grant select on public.profiles to authenticated;
-- Column-level grant: authenticated users may only ever update the fields
-- they are allowed to edit themselves. "status" is intentionally excluded so
-- suspending/banning a user requires a privileged, server-side path.
grant update (username, display_name, avatar_url, bio, country_code, date_of_birth)
  on public.profiles to authenticated;

grant select on public.user_roles to authenticated;

-- --- profiles policies ------------------------------------------------------

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policies for authenticated users: rows are created only by
-- handle_new_user() (SECURITY DEFINER, bypasses RLS) and removed only via the
-- auth.users cascade.

-- --- user_roles policies -----------------------------------------------------

drop policy if exists user_roles_select_own on public.user_roles;
create policy user_roles_select_own
  on public.user_roles
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists user_roles_select_admin on public.user_roles;
create policy user_roles_select_admin
  on public.user_roles
  for select
  to authenticated
  using (public.is_admin());

-- Role management (grant/revoke) is restricted to super_admin. Regular admins
-- can read roles but cannot mint new admins or promote themselves.
drop policy if exists user_roles_write_super_admin on public.user_roles;
create policy user_roles_write_super_admin
  on public.user_roles
  for insert
  to authenticated
  with check (public.has_role(auth.uid(), 'super_admin'));

drop policy if exists user_roles_update_super_admin on public.user_roles;
create policy user_roles_update_super_admin
  on public.user_roles
  for update
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'))
  with check (public.has_role(auth.uid(), 'super_admin'));

drop policy if exists user_roles_delete_super_admin on public.user_roles;
create policy user_roles_delete_super_admin
  on public.user_roles
  for delete
  to authenticated
  using (public.has_role(auth.uid(), 'super_admin'));
