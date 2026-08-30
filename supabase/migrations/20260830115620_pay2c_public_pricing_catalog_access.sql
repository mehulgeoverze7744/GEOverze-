-- =============================================================================
-- PAY-2c Step A.1 — Public pricing catalog read access (anon SELECT)
--
-- Allows unauthenticated visitors to read the public membership catalog on /pricing.
-- Does NOT expose user_subscriptions, grant writes, or change catalog prices.
-- Authenticated SELECT policies from PAY-2a are unchanged.
-- =============================================================================

-- ---- 1. Table privileges (SELECT only) ---------------------------------------
grant select on public.subscription_plans to anon;
grant select on public.plan_promotions to anon;

-- ---- 2. Anon RLS — active catalog plans only ---------------------------------
drop policy if exists subscription_plans_select_active_anon on public.subscription_plans;
create policy subscription_plans_select_active_anon
  on public.subscription_plans
  for select
  to anon
  using (active = true);

-- ---- 3. Anon RLS — public promotions within their active window ---------------
drop policy if exists plan_promotions_select_public_anon on public.plan_promotions;
create policy plan_promotions_select_public_anon
  on public.plan_promotions
  for select
  to anon
  using (
    active = true
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

-- ---- 4. Verification (policy presence; no production data mutation) ----------
do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscription_plans'
      and policyname = 'subscription_plans_select_active_anon'
  ) then
    raise exception 'PAY-2c A.1 failed: subscription_plans_select_active_anon missing';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'plan_promotions'
      and policyname = 'plan_promotions_select_public_anon'
  ) then
    raise exception 'PAY-2c A.1 failed: plan_promotions_select_public_anon missing';
  end if;

  -- Authenticated policies from PAY-2a must remain intact.
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'subscription_plans'
      and policyname = 'subscription_plans_select_active'
  ) then
    raise exception 'PAY-2c A.1 failed: authenticated subscription_plans policy missing';
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'user_subscriptions'
      and policyname = 'user_subscriptions_select_own'
  ) then
    raise exception 'PAY-2c A.1 failed: user_subscriptions RLS must remain unchanged';
  end if;
end;
$$;
