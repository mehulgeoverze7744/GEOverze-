-- =============================================================================
-- PAY-2c B.1h — billing RLS, grants, and deferred FK constraints
-- =============================================================================

-- ---- Deferred FK: webhook_event_id → billing_webhook_events -------------------
alter table public.billing_price_snapshots
  drop constraint if exists billing_price_snapshots_webhook_event_id_fkey;

alter table public.billing_price_snapshots
  add constraint billing_price_snapshots_webhook_event_id_fkey
  foreign key (webhook_event_id)
  references public.billing_webhook_events (id)
  on delete set null;

alter table public.billing_payments
  drop constraint if exists billing_payments_webhook_event_id_fkey;

alter table public.billing_payments
  add constraint billing_payments_webhook_event_id_fkey
  foreign key (webhook_event_id)
  references public.billing_webhook_events (id)
  on delete restrict;

-- ---- Enable RLS --------------------------------------------------------------
alter table public.billing_provider_prices enable row level security;
alter table public.billing_provider_plan_instances enable row level security;
alter table public.billing_customers enable row level security;
alter table public.billing_price_snapshots enable row level security;
alter table public.billing_payments enable row level security;
alter table public.billing_webhook_events enable row level security;

-- ---- Revoke client access (service-role / postgres only for mutations) -------
revoke all on public.billing_provider_prices from public, anon, authenticated;
revoke all on public.billing_provider_plan_instances from public, anon, authenticated;
revoke all on public.billing_customers from public, anon, authenticated;
revoke all on public.billing_price_snapshots from public, anon, authenticated;
revoke all on public.billing_payments from public, anon, authenticated;
revoke all on public.billing_webhook_events from public, anon, authenticated;

-- ---- Authenticated SELECT: own billing history only --------------------------
grant select on public.billing_price_snapshots to authenticated;
grant select on public.billing_payments to authenticated;

drop policy if exists billing_price_snapshots_select_own on public.billing_price_snapshots;
create policy billing_price_snapshots_select_own
  on public.billing_price_snapshots
  for select
  to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists billing_payments_select_own on public.billing_payments;
create policy billing_payments_select_own
  on public.billing_payments
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---- Verification ------------------------------------------------------------
do $$
begin
  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'billing_provider_prices'
  ) then
    raise exception 'PAY-2c B.1h failed: billing_provider_prices missing';
  end if;

  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'billing_webhook_events'
  ) then
    raise exception 'PAY-2c B.1h failed: billing_webhook_events missing';
  end if;

  if has_table_privilege('authenticated', 'public.billing_provider_prices', 'SELECT') then
    raise exception 'PAY-2c B.1h failed: authenticated must not SELECT billing_provider_prices';
  end if;

  if has_table_privilege('authenticated', 'public.billing_webhook_events', 'SELECT') then
    raise exception 'PAY-2c B.1h failed: authenticated must not SELECT billing_webhook_events';
  end if;

  if has_table_privilege('authenticated', 'public.billing_price_snapshots', 'INSERT') then
    raise exception 'PAY-2c B.1h failed: authenticated must not INSERT billing_price_snapshots';
  end if;

  if has_table_privilege('authenticated', 'public.billing_payments', 'INSERT') then
    raise exception 'PAY-2c B.1h failed: authenticated must not INSERT billing_payments';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_subscriptions'
      and policyname = 'user_subscriptions_select_own'
  ) then
    raise exception 'PAY-2c B.1h failed: PAY-2a user_subscriptions RLS policy missing';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'billing_payments_webhook_event_id_fkey'
  ) then
    raise exception 'PAY-2c B.1h failed: billing_payments webhook FK missing';
  end if;
end;
$$;
