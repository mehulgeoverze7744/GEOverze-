-- =============================================================================
-- PAY-2c B.1e — billing_payments (provider payment audit)
--
-- Records successful, failed, and refunded payment attempts with stable IDs.
-- webhook_event_id FK added in B.1h after billing_webhook_events exists.
-- =============================================================================

create table if not exists public.billing_payments (
  id                       uuid        primary key default gen_random_uuid(),
  subscription_id          uuid        not null references public.user_subscriptions (id) on delete cascade,
  user_id                  uuid        not null references auth.users (id) on delete cascade,
  price_snapshot_id        uuid        not null references public.billing_price_snapshots (id),
  provider                 text        not null,
  provider_payment_id      text        not null,
  provider_invoice_id      text,
  provider_subscription_id text        not null,
  billing_period_start     timestamptz,
  billing_period_end       timestamptz,
  catalog_usd_amount_cents integer     not null,
  charge_currency          char(3)     not null,
  charge_amount_minor      integer     not null,
  plan_tier                text        not null references public.subscription_plans (tier),
  plan_promotion_id        uuid        references public.plan_promotions (id),
  cycle_number             integer,
  status                   text        not null,
  failure_code             text,
  failure_reason           text,
  paid_at                  timestamptz,
  attempted_at             timestamptz not null default now(),
  webhook_event_id         uuid        not null,
  metadata                 jsonb       not null default '{}'::jsonb,
  created_at               timestamptz not null default now(),
  constraint billing_payments_provider_allowed check (
    provider in ('razorpay', 'stripe')
  ),
  constraint billing_payments_status_allowed check (
    status in ('succeeded', 'failed', 'refunded', 'partially_refunded')
  ),
  constraint billing_payments_catalog_usd_non_negative check (
    catalog_usd_amount_cents >= 0
  ),
  constraint billing_payments_charge_amount_non_negative check (
    charge_amount_minor >= 0
  ),
  constraint billing_payments_provider_payment_id_nonempty check (
    btrim(provider_payment_id) <> ''
  ),
  constraint billing_payments_provider_subscription_id_nonempty check (
    btrim(provider_subscription_id) <> ''
  )
);

comment on table public.billing_payments is
  'Provider payment/charge audit trail. Service-role inserts only; clients may SELECT own rows.';

create unique index if not exists billing_payments_provider_payment_unique_idx
  on public.billing_payments (provider, provider_payment_id);

create index if not exists billing_payments_subscription_paid_at_idx
  on public.billing_payments (subscription_id, paid_at desc nulls last);

create index if not exists billing_payments_subscription_period_idx
  on public.billing_payments (subscription_id, billing_period_start);

create index if not exists billing_payments_user_id_idx
  on public.billing_payments (user_id);
