-- =============================================================================
-- PAY-2c B.1g — user_subscriptions additive billing extensions
--
-- Adds billing pointers and webhook ordering fields only.
-- Does NOT alter existing PAY-2a columns, constraints, indexes, policies, or RPCs.
-- =============================================================================

alter table public.user_subscriptions
  add column if not exists plan_promotion_id uuid references public.plan_promotions (id),
  add column if not exists billing_provider_price_id uuid references public.billing_provider_prices (id),
  add column if not exists current_price_snapshot_id uuid references public.billing_price_snapshots (id),
  add column if not exists charge_currency char(3),
  add column if not exists provider_last_event_at timestamptz,
  add column if not exists provider_last_event_id text,
  add column if not exists intro_cycles_total smallint,
  add column if not exists intro_cycles_completed smallint not null default 0;

comment on column public.user_subscriptions.plan_promotion_id is
  'Active catalog promotion (e.g. Pro intro). NULL after promo term ends.';

comment on column public.user_subscriptions.billing_provider_price_id is
  'Current billing_provider_prices template governing this subscription.';

comment on column public.user_subscriptions.current_price_snapshot_id is
  'Pointer to the active insert-only billing_price_snapshots row.';

comment on column public.user_subscriptions.charge_currency is
  'Denormalized locked provider charge currency (INR, USD, etc.).';

comment on column public.user_subscriptions.provider_last_event_at is
  'Watermark for webhook ordering / stale event detection.';

comment on column public.user_subscriptions.intro_cycles_total is
  'Intro promo billing cycles (e.g. 3 for Pro intro). NULL when not on intro.';

comment on column public.user_subscriptions.intro_cycles_completed is
  'Successful intro cycles completed; incremented from charge webhooks.';

create unique index if not exists user_subscriptions_provider_subscription_unique_idx
  on public.user_subscriptions (provider_name, provider_subscription_id)
  where provider_subscription_id is not null;

create index if not exists user_subscriptions_provider_customer_lookup_idx
  on public.user_subscriptions (provider_name, provider_customer_id)
  where provider_customer_id is not null;

create index if not exists user_subscriptions_billing_provider_price_idx
  on public.user_subscriptions (billing_provider_price_id)
  where billing_provider_price_id is not null;

create index if not exists user_subscriptions_current_price_snapshot_idx
  on public.user_subscriptions (current_price_snapshot_id)
  where current_price_snapshot_id is not null;
