-- =============================================================================
-- PAY-2c B.1b — billing_provider_plan_instances (immutable provider Plan registry)
--
-- One row per distinct Razorpay/Stripe Plan entity. Rows are inserted only after
-- the provider Plan resource exists (B.2+). B.1 creates the table only; no seed.
--
-- provider_plan_id is NOT NULL because instances are never inserted without a
-- real provider Plan ID. Pending/pre-resource states belong in checkout flow,
-- not in this registry.
-- =============================================================================

create table if not exists public.billing_provider_plan_instances (
  id                         uuid        primary key default gen_random_uuid(),
  provider                   text        not null,
  provider_plan_id           text        not null,
  billing_provider_price_id  uuid        not null references public.billing_provider_prices (id),
  charge_currency            char(3)     not null,
  charge_amount_minor        integer     not null,
  billing_interval           text        not null,
  catalog_usd_amount_cents   integer     not null,
  plan_promotion_id          uuid        references public.plan_promotions (id),
  metadata                   jsonb       not null default '{}'::jsonb,
  created_at                 timestamptz not null default now(),
  constraint billing_provider_plan_instances_provider_allowed check (
    provider in ('razorpay', 'stripe')
  ),
  constraint billing_provider_plan_instances_billing_interval_allowed check (
    billing_interval in ('monthly', 'annual')
  ),
  constraint billing_provider_plan_instances_charge_amount_positive check (
    charge_amount_minor > 0
  ),
  constraint billing_provider_plan_instances_catalog_usd_non_negative check (
    catalog_usd_amount_cents >= 0
  ),
  constraint billing_provider_plan_instances_provider_plan_id_nonempty check (
    btrim(provider_plan_id) <> ''
  )
);

comment on table public.billing_provider_plan_instances is
  'Immutable registry of provider Plan resources. Reused when FX rounds to the same charge amount.';

create unique index if not exists billing_provider_plan_instances_provider_plan_unique_idx
  on public.billing_provider_plan_instances (provider, provider_plan_id);

create unique index if not exists billing_provider_plan_instances_template_amount_unique_idx
  on public.billing_provider_plan_instances (
    provider,
    billing_provider_price_id,
    charge_amount_minor
  );

create index if not exists billing_provider_plan_instances_template_idx
  on public.billing_provider_plan_instances (billing_provider_price_id);
