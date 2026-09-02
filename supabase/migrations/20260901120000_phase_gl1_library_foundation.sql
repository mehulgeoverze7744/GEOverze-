-- =============================================================================
-- Phase GL-1/GL-2/GL-3 — GEOlibrary schema, RLS, and storage foundation
--
-- Creates:
--   - library enums
--   - library_creators, library_resources, library_resource_blocks
--   - library_collections, library_collection_items
--   - RLS policies (ownership-aware creator model; quiz CMS pattern baseline)
--   - library-media storage bucket (private) + path-aware policies
--
-- Does NOT:
--   - seed content (GL-4)
--   - create user bookmark/progress/likes tables (GL-7)
--   - modify quiz, billing, payment, or subscription payment flows
--   - touch Razorpay
--
-- Safe to re-run: IF NOT EXISTS / DROP IF EXISTS guards where practical.
-- =============================================================================


-- =============================================================================
-- GL-1a — ENUMS
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_type where typname = 'library_resource_status') then
    create type public.library_resource_status as enum (
      'draft',
      'pending',
      'published',
      'archived'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'library_resource_kind') then
    create type public.library_resource_kind as enum (
      'article',
      'country_profile',
      'continent_collection',
      'map',
      'infographic',
      'pdf',
      'educational_resource'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'library_difficulty') then
    create type public.library_difficulty as enum (
      'beginner',
      'intermediate',
      'advanced',
      'expert'
    );
  end if;

  if not exists (select 1 from pg_type where typname = 'library_block_kind') then
    create type public.library_block_kind as enum (
      'heading',
      'paragraph',
      'list',
      'quote',
      'image',
      'map',
      'facts',
      'didYouKnow',
      'table',
      'reference'
    );
  end if;
end;
$$;


-- =============================================================================
-- GL-1b — library_creators (public persona; optional auth link)
-- =============================================================================

create table if not exists public.library_creators (
  handle                   text        primary key,
  display_name             text        not null,
  role                     text        not null,
  bio                      text        not null,
  art_key                  text        not null,
  verified                 boolean     not null default false,
  location                 text,
  joined_at                date        not null,
  featured_collection_slug text,
  user_id                  uuid        references auth.users (id) on delete set null,
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now(),
  constraint library_creators_handle_nonempty check (
    btrim(handle) <> ''
  ),
  constraint library_creators_display_name_nonempty check (
    btrim(display_name) <> ''
  ),
  constraint library_creators_role_nonempty check (
    btrim(role) <> ''
  ),
  constraint library_creators_bio_nonempty check (
    btrim(bio) <> ''
  ),
  constraint library_creators_art_key_nonempty check (
    btrim(art_key) <> ''
  )
);

comment on table public.library_creators is
  'Public GEOlibrary creator personas. May exist without a linked auth user (editorial collectives).';

comment on column public.library_creators.user_id is
  'Optional link to auth.users. When set, the creator may update their own persona via RLS.';

create unique index if not exists library_creators_user_id_unique_idx
  on public.library_creators (user_id)
  where user_id is not null;

create index if not exists library_creators_joined_at_idx
  on public.library_creators (joined_at desc);


-- =============================================================================
-- GL-1c — library_resources
-- =============================================================================

create table if not exists public.library_resources (
  id                   uuid                     primary key default gen_random_uuid(),
  slug                 text                     not null,
  title                text                     not null,
  dek                  text                     not null,
  resource_kind        public.library_resource_kind not null default 'article',
  subject_category     text                     not null,
  continent            text                     not null default 'global',
  difficulty           public.library_difficulty not null default 'beginner',
  read_time_minutes    smallint                 not null default 5,
  language             text                     not null default 'English',
  country              text,
  region               text,
  tags                 text[]                   not null default '{}'::text[],
  status               public.library_resource_status not null default 'draft',
  featured             boolean                  not null default false,
  author_handle        text                     not null,
  author_user_id       uuid                     references auth.users (id) on delete set null,
  cover_art_key        text,
  cover_label          text,
  gallery_paths        text[]                   not null default '{}'::text[],
  attachments          jsonb                    not null default '[]'::jsonb,
  min_access_tier      text                     references public.subscription_plans (tier) on delete set null,
  seo_meta_title       text,
  seo_meta_description text,
  seo_canonical_path   text,
  seo_og_title         text,
  seo_og_description   text,
  seo_keywords         text[]                   not null default '{}'::text[],
  published_at         timestamptz,
  created_by           uuid                     references auth.users (id) on delete set null,
  updated_by           uuid                     references auth.users (id) on delete set null,
  created_at           timestamptz              not null default now(),
  updated_at           timestamptz              not null default now(),
  constraint library_resources_slug_unique unique (slug),
  constraint library_resources_slug_nonempty check (
    btrim(slug) <> ''
  ),
  constraint library_resources_title_nonempty check (
    btrim(title) <> ''
  ),
  constraint library_resources_dek_nonempty check (
    btrim(dek) <> ''
  ),
  constraint library_resources_read_time_positive check (
    read_time_minutes > 0
  ),
  constraint library_resources_language_nonempty check (
    btrim(language) <> ''
  ),
  constraint library_resources_subject_category_allowed check (
    subject_category in (
      'countries',
      'capitals',
      'flags',
      'landmarks',
      'physical',
      'oceans',
      'culture',
      'climate',
      'heritage',
      'basics'
    )
  ),
  constraint library_resources_continent_allowed check (
    continent in (
      'africa',
      'asia',
      'europe',
      'north-america',
      'south-america',
      'oceania',
      'antarctica',
      'global'
    )
  ),
  constraint library_resources_author_handle_fkey
    foreign key (author_handle)
    references public.library_creators (handle)
    on delete restrict
);

comment on table public.library_resources is
  'GEOlibrary resources. Block content stored in library_resource_blocks.';

comment on column public.library_resources.resource_kind is
  'Admin editorial format (article, map, pdf, etc.). Orthogonal to subject_category browse facet.';

comment on column public.library_resources.subject_category is
  'Public browse facet. Values mirror geoverze-public-main library taxonomy.ts CategoryId.';

comment on column public.library_resources.min_access_tier is
  'Minimum subscription tier required to read. NULL = no tier gate (GL-9 enforcement deferred).';

create index if not exists library_resources_status_published_at_idx
  on public.library_resources (status, published_at desc);

create index if not exists library_resources_subject_category_status_idx
  on public.library_resources (subject_category, status);

create index if not exists library_resources_continent_status_idx
  on public.library_resources (continent, status);

create index if not exists library_resources_author_handle_status_idx
  on public.library_resources (author_handle, status);

create index if not exists library_resources_featured_published_idx
  on public.library_resources (featured)
  where featured = true and status = 'published';

create index if not exists library_resources_tags_gin_idx
  on public.library_resources using gin (tags);


-- =============================================================================
-- GL-1d — library_resource_blocks
-- =============================================================================

create table if not exists public.library_resource_blocks (
  id          uuid                   primary key default gen_random_uuid(),
  resource_id uuid                   not null references public.library_resources (id) on delete cascade,
  position    integer                not null,
  kind        public.library_block_kind not null,
  payload     jsonb                  not null,
  created_at  timestamptz            not null default now(),
  updated_at  timestamptz            not null default now(),
  constraint library_resource_blocks_position_non_negative check (
    position >= 0
  ),
  constraint library_resource_blocks_resource_position_unique unique (resource_id, position)
);

comment on table public.library_resource_blocks is
  'Ordered typed content blocks. Payload shape validated in application code.';

create index if not exists library_resource_blocks_resource_position_idx
  on public.library_resource_blocks (resource_id, position);


-- =============================================================================
-- GL-1e — library_collections
-- =============================================================================

create table if not exists public.library_collections (
  id                uuid                     primary key default gen_random_uuid(),
  slug              text                     not null,
  title             text                     not null,
  description       text                     not null,
  art_key           text                     not null,
  subject_category  text                     not null,
  continent         text                     not null default 'global',
  curator_handle    text                     not null,
  featured          boolean                  not null default false,
  status            public.library_resource_status not null default 'published',
  published_at      timestamptz,
  created_at        timestamptz              not null default now(),
  updated_at        timestamptz              not null default now(),
  constraint library_collections_slug_unique unique (slug),
  constraint library_collections_slug_nonempty check (
    btrim(slug) <> ''
  ),
  constraint library_collections_title_nonempty check (
    btrim(title) <> ''
  ),
  constraint library_collections_description_nonempty check (
    btrim(description) <> ''
  ),
  constraint library_collections_art_key_nonempty check (
    btrim(art_key) <> ''
  ),
  constraint library_collections_subject_category_allowed check (
    subject_category in (
      'countries',
      'capitals',
      'flags',
      'landmarks',
      'physical',
      'oceans',
      'culture',
      'climate',
      'heritage',
      'basics'
    )
  ),
  constraint library_collections_continent_allowed check (
    continent in (
      'africa',
      'asia',
      'europe',
      'north-america',
      'south-america',
      'oceania',
      'antarctica',
      'global'
    )
  ),
  constraint library_collections_curator_handle_fkey
    foreign key (curator_handle)
    references public.library_creators (handle)
    on delete restrict
);

comment on table public.library_collections is
  'Curated GEOlibrary shelves. Membership via library_collection_items.';

create index if not exists library_collections_status_featured_idx
  on public.library_collections (status, featured);


-- Deferred FK: creators.featured_collection_slug → collections.slug
alter table public.library_creators
  drop constraint if exists library_creators_featured_collection_slug_fkey;

alter table public.library_creators
  add constraint library_creators_featured_collection_slug_fkey
  foreign key (featured_collection_slug)
  references public.library_collections (slug)
  on delete set null;


-- =============================================================================
-- GL-1f — library_collection_items
-- =============================================================================

create table if not exists public.library_collection_items (
  collection_id uuid    not null references public.library_collections (id) on delete cascade,
  resource_id   uuid    not null references public.library_resources (id) on delete cascade,
  position      integer not null,
  constraint library_collection_items_pkey primary key (collection_id, resource_id),
  constraint library_collection_items_collection_position_unique unique (collection_id, position),
  constraint library_collection_items_position_non_negative check (
    position >= 0
  )
);

comment on table public.library_collection_items is
  'Ordered membership of resources within a collection.';

create index if not exists library_collection_items_resource_id_idx
  on public.library_collection_items (resource_id);


-- =============================================================================
-- GL-1g — updated_at triggers (reuse public.set_updated_at)
-- =============================================================================

drop trigger if exists library_creators_set_updated_at on public.library_creators;
create trigger library_creators_set_updated_at
  before update on public.library_creators
  for each row
  execute function public.set_updated_at();

drop trigger if exists library_resources_set_updated_at on public.library_resources;
create trigger library_resources_set_updated_at
  before update on public.library_resources
  for each row
  execute function public.set_updated_at();

drop trigger if exists library_resource_blocks_set_updated_at on public.library_resource_blocks;
create trigger library_resource_blocks_set_updated_at
  before update on public.library_resource_blocks
  for each row
  execute function public.set_updated_at();

drop trigger if exists library_collections_set_updated_at on public.library_collections;
create trigger library_collections_set_updated_at
  before update on public.library_collections
  for each row
  execute function public.set_updated_at();


-- =============================================================================
-- GL-2a — Ownership helpers (SECURITY DEFINER)
-- =============================================================================

create or replace function public.library_user_owns_resource(
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
      and lr.author_user_id = _user_id
  );
$$;

comment on function public.library_user_owns_resource(uuid, uuid) is
  'True when the resource author_user_id matches the given user.';

create or replace function public.library_user_curates_collection(
  _collection_id uuid,
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
    from public.library_collections lc
    join public.library_creators cr on cr.handle = lc.curator_handle
    where lc.id = _collection_id
      and cr.user_id = _user_id
  );
$$;

comment on function public.library_user_curates_collection(uuid, uuid) is
  'True when the collection curator persona is linked to the given user.';

create or replace function public.library_user_owns_creator_handle(
  _handle text,
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
    from public.library_creators lc
    where lc.handle = _handle
      and lc.user_id = _user_id
  );
$$;

comment on function public.library_user_owns_creator_handle(text, uuid) is
  'True when the creator persona handle is linked to the given user.';

revoke all on function public.library_user_owns_resource(uuid, uuid) from public;
revoke all on function public.library_user_curates_collection(uuid, uuid) from public;
revoke all on function public.library_user_owns_creator_handle(text, uuid) from public;
grant execute on function public.library_user_owns_resource(uuid, uuid) to authenticated;
grant execute on function public.library_user_curates_collection(uuid, uuid) to authenticated;
grant execute on function public.library_user_owns_creator_handle(text, uuid) to authenticated;


-- =============================================================================
-- GL-2b — RLS: library_resources
-- =============================================================================

alter table public.library_resources enable row level security;

revoke all on public.library_resources from anon, authenticated;
grant select on public.library_resources to anon, authenticated;
grant insert, update, delete on public.library_resources to authenticated;

drop policy if exists library_resources_select_published on public.library_resources;
create policy library_resources_select_published
  on public.library_resources
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists library_resources_select_own on public.library_resources;
create policy library_resources_select_own
  on public.library_resources
  for select
  to authenticated
  using (author_user_id = (select auth.uid()));

drop policy if exists library_resources_select_admin on public.library_resources;
create policy library_resources_select_admin
  on public.library_resources
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists library_resources_insert on public.library_resources;
create policy library_resources_insert
  on public.library_resources
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and author_user_id = (select auth.uid())
      and public.library_user_owns_creator_handle(author_handle, (select auth.uid()))
    )
  );

drop policy if exists library_resources_update on public.library_resources;
create policy library_resources_update
  on public.library_resources
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and author_user_id = (select auth.uid())
    )
  )
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and author_user_id = (select auth.uid())
      and public.library_user_owns_creator_handle(author_handle, (select auth.uid()))
    )
  );

drop policy if exists library_resources_delete_admin on public.library_resources;
create policy library_resources_delete_admin
  on public.library_resources
  for delete
  to authenticated
  using (public.is_admin());


-- =============================================================================
-- GL-2c — RLS: library_resource_blocks
-- =============================================================================

alter table public.library_resource_blocks enable row level security;

revoke all on public.library_resource_blocks from anon, authenticated;
grant select on public.library_resource_blocks to anon, authenticated;
grant insert, update, delete on public.library_resource_blocks to authenticated;

drop policy if exists library_resource_blocks_select_published on public.library_resource_blocks;
create policy library_resource_blocks_select_published
  on public.library_resource_blocks
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.library_resources lr
      where lr.id = resource_id
        and lr.status = 'published'
    )
  );

drop policy if exists library_resource_blocks_select_own on public.library_resource_blocks;
create policy library_resource_blocks_select_own
  on public.library_resource_blocks
  for select
  to authenticated
  using (
    public.library_user_owns_resource(resource_id, (select auth.uid()))
  );

drop policy if exists library_resource_blocks_select_admin on public.library_resource_blocks;
create policy library_resource_blocks_select_admin
  on public.library_resource_blocks
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists library_resource_blocks_insert on public.library_resource_blocks;
create policy library_resource_blocks_insert
  on public.library_resource_blocks
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_owns_resource(resource_id, (select auth.uid()))
    )
  );

drop policy if exists library_resource_blocks_update on public.library_resource_blocks;
create policy library_resource_blocks_update
  on public.library_resource_blocks
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_owns_resource(resource_id, (select auth.uid()))
    )
  )
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_owns_resource(resource_id, (select auth.uid()))
    )
  );

drop policy if exists library_resource_blocks_delete on public.library_resource_blocks;
create policy library_resource_blocks_delete
  on public.library_resource_blocks
  for delete
  to authenticated
  using (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_owns_resource(resource_id, (select auth.uid()))
    )
  );


-- =============================================================================
-- GL-2d — RLS: library_collections
-- =============================================================================

alter table public.library_collections enable row level security;

revoke all on public.library_collections from anon, authenticated;
grant select on public.library_collections to anon, authenticated;
grant insert, update, delete on public.library_collections to authenticated;

drop policy if exists library_collections_select_published on public.library_collections;
create policy library_collections_select_published
  on public.library_collections
  for select
  to anon, authenticated
  using (status = 'published');

drop policy if exists library_collections_select_own on public.library_collections;
create policy library_collections_select_own
  on public.library_collections
  for select
  to authenticated
  using (
    public.library_user_owns_creator_handle(curator_handle, (select auth.uid()))
  );

drop policy if exists library_collections_select_admin on public.library_collections;
create policy library_collections_select_admin
  on public.library_collections
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists library_collections_insert on public.library_collections;
create policy library_collections_insert
  on public.library_collections
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_owns_creator_handle(curator_handle, (select auth.uid()))
    )
  );

drop policy if exists library_collections_update on public.library_collections;
create policy library_collections_update
  on public.library_collections
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_owns_creator_handle(curator_handle, (select auth.uid()))
    )
  )
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_owns_creator_handle(curator_handle, (select auth.uid()))
    )
  );

drop policy if exists library_collections_delete_admin on public.library_collections;
create policy library_collections_delete_admin
  on public.library_collections
  for delete
  to authenticated
  using (public.is_admin());


-- =============================================================================
-- GL-2e — RLS: library_collection_items
-- =============================================================================

alter table public.library_collection_items enable row level security;

revoke all on public.library_collection_items from anon, authenticated;
grant select on public.library_collection_items to anon, authenticated;
grant insert, update, delete on public.library_collection_items to authenticated;

drop policy if exists library_collection_items_select_published on public.library_collection_items;
create policy library_collection_items_select_published
  on public.library_collection_items
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.library_collections lc
      join public.library_resources lr on lr.id = resource_id
      where lc.id = collection_id
        and lc.status = 'published'
        and lr.status = 'published'
    )
  );

drop policy if exists library_collection_items_select_own on public.library_collection_items;
create policy library_collection_items_select_own
  on public.library_collection_items
  for select
  to authenticated
  using (
    public.library_user_curates_collection(collection_id, (select auth.uid()))
    or public.library_user_owns_resource(resource_id, (select auth.uid()))
  );

drop policy if exists library_collection_items_select_admin on public.library_collection_items;
create policy library_collection_items_select_admin
  on public.library_collection_items
  for select
  to authenticated
  using (public.is_admin());

drop policy if exists library_collection_items_insert on public.library_collection_items;
create policy library_collection_items_insert
  on public.library_collection_items
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_curates_collection(collection_id, (select auth.uid()))
    )
  );

drop policy if exists library_collection_items_update on public.library_collection_items;
create policy library_collection_items_update
  on public.library_collection_items
  for update
  to authenticated
  using (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_curates_collection(collection_id, (select auth.uid()))
    )
  )
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_curates_collection(collection_id, (select auth.uid()))
    )
  );

drop policy if exists library_collection_items_delete on public.library_collection_items;
create policy library_collection_items_delete
  on public.library_collection_items
  for delete
  to authenticated
  using (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and public.library_user_curates_collection(collection_id, (select auth.uid()))
    )
  );


-- =============================================================================
-- GL-2f — RLS: library_creators
-- =============================================================================

alter table public.library_creators enable row level security;

revoke all on public.library_creators from anon, authenticated;
grant select on public.library_creators to anon, authenticated;
grant insert, update, delete on public.library_creators to authenticated;

drop policy if exists library_creators_select_public on public.library_creators;
create policy library_creators_select_public
  on public.library_creators
  for select
  to anon, authenticated
  using (true);

drop policy if exists library_creators_insert on public.library_creators;
create policy library_creators_insert
  on public.library_creators
  for insert
  to authenticated
  with check (
    public.is_admin()
    or (
      public.has_role((select auth.uid()), 'creator')
      and user_id = (select auth.uid())
    )
  );

drop policy if exists library_creators_update on public.library_creators;
create policy library_creators_update
  on public.library_creators
  for update
  to authenticated
  using (
    public.is_admin()
    or user_id = (select auth.uid())
  )
  with check (
    public.is_admin()
    or user_id = (select auth.uid())
  );

drop policy if exists library_creators_delete_admin on public.library_creators;
create policy library_creators_delete_admin
  on public.library_creators
  for delete
  to authenticated
  using (public.is_admin());


-- =============================================================================
-- GL-3a — Storage helpers (private bucket; published assets exposed via helper)
-- =============================================================================

create or replace function public.library_media_resource_slug_from_path(_object_name text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when _object_name ~ '^(covers|articles|attachments)/[^/]+/'
      then split_part(_object_name, '/', 2)
    else null
  end;
$$;

create or replace function public.library_media_collection_slug_from_path(_object_name text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when _object_name ~ '^collections/[^/]+/'
      then split_part(_object_name, '/', 2)
    else null
  end;
$$;

create or replace function public.library_media_creator_handle_from_path(_object_name text)
returns text
language sql
immutable
set search_path = public
as $$
  select case
    when _object_name ~ '^creators/[^/]+/'
      then split_part(_object_name, '/', 2)
    else null
  end;
$$;

create or replace function public.library_storage_object_is_public(_object_name text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (
      select lr.status = 'published'
      from public.library_resources lr
      where lr.slug = public.library_media_resource_slug_from_path(_object_name)
    ),
    (
      select lc.status = 'published'
      from public.library_collections lc
      where lc.slug = public.library_media_collection_slug_from_path(_object_name)
    ),
    (
      public.library_media_creator_handle_from_path(_object_name) is not null
    ),
    false
  );
$$;

comment on function public.library_storage_object_is_public(text) is
  'True when a library-media object path resolves to published content or a public creator persona asset.';

create or replace function public.library_storage_user_can_manage(_object_name text, _user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin(_user_id)
    or exists (
      select 1
      from public.library_resources lr
      where lr.slug = public.library_media_resource_slug_from_path(_object_name)
        and lr.author_user_id = _user_id
    )
    or exists (
      select 1
      from public.library_collections lc
      join public.library_creators cr on cr.handle = lc.curator_handle
      where lc.slug = public.library_media_collection_slug_from_path(_object_name)
        and cr.user_id = _user_id
    )
    or exists (
      select 1
      from public.library_creators cr
      where cr.handle = public.library_media_creator_handle_from_path(_object_name)
        and cr.user_id = _user_id
    );
$$;

comment on function public.library_storage_user_can_manage(text, uuid) is
  'True when the user owns the resource, curates the collection, or owns the creator persona for the object path.';

revoke all on function public.library_media_resource_slug_from_path(text) from public;
revoke all on function public.library_media_collection_slug_from_path(text) from public;
revoke all on function public.library_media_creator_handle_from_path(text) from public;
revoke all on function public.library_storage_object_is_public(text) from public;
revoke all on function public.library_storage_user_can_manage(text, uuid) from public;
grant execute on function public.library_storage_object_is_public(text) to anon, authenticated;
grant execute on function public.library_storage_user_can_manage(text, uuid) to authenticated;


-- =============================================================================
-- GL-3b — Storage bucket (private; draft assets never public-by-default)
-- =============================================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'library-media',
  'library-media',
  false,
  10485760,
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf'
  ]::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;


-- =============================================================================
-- GL-3c — Storage object policies
-- =============================================================================

drop policy if exists library_media_select_public on storage.objects;
create policy library_media_select_public
  on storage.objects
  for select
  to anon, authenticated
  using (
    bucket_id = 'library-media'
    and public.library_storage_object_is_public(name)
  );

drop policy if exists library_media_select_manage on storage.objects;
create policy library_media_select_manage
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'library-media'
    and (
      public.is_admin()
      or public.library_storage_user_can_manage(name, (select auth.uid()))
    )
  );

drop policy if exists library_media_insert on storage.objects;
create policy library_media_insert
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'library-media'
    and (
      public.is_admin()
      or (
        public.has_role((select auth.uid()), 'creator')
        and public.library_storage_user_can_manage(name, (select auth.uid()))
      )
    )
  );

drop policy if exists library_media_update on storage.objects;
create policy library_media_update
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'library-media'
    and (
      public.is_admin()
      or (
        public.has_role((select auth.uid()), 'creator')
        and public.library_storage_user_can_manage(name, (select auth.uid()))
      )
    )
  )
  with check (
    bucket_id = 'library-media'
    and (
      public.is_admin()
      or (
        public.has_role((select auth.uid()), 'creator')
        and public.library_storage_user_can_manage(name, (select auth.uid()))
      )
    )
  );

drop policy if exists library_media_delete on storage.objects;
create policy library_media_delete
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'library-media'
    and (
      public.is_admin()
      or (
        public.has_role((select auth.uid()), 'creator')
        and public.library_storage_user_can_manage(name, (select auth.uid()))
      )
    )
  );


-- =============================================================================
-- Verification
-- =============================================================================

do $$
declare
  v_enum_count integer;
  v_table_count integer;
  v_policy_count integer;
  v_bucket_public boolean;
begin
  select count(*)::integer
  into v_enum_count
  from pg_type
  where typname in (
    'library_resource_status',
    'library_resource_kind',
    'library_difficulty',
    'library_block_kind'
  );

  if v_enum_count <> 4 then
    raise exception 'GL-1 failed: expected 4 library enums, got %', v_enum_count;
  end if;

  select count(*)::integer
  into v_table_count
  from information_schema.tables
  where table_schema = 'public'
    and table_name in (
      'library_creators',
      'library_resources',
      'library_resource_blocks',
      'library_collections',
      'library_collection_items'
    );

  if v_table_count <> 5 then
    raise exception 'GL-1 failed: expected 5 library tables, got %', v_table_count;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'library_resources_min_access_tier_fkey'
  ) then
    raise exception 'GL-1 failed: library_resources.min_access_tier FK missing';
  end if;

  if not exists (
    select 1
    from pg_indexes
    where schemaname = 'public'
      and indexname = 'library_resources_tags_gin_idx'
  ) then
    raise exception 'GL-1 failed: library_resources_tags_gin_idx missing';
  end if;

  select count(*)::integer
  into v_policy_count
  from pg_policies
  where schemaname = 'public'
    and tablename like 'library_%';

  if v_policy_count < 20 then
    raise exception 'GL-2 failed: expected at least 20 library RLS policies, got %', v_policy_count;
  end if;

  if has_table_privilege('anon', 'public.library_resources', 'INSERT') then
    raise exception 'GL-2 failed: anon must not INSERT library_resources';
  end if;

  if has_table_privilege('authenticated', 'public.library_resources', 'INSERT') = false then
    raise exception 'GL-2 failed: authenticated must have INSERT on library_resources (RLS restricts rows)';
  end if;

  select public
  into v_bucket_public
  from storage.buckets
  where id = 'library-media';

  if v_bucket_public is null then
    raise exception 'GL-3 failed: library-media bucket missing';
  end if;

  if v_bucket_public is true then
    raise exception 'GL-3 failed: library-media must remain private (public = false)';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'library_media_select_public'
  ) then
    raise exception 'GL-3 failed: library_media_select_public policy missing';
  end if;
end;
$$;
