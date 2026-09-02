-- =============================================================================
-- Phase GL-7/GL-8/GL-9 — GEOlibrary user state, search, tier access
--
-- Depends on: 20260901120000_phase_gl1_library_foundation.sql
--
-- GL-7: user_library_bookmarks, user_library_progress, user_library_likes
-- GL-8: library_resources.search_vector + refresh triggers
-- GL-9: tier-aware published resource/block visibility
--
-- Does NOT touch billing payment flows, Razorpay, or quiz schema.
-- Safe to re-run where practical.
-- =============================================================================


-- =============================================================================
-- GL-7a — user_library_bookmarks
-- =============================================================================

create table if not exists public.user_library_bookmarks (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  resource_id uuid        not null references public.library_resources (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, resource_id)
);

comment on table public.user_library_bookmarks is
  'Per-user GEOlibrary bookmarks. Composite PK prevents duplicates.';

create index if not exists user_library_bookmarks_user_created_idx
  on public.user_library_bookmarks (user_id, created_at desc);


-- =============================================================================
-- GL-7b — user_library_progress
-- =============================================================================

create table if not exists public.user_library_progress (
  user_id           uuid        not null references auth.users (id) on delete cascade,
  resource_id       uuid        not null references public.library_resources (id) on delete cascade,
  progress_percent  smallint    not null default 0,
  completed_at      timestamptz,
  updated_at        timestamptz not null default now(),
  primary key (user_id, resource_id),
  constraint user_library_progress_percent_range check (
    progress_percent >= 0 and progress_percent <= 100
  )
);

comment on table public.user_library_progress is
  'Per-user GEOlibrary reading progress. Upserts use greatest() for monotonic merge.';

create index if not exists user_library_progress_user_updated_idx
  on public.user_library_progress (user_id, updated_at desc);


-- =============================================================================
-- GL-7c — user_library_likes
-- =============================================================================

create table if not exists public.user_library_likes (
  user_id     uuid        not null references auth.users (id) on delete cascade,
  resource_id uuid        not null references public.library_resources (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (user_id, resource_id)
);

comment on table public.user_library_likes is
  'Per-user GEOlibrary likes. Composite PK prevents duplicates.';

create index if not exists user_library_likes_user_created_idx
  on public.user_library_likes (user_id, created_at desc);


-- =============================================================================
-- GL-7d — updated_at trigger (progress)
-- =============================================================================

drop trigger if exists user_library_progress_set_updated_at on public.user_library_progress;
create trigger user_library_progress_set_updated_at
  before update on public.user_library_progress
  for each row
  execute function public.set_updated_at();


-- =============================================================================
-- GL-7e — RLS: user-owned tables
-- =============================================================================

alter table public.user_library_bookmarks enable row level security;
alter table public.user_library_progress enable row level security;
alter table public.user_library_likes enable row level security;

revoke all on public.user_library_bookmarks from anon, authenticated;
revoke all on public.user_library_progress from anon, authenticated;
revoke all on public.user_library_likes from anon, authenticated;

grant select, insert, delete on public.user_library_bookmarks to authenticated;
grant select, insert, update, delete on public.user_library_progress to authenticated;
grant select, insert, delete on public.user_library_likes to authenticated;

-- bookmarks
drop policy if exists user_library_bookmarks_select_own on public.user_library_bookmarks;
create policy user_library_bookmarks_select_own
  on public.user_library_bookmarks for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_library_bookmarks_insert_own on public.user_library_bookmarks;
create policy user_library_bookmarks_insert_own
  on public.user_library_bookmarks for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_library_bookmarks_delete_own on public.user_library_bookmarks;
create policy user_library_bookmarks_delete_own
  on public.user_library_bookmarks for delete to authenticated
  using (user_id = (select auth.uid()));

-- progress
drop policy if exists user_library_progress_select_own on public.user_library_progress;
create policy user_library_progress_select_own
  on public.user_library_progress for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_library_progress_insert_own on public.user_library_progress;
create policy user_library_progress_insert_own
  on public.user_library_progress for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_library_progress_update_own on public.user_library_progress;
create policy user_library_progress_update_own
  on public.user_library_progress for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists user_library_progress_delete_own on public.user_library_progress;
create policy user_library_progress_delete_own
  on public.user_library_progress for delete to authenticated
  using (user_id = (select auth.uid()));

-- likes
drop policy if exists user_library_likes_select_own on public.user_library_likes;
create policy user_library_likes_select_own
  on public.user_library_likes for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists user_library_likes_insert_own on public.user_library_likes;
create policy user_library_likes_insert_own
  on public.user_library_likes for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists user_library_likes_delete_own on public.user_library_likes;
create policy user_library_likes_delete_own
  on public.user_library_likes for delete to authenticated
  using (user_id = (select auth.uid()));


-- =============================================================================
-- GL-8a — search_vector on library_resources
-- =============================================================================

alter table public.library_resources
  add column if not exists search_vector tsvector;

comment on column public.library_resources.search_vector is
  'Weighted FTS document for published browse/search (GL-8). Refreshed by trigger.';

create index if not exists library_resources_search_vector_gin_idx
  on public.library_resources using gin (search_vector);


-- =============================================================================
-- GL-8b — search vector refresh helpers
-- =============================================================================

create or replace function public.library_block_search_text(_payload jsonb, _kind public.library_block_kind)
returns text
language sql
immutable
as $$
  select case _kind
    when 'heading' then coalesce(_payload->>'text', '')
    when 'paragraph' then coalesce(_payload->>'text', '')
    when 'quote' then coalesce(_payload->>'text', '')
    when 'didYouKnow' then coalesce(_payload->>'text', '')
    when 'list' then coalesce(
      (
        select string_agg(value, ' ')
        from jsonb_array_elements_text(coalesce(_payload->'items', '[]'::jsonb)) as value
      ),
      ''
    )
    when 'facts' then coalesce(_payload->>'title', '') || ' ' || coalesce(
      (
        select string_agg(
          coalesce(f->>'label', '') || ' ' || coalesce(f->>'value', ''),
          ' '
        )
        from jsonb_array_elements(coalesce(_payload->'facts', '[]'::jsonb)) as f
      ),
      ''
    )
    when 'image' then coalesce(_payload->>'caption', '') || ' ' || coalesce(_payload->>'art', '')
    when 'map' then coalesce(_payload->>'caption', '') || ' ' || coalesce(_payload->>'region', '')
    else ''
  end;
$$;

create or replace function public.library_refresh_resource_search_vector(_resource_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row public.library_resources;
  v_block_text text;
begin
  select *
  into v_row
  from public.library_resources lr
  where lr.id = _resource_id;

  if not found then
    return;
  end if;

  select coalesce(string_agg(public.library_block_search_text(b.payload, b.kind), ' '), '')
  into v_block_text
  from public.library_resource_blocks b
  where b.resource_id = _resource_id;

  update public.library_resources lr
  set search_vector =
    setweight(to_tsvector('english', coalesce(v_row.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(v_row.dek, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(array_to_string(v_row.tags, ' '), '')), 'B') ||
    setweight(to_tsvector('english', coalesce(v_row.subject_category, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(v_row.continent, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(v_row.author_handle, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(v_block_text, '')), 'D')
  where lr.id = _resource_id;
end;
$$;

comment on function public.library_refresh_resource_search_vector(uuid) is
  'Rebuilds library_resources.search_vector from metadata and block text.';

revoke all on function public.library_block_search_text(jsonb, public.library_block_kind) from public;
revoke all on function public.library_refresh_resource_search_vector(uuid) from public;

create or replace function public.library_resources_search_vector_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.library_refresh_resource_search_vector(
    case when tg_op = 'DELETE' then old.id else new.id end
  );
  return coalesce(new, old);
end;
$$;

create or replace function public.library_resource_blocks_search_vector_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  perform public.library_refresh_resource_search_vector(
    case when tg_op = 'DELETE' then old.resource_id else new.resource_id end
  );
  return coalesce(new, old);
end;
$$;

drop trigger if exists library_resources_refresh_search_vector on public.library_resources;
create trigger library_resources_refresh_search_vector
  after insert or update of title, dek, tags, subject_category, continent, author_handle, status
  on public.library_resources
  for each row
  execute function public.library_resources_search_vector_trigger();

drop trigger if exists library_resource_blocks_refresh_search_vector on public.library_resource_blocks;
create trigger library_resource_blocks_refresh_search_vector
  after insert or update or delete
  on public.library_resource_blocks
  for each row
  execute function public.library_resource_blocks_search_vector_trigger();


-- =============================================================================
-- GL-9a — tier rank + access helpers
-- =============================================================================

create or replace function public.library_tier_rank(_tier text)
returns integer
language sql
immutable
as $$
  select case _tier
    when 'explorer' then 0
    when 'basic' then 1
    when 'pro' then 2
    when 'advance' then 3
    else 0
  end;
$$;

comment on function public.library_tier_rank(text) is
  'Numeric rank for subscription_plans.tier values used by GEOlibrary access checks.';

create or replace function public.library_user_can_access_resource(
  _resource_id uuid,
  _user_id uuid default auth.uid()
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.library_resources lr
    where lr.id = _resource_id
      and lr.status = 'published'
      and (
        lr.min_access_tier is null
        or (
          _user_id is not null
          and public.library_tier_rank(public.resolve_user_subscription_tier(_user_id))
              >= public.library_tier_rank(lr.min_access_tier)
        )
      )
  );
$$;

comment on function public.library_user_can_access_resource(uuid, uuid) is
  'True when a published resource is free (NULL tier) or the user subscription tier is sufficient.';

revoke all on function public.library_tier_rank(text) from public;
revoke all on function public.library_user_can_access_resource(uuid, uuid) from public;
grant execute on function public.library_user_can_access_resource(uuid, uuid) to anon, authenticated;


-- =============================================================================
-- GL-9b — replace published visibility policies (tier-aware)
-- =============================================================================

drop policy if exists library_resources_select_published on public.library_resources;
create policy library_resources_select_published
  on public.library_resources
  for select
  to anon, authenticated
  using (
    status = 'published'
    and public.library_user_can_access_resource(id, (select auth.uid()))
  );

drop policy if exists library_resource_blocks_select_published on public.library_resource_blocks;
create policy library_resource_blocks_select_published
  on public.library_resource_blocks
  for select
  to anon, authenticated
  using (
    public.library_user_can_access_resource(resource_id, (select auth.uid()))
  );


-- =============================================================================
-- GL-7f — monotonic progress upsert helper (optional server-side merge)
-- =============================================================================

create or replace function public.upsert_library_progress(
  _resource_id uuid,
  _progress_percent smallint,
  _completed boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_percent smallint := greatest(0, least(100, coalesce(_progress_percent, 0)));
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  insert into public.user_library_progress as p (
    user_id,
    resource_id,
    progress_percent,
    completed_at,
    updated_at
  )
  values (
    v_uid,
    _resource_id,
    v_percent,
    case when _completed or v_percent >= 100 then now() else null end,
    now()
  )
  on conflict (user_id, resource_id) do update
  set
    progress_percent = greatest(p.progress_percent, excluded.progress_percent),
    completed_at = coalesce(p.completed_at, excluded.completed_at),
    updated_at = now();
end;
$$;

comment on function public.upsert_library_progress(uuid, smallint, boolean) is
  'Monotonic progress upsert for authenticated users. Never decreases progress_percent.';

revoke all on function public.upsert_library_progress(uuid, smallint, boolean) from public;
grant execute on function public.upsert_library_progress(uuid, smallint, boolean) to authenticated;


-- =============================================================================
-- GL-8c — backfill search vectors for existing resources
-- =============================================================================

do $$
declare
  r record;
begin
  if to_regclass('public.library_resources') is null then
    return;
  end if;

  for r in select id from public.library_resources loop
    perform public.library_refresh_resource_search_vector(r.id);
  end loop;
end $$;


-- =============================================================================
-- Verification (static — runs only when GL-1 tables already exist)
-- =============================================================================

do $$
declare
  c_bookmarks int;
  c_progress int;
  c_likes int;
begin
  if to_regclass('public.library_resources') is null then
    raise notice 'GL-789 verification skipped: GL-1 foundation not applied yet.';
    return;
  end if;

  select count(*) into c_bookmarks from pg_policies where tablename = 'user_library_bookmarks';
  select count(*) into c_progress from pg_policies where tablename = 'user_library_progress';
  select count(*) into c_likes from pg_policies where tablename = 'user_library_likes';

  if c_bookmarks < 3 then
    raise exception 'GL-789: expected >= 3 bookmark policies, got %', c_bookmarks;
  end if;
  if c_progress < 4 then
    raise exception 'GL-789: expected >= 4 progress policies, got %', c_progress;
  end if;
  if c_likes < 3 then
    raise exception 'GL-789: expected >= 3 like policies, got %', c_likes;
  end if;

  if not exists (
    select 1 from pg_indexes where indexname = 'library_resources_search_vector_gin_idx'
  ) then
    raise exception 'GL-789: search_vector GIN index missing';
  end if;

  raise notice 'GL-789 verification OK';
end $$;
