-- =============================================================================
-- PAY-3b — GST configuration, billing addresses, invoices, payment GST tracking
--
-- Implements:
--   1. billing_gst_config  — centralized, DB-authoritative GST settings
--   2. billing_addresses   — reusable billing address + GSTIN per user
--   3. billing_invoices    — invoice records linked to payments
--   4. Additive columns on billing_payments: gst_amount_minor, base_amount_minor, invoice_number
--   5. Additive column on user_subscriptions: billing_address_id
--
-- GST is configured in the DB (not hardcoded in Edge Functions) so finance can
-- update the rate, inclusive flag, and GSTIN without code changes.
--
-- Safe to re-run: IF NOT EXISTS / ALTER … ADD COLUMN IF NOT EXISTS throughout.
-- =============================================================================

-- ---- 1. billing_gst_config ───────────────────────────────────────────────────
-- One authoritative row controls all GST behaviour.
-- Seed with India standard 18% (inclusive).

create table if not exists public.billing_gst_config (
  id                   smallint    primary key default 1,
  rate_percent         numeric(5,2) not null default 18.00,
  tax_inclusive        boolean     not null default true,
  gstin                text,
  sac_code             text        not null default '9984',
  tax_label            text        not null default 'GST (18%)',
  currency             char(3)     not null default 'INR',
  active               boolean     not null default true,
  notes                text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint billing_gst_config_singleton check (id = 1),
  constraint billing_gst_config_rate_non_negative check (rate_percent >= 0),
  constraint billing_gst_config_rate_max check (rate_percent <= 100)
);

comment on table public.billing_gst_config is
  'Singleton GST configuration row (id always = 1). Managed by admin, read by Edge Functions.';

comment on column public.billing_gst_config.tax_inclusive is
  'TRUE: catalog prices already include GST; extract base. FALSE: add GST on top.';

comment on column public.billing_gst_config.gstin is
  'GSTIN once GVRZE is GST-registered (format: AAAAAAAAAAAAA). NULL = unregistered.';

-- Seed default row
insert into public.billing_gst_config (id, rate_percent, tax_inclusive, sac_code, tax_label)
values (1, 18.00, true, '9984', 'GST (18%)')
on conflict (id) do nothing;

-- RLS: anyone can read; only service role can write
alter table public.billing_gst_config enable row level security;

drop policy if exists billing_gst_config_read_public on public.billing_gst_config;
create policy billing_gst_config_read_public
  on public.billing_gst_config
  for select
  using (true);

-- Only service_role updates (default deny for insert/update/delete to anon/authenticated)
grant select on public.billing_gst_config to anon, authenticated;

-- ---- 2. billing_addresses ────────────────────────────────────────────────────
-- Stores per-user billing addresses + optional GSTIN for business invoices.

create table if not exists public.billing_addresses (
  id                   uuid        primary key default gen_random_uuid(),
  user_id              uuid        not null references auth.users (id) on delete cascade,
  display_name         text        not null,
  line1                text        not null,
  line2                text,
  city                 text        not null,
  state                text        not null,
  pincode              char(6)     not null,
  country              char(2)     not null default 'IN',
  gstin                text,
  is_default           boolean     not null default true,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint billing_addresses_pincode_format check (
    pincode ~ '^[0-9]{6}$'
  ),
  constraint billing_addresses_gstin_format check (
    gstin is null or gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$'
  )
);

comment on table public.billing_addresses is
  'Billing address per user. GSTIN enables B2B GST invoicing.';

create index if not exists billing_addresses_user_idx
  on public.billing_addresses (user_id, is_default desc, created_at desc);

drop trigger if exists billing_addresses_set_updated_at on public.billing_addresses;
create trigger billing_addresses_set_updated_at
  before update on public.billing_addresses
  for each row
  execute function public.set_updated_at();

alter table public.billing_addresses enable row level security;

revoke all on public.billing_addresses from public, anon;
grant select, insert, update on public.billing_addresses to authenticated;

drop policy if exists billing_addresses_own on public.billing_addresses;
create policy billing_addresses_own
  on public.billing_addresses
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- 3. Additive columns on billing_payments ─────────────────────────────────
-- base_amount_minor: pre-GST amount in paise
-- gst_amount_minor:  GST portion in paise
-- gst_rate_percent:  rate snapshotted at time of charge
-- invoice_id:        FK to billing_invoices (added after invoice table)

alter table public.billing_payments
  add column if not exists base_amount_minor     integer,
  add column if not exists gst_amount_minor      integer,
  add column if not exists gst_rate_percent      numeric(5,2),
  add column if not exists billing_address_id    uuid references public.billing_addresses (id) on delete set null,
  add column if not exists customer_gstin        text;

comment on column public.billing_payments.base_amount_minor is
  'Pre-GST charge amount in paise. base + gst = charge_amount_minor.';

comment on column public.billing_payments.gst_amount_minor is
  'GST portion in paise. Extracted from charge_amount_minor using gst_rate_percent.';

comment on column public.billing_payments.gst_rate_percent is
  'GST rate snapshotted at payment time (e.g. 18.00). Do not use GST_CONFIG directly.';

comment on column public.billing_payments.customer_gstin is
  'GSTIN supplied by the customer for B2B invoice (may differ from billing_addresses.gstin if address changed).';

-- ---- 4. Additive column on user_subscriptions ───────────────────────────────
alter table public.user_subscriptions
  add column if not exists billing_address_id uuid references public.billing_addresses (id) on delete set null;

comment on column public.user_subscriptions.billing_address_id is
  'Billing address used at subscription creation. Used for invoice generation.';

-- ---- 5. billing_invoices ─────────────────────────────────────────────────────
-- Invoice records for every successful payment.

create sequence if not exists billing_invoice_number_seq start with 1000 increment by 1;

create table if not exists public.billing_invoices (
  id                   uuid        primary key default gen_random_uuid(),
  invoice_number       text        not null unique default ('INV-' || to_char(nextval('billing_invoice_number_seq'), 'FM000000')),
  user_id              uuid        not null references auth.users (id) on delete cascade,
  subscription_id      uuid        not null references public.user_subscriptions (id) on delete cascade,
  payment_id           uuid        references public.billing_payments (id) on delete set null,
  plan_tier            text        not null references public.subscription_plans (tier),
  billing_interval     text        not null,
  billing_period_start timestamptz,
  billing_period_end   timestamptz,
  base_amount_minor    integer     not null,
  gst_amount_minor     integer     not null default 0,
  total_amount_minor   integer     not null,
  gst_rate_percent     numeric(5,2) not null default 0,
  currency             char(3)     not null default 'INR',
  billing_address_id   uuid        references public.billing_addresses (id) on delete set null,
  customer_gstin       text,
  status               text        not null default 'issued',
  issued_at            timestamptz not null default now(),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint billing_invoices_billing_interval_allowed check (
    billing_interval in ('monthly', 'annual')
  ),
  constraint billing_invoices_status_allowed check (
    status in ('draft', 'issued', 'void', 'refunded')
  ),
  constraint billing_invoices_base_non_negative check (base_amount_minor >= 0),
  constraint billing_invoices_gst_non_negative check (gst_amount_minor >= 0),
  constraint billing_invoices_total_non_negative check (total_amount_minor >= 0)
);

comment on table public.billing_invoices is
  'GST invoice for every successful subscription payment. invoice_number is auto-sequenced.';

comment on column public.billing_invoices.invoice_number is
  'Human-readable invoice number (INV-001000, INV-001001, …). Unique.';

create index if not exists billing_invoices_user_issued_idx
  on public.billing_invoices (user_id, issued_at desc);

create index if not exists billing_invoices_subscription_idx
  on public.billing_invoices (subscription_id, issued_at desc);

drop trigger if exists billing_invoices_set_updated_at on public.billing_invoices;
create trigger billing_invoices_set_updated_at
  before update on public.billing_invoices
  for each row
  execute function public.set_updated_at();

-- RLS: users see their own invoices; service role writes
alter table public.billing_invoices enable row level security;

revoke all on public.billing_invoices from public, anon;
grant select on public.billing_invoices to authenticated;

drop policy if exists billing_invoices_own_select on public.billing_invoices;
create policy billing_invoices_own_select
  on public.billing_invoices
  for select
  using (auth.uid() = user_id);

-- ---- 6. FK from billing_payments → billing_invoices ─────────────────────────
alter table public.billing_payments
  add column if not exists invoice_id uuid references public.billing_invoices (id) on delete set null;

-- ---- 7. RPC: get_billing_gst_config (client-safe) ───────────────────────────
create or replace function public.get_billing_gst_config()
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  select to_jsonb(c) - 'id' - 'created_at' - 'updated_at'
  from public.billing_gst_config c
  where c.id = 1;
$$;

grant execute on function public.get_billing_gst_config to anon, authenticated;

-- ---- 8. RPC: create_billing_invoice (service-role) ──────────────────────────
create or replace function public.create_billing_invoice(
  p_user_id              uuid,
  p_subscription_id      uuid,
  p_payment_id           uuid,
  p_plan_tier            text,
  p_billing_interval     text,
  p_base_amount_minor    integer,
  p_gst_amount_minor     integer,
  p_total_amount_minor   integer,
  p_gst_rate_percent     numeric,
  p_currency             char(3),
  p_billing_address_id   uuid default null,
  p_customer_gstin       text default null,
  p_period_start         timestamptz default null,
  p_period_end           timestamptz default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invoice_id uuid;
begin
  insert into public.billing_invoices (
    user_id,
    subscription_id,
    payment_id,
    plan_tier,
    billing_interval,
    billing_period_start,
    billing_period_end,
    base_amount_minor,
    gst_amount_minor,
    total_amount_minor,
    gst_rate_percent,
    currency,
    billing_address_id,
    customer_gstin,
    status,
    issued_at
  )
  values (
    p_user_id,
    p_subscription_id,
    p_payment_id,
    p_plan_tier,
    p_billing_interval,
    p_period_start,
    p_period_end,
    p_base_amount_minor,
    p_gst_amount_minor,
    p_total_amount_minor,
    p_gst_rate_percent,
    p_currency,
    p_billing_address_id,
    p_customer_gstin,
    'issued',
    now()
  )
  returning id into v_invoice_id;

  return v_invoice_id;
end;
$$;

revoke all on function public.create_billing_invoice from public, anon, authenticated;
grant execute on function public.create_billing_invoice to service_role;

-- ---- 9. RPC: get_my_invoices (client-readable) ───────────────────────────────
create or replace function public.get_my_invoices(p_limit int default 20)
returns jsonb
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'id',              i.id,
        'invoice_number',  i.invoice_number,
        'plan_tier',       i.plan_tier,
        'billing_interval', i.billing_interval,
        'base_amount_minor', i.base_amount_minor,
        'gst_amount_minor',  i.gst_amount_minor,
        'total_amount_minor', i.total_amount_minor,
        'gst_rate_percent', i.gst_rate_percent,
        'currency',        i.currency,
        'status',          i.status,
        'issued_at',       i.issued_at,
        'billing_period_start', i.billing_period_start,
        'billing_period_end',   i.billing_period_end,
        'customer_gstin',  i.customer_gstin
      )
      order by i.issued_at desc
    ),
    '[]'::jsonb
  )
  from public.billing_invoices i
  where i.user_id = auth.uid()
  limit p_limit;
$$;

grant execute on function public.get_my_invoices to authenticated;
