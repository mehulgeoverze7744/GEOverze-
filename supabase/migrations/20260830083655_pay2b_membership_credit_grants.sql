-- =============================================================================
-- PAY-2b — Membership credit grant pipeline
--
-- Server-controlled monthly membership credits for paid subscribers.
-- Grants flow: user_subscriptions → membership_credit_grants → credit_ledger_entries
-- → reconcile_user_credits() → user_progression.credits
--
-- Does NOT modify PAY-1 FIFO/settlement/expiry, PAY-2a objects, or billing webhooks.
-- Provider-agnostic: service-role RPCs; PAY-2c wires webhooks/cron later.
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE guards where practical.
-- =============================================================================

-- ---- 1. membership_credit_grants ------------------------------------------------
create table if not exists public.membership_credit_grants (
  id                  uuid        primary key default gen_random_uuid(),
  user_id             uuid        not null references auth.users (id) on delete cascade,
  subscription_id     uuid        not null references public.user_subscriptions (id) on delete cascade,
  plan_tier           text        not null references public.subscription_plans (tier),
  grant_period_start  timestamptz not null,
  grant_period_end    timestamptz not null,
  credit_amount       integer     not null,
  rollover_tier_key   text        not null,
  ledger_entry_id     uuid        references public.credit_ledger_entries (id),
  status              text        not null,
  skip_reason         text,
  idempotency_key     text        not null,
  metadata            jsonb       not null default '{}'::jsonb,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint membership_credit_grants_credit_amount_non_negative check (
    credit_amount >= 0
  ),
  constraint membership_credit_grants_status_allowed check (
    status in ('pending', 'completed', 'skipped', 'failed')
  ),
  constraint membership_credit_grants_period_order check (
    grant_period_end > grant_period_start
  ),
  constraint membership_credit_grants_idempotency_key_nonempty check (
    btrim(idempotency_key) <> ''
  ),
  constraint membership_credit_grants_rollover_tier_key_allowed check (
    rollover_tier_key in ('free', 'basic', 'pro', 'advance')
  ),
  constraint membership_credit_grants_subscription_period_unique
    unique (subscription_id, grant_period_start),
  constraint membership_credit_grants_idempotency_key_unique
    unique (idempotency_key)
);

comment on table public.membership_credit_grants is
  'Audit + idempotency anchor for membership credit grants. Mutations are service-controlled.';

create index if not exists membership_credit_grants_user_period_idx
  on public.membership_credit_grants (user_id, grant_period_start desc);

create index if not exists membership_credit_grants_subscription_period_idx
  on public.membership_credit_grants (subscription_id, grant_period_start desc);

create index if not exists membership_credit_grants_reconcile_idx
  on public.membership_credit_grants (status)
  where status in ('pending', 'failed');

drop trigger if exists membership_credit_grants_set_updated_at on public.membership_credit_grants;
create trigger membership_credit_grants_set_updated_at
  before update on public.membership_credit_grants
  for each row
  execute function public.set_updated_at();

-- ---- 2. RLS ---------------------------------------------------------------------
alter table public.membership_credit_grants enable row level security;

revoke all on public.membership_credit_grants from public, anon, authenticated;

grant select on public.membership_credit_grants to authenticated;

drop policy if exists membership_credit_grants_select_own on public.membership_credit_grants;
create policy membership_credit_grants_select_own
  on public.membership_credit_grants
  for select
  to authenticated
  using (user_id = (select auth.uid()));

-- ---- 3. membership_grant_idempotency_key ------------------------------------------
create or replace function public.membership_grant_idempotency_key(
  _subscription_id uuid,
  _grant_period_start timestamptz
)
returns text
language sql
immutable
set search_path = public
as $$
  select
    'membership_grant:'
    || _subscription_id::text
    || ':'
    || to_char(
      _grant_period_start at time zone 'UTC',
      'YYYY-MM-DD"T"HH24:MI:SS.USOF'
    );
$$;

comment on function public.membership_grant_idempotency_key(uuid, timestamptz) is
  'Stable ledger/grant idempotency key for a subscription grant period.';

revoke all on function public.membership_grant_idempotency_key(uuid, timestamptz)
  from public, anon, authenticated;

-- ---- 4. is_membership_grant_eligible (internal) ---------------------------------
create or replace function public.is_membership_grant_eligible(
  _status text,
  _at_time timestamptz,
  _period_start timestamptz,
  _period_end timestamptz,
  _monthly_credit_grant integer
)
returns boolean
language plpgsql
immutable
set search_path = public
as $$
begin
  if _monthly_credit_grant is null or _monthly_credit_grant <= 0 then
    return false;
  end if;

  if _status not in ('active', 'trialing') then
    return false;
  end if;

  if _at_time < _period_start then
    return false;
  end if;

  if _period_end is not null and _at_time >= _period_end then
    return false;
  end if;

  return true;
end;
$$;

comment on function public.is_membership_grant_eligible(text, timestamptz, timestamptz, timestamptz, integer) is
  'Stricter than PAY-2a tier resolver: active/trialing only; excludes past_due.';

revoke all on function public.is_membership_grant_eligible(text, timestamptz, timestamptz, timestamptz, integer)
  from public, anon, authenticated;

-- ---- 5. compute_membership_grant_period -----------------------------------------
create or replace function public.compute_membership_grant_period(
  _subscription_id uuid,
  _at_time timestamptz default now()
)
returns table (
  grant_period_start timestamptz,
  grant_period_end timestamptz
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_sub       public.user_subscriptions%rowtype;
  v_n         integer;
  v_start     timestamptz;
  v_end       timestamptz;
  v_term_end  timestamptz;
begin
  if _subscription_id is null then
    raise exception 'subscription_id is required';
  end if;

  if _at_time is null then
    raise exception 'at_time is required';
  end if;

  select us.*
  into v_sub
  from public.user_subscriptions us
  where us.id = _subscription_id;

  if not found then
    return;
  end if;

  if _at_time < v_sub.current_period_start then
    return;
  end if;

  v_term_end := v_sub.current_period_end;

  if v_term_end is not null and _at_time >= v_term_end then
    return;
  end if;

  if v_sub.billing_interval = 'monthly' then
    grant_period_start := v_sub.current_period_start;
    grant_period_end := coalesce(
      v_term_end,
      v_sub.current_period_start + make_interval(months => 1)
    );
    return next;
    return;
  end if;

  if v_sub.billing_interval = 'annual' then
    if v_term_end is null then
      raise exception
        'annual subscription % requires current_period_end for grant windows',
        _subscription_id;
    end if;

    v_n := 0;
    loop
      v_start := v_sub.current_period_start + make_interval(months => v_n);
      exit when v_start >= v_term_end;

      v_end := least(
        v_sub.current_period_start + make_interval(months => v_n + 1),
        v_term_end
      );

      if _at_time >= v_start and _at_time < v_end then
        grant_period_start := v_start;
        grant_period_end := v_end;
        return next;
        return;
      end if;

      v_n := v_n + 1;
      if v_n > 120 then
        raise exception 'grant period iteration guard exceeded for subscription %', _subscription_id;
      end if;
    end loop;

    return;
  end if;

  raise exception 'unsupported billing_interval % for subscription %', v_sub.billing_interval, _subscription_id;
end;
$$;

comment on function public.compute_membership_grant_period(uuid, timestamptz) is
  'Returns the subscription-anchored monthly grant window containing at_time. Annual plans use calendar-month arithmetic from current_period_start.';

revoke all on function public.compute_membership_grant_period(uuid, timestamptz)
  from public, anon, authenticated;

-- ---- 6. grant_membership_credits_for_period -------------------------------------
create or replace function public.grant_membership_credits_for_period(
  _subscription_id uuid,
  _grant_period_start timestamptz
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub              public.user_subscriptions%rowtype;
  v_plan             public.subscription_plans%rowtype;
  v_grant            public.membership_credit_grants%rowtype;
  v_period_end       timestamptz;
  v_idempotency_key  text;
  v_ledger_id        uuid;
  v_earned_at        timestamptz;
  v_check_start      timestamptz;
  v_check_end        timestamptz;
begin
  if _subscription_id is null then
    raise exception 'subscription_id is required';
  end if;

  if _grant_period_start is null then
    raise exception 'grant_period_start is required';
  end if;

  select us.*
  into v_sub
  from public.user_subscriptions us
  where us.id = _subscription_id
  for update;

  if not found then
    raise exception 'subscription not found: %', _subscription_id;
  end if;

  select cgp.grant_period_start, cgp.grant_period_end
  into v_check_start, v_check_end
  from public.compute_membership_grant_period(_subscription_id, _grant_period_start)
  as cgp(grant_period_start, grant_period_end);

  if v_check_start is null then
    raise exception 'grant_period_start % is not within a valid grant window for subscription %',
      _grant_period_start, _subscription_id;
  end if;

  if v_check_start is distinct from _grant_period_start then
    raise exception 'grant_period_start mismatch: expected %, got %',
      v_check_start, _grant_period_start;
  end if;

  v_period_end := v_check_end;
  v_idempotency_key := public.membership_grant_idempotency_key(_subscription_id, _grant_period_start);

  select mcg.*
  into v_grant
  from public.membership_credit_grants mcg
  where mcg.subscription_id = _subscription_id
    and mcg.grant_period_start = _grant_period_start;

  if found and v_grant.status = 'completed' then
    return jsonb_build_object(
      'status', 'completed',
      'idempotent_replay', true,
      'grant_id', v_grant.id,
      'ledger_entry_id', v_grant.ledger_entry_id,
      'credit_amount', v_grant.credit_amount
    );
  end if;

  select sp.*
  into v_plan
  from public.subscription_plans sp
  where sp.tier = v_sub.plan_tier;

  if not found then
    raise exception 'plan tier not found: %', v_sub.plan_tier;
  end if;

  if not v_plan.active then
    raise exception 'plan tier % is inactive; membership grant refused (fail closed)', v_sub.plan_tier;
  end if;

  if not public.is_membership_grant_eligible(
    v_sub.status,
    _grant_period_start,
    v_sub.current_period_start,
    v_sub.current_period_end,
    v_plan.monthly_credit_grant
  ) then
    raise exception 'subscription % is not eligible for membership grant at %',
      _subscription_id, _grant_period_start;
  end if;

  if v_grant.id is null then
    insert into public.membership_credit_grants (
      user_id,
      subscription_id,
      plan_tier,
      grant_period_start,
      grant_period_end,
      credit_amount,
      rollover_tier_key,
      status,
      idempotency_key,
      metadata
    ) values (
      v_sub.user_id,
      v_sub.id,
      v_sub.plan_tier,
      _grant_period_start,
      v_period_end,
      v_plan.monthly_credit_grant,
      v_plan.rollover_tier_key,
      'pending',
      v_idempotency_key,
      jsonb_build_object(
        'source', 'membership_grant',
        'billing_interval', v_sub.billing_interval
      )
    )
    on conflict (subscription_id, grant_period_start) do nothing
    returning * into v_grant;

    if v_grant.id is null then
      select mcg.*
      into v_grant
      from public.membership_credit_grants mcg
      where mcg.subscription_id = _subscription_id
        and mcg.grant_period_start = _grant_period_start;

      if v_grant.status = 'completed' then
        return jsonb_build_object(
          'status', 'completed',
          'idempotent_replay', true,
          'grant_id', v_grant.id,
          'ledger_entry_id', v_grant.ledger_entry_id,
          'credit_amount', v_grant.credit_amount
        );
      end if;
    end if;
  end if;

  if v_grant.ledger_entry_id is not null then
    update public.membership_credit_grants mcg
    set status = 'completed', skip_reason = null
    where mcg.id = v_grant.id
      and mcg.status <> 'completed';

    return jsonb_build_object(
      'status', 'completed',
      'idempotent_replay', true,
      'grant_id', v_grant.id,
      'ledger_entry_id', v_grant.ledger_entry_id,
      'credit_amount', v_grant.credit_amount
    );
  end if;

  v_earned_at := _grant_period_start;

  v_ledger_id := public.append_credit_ledger_entry(
    v_sub.user_id,
    v_plan.monthly_credit_grant,
    'membership_grant',
    v_idempotency_key,
    'user_subscription',
    v_sub.id,
    date_trunc('month', _grant_period_start at time zone 'UTC')::date,
    jsonb_build_object(
      'source', 'membership_grant',
      'plan_tier', v_sub.plan_tier,
      'display_name', v_plan.display_name,
      'grant_period_start', _grant_period_start,
      'grant_period_end', v_period_end,
      'billing_interval', v_sub.billing_interval
    ),
    v_earned_at,
    v_plan.rollover_tier_key
  );

  update public.membership_credit_grants mcg
  set
    status = 'completed',
    ledger_entry_id = v_ledger_id,
    credit_amount = v_plan.monthly_credit_grant,
    rollover_tier_key = v_plan.rollover_tier_key,
    skip_reason = null
  where mcg.id = v_grant.id;

  return jsonb_build_object(
    'status', 'completed',
    'idempotent_replay', false,
    'grant_id', v_grant.id,
    'ledger_entry_id', v_ledger_id,
    'credit_amount', v_plan.monthly_credit_grant
  );
end;
$$;

comment on function public.grant_membership_credits_for_period(uuid, timestamptz) is
  'Idempotent membership credit grant for one subscription grant period. Service-controlled only.';

revoke all on function public.grant_membership_credits_for_period(uuid, timestamptz)
  from public, anon, authenticated;

-- ---- 7. grant_membership_credits_for_user ---------------------------------------
create or replace function public.grant_membership_credits_for_user(_user_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub_id           uuid;
  v_period_start     timestamptz;
  v_period_end       timestamptz;
begin
  if _user_id is null then
    raise exception 'user_id is required';
  end if;

  select us.id
  into v_sub_id
  from public.user_subscriptions us
  inner join public.subscription_plans sp on sp.tier = us.plan_tier
  where us.user_id = _user_id
    and us.status in ('active', 'trialing')
    and sp.monthly_credit_grant > 0
    and sp.active = true
    and us.current_period_start <= now()
    and (us.current_period_end is null or us.current_period_end > now())
  order by us.current_period_start desc, us.created_at desc
  limit 1;

  if v_sub_id is null then
    return jsonb_build_object(
      'status', 'skipped',
      'reason', 'no_eligible_subscription'
    );
  end if;

  select cgp.grant_period_start, cgp.grant_period_end
  into v_period_start, v_period_end
  from public.compute_membership_grant_period(v_sub_id, now())
  as cgp(grant_period_start, grant_period_end);

  if v_period_start is null then
    return jsonb_build_object(
      'status', 'skipped',
      'reason', 'no_current_grant_period'
    );
  end if;

  return public.grant_membership_credits_for_period(v_sub_id, v_period_start);
end;
$$;

comment on function public.grant_membership_credits_for_user(uuid) is
  'Grant membership credits for the user''s current eligible subscription period. Service-controlled only.';

revoke all on function public.grant_membership_credits_for_user(uuid)
  from public, anon, authenticated;

-- ---- 8. reconcile_membership_credit_grants --------------------------------------
create or replace function public.reconcile_membership_credit_grants(_limit integer default 100)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub              record;
  v_period_start     timestamptz;
  v_period_end       timestamptz;
  v_processed        integer := 0;
  v_granted          integer := 0;
  v_skipped          integer := 0;
  v_errors           jsonb := '[]'::jsonb;
  v_result           jsonb;
begin
  if _limit is null or _limit <= 0 then
    raise exception 'limit must be > 0';
  end if;

  for v_sub in
    select us.id as subscription_id
    from public.user_subscriptions us
    inner join public.subscription_plans sp on sp.tier = us.plan_tier
    where us.status in ('active', 'trialing')
      and sp.monthly_credit_grant > 0
      and sp.active = true
      and us.current_period_start <= now()
      and (us.current_period_end is null or us.current_period_end > now())
    order by us.current_period_start asc, us.created_at asc
    limit _limit
  loop
    v_processed := v_processed + 1;

    select cgp.grant_period_start, cgp.grant_period_end
    into v_period_start, v_period_end
    from public.compute_membership_grant_period(v_sub.subscription_id, now())
    as cgp(grant_period_start, grant_period_end);

    if v_period_start is null then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    if exists (
      select 1
      from public.membership_credit_grants mcg
      where mcg.subscription_id = v_sub.subscription_id
        and mcg.grant_period_start = v_period_start
        and mcg.status = 'completed'
    ) then
      v_skipped := v_skipped + 1;
      continue;
    end if;

    begin
      v_result := public.grant_membership_credits_for_period(
        v_sub.subscription_id,
        v_period_start
      );

      if coalesce((v_result ->> 'idempotent_replay')::boolean, false) then
        v_skipped := v_skipped + 1;
      else
        v_granted := v_granted + 1;
      end if;
    exception
      when others then
        v_errors := v_errors || jsonb_build_array(
          jsonb_build_object(
            'subscription_id', v_sub.subscription_id,
            'grant_period_start', v_period_start,
            'error', sqlerrm
          )
        );
    end;
  end loop;

  return jsonb_build_object(
    'processed', v_processed,
    'granted', v_granted,
    'skipped', v_skipped,
    'errors', v_errors
  );
end;
$$;

comment on function public.reconcile_membership_credit_grants(integer) is
  'Service-only backfill for eligible subscriptions missing the current period grant.';

revoke all on function public.reconcile_membership_credit_grants(integer)
  from public, anon, authenticated;

-- ---- 9. PAY-2b verification tests -----------------------------------------------
do $$
declare
  v_user              uuid := '757345e7-f79b-4b62-8416-1c11d5eefdf5';
  v_user_exists       boolean;
  v_sub_id            uuid;
  v_result            jsonb;
  v_grant_count       integer;
  v_ledger_count      integer;
  v_period_start      timestamptz;
  v_period_end        timestamptz;
  v_hist_ledger_count integer;
  v_hist_ledger_sum   integer;
  v_dup_blocked       boolean := false;
begin
  select count(*)::integer
  into v_hist_ledger_count
  from public.credit_ledger_entries;

  select coalesce(sum(amount), 0)::integer
  into v_hist_ledger_sum
  from public.credit_ledger_entries;

  if not exists (
    select 1
    from information_schema.tables
    where table_schema = 'public'
      and table_name = 'membership_credit_grants'
  ) then
    raise exception 'PAY-2b test failed: membership_credit_grants table missing';
  end if;

  if (select monthly_credit_grant from public.subscription_plans where tier = 'basic') <> 5 then
    raise exception 'PAY-2b test failed: basic monthly_credit_grant';
  end if;

  if (select monthly_credit_grant from public.subscription_plans where tier = 'pro') <> 20 then
    raise exception 'PAY-2b test failed: pro monthly_credit_grant';
  end if;

  if (select monthly_credit_grant from public.subscription_plans where tier = 'advance') <> 50 then
    raise exception 'PAY-2b test failed: advance monthly_credit_grant';
  end if;

  if (select monthly_credit_grant from public.subscription_plans where tier = 'explorer') <> 0 then
    raise exception 'PAY-2b test failed: explorer monthly_credit_grant must be 0';
  end if;

  if not public.is_membership_grant_eligible('active', now(), now() - interval '1 day', now() + interval '30 days', 5) then
    raise exception 'PAY-2b test failed: active eligibility';
  end if;

  if not public.is_membership_grant_eligible('trialing', now(), now() - interval '1 day', now() + interval '30 days', 20) then
    raise exception 'PAY-2b test failed: trialing eligibility';
  end if;

  if public.is_membership_grant_eligible('past_due', now(), now() - interval '1 day', now() + interval '30 days', 5) then
    raise exception 'PAY-2b test failed: past_due must not be eligible';
  end if;

  if public.is_membership_grant_eligible('cancelled', now(), now() - interval '1 day', now() + interval '30 days', 5) then
    raise exception 'PAY-2b test failed: cancelled must not be eligible';
  end if;

  if public.is_membership_grant_eligible('expired', now(), now() - interval '1 day', now() + interval '30 days', 5) then
    raise exception 'PAY-2b test failed: expired must not be eligible';
  end if;

  if public.is_membership_grant_eligible('incomplete', now(), now() - interval '1 day', now() + interval '30 days', 5) then
    raise exception 'PAY-2b test failed: incomplete must not be eligible';
  end if;

  if public.is_membership_grant_eligible('active', now(), now() - interval '1 day', now() + interval '30 days', 0) then
    raise exception 'PAY-2b test failed: zero grant must not be eligible';
  end if;

  if has_function_privilege(
    'authenticated',
    'public.grant_membership_credits_for_period(uuid, timestamptz)',
    'EXECUTE'
  ) then
    raise exception 'PAY-2b test failed: authenticated must not execute grant_membership_credits_for_period';
  end if;

  if has_table_privilege('authenticated', 'public.membership_credit_grants', 'INSERT') then
    raise exception 'PAY-2b test failed: authenticated must not INSERT membership_credit_grants';
  end if;

  -- Fixture-backed tests when a real auth user exists
  select exists(select 1 from auth.users where id = v_user)
  into v_user_exists;

  if v_user_exists then
    delete from public.membership_credit_grants where user_id = v_user;
    delete from public.user_subscriptions where user_id = v_user;
    delete from public.credit_ledger_entries
    where user_id = v_user
      and idempotency_key like 'membership_grant:%';

    -- Monthly Basic grant
    insert into public.user_subscriptions (
      user_id, plan_tier, billing_interval, status,
      current_period_start, current_period_end
    ) values (
      v_user, 'basic', 'monthly', 'active',
      timestamptz '2026-08-01 00:00:00+00',
      timestamptz '2026-09-01 00:00:00+00'
    )
    returning id into v_sub_id;

    select cgp.grant_period_start, cgp.grant_period_end
    into v_period_start, v_period_end
    from public.compute_membership_grant_period(
      v_sub_id,
      timestamptz '2026-08-15 00:00:00+00'
    ) as cgp(grant_period_start, grant_period_end);

    if v_period_start is distinct from timestamptz '2026-08-01 00:00:00+00' then
      raise exception 'PAY-2b test failed: monthly grant period start %', v_period_start;
    end if;

    v_result := public.grant_membership_credits_for_period(
      v_sub_id,
      v_period_start
    );

    if (v_result ->> 'status') <> 'completed' then
      raise exception 'PAY-2b test failed: basic grant status %', v_result;
    end if;

    if (v_result ->> 'credit_amount')::integer <> 5 then
      raise exception 'PAY-2b test failed: basic grant amount';
    end if;

    if not exists (
      select 1
      from public.credit_ledger_entries cle
      where cle.user_id = v_user
        and cle.entry_type = 'membership_grant'
        and cle.amount = 5
        and cle.plan_tier_at_earn = 'basic'
        and cle.expires_at is not null
    ) then
      raise exception 'PAY-2b test failed: membership ledger lot missing';
    end if;

    -- Duplicate grant protection
    v_result := public.grant_membership_credits_for_period(v_sub_id, v_period_start);
    if coalesce((v_result ->> 'idempotent_replay')::boolean, false) is not true then
      raise exception 'PAY-2b test failed: duplicate grant must replay idempotently';
    end if;

    select count(*)::integer
    into v_grant_count
    from public.membership_credit_grants
    where subscription_id = v_sub_id;

    select count(*)::integer
    into v_ledger_count
    from public.credit_ledger_entries
    where user_id = v_user
      and entry_type = 'membership_grant';

    if v_grant_count <> 1 or v_ledger_count <> 1 then
      raise exception 'PAY-2b test failed: duplicate grant created extra rows (grants %, ledger %)',
        v_grant_count, v_ledger_count;
    end if;

    -- past_due rejection (in-window period start; clear prior grant so eligibility is tested)
    delete from public.membership_credit_grants where subscription_id = v_sub_id;
    delete from public.credit_ledger_entries
    where user_id = v_user
      and entry_type = 'membership_grant';

    update public.user_subscriptions
    set status = 'past_due'
    where id = v_sub_id;

    begin
      perform public.grant_membership_credits_for_period(
        v_sub_id,
        timestamptz '2026-08-01 00:00:00+00'
      );
      raise exception 'PAY-2b test failed: past_due grant should fail';
    exception
      when others then
        if position('not eligible' in sqlerrm) = 0 then
          raise;
        end if;
    end;

    delete from public.membership_credit_grants where subscription_id = v_sub_id;
    delete from public.user_subscriptions where id = v_sub_id;
    delete from public.credit_ledger_entries
    where user_id = v_user
      and entry_type = 'membership_grant';

    perform public.reconcile_user_credits(v_user);

    -- Annual Pro: monthly windows, no 12x upfront
    insert into public.user_subscriptions (
      user_id, plan_tier, billing_interval, status,
      current_period_start, current_period_end
    ) values (
      v_user, 'pro', 'annual', 'active',
      timestamptz '2026-08-30 00:00:00+00',
      timestamptz '2027-08-30 00:00:00+00'
    )
    returning id into v_sub_id;

    select cgp.grant_period_start, cgp.grant_period_end
    into v_period_start, v_period_end
    from public.compute_membership_grant_period(
      v_sub_id,
      timestamptz '2026-09-15 00:00:00+00'
    ) as cgp(grant_period_start, grant_period_end);

    if v_period_start is distinct from timestamptz '2026-08-30 00:00:00+00' then
      raise exception 'PAY-2b test failed: annual first window start %', v_period_start;
    end if;

    if v_period_end is distinct from timestamptz '2026-09-30 00:00:00+00' then
      raise exception 'PAY-2b test failed: annual first window end %', v_period_end;
    end if;

    v_result := public.grant_membership_credits_for_period(v_sub_id, v_period_start);
    if (v_result ->> 'credit_amount')::integer <> 20 then
      raise exception 'PAY-2b test failed: annual pro grant amount';
    end if;

    select cgp.grant_period_start
    into v_period_start
    from public.compute_membership_grant_period(
      v_sub_id,
      timestamptz '2026-10-15 00:00:00+00'
    ) as cgp(grant_period_start, grant_period_end);

    if v_period_start is distinct from timestamptz '2026-09-30 00:00:00+00' then
      raise exception 'PAY-2b test failed: annual second window start %', v_period_start;
    end if;

    v_result := public.grant_membership_credits_for_period(v_sub_id, v_period_start);
    if coalesce((v_result ->> 'idempotent_replay')::boolean, false) is true then
      raise exception 'PAY-2b test failed: second annual window should be new grant';
    end if;

    select count(*)::integer
    into v_ledger_count
    from public.credit_ledger_entries
    where user_id = v_user
      and entry_type = 'membership_grant';

    if v_ledger_count <> 2 then
      raise exception 'PAY-2b test failed: annual must grant monthly not upfront (ledger %)', v_ledger_count;
    end if;

    -- Jan 31 anchor → Feb 28 window end (non-leap 2026)
    delete from public.membership_credit_grants where subscription_id = v_sub_id;
    delete from public.credit_ledger_entries
    where user_id = v_user and entry_type = 'membership_grant';

    update public.user_subscriptions
    set
      plan_tier = 'advance',
      billing_interval = 'annual',
      current_period_start = timestamptz '2026-01-31 00:00:00+00',
      current_period_end = timestamptz '2027-01-31 00:00:00+00'
    where id = v_sub_id;

    select cgp.grant_period_start, cgp.grant_period_end
    into v_period_start, v_period_end
    from public.compute_membership_grant_period(
      v_sub_id,
      timestamptz '2026-02-15 00:00:00+00'
    ) as cgp(grant_period_start, grant_period_end);

    if v_period_start is distinct from timestamptz '2026-01-31 00:00:00+00' then
      raise exception 'PAY-2b test failed: Jan 31 anchor window start %', v_period_start;
    end if;

    if v_period_end is distinct from timestamptz '2026-02-28 00:00:00+00' then
      raise exception 'PAY-2b test failed: Jan 31 anchor window end %', v_period_end;
    end if;

    -- Trialing Advance grant + expiry compatibility
    update public.user_subscriptions
    set status = 'trialing'
    where id = v_sub_id;

    v_result := public.grant_membership_credits_for_period(v_sub_id, v_period_start);
    if (v_result ->> 'credit_amount')::integer <> 50 then
      raise exception 'PAY-2b test failed: trialing advance grant amount';
    end if;

    if not exists (
      select 1
      from public.credit_ledger_entries cle
      where cle.user_id = v_user
        and cle.entry_type = 'membership_grant'
        and cle.plan_tier_at_earn = 'advance'
        and cle.expires_at = public.compute_credit_expires_at(
          'advance',
          timestamptz '2026-01-31 00:00:00+00'
        )
    ) then
      raise exception 'PAY-2b test failed: advance expiry compatibility';
    end if;

    -- Renewal boundary: new annual period must not collide
    update public.user_subscriptions
    set
      current_period_start = timestamptz '2027-08-30 00:00:00+00',
      current_period_end = timestamptz '2028-08-30 00:00:00+00'
    where id = v_sub_id;

    select cgp.grant_period_start
    into v_period_start
    from public.compute_membership_grant_period(
      v_sub_id,
      timestamptz '2027-09-15 00:00:00+00'
    ) as cgp(grant_period_start, grant_period_end);

    if v_period_start is distinct from timestamptz '2027-08-30 00:00:00+00' then
      raise exception 'PAY-2b test failed: renewal annual window start %', v_period_start;
    end if;

    -- Plan upgrade before next grant
    delete from public.membership_credit_grants where subscription_id = v_sub_id;
    delete from public.credit_ledger_entries
    where user_id = v_user and entry_type = 'membership_grant';

    update public.user_subscriptions
    set
      plan_tier = 'basic',
      billing_interval = 'monthly',
      status = 'active',
      current_period_start = timestamptz '2026-10-01 00:00:00+00',
      current_period_end = timestamptz '2026-11-01 00:00:00+00'
    where id = v_sub_id;

    v_period_start := timestamptz '2026-10-01 00:00:00+00';
    v_result := public.grant_membership_credits_for_period(v_sub_id, v_period_start);

    update public.user_subscriptions
    set plan_tier = 'pro'
    where id = v_sub_id;

    select cgp.grant_period_start
    into v_period_start
    from public.compute_membership_grant_period(
      v_sub_id,
      timestamptz '2026-11-01 00:00:00+00'
    ) as cgp(grant_period_start, grant_period_end);

    v_result := public.grant_membership_credits_for_period(v_sub_id, v_period_start);
    if (v_result ->> 'credit_amount')::integer <> 20 then
      raise exception 'PAY-2b test failed: upgrade before grant should use pro amount';
    end if;

    -- grant_membership_credits_for_user convenience
    v_result := public.grant_membership_credits_for_user(v_user);
    if (v_result ->> 'status') not in ('completed', 'skipped') then
      raise exception 'PAY-2b test failed: grant_for_user unexpected %', v_result;
    end if;

    -- reconcile guard: invalid limit rejected (does not scan live subscriptions)
    begin
      perform public.reconcile_membership_credit_grants(0);
      raise exception 'PAY-2b test failed: reconcile must reject non-positive limit';
    exception
      when others then
        if position('limit must be' in sqlerrm) = 0 then
          raise;
        end if;
    end;

    -- FIFO: membership lot spendable
    if (select credits from public.user_progression where user_id = v_user) is null then
      raise exception 'PAY-2b test failed: user_progression missing';
    end if;

    -- cleanup fixtures
    delete from public.membership_credit_grants where user_id = v_user;
    delete from public.user_subscriptions where user_id = v_user;
    delete from public.credit_ledger_entries
    where user_id = v_user
      and idempotency_key like 'membership_grant:%';
    perform public.reconcile_user_credits(v_user);
  end if;

  if (select count(*) from public.credit_ledger_entries) <> v_hist_ledger_count then
    raise exception 'PAY-2b test failed: historical ledger row count changed outside fixtures';
  end if;

  if (select coalesce(sum(amount), 0) from public.credit_ledger_entries) <> v_hist_ledger_sum then
    raise exception 'PAY-2b test failed: historical ledger sum changed outside fixtures';
  end if;
end;
$$;
