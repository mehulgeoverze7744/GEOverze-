-- =============================================================================
-- PAY-2c B.1a — billing_provider_prices (reusable provider pricing templates)
--
-- Maps GEOverze catalog identity to provider pricing policy.
-- NOT a Razorpay Plan registry — see billing_provider_plan_instances.
--
-- Does NOT modify subscription_plans, plan_promotions, PAY-2a/2b, or PAY-1.
-- Safe to re-run: IF NOT EXISTS guards where practical.
-- =============================================================================

create table if not exists public.billing_provider_prices (
  id                   uuid        primary key default gen_random_uuid(),
  provider             text        not null,
  plan_tier            text        not null references public.subscription_plans (tier),
  billing_interval     text        not null,
  currency             char(3)     not null,
  plan_promotion_id    uuid        references public.plan_promotions (id),
  pricing_mode         text        not null,
  price_lock_policy    text        not null default 'locked_at_signup',
  rounding_mode        text        not null default 'half_up_minor_unit',
  active               boolean     not null default true,
  metadata             jsonb       not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint billing_provider_prices_provider_allowed check (
    provider in ('razorpay', 'stripe')
  ),
  constraint billing_provider_prices_billing_interval_allowed check (
    billing_interval in ('monthly', 'annual')
  ),
  constraint billing_provider_prices_pricing_mode_allowed check (
    pricing_mode in ('fixed', 'fx_at_signup')
  ),
  constraint billing_provider_prices_price_lock_policy_allowed check (
    price_lock_policy in ('locked_at_signup')
  ),
  constraint billing_provider_prices_rounding_mode_allowed check (
    rounding_mode in ('half_up_minor_unit')
  ),
  constraint billing_provider_prices_currency_nonempty check (
    btrim(currency) <> ''
  )
);

comment on table public.billing_provider_prices is
  'Reusable provider pricing templates. FX-at-signup templates do not store customer-specific amounts.';

comment on column public.billing_provider_prices.pricing_mode is
  'fixed = charge amount known upfront (e.g. USD catalog cents). fx_at_signup = server FX at checkout.';

create unique index if not exists billing_provider_prices_active_unique_idx
  on public.billing_provider_prices (
    provider,
    plan_tier,
    billing_interval,
    currency,
    coalesce(plan_promotion_id, '00000000-0000-0000-0000-000000000000'::uuid)
  )
  where active = true;

create index if not exists billing_provider_prices_lookup_idx
  on public.billing_provider_prices (provider, plan_tier, billing_interval, currency, active);

drop trigger if exists billing_provider_prices_set_updated_at on public.billing_provider_prices;
create trigger billing_provider_prices_set_updated_at
  before update on public.billing_provider_prices
  for each row
  execute function public.set_updated_at();
