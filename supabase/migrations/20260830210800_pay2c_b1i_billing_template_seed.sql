-- =============================================================================
-- PAY-2c B.1i — logical billing provider template seed (INR + USD)
--
-- Seeds billing_provider_prices templates only.
-- Does NOT create billing_provider_plan_instances or Razorpay Plan IDs.
-- Does NOT modify subscription_plans, plan_promotions catalog values, or PAY-2b.
--
-- USD templates are inactive until Razorpay international USD capability is confirmed.
-- =============================================================================

do $$
declare
  v_pro_intro_promo uuid;
begin
  select id
  into v_pro_intro_promo
  from public.plan_promotions
  where plan_tier = 'pro'
    and billing_interval = 'monthly'
    and label = 'Pro introductory monthly pricing'
  limit 1;

  if v_pro_intro_promo is null then
    raise exception 'PAY-2c B.1i failed: Pro introductory plan_promotions row not found';
  end if;

  insert into public.billing_provider_prices (
    provider,
    plan_tier,
    billing_interval,
    currency,
    plan_promotion_id,
    pricing_mode,
    price_lock_policy,
    rounding_mode,
    active,
    metadata
  )
  select
    v.provider,
    v.plan_tier,
    v.billing_interval,
    v.currency,
    v.plan_promotion_id,
    v.pricing_mode,
    'locked_at_signup',
    'half_up_minor_unit',
    v.active,
    v.metadata
  from (
    values
      ('razorpay', 'basic', 'monthly', 'INR', null::uuid, 'fx_at_signup', true, '{"market":"india"}'::jsonb),
      ('razorpay', 'basic', 'annual', 'INR', null::uuid, 'fx_at_signup', true, '{"market":"india"}'::jsonb),
      ('razorpay', 'pro', 'monthly', 'INR', v_pro_intro_promo, 'fx_at_signup', true, '{"market":"india","promo":"intro"}'::jsonb),
      ('razorpay', 'pro', 'monthly', 'INR', null::uuid, 'fx_at_signup', true, '{"market":"india","promo":"standard"}'::jsonb),
      ('razorpay', 'pro', 'annual', 'INR', null::uuid, 'fx_at_signup', true, '{"market":"india"}'::jsonb),
      ('razorpay', 'advance', 'monthly', 'INR', null::uuid, 'fx_at_signup', true, '{"market":"india"}'::jsonb),
      ('razorpay', 'advance', 'annual', 'INR', null::uuid, 'fx_at_signup', true, '{"market":"india"}'::jsonb),
      ('razorpay', 'basic', 'monthly', 'USD', null::uuid, 'fixed', false, '{"market":"international","note":"inactive until Razorpay USD subscriptions confirmed"}'::jsonb),
      ('razorpay', 'basic', 'annual', 'USD', null::uuid, 'fixed', false, '{"market":"international","note":"inactive until Razorpay USD subscriptions confirmed"}'::jsonb),
      ('razorpay', 'pro', 'monthly', 'USD', v_pro_intro_promo, 'fixed', false, '{"market":"international","promo":"intro","note":"inactive until Razorpay USD subscriptions confirmed"}'::jsonb),
      ('razorpay', 'pro', 'monthly', 'USD', null::uuid, 'fixed', false, '{"market":"international","promo":"standard","note":"inactive until Razorpay USD subscriptions confirmed"}'::jsonb),
      ('razorpay', 'pro', 'annual', 'USD', null::uuid, 'fixed', false, '{"market":"international","note":"inactive until Razorpay USD subscriptions confirmed"}'::jsonb),
      ('razorpay', 'advance', 'monthly', 'USD', null::uuid, 'fixed', false, '{"market":"international","note":"inactive until Razorpay USD subscriptions confirmed"}'::jsonb),
      ('razorpay', 'advance', 'annual', 'USD', null::uuid, 'fixed', false, '{"market":"international","note":"inactive until Razorpay USD subscriptions confirmed"}'::jsonb)
  ) as v(
    provider,
    plan_tier,
    billing_interval,
    currency,
    plan_promotion_id,
    pricing_mode,
    active,
    metadata
  )
  where not exists (
    select 1
    from public.billing_provider_prices bpp
    where bpp.provider = v.provider
      and bpp.plan_tier = v.plan_tier
      and bpp.billing_interval = v.billing_interval
      and bpp.currency = v.currency
      and coalesce(bpp.plan_promotion_id, '00000000-0000-0000-0000-000000000000'::uuid)
        = coalesce(v.plan_promotion_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );
end;
$$;

-- ---- Verification ------------------------------------------------------------
do $$
declare
  v_inr_count integer;
  v_usd_count integer;
  v_pro_intro_promo uuid;
  v_pro_intro_inr uuid;
begin
  select count(*)::integer
  into v_inr_count
  from public.billing_provider_prices
  where provider = 'razorpay'
    and currency = 'INR'
    and active = true;

  if v_inr_count <> 7 then
    raise exception 'PAY-2c B.1i failed: expected 7 active INR templates, got %', v_inr_count;
  end if;

  select count(*)::integer
  into v_usd_count
  from public.billing_provider_prices
  where provider = 'razorpay'
    and currency = 'USD'
    and active = false;

  if v_usd_count <> 7 then
    raise exception 'PAY-2c B.1i failed: expected 7 inactive USD templates, got %', v_usd_count;
  end if;

  if exists (
    select 1
    from public.billing_provider_prices
    where plan_tier = 'explorer'
  ) then
    raise exception 'PAY-2c B.1i failed: explorer must not have billable templates';
  end if;

  select id
  into v_pro_intro_promo
  from public.plan_promotions
  where plan_tier = 'pro'
    and billing_interval = 'monthly'
    and label = 'Pro introductory monthly pricing'
    and price_cents = 399
    and intro_period_months = 3
    and active = true
  limit 1;

  if v_pro_intro_promo is null then
    raise exception 'PAY-2c B.1i failed: Pro intro plan_promotions row missing or altered';
  end if;

  select id
  into v_pro_intro_inr
  from public.billing_provider_prices
  where provider = 'razorpay'
    and plan_tier = 'pro'
    and billing_interval = 'monthly'
    and currency = 'INR'
    and plan_promotion_id = v_pro_intro_promo
    and active = true
  limit 1;

  if v_pro_intro_inr is null then
    raise exception 'PAY-2c B.1i failed: Pro intro INR template missing';
  end if;

  if (select monthly_price_cents from public.subscription_plans where tier = 'pro') <> 499 then
    raise exception 'PAY-2c B.1i failed: Pro standard catalog price altered';
  end if;

  if (select monthly_credit_grant from public.subscription_plans where tier = 'pro') <> 20 then
    raise exception 'PAY-2c B.1i failed: Pro monthly_credit_grant altered';
  end if;

  if exists (
    select 1
    from public.billing_provider_plan_instances
  ) then
    raise exception 'PAY-2c B.1i failed: plan instances must not be seeded in B.1';
  end if;

  if not exists (
    select 1
    from pg_proc
    where proname = 'grant_membership_credits_for_period'
  ) then
    raise exception 'PAY-2c B.1i failed: PAY-2b grant_membership_credits_for_period missing';
  end if;
end;
$$;
