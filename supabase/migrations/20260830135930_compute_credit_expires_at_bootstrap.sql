-- =============================================================================
-- Staging bootstrap — compute_credit_expires_at(text, timestamptz)
--
-- Provides the PAY-1 expiry helper required by pay2a verification tests in:
--   20260830140000_pay2a_subscription_plan_foundation.sql
--
-- Extracted from pay1b1 §4 (function definition, comment, and revoke only).
-- Depends on: 20260830135900_credit_plan_rollover_config_bootstrap.sql
-- Does NOT include PAY-1 production guards, ledger logic, or unrelated RPCs.
-- Safe to re-run on an empty staging database.
-- =============================================================================

create or replace function public.compute_credit_expires_at(
  _plan_tier text,
  _earned_at timestamptz
)
returns timestamptz
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_rollover_months smallint;
  v_earn_month      timestamptz;
begin
  if _plan_tier is null then
    raise exception 'plan_tier is required';
  end if;

  if _earned_at is null then
    raise exception 'earned_at is required';
  end if;

  select c.rollover_months
  into v_rollover_months
  from public.credit_plan_rollover_config c
  where c.plan_tier = _plan_tier;

  if not found then
    raise exception 'Unknown plan tier: %', _plan_tier;
  end if;

  v_earn_month := date_trunc('month', _earned_at at time zone 'UTC') at time zone 'UTC';

  return v_earn_month + make_interval(months => v_rollover_months + 1);
end;
$$;

comment on function public.compute_credit_expires_at(text, timestamptz) is
  'Calendar-month expiry: valid through earn month plus rollover_months, expires start of next month after that.';

revoke all on function public.compute_credit_expires_at(text, timestamptz)
  from public, anon, authenticated;
