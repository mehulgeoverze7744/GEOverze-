-- =============================================================================
-- PAY-1b.1 — Credit expiry correction
--
-- Converts credit_ledger_entries into expiring credit lots with calendar-month
-- rollover. Backfills existing 79 rows, recomputes user_progression.credits from
-- unexpired remaining_amount, and routes new earns through append_credit_ledger_entry.
--
-- Does NOT modify settlement RPCs (PAY-1c), credit_transactions, or earning rules.
-- Safe to re-run: IF NOT EXISTS / ON CONFLICT guards where practical.
-- =============================================================================

-- ---- 0. Pre-migration verification ------------------------------------------------
do $$
declare
  v_ledger_count integer;
  v_ledger_sum integer;
  v_ct_count integer;
  v_balance_total integer;
begin
  select count(*)::integer, coalesce(sum(amount), 0)::integer
  into v_ledger_count, v_ledger_sum
  from public.credit_ledger_entries;

  if v_ledger_count <> 79 then
    raise exception 'PAY-1b.1 aborted: expected 79 ledger rows, found %', v_ledger_count;
  end if;

  if v_ledger_sum <> 266 then
    raise exception 'PAY-1b.1 aborted: expected ledger sum 266, found %', v_ledger_sum;
  end if;

  select count(*)::integer into v_ct_count from public.credit_transactions;
  if v_ct_count <> 78 then
    raise exception 'PAY-1b.1 aborted: expected 78 credit_transactions, found %', v_ct_count;
  end if;

  select coalesce(sum(credits), 0)::integer into v_balance_total
  from public.user_progression;

  if v_balance_total <> 266 then
    raise exception 'PAY-1b.1 aborted: expected balance total 266, found %', v_balance_total;
  end if;
end;
$$;

-- ---- 1. Extend credit_ledger_entries --------------------------------------------
alter table public.credit_ledger_entries
  add column if not exists expires_at timestamptz,
  add column if not exists plan_tier_at_earn text,
  add column if not exists remaining_amount integer;

comment on column public.credit_ledger_entries.expires_at is
  'First UTC instant the lot is no longer spendable. NULL for spend/debit rows.';

comment on column public.credit_ledger_entries.plan_tier_at_earn is
  'Frozen billing tier (free/basic/pro/advance) at earn time. NULL for spend/debit rows.';

comment on column public.credit_ledger_entries.remaining_amount is
  'Unspent portion of a positive earn lot. NULL for spend/debit rows.';

-- ---- 2. Plan rollover configuration -----------------------------------------------
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

-- ---- 3. get_user_plan_tier --------------------------------------------------------
create or replace function public.get_user_plan_tier(_user_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if _user_id is null then
    raise exception 'user_id is required';
  end if;

  -- PAY-2 subscriptions will replace this resolver with real billing state.
  return 'free';
end;
$$;

comment on function public.get_user_plan_tier(uuid) is
  'Returns the user billing tier for credit expiry. Defaults to free until subscriptions exist.';

revoke all on function public.get_user_plan_tier(uuid) from public, anon, authenticated;

-- ---- 4. compute_credit_expires_at -----------------------------------------------
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

-- ---- 5. reconcile_user_credits ----------------------------------------------------
create or replace function public.reconcile_user_credits(_user_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_balance integer;
begin
  if _user_id is null then
    raise exception 'user_id is required';
  end if;

  select coalesce(sum(cle.remaining_amount), 0)::integer
  into v_balance
  from public.credit_ledger_entries cle
  where cle.user_id = _user_id
    and cle.amount > 0
    and cle.remaining_amount is not null
    and cle.remaining_amount > 0
    and cle.expires_at is not null
    and cle.expires_at > now();

  update public.user_progression
  set credits = v_balance
  where user_id = _user_id;

  if not found then
    raise exception 'user_progression row not found for uid %. Run backfill.', _user_id;
  end if;

  return v_balance;
end;
$$;

comment on function public.reconcile_user_credits(uuid) is
  'Recompute user_progression.credits from unexpired positive ledger lots.';

revoke all on function public.reconcile_user_credits(uuid) from public, anon, authenticated;

-- ---- 6. append_credit_ledger_entry ------------------------------------------------
create or replace function public.append_credit_ledger_entry(
  _user_id           uuid,
  _amount            integer,
  _entry_type        text,
  _idempotency_key   text,
  _reference_type    text    default null,
  _reference_id      uuid    default null,
  _month_key         date    default null,
  _metadata          jsonb   default '{}'::jsonb,
  _earned_at         timestamptz default now(),
  _plan_tier         text    default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan_tier  text;
  v_expires_at timestamptz;
  v_entry_id   uuid;
begin
  if _user_id is null then
    raise exception 'user_id is required';
  end if;

  if _amount is null or _amount <= 0 then
    raise exception 'amount must be > 0 for earn entries';
  end if;

  if _entry_type is null or btrim(_entry_type) = '' then
    raise exception 'entry_type is required';
  end if;

  if _idempotency_key is null or btrim(_idempotency_key) = '' then
    raise exception 'idempotency_key is required';
  end if;

  v_plan_tier := coalesce(_plan_tier, public.get_user_plan_tier(_user_id));
  v_expires_at := public.compute_credit_expires_at(v_plan_tier, _earned_at);

  insert into public.credit_ledger_entries (
    user_id,
    amount,
    entry_type,
    idempotency_key,
    reference_type,
    reference_id,
    month_key,
    metadata,
    created_at,
    expires_at,
    plan_tier_at_earn,
    remaining_amount
  ) values (
    _user_id,
    _amount,
    _entry_type,
    _idempotency_key,
    _reference_type,
    _reference_id,
    _month_key,
    coalesce(_metadata, '{}'::jsonb),
    _earned_at,
    v_expires_at,
    v_plan_tier,
    _amount
  )
  on conflict (idempotency_key) do nothing
  returning id into v_entry_id;

  if v_entry_id is null then
    select cle.id
    into v_entry_id
    from public.credit_ledger_entries cle
    where cle.idempotency_key = _idempotency_key;
  end if;

  perform public.reconcile_user_credits(_user_id);

  return v_entry_id;
end;
$$;

comment on function public.append_credit_ledger_entry(
  uuid, integer, text, text, text, uuid, date, jsonb, timestamptz, text
) is
  'Internal append-only earn insert with frozen plan expiry. Idempotent by idempotency_key.';

revoke all on function public.append_credit_ledger_entry(
  uuid, integer, text, text, text, uuid, date, jsonb, timestamptz, text
) from public, anon, authenticated;

-- ---- 7. Backfill existing ledger entries ------------------------------------------
update public.credit_ledger_entries cle
set
  plan_tier_at_earn = 'free',
  remaining_amount  = cle.amount,
  expires_at        = public.compute_credit_expires_at('free', cle.created_at)
where cle.amount > 0
  and (
    cle.plan_tier_at_earn is distinct from 'free'
    or cle.remaining_amount is distinct from cle.amount
    or cle.expires_at is null
  );

-- ---- 8. Enforce ledger shape constraints (after backfill) -------------------------
alter table public.credit_ledger_entries
  drop constraint if exists credit_ledger_positive_entry_shape;

alter table public.credit_ledger_entries
  add constraint credit_ledger_positive_entry_shape check (
    amount <= 0
    or (
      amount > 0
      and expires_at is not null
      and plan_tier_at_earn is not null
      and remaining_amount is not null
      and remaining_amount >= 0
    )
  );

alter table public.credit_ledger_entries
  drop constraint if exists credit_ledger_negative_entry_shape;

alter table public.credit_ledger_entries
  add constraint credit_ledger_negative_entry_shape check (
    amount >= 0
    or (
      amount < 0
      and expires_at is null
      and plan_tier_at_earn is null
      and remaining_amount is null
    )
  );

-- ---- 9. Recompute all user balances from ledger ---------------------------------
do $$
declare
  v_user_id uuid;
begin
  for v_user_id in
    select distinct cle.user_id
    from public.credit_ledger_entries cle
  loop
    perform public.reconcile_user_credits(v_user_id);
  end loop;

  update public.user_progression up
  set credits = 0
  where up.credits <> 0
    and not exists (
      select 1
      from public.credit_ledger_entries cle
      where cle.user_id = up.user_id
    );
end;
$$;

comment on column public.user_progression.credits_month_key is
  'Reporting-only last earn month. Does not reset or expire spendable balance.';

-- ---- 10. apply_user_progression_rewards — ledger-controlled credits ---------------
drop function if exists public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date
);

create or replace function public.apply_user_progression_rewards(
  _user_id                  uuid,
  _correct                  smallint,
  _total                    smallint,
  _xp_earned                integer,
  _credits_earned           integer,
  _month_key                date,
  _ledger_idempotency_key   text        default null,
  _ledger_entry_type        text        default null,
  _ledger_reference_type    text        default null,
  _ledger_reference_id      uuid        default null,
  _earned_at                timestamptz default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prog                public.user_progression%rowtype;
  v_new_xp              integer;
  v_new_level           smallint;
  v_old_level           smallint;
  v_new_credits         integer;
  v_new_total_q         integer;
  v_new_total_c         integer;
  v_new_total_a         integer;
  v_new_streak          smallint;
  v_new_longest         smallint;
  v_today               date := current_date;
  v_earned_at           timestamptz;
  v_idempotency_key     text;
  v_entry_type          text;
begin
  select * into v_prog
  from public.user_progression
  where user_id = _user_id
  for update;

  if not found then
    raise exception 'user_progression row not found for uid %. Run backfill.', _user_id;
  end if;

  v_old_level := v_prog.level;
  v_new_xp := v_prog.xp + _xp_earned;

  v_new_total_q := v_prog.total_quizzes + 1;
  v_new_total_c := v_prog.total_correct + _correct;
  v_new_total_a := v_prog.total_answered + _total;
  v_new_level := public.level_from_xp(v_new_xp);

  if v_prog.last_played_date is null then
    v_new_streak := 1;
  elsif v_prog.last_played_date = v_today then
    v_new_streak := v_prog.current_streak;
  elsif v_prog.last_played_date = v_today - interval '1 day' then
    v_new_streak := v_prog.current_streak + 1;
  else
    v_new_streak := 1;
  end if;

  v_new_longest := greatest(v_prog.longest_streak, v_new_streak);

  if _credits_earned > 0 then
    v_earned_at := coalesce(_earned_at, now());
    v_idempotency_key := coalesce(
      _ledger_idempotency_key,
      'earn:tx:' || _user_id::text || ':' || txid_current()::text
    );
    v_entry_type := coalesce(_ledger_entry_type, 'earn_gameplay');

    perform public.append_credit_ledger_entry(
      _user_id,
      _credits_earned,
      v_entry_type,
      v_idempotency_key,
      _ledger_reference_type,
      _ledger_reference_id,
      _month_key,
      jsonb_build_object('source', 'apply_user_progression_rewards'),
      v_earned_at,
      null
    );
  end if;

  select credits into v_new_credits
  from public.user_progression
  where user_id = _user_id;

  update public.user_progression
  set
    xp                = v_new_xp,
    level             = v_new_level,
    credits           = v_new_credits,
    credits_month_key = _month_key,
    total_quizzes     = v_new_total_q,
    total_correct     = v_new_total_c,
    total_answered    = v_new_total_a,
    current_streak    = v_new_streak,
    longest_streak    = v_new_longest,
    last_played_date  = v_today
  where user_id = _user_id;

  return jsonb_build_object(
    'xp_earned',      _xp_earned,
    'credits_earned', _credits_earned,
    'new_xp',         v_new_xp,
    'new_level',      v_new_level::integer,
    'level_up',       v_new_level > v_old_level,
    'new_streak',     v_new_streak::integer,
    'new_credits',    v_new_credits,
    'total_quizzes',  v_new_total_q,
    'total_correct',  v_new_total_c,
    'total_answered', v_new_total_a
  );
end;
$$;

comment on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date, text, text, text, uuid, timestamptz
) is
  'Shared progression update. Credits route through credit_ledger_entries; balance is reconciled.';

revoke all on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date, text, text, text, uuid, timestamptz
) from public, anon, authenticated;

-- Re-assert PAY-0/PAY-1b security hardening
revoke all on function public.settle_pvp_match_rewards(uuid) from authenticated;
revoke all on function public.settle_multiplayer_match_rewards(uuid) from authenticated;
revoke all on function public.calculate_pvp_credit_award(uuid, uuid, date, uuid)
  from public, anon, authenticated;

-- ---- 11. Post-migration verification ----------------------------------------------
do $$
declare
  v_ledger_count integer;
  v_ledger_sum integer;
  v_ct_count integer;
  v_balance_total integer;
  v_positive_shape integer;
  v_free_tier integer;
  v_oct_expiry integer;
  v_recon integer;
begin
  select count(*)::integer, coalesce(sum(amount), 0)::integer
  into v_ledger_count, v_ledger_sum
  from public.credit_ledger_entries;

  if v_ledger_count <> 79 then
    raise exception 'PAY-1b.1 verify failed: ledger row count % != 79', v_ledger_count;
  end if;

  if v_ledger_sum <> 266 then
    raise exception 'PAY-1b.1 verify failed: ledger sum % != 266', v_ledger_sum;
  end if;

  select count(*)::integer into v_ct_count from public.credit_transactions;
  if v_ct_count <> 78 then
    raise exception 'PAY-1b.1 verify failed: credit_transactions count % != 78', v_ct_count;
  end if;

  select coalesce(sum(credits), 0)::integer into v_balance_total
  from public.user_progression;

  if v_balance_total <> 266 then
    raise exception 'PAY-1b.1 verify failed: balance total % != 266', v_balance_total;
  end if;

  select count(*)::integer into v_positive_shape
  from public.credit_ledger_entries cle
  where cle.amount > 0
    and (
      cle.expires_at is null
      or cle.plan_tier_at_earn is null
      or cle.remaining_amount is null
      or cle.remaining_amount < 0
    );

  if v_positive_shape > 0 then
    raise exception 'PAY-1b.1 verify failed: % positive rows missing expiry shape', v_positive_shape;
  end if;

  select count(*)::integer into v_free_tier
  from public.credit_ledger_entries cle
  where cle.amount > 0
    and cle.plan_tier_at_earn is distinct from 'free';

  if v_free_tier > 0 then
    raise exception 'PAY-1b.1 verify failed: % rows not plan_tier_at_earn free', v_free_tier;
  end if;

  select count(*)::integer into v_oct_expiry
  from public.credit_ledger_entries cle
  where cle.amount > 0
    and cle.expires_at is distinct from timestamptz '2026-10-01 00:00:00+00';

  if v_oct_expiry > 0 then
    raise exception 'PAY-1b.1 verify failed: % rows not expiring 2026-10-01 UTC', v_oct_expiry;
  end if;

  select count(*)::integer into v_recon
  from public.credit_ledger_entries cle
  where cle.entry_type = 'reconciliation_opening'
    and cle.amount = 15
    and cle.idempotency_key = 'pay1b-opening:757345e7-f79b-4b62-8416-1c11d5eefdf5';

  if v_recon <> 1 then
    raise exception 'PAY-1b.1 verify failed: reconciliation_opening row missing';
  end if;

  if not exists (
    select 1 from public.user_progression
    where user_id = '757345e7-f79b-4b62-8416-1c11d5eefdf5' and credits = 127
  ) then
    raise exception 'PAY-1b.1 verify failed: drift user balance != 127';
  end if;

  if exists (
    select 1
    from public.user_progression up
    left join (
      select user_id, sum(remaining_amount)::integer as ledger_balance
      from public.credit_ledger_entries
      where amount > 0
        and remaining_amount > 0
        and expires_at > now()
      group by user_id
    ) lb on lb.user_id = up.user_id
    where up.credits > 0
      and up.credits is distinct from coalesce(lb.ledger_balance, 0)
  ) then
    raise exception 'PAY-1b.1 verify failed: user balance drift vs unexpired ledger';
  end if;
end;
$$;

-- ---- 12. Month-boundary reconciliation test (cleaned up) -----------------------
do $$
declare
  v_user uuid := '8be82cab-9f3a-4702-b997-1fa7e53c1d00';
  v_balance integer;
begin
  insert into public.credit_ledger_entries (
    user_id, amount, entry_type, idempotency_key,
    expires_at, plan_tier_at_earn, remaining_amount,
    metadata, created_at
  ) values (
    v_user, 100, 'earn_gameplay', 'pay1b1:test:expired-lot',
    timestamptz '2026-01-01 00:00:00+00', 'free', 100,
    '{"source":"pay1b1_month_boundary_test"}'::jsonb,
    timestamptz '2025-08-01 00:00:00+00'
  )
  on conflict (idempotency_key) do nothing;

  insert into public.credit_ledger_entries (
    user_id, amount, entry_type, idempotency_key,
    expires_at, plan_tier_at_earn, remaining_amount,
    metadata, created_at, month_key
  ) values (
    v_user, 7, 'earn_gameplay', 'pay1b1:test:valid-lot',
    timestamptz '2027-01-01 00:00:00+00', 'free', 7,
    '{"source":"pay1b1_month_boundary_test"}'::jsonb,
    now(), date '2026-08-01'
  )
  on conflict (idempotency_key) do nothing;

  v_balance := public.reconcile_user_credits(v_user);

  if v_balance <> 7 then
    raise exception 'PAY-1b.1 month-boundary test failed: expected balance 7, got %', v_balance;
  end if;

  if not exists (
    select 1 from public.credit_ledger_entries
    where idempotency_key = 'pay1b1:test:expired-lot' and remaining_amount = 100
  ) then
    raise exception 'PAY-1b.1 month-boundary test failed: expired lot missing from audit trail';
  end if;

  delete from public.credit_ledger_entries
  where idempotency_key in ('pay1b1:test:expired-lot', 'pay1b1:test:valid-lot');

  perform public.reconcile_user_credits(v_user);
end;
$$;
