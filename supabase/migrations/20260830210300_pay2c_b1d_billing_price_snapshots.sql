-- =============================================================================
-- PAY-2c B.1d — billing_price_snapshots (insert-only price lock audit)
--
-- Historical snapshots are never updated to retire them. The current snapshot
-- is tracked via user_subscriptions.current_price_snapshot_id (B.1g).
-- webhook_event_id FK added in B.1h after billing_webhook_events exists.
-- =============================================================================

create table if not exists public.billing_price_snapshots (
  id                                uuid           primary key default gen_random_uuid(),
  subscription_id                   uuid           not null references public.user_subscriptions (id) on delete cascade,
  user_id                           uuid           not null references auth.users (id) on delete cascade,
  billing_provider_price_id         uuid           not null references public.billing_provider_prices (id),
  billing_provider_plan_instance_id uuid           not null references public.billing_provider_plan_instances (id),
  plan_tier                         text           not null references public.subscription_plans (tier),
  billing_interval                  text           not null,
  plan_promotion_id                 uuid           references public.plan_promotions (id),
  catalog_usd_amount_cents          integer        not null,
  catalog_usd_currency              char(3)        not null default 'USD',
  fx_rate                           numeric(20, 8),
  fx_source                         text,
  fx_rate_at                        timestamptz,
  fx_unrounded_amount               numeric(20, 8),
  charge_currency                   char(3)        not null,
  charge_amount_minor               integer        not null,
  rounding_mode                     text           not null,
  price_lock_policy                 text           not null,
  provider_plan_id                  text           not null,
  snapshot_reason                   text           not null,
  previous_snapshot_id              uuid           references public.billing_price_snapshots (id),
  webhook_event_id                  uuid,
  metadata                          jsonb          not null default '{}'::jsonb,
  created_at                        timestamptz    not null default now(),
  constraint billing_price_snapshots_billing_interval_allowed check (
    billing_interval in ('monthly', 'annual')
  ),
  constraint billing_price_snapshots_snapshot_reason_allowed check (
    snapshot_reason in ('initial', 'promo_transition', 'upgrade', 'downgrade')
  ),
  constraint billing_price_snapshots_catalog_usd_non_negative check (
    catalog_usd_amount_cents >= 0
  ),
  constraint billing_price_snapshots_charge_amount_positive check (
    charge_amount_minor > 0
  ),
  constraint billing_price_snapshots_catalog_usd_currency_usd check (
    catalog_usd_currency = 'USD'
  ),
  constraint billing_price_snapshots_provider_plan_id_nonempty check (
    btrim(provider_plan_id) <> ''
  )
);

comment on table public.billing_price_snapshots is
  'Insert-only locked price terms. Service-role inserts only; clients may SELECT own rows.';

create index if not exists billing_price_snapshots_subscription_created_idx
  on public.billing_price_snapshots (subscription_id, created_at desc);

create index if not exists billing_price_snapshots_user_created_idx
  on public.billing_price_snapshots (user_id, created_at desc);
