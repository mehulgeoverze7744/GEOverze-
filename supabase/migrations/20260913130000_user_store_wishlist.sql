-- =============================================================================
-- GEOstore wishlist — per-user saved products (product_slug keyed)
-- Mirrors user_library_bookmarks patterns: own-row RLS, slug as stable key.
-- =============================================================================

create table if not exists public.user_store_wishlist (
  user_id      uuid        not null references auth.users (id) on delete cascade,
  product_slug text        not null,
  created_at   timestamptz not null default now(),
  primary key (user_id, product_slug)
);

comment on table public.user_store_wishlist is
  'Authenticated shopper wishlist. product_slug matches GEOstore catalogue slugs.';

create index if not exists user_store_wishlist_user_created_idx
  on public.user_store_wishlist (user_id, created_at desc);

alter table public.user_store_wishlist enable row level security;

revoke all on public.user_store_wishlist from anon, authenticated;
grant select, insert, delete on public.user_store_wishlist to authenticated;

drop policy if exists user_store_wishlist_select_own on public.user_store_wishlist;
create policy user_store_wishlist_select_own
  on public.user_store_wishlist for select to authenticated
  using (user_id = auth.uid());

drop policy if exists user_store_wishlist_insert_own on public.user_store_wishlist;
create policy user_store_wishlist_insert_own
  on public.user_store_wishlist for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists user_store_wishlist_delete_own on public.user_store_wishlist;
create policy user_store_wishlist_delete_own
  on public.user_store_wishlist for delete to authenticated
  using (user_id = auth.uid());
