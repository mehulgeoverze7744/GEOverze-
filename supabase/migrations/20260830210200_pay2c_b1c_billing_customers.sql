-- =============================================================================
-- PAY-2c B.1c — billing_customers (user ↔ provider customer mapping)
-- =============================================================================

create table if not exists public.billing_customers (
  id                    uuid        primary key default gen_random_uuid(),
  user_id               uuid        not null references auth.users (id) on delete cascade,
  provider              text        not null,
  provider_customer_id  text        not null,
  email_at_creation     text,
  metadata              jsonb       not null default '{}'::jsonb,
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now(),
  constraint billing_customers_provider_allowed check (
    provider in ('razorpay', 'stripe')
  ),
  constraint billing_customers_provider_customer_id_nonempty check (
    btrim(provider_customer_id) <> ''
  )
);

comment on table public.billing_customers is
  'Canonical mapping from GEOverze user to provider customer ID. Service-controlled only.';

create unique index if not exists billing_customers_user_provider_unique_idx
  on public.billing_customers (user_id, provider);

create unique index if not exists billing_customers_provider_customer_unique_idx
  on public.billing_customers (provider, provider_customer_id);

create index if not exists billing_customers_user_id_idx
  on public.billing_customers (user_id);

drop trigger if exists billing_customers_set_updated_at on public.billing_customers;
create trigger billing_customers_set_updated_at
  before update on public.billing_customers
  for each row
  execute function public.set_updated_at();
