-- =============================================================================
-- GEOlibrary Batch 5A — engagement foundation (staging-safe)
--
-- Adds aggregate engagement metrics without weakening content RLS:
--   library_resource_stats       — counter store (no client access)
--   user_library_view_dedupe     — authenticated view dedupe (no client access)
--   record_library_view(uuid)    — SECURITY DEFINER view recording RPC
--   like/bookmark counter triggers on user_library_* source tables
--   library_catalogue_resources  — exposes aggregate counts only
--
-- Source of truth remains user_library_likes / user_library_bookmarks.
-- Initial backfill covers published resources only; triggers upsert stats rows
-- for resources that gain engagement before a dedicated stats row exists.
-- =============================================================================


-- =============================================================================
-- 1. library_resource_stats
-- =============================================================================

create table if not exists public.library_resource_stats (
  resource_id     uuid        primary key references public.library_resources (id) on delete cascade,
  view_count      bigint      not null default 0,
  like_count      bigint      not null default 0,
  bookmark_count  bigint      not null default 0,
  updated_at      timestamptz not null default now(),
  constraint library_resource_stats_view_count_nonneg check (view_count >= 0),
  constraint library_resource_stats_like_count_nonneg check (like_count >= 0),
  constraint library_resource_stats_bookmark_count_nonneg check (bookmark_count >= 0)
);

comment on table public.library_resource_stats is
  'Aggregate GEOlibrary engagement counters. Not client-readable; exposed via library_catalogue_resources only.';

alter table public.library_resource_stats enable row level security;

revoke all on public.library_resource_stats from public, anon, authenticated;


-- =============================================================================
-- 2. Source-table indexes for aggregation
-- =============================================================================

create index if not exists user_library_likes_resource_id_idx
  on public.user_library_likes (resource_id);

create index if not exists user_library_bookmarks_resource_id_idx
  on public.user_library_bookmarks (resource_id);


-- =============================================================================
-- 3. Backfill published resource stats (views start at 0)
-- =============================================================================

insert into public.library_resource_stats (resource_id, view_count, like_count, bookmark_count)
select
  lr.id,
  0,
  coalesce(l.like_count, 0),
  coalesce(b.bookmark_count, 0)
from public.library_resources lr
left join (
  select resource_id, count(*)::bigint as like_count
  from public.user_library_likes
  group by resource_id
) l on l.resource_id = lr.id
left join (
  select resource_id, count(*)::bigint as bookmark_count
  from public.user_library_bookmarks
  group by resource_id
) b on b.resource_id = lr.id
where lr.status = 'published'::public.library_resource_status
on conflict (resource_id) do nothing;


-- =============================================================================
-- 4. Like counter triggers
-- =============================================================================

create or replace function public.library_resource_stats_on_like_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.library_resource_stats (resource_id, like_count)
  values (new.resource_id, 1)
  on conflict (resource_id) do update
    set like_count = public.library_resource_stats.like_count + 1,
        updated_at = now();

  return new;
end;
$$;

create or replace function public.library_resource_stats_on_like_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.library_resource_stats
    set like_count = greatest(like_count - 1, 0),
        updated_at = now()
  where resource_id = old.resource_id;

  return old;
end;
$$;

drop trigger if exists library_resource_stats_like_insert on public.user_library_likes;
create trigger library_resource_stats_like_insert
  after insert on public.user_library_likes
  for each row
  execute function public.library_resource_stats_on_like_insert();

drop trigger if exists library_resource_stats_like_delete on public.user_library_likes;
create trigger library_resource_stats_like_delete
  after delete on public.user_library_likes
  for each row
  execute function public.library_resource_stats_on_like_delete();


-- =============================================================================
-- 5. Bookmark counter triggers
-- =============================================================================

create or replace function public.library_resource_stats_on_bookmark_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.library_resource_stats (resource_id, bookmark_count)
  values (new.resource_id, 1)
  on conflict (resource_id) do update
    set bookmark_count = public.library_resource_stats.bookmark_count + 1,
        updated_at = now();

  return new;
end;
$$;

create or replace function public.library_resource_stats_on_bookmark_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.library_resource_stats
    set bookmark_count = greatest(bookmark_count - 1, 0),
        updated_at = now()
  where resource_id = old.resource_id;

  return old;
end;
$$;

drop trigger if exists library_resource_stats_bookmark_insert on public.user_library_bookmarks;
create trigger library_resource_stats_bookmark_insert
  after insert on public.user_library_bookmarks
  for each row
  execute function public.library_resource_stats_on_bookmark_insert();

drop trigger if exists library_resource_stats_bookmark_delete on public.user_library_bookmarks;
create trigger library_resource_stats_bookmark_delete
  after delete on public.user_library_bookmarks
  for each row
  execute function public.library_resource_stats_on_bookmark_delete();


-- =============================================================================
-- 6. View dedupe table (server-only)
-- =============================================================================

create table if not exists public.user_library_view_dedupe (
  user_id          uuid        not null references auth.users (id) on delete cascade,
  resource_id      uuid        not null references public.library_resources (id) on delete cascade,
  last_counted_at  timestamptz not null,
  primary key (user_id, resource_id)
);

comment on table public.user_library_view_dedupe is
  'Authenticated GEOlibrary view dedupe window (6h). Accessible only via record_library_view().';

alter table public.user_library_view_dedupe enable row level security;

revoke all on public.user_library_view_dedupe from public, anon, authenticated;


-- =============================================================================
-- 7. record_library_view(resource_id) — authenticated, 6-hour dedupe
-- =============================================================================

create or replace function public.record_library_view(_resource_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_counted boolean := false;
  v_view_count bigint;
  v_rows_affected bigint;
begin
  v_user_id := auth.uid();
  if v_user_id is null then
    raise exception 'Authentication required'
      using errcode = '42501';
  end if;

  if _resource_id is null then
    raise exception 'resource_id is required'
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.library_resources lr
    where lr.id = _resource_id
      and lr.status = 'published'::public.library_resource_status
  ) then
    raise exception 'Published library resource not found'
      using errcode = 'P0002';
  end if;

  with upsert as (
    insert into public.user_library_view_dedupe as d (user_id, resource_id, last_counted_at)
    values (v_user_id, _resource_id, now())
    on conflict (user_id, resource_id) do update
      set last_counted_at = now()
    where d.last_counted_at <= now() - interval '6 hours'
    returning 1 as counted
  )
  insert into public.library_resource_stats (resource_id, view_count)
  select _resource_id, 1
  from upsert
  on conflict (resource_id) do update
    set view_count = public.library_resource_stats.view_count + 1,
        updated_at = now();

  get diagnostics v_rows_affected = row_count;
  v_counted := v_rows_affected > 0;

  select coalesce(s.view_count, 0)
    into v_view_count
  from public.library_resource_stats s
  where s.resource_id = _resource_id;

  if v_view_count is null then
    v_view_count := 0;
  end if;

  return jsonb_build_object(
    'counted', v_counted,
    'view_count', v_view_count
  );
end;
$$;

comment on function public.record_library_view(uuid) is
  'Records one authenticated GEOlibrary view per user/resource per 6 hours. Does not expose article content.';

revoke all on function public.record_library_view(uuid) from public, anon;
grant execute on function public.record_library_view(uuid) to authenticated;


-- =============================================================================
-- 8. Extend catalogue discovery view with aggregate metrics
-- =============================================================================

create or replace view public.library_catalogue_resources
with (security_invoker = false) as
select
  lr.id,
  lr.slug,
  lr.title,
  lr.dek,
  lr.resource_kind,
  lr.subject_category,
  lr.continent,
  lr.difficulty,
  lr.read_time_minutes,
  lr.language,
  lr.tags,
  lr.featured,
  lr.author_handle,
  lr.cover_art_key,
  lr.cover_label,
  lr.min_access_tier,
  lr.published_at,
  lr.status,
  lr.search_vector,
  coalesce(st.view_count, 0)::bigint     as view_count,
  coalesce(st.like_count, 0)::bigint     as like_count,
  coalesce(st.bookmark_count, 0)::bigint as bookmark_count
from public.library_resources lr
left join public.library_resource_stats st on st.resource_id = lr.id
where lr.status = 'published'::public.library_resource_status;

comment on view public.library_catalogue_resources is
  'Read-only GEOlibrary catalogue metadata for discovery. All published resources; aggregate engagement only; excludes block/body content.';

revoke all on public.library_catalogue_resources from public;
grant select on public.library_catalogue_resources to anon, authenticated;
