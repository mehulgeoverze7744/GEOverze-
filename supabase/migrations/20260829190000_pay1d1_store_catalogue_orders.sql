-- =============================================================================
-- PAY-1d.1 — Server catalogue & credit-only order schema
--
-- Creates store_products (authoritative catalogue), store_orders, and
-- store_order_lines (price snapshots). Seeds credit-only reward products from
-- the frontend rewards catalogue (mode === "credits").
--
-- Out of scope (deferred):
--   - place_credit_order / spend_credits RPCs (PAY-1d.2)
--   - user_entitlements (PAY-1d.4)
--   - Razorpay / hybrid checkout / money fields
--   - credit_transactions / credit_ledger_entries mutations
--
-- Safe to re-run: IF NOT EXISTS / ON CONFLICT DO NOTHING guards.
-- =============================================================================

-- ---- 1. Enums ----------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'store_product_fulfillment_type') then
    create type public.store_product_fulfillment_type as enum ('digital', 'physical');
  end if;

  if not exists (select 1 from pg_type where typname = 'store_order_status') then
    create type public.store_order_status as enum (
      'pending',
      'completed',
      'failed',
      'cancelled',
      'refunded'
    );
  end if;
end
$$;

comment on type public.store_product_fulfillment_type is
  'How a store product is delivered: digital reward vs physical shipment.';

comment on type public.store_order_status is
  'Credit-only order lifecycle. Mutations are service-role / internal RPC only.';

-- ---- 2. store_products -------------------------------------------------------
create table if not exists public.store_products (
  id               uuid                             primary key default gen_random_uuid(),
  slug             text                             not null,
  name             text                             not null,
  description      text                             not null default '',
  active           boolean                          not null default true,
  credit_price     integer                          not null,
  fulfillment_type public.store_product_fulfillment_type not null default 'digital',
  metadata         jsonb                            not null default '{}'::jsonb,
  created_at       timestamptz                      not null default now(),
  updated_at       timestamptz                      not null default now(),
  constraint store_products_slug_key unique (slug),
  constraint store_products_credit_price_nonneg check (credit_price >= 0),
  constraint store_products_credit_price_positive_when_active check (
    not active or credit_price > 0
  )
);

comment on table public.store_products is
  'Server-authoritative GEOstore catalogue. Credit prices are whole GEO credits; no USD conversion.';

comment on column public.store_products.credit_price is
  'Whole GEO credits required to purchase. Must be > 0 when active.';

create index if not exists store_products_active_idx
  on public.store_products (active)
  where active = true;

-- ---- 3. store_orders ---------------------------------------------------------
create table if not exists public.store_orders (
  id               uuid                    primary key default gen_random_uuid(),
  user_id          uuid                    not null references auth.users (id) on delete cascade,
  status           public.store_order_status not null default 'pending',
  credits_total    integer                 not null,
  idempotency_key  text                    not null,
  placed_at        timestamptz,
  metadata         jsonb                   not null default '{}'::jsonb,
  created_at       timestamptz             not null default now(),
  updated_at       timestamptz             not null default now(),
  constraint store_orders_credits_total_nonneg check (credits_total >= 0),
  constraint store_orders_user_idempotency_key unique (user_id, idempotency_key)
);

comment on table public.store_orders is
  'Credit-only purchase orders. Client writes forbidden; future place_credit_order RPC only.';

comment on column public.store_orders.credits_total is
  'Authoritative credit amount for the order. No money_total / USD fields at launch.';

comment on column public.store_orders.idempotency_key is
  'Per-user deduplication key scoped by (user_id, idempotency_key).';

create index if not exists store_orders_user_created_idx
  on public.store_orders (user_id, created_at desc);

-- ---- 4. store_order_lines ----------------------------------------------------
create table if not exists public.store_order_lines (
  id               uuid                             primary key default gen_random_uuid(),
  order_id         uuid                             not null references public.store_orders (id) on delete restrict,
  product_id       uuid                             references public.store_products (id) on delete restrict,
  product_slug     text                             not null,
  product_name     text                             not null,
  quantity         integer                          not null,
  unit_credits     integer                          not null,
  line_credits     integer                          not null,
  fulfillment_type public.store_product_fulfillment_type not null,
  metadata         jsonb                            not null default '{}'::jsonb,
  created_at       timestamptz                      not null default now(),
  constraint store_order_lines_quantity_positive check (quantity > 0),
  constraint store_order_lines_unit_credits_nonneg check (unit_credits >= 0),
  constraint store_order_lines_line_credits_nonneg check (line_credits >= 0),
  constraint store_order_lines_line_credits_matches check (
    line_credits = unit_credits * quantity
  )
);

comment on table public.store_order_lines is
  'Immutable line snapshots capturing catalogue price at purchase time.';

comment on column public.store_order_lines.unit_credits is
  'Credit price per unit copied from store_products.credit_price at order time.';

create index if not exists store_order_lines_order_id_idx
  on public.store_order_lines (order_id);

-- ---- 5. updated_at triggers --------------------------------------------------
drop trigger if exists store_products_set_updated_at on public.store_products;
create trigger store_products_set_updated_at
  before update on public.store_products
  for each row
  execute function public.set_updated_at();

drop trigger if exists store_orders_set_updated_at on public.store_orders;
create trigger store_orders_set_updated_at
  before update on public.store_orders
  for each row
  execute function public.set_updated_at();

-- ---- 6. RLS — read-only catalogue; own orders only; no client writes ---------
alter table public.store_products enable row level security;
alter table public.store_orders enable row level security;
alter table public.store_order_lines enable row level security;

revoke all on public.store_products from public, anon, authenticated;
revoke all on public.store_orders from public, anon, authenticated;
revoke all on public.store_order_lines from public, anon, authenticated;

grant select on public.store_products to anon, authenticated;
grant select on public.store_orders to authenticated;
grant select on public.store_order_lines to authenticated;

drop policy if exists store_products_select_active on public.store_products;
create policy store_products_select_active
  on public.store_products
  for select
  to anon, authenticated
  using (active = true);

drop policy if exists store_orders_select_own on public.store_orders;
create policy store_orders_select_own
  on public.store_orders
  for select
  to authenticated
  using (auth.uid() = user_id);

drop policy if exists store_order_lines_select_own on public.store_order_lines;
create policy store_order_lines_select_own
  on public.store_order_lines
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.store_orders o
      where o.id = order_id
        and o.user_id = auth.uid()
    )
  );

-- ---- 7. Seed credit-only reward products (mode === "credits" in products.ts) -
-- Source: geoverze-public-main/src/features/store/data/products.ts rewards section.
-- All nine items have price: null and credits set; none are hybrid.
-- boost-double-xp is seeded inactive (frontend stock: sold-out).
-- user_entitlements deferred to PAY-1d.4.
insert into public.store_products (
  slug,
  name,
  description,
  active,
  credit_price,
  fulfillment_type,
  metadata
)
values
  (
    'avatar-navigator',
    'Navigator Avatar',
    'Bronze-plated explorer portrait.',
    true,
    40,
    'digital',
    '{"category":"avatars","group":"rewards","mode":"credits","tags":["profile","credits"]}'::jsonb
  ),
  (
    'avatar-astronomer',
    'Astronomer Avatar',
    'For the ones who read the sky first.',
    true,
    55,
    'digital',
    '{"category":"avatars","group":"rewards","mode":"credits","tags":["profile","credits"]}'::jsonb
  ),
  (
    'badge-continental-sweep',
    'Continental Sweep Badge',
    'Display honour for clearing every continent.',
    true,
    65,
    'digital',
    '{"category":"badges","group":"rewards","mode":"credits","limited":true,"tags":["honour","credits","limited"]}'::jsonb
  ),
  (
    'badge-streak-keeper',
    'Streak Keeper Badge',
    'Shown beside your name for 90 days.',
    true,
    35,
    'digital',
    '{"category":"badges","group":"rewards","mode":"credits","tags":["honour","credits"]}'::jsonb
  ),
  (
    'frame-bronze-meridian',
    'Bronze Meridian Frame',
    'Machined bronze ring for your avatar.',
    true,
    50,
    'digital',
    '{"category":"frames","group":"rewards","mode":"credits","featured":true,"tags":["profile","credits"]}'::jsonb
  ),
  (
    'frame-obsidian-edge',
    'Obsidian Edge Frame',
    'Matte black with a single bronze notch.',
    true,
    45,
    'digital',
    '{"category":"frames","group":"rewards","mode":"credits","tags":["profile","credits"]}'::jsonb
  ),
  (
    'theme-deep-space',
    'Deep Space Theme',
    'Darker interface, brighter starfield.',
    true,
    75,
    'digital',
    '{"category":"themes","group":"rewards","mode":"credits","tags":["interface","credits"]}'::jsonb
  ),
  (
    'theme-sandstone',
    'Sandstone Theme',
    'Warm desert light over the same bronze.',
    true,
    70,
    'digital',
    '{"category":"themes","group":"rewards","mode":"credits","stock":"low","tags":["interface","credits"]}'::jsonb
  ),
  (
    'boost-double-xp',
    'Double XP Boost',
    'Two hours of doubled experience.',
    false,
    25,
    'digital',
    '{"category":"boosts","group":"rewards","mode":"credits","stock":"sold-out","tags":["gameplay","credits"]}'::jsonb
  )
on conflict (slug) do nothing;

-- ---- 8. Post-migration ledger guard (read-only schema must not mutate credits)
do $$
declare
  v_ledger_count integer;
  v_ledger_sum   integer;
  v_up_sum       integer;
begin
  select count(*)::integer, coalesce(sum(remaining_amount), 0)::integer
  into v_ledger_count, v_ledger_sum
  from public.credit_ledger_entries;

  if v_ledger_count <> 79 then
    raise exception
      'PAY-1d.1 aborted: credit_ledger_entries count % != expected 79',
      v_ledger_count;
  end if;

  if v_ledger_sum <> 266 then
    raise exception
      'PAY-1d.1 aborted: credit_ledger_entries sum % != expected 266',
      v_ledger_sum;
  end if;

  select coalesce(sum(credits), 0)::integer
  into v_up_sum
  from public.user_progression;

  if v_up_sum <> 266 then
    raise exception
      'PAY-1d.1 aborted: user_progression total credits % != expected 266',
      v_up_sum;
  end if;
end;
$$;
