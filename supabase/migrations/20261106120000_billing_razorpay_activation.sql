-- =============================================================================
-- PAY-3a — Razorpay activation helpers
--
-- Adds server-side RPCs and indexes needed by the Razorpay Edge Functions.
-- All structural tables were created in PAY-2c B.1a–B.1i.
-- This migration only adds RPCs, indexes, and idempotency guards.
-- Safe to re-run: CREATE OR REPLACE / IF NOT EXISTS throughout.
-- =============================================================================

-- ---- 1. Idempotency guard on billing_customers ---------------------------
-- Prevents duplicate Razorpay customer creation for the same user.
create unique index if not exists billing_customers_user_provider_unique_idx
  on public.billing_customers (user_id, provider)
  where provider = 'razorpay';

-- ---- 2. Subscription lookup by provider ID --------------------------------
create index if not exists user_subscriptions_razorpay_id_idx
  on public.user_subscriptions (provider_subscription_id)
  where provider_name = 'razorpay' and provider_subscription_id is not null;

-- ---- 3. RPC: begin_razorpay_subscription ------------------------------------
-- Called by create-razorpay-subscription Edge Function (service-role).
-- Creates or returns existing billing_customers row, then creates a pending
-- user_subscriptions row that the webhook will activate.
-- Returns the internal subscription UUID so the Edge Function can embed it.
create or replace function public.begin_razorpay_subscription(
  p_user_id                uuid,
  p_plan_tier              text,
  p_billing_interval       text,
  p_provider_customer_id   text,
  p_provider_subscription_id text,
  p_charge_currency        char(3),
  p_price_snapshot_id      uuid
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subscription_id uuid;
begin
  -- Validate tier
  if p_plan_tier not in ('basic', 'pro', 'advance') then
    raise exception 'begin_razorpay_subscription: invalid plan tier %', p_plan_tier;
  end if;

  -- Validate interval
  if p_billing_interval not in ('monthly', 'annual') then
    raise exception 'begin_razorpay_subscription: invalid billing interval %', p_billing_interval;
  end if;

  -- Upsert billing customer
  insert into public.billing_customers (
    user_id,
    provider,
    provider_customer_id,
    created_at,
    updated_at
  )
  values (
    p_user_id,
    'razorpay',
    p_provider_customer_id,
    now(),
    now()
  )
  on conflict (user_id, provider) do update
    set provider_customer_id = excluded.provider_customer_id,
        updated_at = now();

  -- Cancel any existing pending subscriptions for this user to prevent duplicates
  update public.user_subscriptions
  set status = 'cancelled',
      cancelled_at = now(),
      updated_at = now()
  where user_id = p_user_id
    and status = 'created'
    and provider_name = 'razorpay'
    and id <> coalesce(v_subscription_id, '00000000-0000-0000-0000-000000000000'::uuid);

  -- Insert pending subscription (webhook will activate it)
  insert into public.user_subscriptions (
    user_id,
    plan_tier,
    provider_name,
    provider_customer_id,
    provider_subscription_id,
    billing_interval,
    status,
    charge_currency,
    current_price_snapshot_id,
    started_at,
    created_at,
    updated_at
  )
  values (
    p_user_id,
    p_plan_tier,
    'razorpay',
    p_provider_customer_id,
    p_provider_subscription_id,
    p_billing_interval,
    'created',
    p_charge_currency,
    p_price_snapshot_id,
    now(),
    now(),
    now()
  )
  on conflict (provider_name, provider_subscription_id)
    where provider_subscription_id is not null
  do update
    set updated_at = now()
  returning id into v_subscription_id;

  return v_subscription_id;
end;
$$;

comment on function public.begin_razorpay_subscription is
  'Service-role only. Creates billing_customer + pending user_subscription from Edge Function.';

revoke all on function public.begin_razorpay_subscription from public, anon, authenticated;
grant execute on function public.begin_razorpay_subscription to service_role;

-- ---- 4. RPC: activate_razorpay_subscription ---------------------------------
-- Called by razorpay-webhook Edge Function after successful payment.
-- Only activates if status is 'created' or 'authenticated' (not already active).
create or replace function public.activate_razorpay_subscription(
  p_provider_subscription_id text,
  p_provider_event_id        text,
  p_period_start             timestamptz,
  p_period_end               timestamptz,
  p_next_billing_at          timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub record;
begin
  select id, user_id, plan_tier, status
  into v_sub
  from public.user_subscriptions
  where provider_subscription_id = p_provider_subscription_id
    and provider_name = 'razorpay'
  for update;

  if not found then
    raise exception 'activate_razorpay_subscription: subscription % not found', p_provider_subscription_id;
  end if;

  -- Idempotency: skip if already active
  if v_sub.status = 'active' then
    return;
  end if;

  update public.user_subscriptions
  set status                 = 'active',
      current_period_start   = p_period_start,
      current_period_end     = p_period_end,
      next_billing_at        = p_next_billing_at,
      provider_last_event_id = p_provider_event_id,
      provider_last_event_at = now(),
      updated_at             = now()
  where id = v_sub.id;
end;
$$;

comment on function public.activate_razorpay_subscription is
  'Service-role only. Activates subscription after verified payment webhook.';

revoke all on function public.activate_razorpay_subscription from public, anon, authenticated;
grant execute on function public.activate_razorpay_subscription to service_role;

-- ---- 5. RPC: halt_razorpay_subscription -------------------------------------
create or replace function public.halt_razorpay_subscription(
  p_provider_subscription_id text,
  p_provider_event_id        text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_subscriptions
  set status                 = 'halted',
      provider_last_event_id = p_provider_event_id,
      provider_last_event_at = now(),
      updated_at             = now()
  where provider_subscription_id = p_provider_subscription_id
    and provider_name = 'razorpay'
    and status not in ('cancelled', 'completed');
end;
$$;

revoke all on function public.halt_razorpay_subscription from public, anon, authenticated;
grant execute on function public.halt_razorpay_subscription to service_role;

-- ---- 6. RPC: cancel_razorpay_subscription -----------------------------------
create or replace function public.cancel_razorpay_subscription(
  p_provider_subscription_id text,
  p_provider_event_id        text,
  p_cancel_at_period_end     boolean default false
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.user_subscriptions
  set status                 = case when p_cancel_at_period_end then 'active' else 'cancelled' end,
      cancel_at_period_end   = p_cancel_at_period_end,
      cancelled_at           = case when not p_cancel_at_period_end then now() else cancelled_at end,
      provider_last_event_id = p_provider_event_id,
      provider_last_event_at = now(),
      updated_at             = now()
  where provider_subscription_id = p_provider_subscription_id
    and provider_name = 'razorpay';
end;
$$;

revoke all on function public.cancel_razorpay_subscription from public, anon, authenticated;
grant execute on function public.cancel_razorpay_subscription to service_role;

-- ---- 7. RPC: record_razorpay_payment ----------------------------------------
-- Records a payment row; idempotent on provider_payment_id.
create or replace function public.record_razorpay_payment(
  p_subscription_id         uuid,
  p_user_id                 uuid,
  p_price_snapshot_id       uuid,
  p_provider_payment_id     text,
  p_provider_invoice_id     text,
  p_provider_subscription_id text,
  p_plan_tier               text,
  p_charge_currency         char(3),
  p_charge_amount_minor     integer,
  p_catalog_usd_amount_cents integer,
  p_status                  text,
  p_failure_code            text default null,
  p_failure_reason          text default null,
  p_period_start            timestamptz default null,
  p_period_end              timestamptz default null,
  p_webhook_event_id        uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_payment_id uuid;
  v_event_id   uuid;
begin
  -- Provide a placeholder webhook_event_id if not supplied yet
  v_event_id := coalesce(p_webhook_event_id, gen_random_uuid());

  insert into public.billing_payments (
    subscription_id,
    user_id,
    price_snapshot_id,
    provider,
    provider_payment_id,
    provider_invoice_id,
    provider_subscription_id,
    billing_period_start,
    billing_period_end,
    catalog_usd_amount_cents,
    charge_currency,
    charge_amount_minor,
    plan_tier,
    status,
    failure_code,
    failure_reason,
    paid_at,
    attempted_at,
    webhook_event_id,
    created_at
  )
  values (
    p_subscription_id,
    p_user_id,
    p_price_snapshot_id,
    'razorpay',
    p_provider_payment_id,
    p_provider_invoice_id,
    p_provider_subscription_id,
    p_period_start,
    p_period_end,
    p_catalog_usd_amount_cents,
    p_charge_currency,
    p_charge_amount_minor,
    p_plan_tier,
    p_status,
    p_failure_code,
    p_failure_reason,
    case when p_status = 'succeeded' then now() else null end,
    now(),
    v_event_id,
    now()
  )
  on conflict (provider, provider_payment_id) do nothing
  returning id into v_payment_id;

  return v_payment_id;
end;
$$;

revoke all on function public.record_razorpay_payment from public, anon, authenticated;
grant execute on function public.record_razorpay_payment to service_role;

-- ---- 8. RPC: get_my_active_subscription (client-readable) -------------------
-- Returns the current user's active subscription details for the checkout page.
create or replace function public.get_my_active_subscription()
returns jsonb
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_user_id uuid;
  v_result  jsonb;
begin
  select auth.uid() into v_user_id;
  if v_user_id is null then
    raise exception 'get_my_active_subscription: authentication required';
  end if;

  select to_jsonb(sub)
  into v_result
  from (
    select
      us.id,
      us.plan_tier,
      us.billing_interval,
      us.status,
      us.cancel_at_period_end,
      us.current_period_end,
      us.next_billing_at,
      sp.display_name,
      sp.monthly_price_cents,
      sp.annual_price_cents
    from public.user_subscriptions us
    join public.subscription_plans sp on sp.tier = us.plan_tier
    where us.user_id = v_user_id
      and us.status in ('active', 'created', 'authenticated')
      and us.provider_name = 'razorpay'
    order by us.created_at desc
    limit 1
  ) sub;

  return v_result;
end;
$$;

comment on function public.get_my_active_subscription is
  'Returns current authenticated user''s Razorpay subscription. Client-safe.';

grant execute on function public.get_my_active_subscription to authenticated;

-- ---- 9. RPC: request_cancel_subscription ------------------------------------
-- Client-callable: sets cancel_at_period_end = true.
-- Actual cancellation of the Razorpay subscription is done by the Edge Function.
create or replace function public.request_cancel_subscription()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_sub_id  uuid;
begin
  select auth.uid() into v_user_id;
  if v_user_id is null then
    raise exception 'request_cancel_subscription: authentication required';
  end if;

  update public.user_subscriptions
  set cancel_at_period_end = true,
      updated_at = now()
  where user_id = v_user_id
    and status = 'active'
    and provider_name = 'razorpay'
    and cancel_at_period_end = false
  returning id into v_sub_id;

  if v_sub_id is null then
    return jsonb_build_object('ok', false, 'reason', 'no_active_subscription');
  end if;

  return jsonb_build_object('ok', true, 'subscription_id', v_sub_id);
end;
$$;

comment on function public.request_cancel_subscription is
  'Client-callable: marks subscription for end-of-period cancellation. Edge Function processes actual Razorpay API call.';

grant execute on function public.request_cancel_subscription to authenticated;
