-- =============================================================================
-- PAY-2a — Subscription & plan foundation
--
-- Establishes database-driven plan catalog, user subscriptions, and replaces
-- get_user_plan_tier() stub with a secure resolver.
--
-- Tier naming:
--   Public/product tiers: explorer | basic | pro | advance
--   PAY-1 rollover keys:  free     | basic | pro | advance
--   Mapping: explorer → free (credit_plan_rollover_config compatibility)
--
-- Out of scope: quiz usage counting, membership credit grants, billing webhooks.
-- Does NOT modify PAY-1 settlement, FIFO spending, expiry, GEOstore, entitlements.
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE guards where practical.
-- =============================================================================

-- ---- 1. subscription_plans (catalog) -----------------------------------------
create table if not exists public.subscription_plans (
  tier                   text        primary key,
  display_name           text        not null,
  monthly_price_cents    integer     not null default 0,
  annual_price_cents     integer,
  monthly_quiz_limit     integer,
  solo_quiz_limit        integer,
  pvp_limit              integer,
  multiplayer_limit      integer,
  monthly_credit_grant   integer     not null default 0,
  credit_rollover_months smallint    not null default 1,
  rollover_tier_key      text        not null,
  is_creator_plan        boolean     not null default false,
  active                 boolean     not null default true,
  metadata               jsonb       not null default '{}'::jsonb,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now(),
  constraint subscription_plans_tier_allowed check (
    tier in ('explorer', 'basic', 'pro', 'advance')
  ),
  constraint subscription_plans_monthly_price_non_negative check (
    monthly_price_cents >= 0
  ),
  constraint subscription_plans_annual_price_non_negative check (
    annual_price_cents is null or annual_price_cents >= 0
  ),
  constraint subscription_plans_monthly_quiz_limit_positive check (
    monthly_quiz_limit is null or monthly_quiz_limit > 0
  ),
  constraint subscription_plans_solo_limit_non_negative check (
    solo_quiz_limit is null or solo_quiz_limit >= 0
  ),
  constraint subscription_plans_pvp_limit_non_negative check (
    pvp_limit is null or pvp_limit >= 0
  ),
  constraint subscription_plans_multiplayer_limit_non_negative check (
    multiplayer_limit is null or multiplayer_limit >= 0
  ),
  constraint subscription_plans_monthly_credit_grant_non_negative check (
    monthly_credit_grant >= 0
  ),
  constraint subscription_plans_credit_rollover_months_non_negative check (
    credit_rollover_months >= 0
  ),
  constraint subscription_plans_rollover_tier_key_allowed check (
    rollover_tier_key in ('free', 'basic', 'pro', 'advance')
  ),
  constraint subscription_plans_rollover_tier_key_fkey
    foreign key (rollover_tier_key)
    references public.credit_plan_rollover_config (plan_tier)
);

comment on table public.subscription_plans is
  'Server-controlled subscription plan catalog. Limits and prices are authoritative for future enforcement.';

comment on column public.subscription_plans.monthly_quiz_limit is
  'Shared monthly session quota across solo/pvp/multiplayer. NULL = unlimited or per-mode limits apply.';

comment on column public.subscription_plans.solo_quiz_limit is
  'Per-mode solo cap (Explorer). NULL when plan uses monthly_quiz_limit or unlimited.';

comment on column public.subscription_plans.pvp_limit is
  'Per-mode PvP cap (Explorer). NULL when plan uses monthly_quiz_limit or unlimited.';

comment on column public.subscription_plans.multiplayer_limit is
  'Per-mode multiplayer cap (Explorer). NULL when plan uses monthly_quiz_limit or unlimited.';

comment on column public.subscription_plans.rollover_tier_key is
  'PAY-1 credit_plan_rollover_config key used by compute_credit_expires_at(). explorer maps to free.';

insert into public.subscription_plans (
  tier,
  display_name,
  monthly_price_cents,
  annual_price_cents,
  monthly_quiz_limit,
  solo_quiz_limit,
  pvp_limit,
  multiplayer_limit,
  monthly_credit_grant,
  credit_rollover_months,
  rollover_tier_key,
  is_creator_plan,
  active,
  metadata
) values
  (
    'explorer',
    'Explorer',
    0,
    0,
    null,
    8,
    1,
    1,
    0,
    1,
    'free',
    false,
    true,
    jsonb_build_object('billing_note', 'Free default plan')
  ),
  (
    'basic',
    'Basic',
    99,
    999,
    60,
    null,
    null,
    null,
    5,
    1,
    'basic',
    false,
    true,
    jsonb_build_object('quota_note', '60 shared solo+pvp+multiplayer sessions per calendar month')
  ),
  (
    'pro',
    'Pro',
    499,
    3999,
    null,
    null,
    null,
    null,
    20,
    1,
    'pro',
    false,
    true,
    jsonb_build_object('unlimited_sessions', true)
  ),
  (
    'advance',
    'Advance',
    999,
    8000,
    null,
    null,
    null,
    null,
    50,
    2,
    'advance',
    true,
    true,
    jsonb_build_object('unlimited_sessions', true, 'creator_plan', true)
  )
on conflict (tier) do update
set
  display_name           = excluded.display_name,
  monthly_price_cents    = excluded.monthly_price_cents,
  annual_price_cents     = excluded.annual_price_cents,
  monthly_quiz_limit     = excluded.monthly_quiz_limit,
  solo_quiz_limit        = excluded.solo_quiz_limit,
  pvp_limit              = excluded.pvp_limit,
  multiplayer_limit      = excluded.multiplayer_limit,
  monthly_credit_grant   = excluded.monthly_credit_grant,
  credit_rollover_months = excluded.credit_rollover_months,
  rollover_tier_key      = excluded.rollover_tier_key,
  is_creator_plan        = excluded.is_creator_plan,
  active                 = excluded.active,
  metadata               = excluded.metadata,
  updated_at             = now();

drop trigger if exists subscription_plans_set_updated_at on public.subscription_plans;
create trigger subscription_plans_set_updated_at
  before update on public.subscription_plans
  for each row
  execute function public.set_updated_at();

-- ---- 2. plan_promotions (future-proof pricing) --------------------------------
create table if not exists public.plan_promotions (
  id                   uuid        primary key default gen_random_uuid(),
  plan_tier            text        not null references public.subscription_plans (tier),
  billing_interval     text        not null,
  price_cents          integer     not null,
  intro_period_months  smallint,
  label                text        not null,
  starts_at            timestamptz,
  ends_at              timestamptz,
  active               boolean     not null default true,
  metadata             jsonb       not null default '{}'::jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint plan_promotions_billing_interval_allowed check (
    billing_interval in ('monthly', 'annual')
  ),
  constraint plan_promotions_price_non_negative check (
    price_cents >= 0
  ),
  constraint plan_promotions_intro_period_positive check (
    intro_period_months is null or intro_period_months > 0
  )
);

comment on table public.plan_promotions is
  'Promotional/introductory pricing variants. Billing engine applies these in later PAY-2 phases.';

create unique index if not exists plan_promotions_plan_interval_label_idx
  on public.plan_promotions (plan_tier, billing_interval, label);

insert into public.plan_promotions (
  plan_tier,
  billing_interval,
  price_cents,
  intro_period_months,
  label,
  active,
  metadata
) values (
  'pro',
  'monthly',
  399,
  3,
  'Pro introductory monthly pricing',
  true,
  jsonb_build_object(
    'standard_monthly_price_cents', 499,
    'note', 'First 3 months at introductory price; enforcement deferred to billing phase'
  )
)
on conflict (plan_tier, billing_interval, label) do update
set
  price_cents         = excluded.price_cents,
  intro_period_months = excluded.intro_period_months,
  active              = excluded.active,
  metadata            = excluded.metadata,
  updated_at          = now();

drop trigger if exists plan_promotions_set_updated_at on public.plan_promotions;
create trigger plan_promotions_set_updated_at
  before update on public.plan_promotions
  for each row
  execute function public.set_updated_at();

-- ---- 3. user_subscriptions ----------------------------------------------------
create table if not exists public.user_subscriptions (
  id                         uuid        primary key default gen_random_uuid(),
  user_id                    uuid        not null references auth.users (id) on delete cascade,
  plan_tier                  text        not null references public.subscription_plans (tier),
  billing_interval           text        not null default 'monthly',
  status                     text        not null default 'active',
  started_at                 timestamptz not null default now(),
  current_period_start       timestamptz not null default now(),
  current_period_end         timestamptz,
  cancel_at_period_end       boolean     not null default false,
  cancelled_at               timestamptz,
  provider_name              text,
  provider_customer_id       text,
  provider_subscription_id   text,
  metadata                   jsonb       not null default '{}'::jsonb,
  created_at                 timestamptz not null default now(),
  updated_at                 timestamptz not null default now(),
  constraint user_subscriptions_billing_interval_allowed check (
    billing_interval in ('monthly', 'annual')
  ),
  constraint user_subscriptions_status_allowed check (
    status in ('trialing', 'active', 'past_due', 'cancelled', 'expired', 'incomplete')
  )
);

comment on table public.user_subscriptions is
  'Authoritative per-user subscription state. Mutations are server-controlled (webhooks/admin), not client-writable.';

create index if not exists user_subscriptions_user_id_idx
  on public.user_subscriptions (user_id);

create index if not exists user_subscriptions_status_idx
  on public.user_subscriptions (status);

create unique index if not exists user_subscriptions_one_live_per_user_idx
  on public.user_subscriptions (user_id)
  where status in ('trialing', 'active', 'past_due');

drop trigger if exists user_subscriptions_set_updated_at on public.user_subscriptions;
create trigger user_subscriptions_set_updated_at
  before update on public.user_subscriptions
  for each row
  execute function public.set_updated_at();

-- ---- 4. RLS -------------------------------------------------------------------
alter table public.subscription_plans enable row level security;
alter table public.plan_promotions enable row level security;
alter table public.user_subscriptions enable row level security;

revoke all on public.subscription_plans from public, anon, authenticated;
revoke all on public.plan_promotions from public, anon, authenticated;
revoke all on public.user_subscriptions from public, anon, authenticated;

grant select on public.subscription_plans to authenticated;
grant select on public.plan_promotions to authenticated;
grant select on public.user_subscriptions to authenticated;

drop policy if exists subscription_plans_select_active on public.subscription_plans;
create policy subscription_plans_select_active
  on public.subscription_plans
  for select
  to authenticated
  using (active = true);

drop policy if exists plan_promotions_select_active on public.plan_promotions;
create policy plan_promotions_select_active
  on public.plan_promotions
  for select
  to authenticated
  using (active = true);

drop policy if exists user_subscriptions_select_own on public.user_subscriptions;
create policy user_subscriptions_select_own
  on public.user_subscriptions
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---- 5. map_plan_tier_to_rollover_key -----------------------------------------
create or replace function public.map_plan_tier_to_rollover_key(_plan_tier text)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_key text;
begin
  if _plan_tier is null or btrim(_plan_tier) = '' then
    raise exception 'plan_tier is required';
  end if;

  select sp.rollover_tier_key
  into v_key
  from public.subscription_plans sp
  where sp.tier = _plan_tier
    and sp.active = true;

  if not found then
    raise exception 'Unknown or inactive plan tier: %', _plan_tier;
  end if;

  return v_key;
end;
$$;

comment on function public.map_plan_tier_to_rollover_key(text) is
  'Maps public plan tier (explorer/basic/pro/advance) to PAY-1 rollover config key (free/basic/pro/advance).';

revoke all on function public.map_plan_tier_to_rollover_key(text)
  from public, anon, authenticated;

-- ---- 6. resolve_user_subscription_tier ----------------------------------------
create or replace function public.resolve_user_subscription_tier(_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_tier text;
begin
  if _user_id is null then
    raise exception 'user_id is required';
  end if;

  select us.plan_tier
  into v_tier
  from public.user_subscriptions us
  where us.user_id = _user_id
    and us.status in ('trialing', 'active', 'past_due')
    and (
      us.current_period_end is null
      or us.current_period_end > now()
    )
  order by us.current_period_start desc, us.created_at desc
  limit 1;

  return coalesce(v_tier, 'explorer');
end;
$$;

comment on function public.resolve_user_subscription_tier(uuid) is
  'Returns the active public plan tier for a user, or explorer when no live subscription exists.';

revoke all on function public.resolve_user_subscription_tier(uuid)
  from public, anon, authenticated;

-- ---- 7. get_user_plan_tier (PAY-1 compatible rollover key) --------------------
create or replace function public.get_user_plan_tier(_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_public_tier text;
begin
  if _user_id is null then
    raise exception 'user_id is required';
  end if;

  v_public_tier := public.resolve_user_subscription_tier(_user_id);

  return public.map_plan_tier_to_rollover_key(v_public_tier);
end;
$$;

comment on function public.get_user_plan_tier(uuid) is
  'Internal PAY-1 resolver. Returns rollover config key (free/basic/pro/advance). explorer → free.';

revoke all on function public.get_user_plan_tier(uuid)
  from public, anon, authenticated;

-- ---- 8. get_my_plan_tier (authenticated read) ---------------------------------
create or replace function public.get_my_plan_tier()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid           uuid := auth.uid();
  v_public_tier   text;
  v_rollover_key  text;
  v_plan          public.subscription_plans;
  v_subscription  public.user_subscriptions;
begin
  if v_uid is null then
    raise exception 'Authentication required';
  end if;

  v_public_tier := public.resolve_user_subscription_tier(v_uid);
  v_rollover_key := public.map_plan_tier_to_rollover_key(v_public_tier);

  select sp.*
  into v_plan
  from public.subscription_plans sp
  where sp.tier = v_public_tier;

  select us.*
  into v_subscription
  from public.user_subscriptions us
  where us.user_id = v_uid
    and us.status in ('trialing', 'active', 'past_due')
    and (
      us.current_period_end is null
      or us.current_period_end > now()
    )
  order by us.current_period_start desc, us.created_at desc
  limit 1;

  return jsonb_build_object(
    'tier', v_public_tier,
    'display_name', v_plan.display_name,
    'rollover_tier_key', v_rollover_key,
    'monthly_price_cents', v_plan.monthly_price_cents,
    'annual_price_cents', v_plan.annual_price_cents,
    'monthly_quiz_limit', v_plan.monthly_quiz_limit,
    'solo_quiz_limit', v_plan.solo_quiz_limit,
    'pvp_limit', v_plan.pvp_limit,
    'multiplayer_limit', v_plan.multiplayer_limit,
    'monthly_credit_grant', v_plan.monthly_credit_grant,
    'credit_rollover_months', v_plan.credit_rollover_months,
    'is_creator_plan', v_plan.is_creator_plan,
    'subscription', case
      when v_subscription.id is null then null
      else jsonb_build_object(
        'id', v_subscription.id,
        'status', v_subscription.status,
        'billing_interval', v_subscription.billing_interval,
        'started_at', v_subscription.started_at,
        'current_period_start', v_subscription.current_period_start,
        'current_period_end', v_subscription.current_period_end,
        'cancel_at_period_end', v_subscription.cancel_at_period_end,
        'cancelled_at', v_subscription.cancelled_at
      )
    end
  );
end;
$$;

comment on function public.get_my_plan_tier() is
  'Authenticated read-only plan snapshot for the current user. Never accepts client-supplied tiers.';

revoke all on function public.get_my_plan_tier() from public, anon;
grant execute on function public.get_my_plan_tier() to authenticated;

-- ---- 9. PAY-2a verification tests ---------------------------------------------
do $$
declare
  v_user              uuid := '757345e7-f79b-4b62-8416-1c11d5eefdf5';
  v_user_exists       boolean;
  v_tier              text;
  v_sub_id            uuid;
  v_duplicate_blocked boolean := false;
begin
  -- Tier mapping
  if public.map_plan_tier_to_rollover_key('explorer') <> 'free' then
    raise exception 'PAY-2a test failed: explorer must map to free';
  end if;

  if public.map_plan_tier_to_rollover_key('basic') <> 'basic' then
    raise exception 'PAY-2a test failed: basic mapping';
  end if;

  if public.map_plan_tier_to_rollover_key('pro') <> 'pro' then
    raise exception 'PAY-2a test failed: pro mapping';
  end if;

  if public.map_plan_tier_to_rollover_key('advance') <> 'advance' then
    raise exception 'PAY-2a test failed: advance mapping';
  end if;

  -- Plan seed
  if (select count(*) from public.subscription_plans where active = true) <> 4 then
    raise exception 'PAY-2a test failed: expected 4 active subscription plans';
  end if;

  if (select monthly_price_cents from public.subscription_plans where tier = 'basic') <> 99 then
    raise exception 'PAY-2a test failed: basic monthly price';
  end if;

  if (select monthly_quiz_limit from public.subscription_plans where tier = 'explorer') is not null then
    raise exception 'PAY-2a test failed: explorer must use per-mode limits, not monthly_quiz_limit';
  end if;

  if (select solo_quiz_limit from public.subscription_plans where tier = 'explorer') <> 8 then
    raise exception 'PAY-2a test failed: explorer solo limit';
  end if;

  if (select monthly_quiz_limit from public.subscription_plans where tier = 'basic') <> 60 then
    raise exception 'PAY-2a test failed: basic shared quota';
  end if;

  if (select monthly_quiz_limit from public.subscription_plans where tier = 'pro') is not null then
    raise exception 'PAY-2a test failed: pro must be unlimited (NULL monthly_quiz_limit)';
  end if;

  if (select credit_rollover_months from public.subscription_plans where tier = 'advance') <> 2 then
    raise exception 'PAY-2a test failed: advance rollover months';
  end if;

  if not exists (
    select 1
    from public.plan_promotions pp
    where pp.plan_tier = 'pro'
      and pp.price_cents = 399
      and pp.intro_period_months = 3
      and pp.active = true
  ) then
    raise exception 'PAY-2a test failed: pro introductory promotion seed missing';
  end if;

  -- Null user guard
  begin
    perform public.get_user_plan_tier(null);
    raise exception 'PAY-2a test failed: get_user_plan_tier(null) should raise';
  exception
    when others then
      if position('user_id is required' in sqlerrm) = 0 then
        raise;
      end if;
  end;

  -- PAY-1 rollover compatibility for anonymous users (no subscription)
  v_tier := public.get_user_plan_tier(gen_random_uuid());
  if not exists (
    select 1 from public.credit_plan_rollover_config c where c.plan_tier = v_tier
  ) then
    raise exception 'PAY-2a test failed: rollover key % missing from credit_plan_rollover_config', v_tier;
  end if;

  if v_tier <> 'free' then
    raise exception 'PAY-2a test failed: default rollover key must be free, got %', v_tier;
  end if;

  select exists(select 1 from auth.users where id = v_user)
  into v_user_exists;

  if v_user_exists then
    -- Explorer fallback with no subscription row
    delete from public.user_subscriptions where user_id = v_user;

    if public.resolve_user_subscription_tier(v_user) <> 'explorer' then
      raise exception 'PAY-2a test failed: explorer fallback tier';
    end if;

    if public.get_user_plan_tier(v_user) <> 'free' then
      raise exception 'PAY-2a test failed: explorer fallback rollover key must be free';
    end if;

    -- Active Basic
    insert into public.user_subscriptions (
      user_id, plan_tier, billing_interval, status,
      current_period_start, current_period_end
    ) values (
      v_user, 'basic', 'monthly', 'active',
      now(), now() + interval '30 days'
    )
    returning id into v_sub_id;

    if public.resolve_user_subscription_tier(v_user) <> 'basic' then
      raise exception 'PAY-2a test failed: active basic resolver';
    end if;

    if public.get_user_plan_tier(v_user) <> 'basic' then
      raise exception 'PAY-2a test failed: active basic rollover key';
    end if;

    -- Duplicate live subscription protection
    begin
      insert into public.user_subscriptions (
        user_id, plan_tier, billing_interval, status,
        current_period_start, current_period_end
      ) values (
        v_user, 'pro', 'monthly', 'active',
        now(), now() + interval '30 days'
      );
    exception
      when unique_violation then
        v_duplicate_blocked := true;
    end;

    if not v_duplicate_blocked then
      raise exception 'PAY-2a test failed: duplicate active subscription was allowed';
    end if;

    -- Cancelled subscription ignored → explorer/free fallback
    update public.user_subscriptions
    set status = 'cancelled', cancelled_at = now()
    where id = v_sub_id;

    if public.get_user_plan_tier(v_user) <> 'free' then
      raise exception 'PAY-2a test failed: cancelled subscription must fall back to free';
    end if;

    delete from public.user_subscriptions where user_id = v_user;

    -- Expired period ignored
    insert into public.user_subscriptions (
      user_id, plan_tier, billing_interval, status,
      current_period_start, current_period_end
    ) values (
      v_user, 'pro', 'monthly', 'active',
      now() - interval '60 days', now() - interval '1 day'
    )
    returning id into v_sub_id;

    if public.get_user_plan_tier(v_user) <> 'free' then
      raise exception 'PAY-2a test failed: expired period must fall back to free';
    end if;

    delete from public.user_subscriptions where user_id = v_user;

    -- Active Pro
    insert into public.user_subscriptions (
      user_id, plan_tier, billing_interval, status,
      current_period_start, current_period_end
    ) values (
      v_user, 'pro', 'monthly', 'active',
      now(), now() + interval '30 days'
    );

    if public.get_user_plan_tier(v_user) <> 'pro' then
      raise exception 'PAY-2a test failed: active pro rollover key';
    end if;

    delete from public.user_subscriptions where user_id = v_user;

    -- Active Advance
    insert into public.user_subscriptions (
      user_id, plan_tier, billing_interval, status,
      current_period_start, current_period_end
    ) values (
      v_user, 'advance', 'annual', 'active',
      now(), now() + interval '365 days'
    );

    if public.get_user_plan_tier(v_user) <> 'advance' then
      raise exception 'PAY-2a test failed: active advance rollover key';
    end if;

    delete from public.user_subscriptions where user_id = v_user;
  end if;

  -- compute_credit_expires_at still accepts resolver output
  if public.compute_credit_expires_at(
    public.get_user_plan_tier(coalesce(v_user, gen_random_uuid())),
    timestamptz '2026-08-10 00:00:00+00'
  ) is null then
    raise exception 'PAY-2a test failed: compute_credit_expires_at returned null';
  end if;
end;
$$;
