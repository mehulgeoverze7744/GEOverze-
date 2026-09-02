-- =============================================================================
-- Staging bootstrap — credit_plan_rollover_config
--
-- Provides the minimum PAY-1 rollover lookup table required by:
--   20260830140000_pay2a_subscription_plan_foundation.sql
--     (subscription_plans.rollover_tier_key FK)
--
-- Extracted from pay1b1 §2 (table + four canonical tier rows only).
-- Does NOT include PAY-1 production guards, ledger backfills, or credit RPCs.
-- Safe to re-run on an empty staging database.
-- =============================================================================

create table if not exists public.credit_plan_rollover_config (
  plan_tier       text     primary key,
  rollover_months smallint not null,
  constraint credit_plan_rollover_months_positive check (rollover_months >= 0),
  constraint credit_plan_rollover_tier_allowed check (
    plan_tier in ('free', 'basic', 'pro', 'advance')
  )
);

comment on table public.credit_plan_rollover_config is
  'Server-controlled calendar-month credit rollover by plan tier.';

insert into public.credit_plan_rollover_config (plan_tier, rollover_months) values
  ('free',    1),
  ('basic',   1),
  ('pro',     1),
  ('advance', 2)
on conflict (plan_tier) do update
  set rollover_months = excluded.rollover_months;

alter table public.credit_plan_rollover_config enable row level security;

revoke all on public.credit_plan_rollover_config from public, anon, authenticated;
