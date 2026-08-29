-- =============================================================================
-- PAY-1b — Lifetime credit ledger foundation
--
-- Creates credit_ledger_entries, backfills credit_transactions, preserves the
-- PAY-1a +15 reconciliation opening balance, recomputes user_progression.credits,
-- switches apply_user_progression_rewards to lifetime accumulation, and revokes
-- calculate_pvp_credit_award from authenticated.
--
-- Does NOT modify settlement RPCs (PAY-1c dual-write).
-- Safe to re-run: IF NOT EXISTS / ON CONFLICT DO NOTHING guards.
-- =============================================================================

-- ---- 1. credit_ledger_entries -------------------------------------------------
create table if not exists public.credit_ledger_entries (
  id              uuid        primary key default gen_random_uuid(),
  user_id         uuid        not null references auth.users (id) on delete cascade,
  amount          integer     not null,
  entry_type      text        not null,
  idempotency_key text        not null,
  reference_type  text,
  reference_id    uuid,
  month_key       date,
  metadata        jsonb       not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  constraint credit_ledger_entries_amount_nonzero check (amount <> 0),
  constraint credit_ledger_entries_idempotency_key_key unique (idempotency_key)
);

comment on table public.credit_ledger_entries is
  'Append-only authoritative credit ledger. Positive = earn, negative = spend (future).';

comment on column public.credit_ledger_entries.entry_type is
  'earn_pvp, earn_multiplayer, reconciliation_opening, store_spend, etc.';

comment on column public.credit_ledger_entries.idempotency_key is
  'Unique deduplication key. Immutable once inserted.';

create index if not exists credit_ledger_entries_user_created_idx
  on public.credit_ledger_entries (user_id, created_at desc);

-- ---- 2. RLS — SELECT own rows only; no client writes --------------------------
alter table public.credit_ledger_entries enable row level security;

revoke all on public.credit_ledger_entries from public, anon, authenticated;
grant select on public.credit_ledger_entries to authenticated;

drop policy if exists credit_ledger_entries_select_own on public.credit_ledger_entries;
create policy credit_ledger_entries_select_own
  on public.credit_ledger_entries
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ---- 3. Pre-migration balance guard -------------------------------------------
do $$
declare
  v_total integer;
  v_ct_count integer;
  v_ct_sum integer;
begin
  select coalesce(sum(credits), 0)::integer
  into v_total
  from public.user_progression;

  if v_total <> 266 then
    raise exception
      'PAY-1b aborted: user_progression total credits % != expected 266',
      v_total;
  end if;

  if not exists (
    select 1
    from public.user_progression
    where user_id = '757345e7-f79b-4b62-8416-1c11d5eefdf5'
      and credits = 127
  ) then
    raise exception
      'PAY-1b aborted: drift user 757345e7 balance != expected 127';
  end if;

  select count(*)::integer, coalesce(sum(amount), 0)::integer
  into v_ct_count, v_ct_sum
  from public.credit_transactions;

  if v_ct_count = 0 then
    raise exception 'PAY-1b aborted: no credit_transactions rows to backfill';
  end if;

  if v_ct_sum <> 251 then
    raise exception
      'PAY-1b aborted: credit_transactions sum % != expected 251',
      v_ct_sum;
  end if;
end;
$$;

-- ---- 4. Backfill credit_transactions ------------------------------------------
insert into public.credit_ledger_entries (
  user_id,
  amount,
  entry_type,
  idempotency_key,
  reference_type,
  reference_id,
  month_key,
  metadata,
  created_at
)
select
  ct.user_id,
  ct.amount,
  case
    when r.room_mode = 'pvp'::public.room_mode then 'earn_pvp'
    when r.room_mode = 'multiplayer'::public.room_mode then 'earn_multiplayer'
    else 'earn_pvp'
  end,
  'pay1b:earn:ct:' || ct.id::text,
  'pvp_room',
  ct.room_id,
  ct.month_key,
  jsonb_strip_nulls(jsonb_build_object(
    'source', 'credit_transactions',
    'credit_transaction_id', ct.id,
    'room_code', r.room_code,
    'room_mode', r.room_mode,
    'win_tier', ct.win_tier,
    'opponent_user_id', ct.opponent_user_id
  )),
  ct.created_at
from public.credit_transactions ct
join public.pvp_rooms r on r.id = ct.room_id
on conflict (idempotency_key) do nothing;

-- ---- 5. PAY-1a reconciliation opening entry -----------------------------------
insert into public.credit_ledger_entries (
  user_id,
  amount,
  entry_type,
  idempotency_key,
  reference_type,
  reference_id,
  month_key,
  metadata
) values (
  '757345e7-f79b-4b62-8416-1c11d5eefdf5',
  15,
  'reconciliation_opening',
  'pay1b-opening:757345e7-f79b-4b62-8416-1c11d5eefdf5',
  null,
  null,
  null,
  jsonb_build_object(
    'source', 'PAY-1a reconciliation',
    'reason', 'progression_without_ledger_row',
    'original_balance', 127,
    'existing_gameplay_ledger', 112,
    'reconciliation_amount', 15
  )
)
on conflict (idempotency_key) do nothing;

-- ---- 6. Recompute user_progression.credits from ledger ------------------------
do $$
declare
  v_ledger_total integer;
  v_ct_backfill_count integer;
  v_ct_count integer;
begin
  select count(*)::integer
  into v_ct_count
  from public.credit_transactions;

  select count(*)::integer
  into v_ct_backfill_count
  from public.credit_ledger_entries
  where entry_type in ('earn_pvp', 'earn_multiplayer');

  if v_ct_backfill_count <> v_ct_count then
    raise exception
      'PAY-1b aborted: backfill count % != credit_transactions count %',
      v_ct_backfill_count, v_ct_count;
  end if;

  select coalesce(sum(amount), 0)::integer
  into v_ledger_total
  from public.credit_ledger_entries;

  if v_ledger_total <> 266 then
    raise exception
      'PAY-1b aborted: ledger total % != expected 266',
      v_ledger_total;
  end if;
end;
$$;

update public.user_progression up
set credits = coalesce(ledger.sum, 0)
from (
  select user_id, sum(amount)::integer as sum
  from public.credit_ledger_entries
  group by user_id
) ledger
where up.user_id = ledger.user_id;

update public.user_progression up
set credits = 0
where up.credits <> 0
  and not exists (
    select 1
    from public.credit_ledger_entries cle
    where cle.user_id = up.user_id
  );

-- Post-recompute guard
do $$
declare
  v_total integer;
begin
  select coalesce(sum(credits), 0)::integer
  into v_total
  from public.user_progression;

  if v_total <> 266 then
    raise exception
      'PAY-1b aborted: post-recompute total credits % != expected 266',
      v_total;
  end if;

  if not exists (
    select 1
    from public.user_progression
    where user_id = '757345e7-f79b-4b62-8416-1c11d5eefdf5'
      and credits = 127
  ) then
    raise exception
      'PAY-1b aborted: drift user balance != 127 after recompute';
  end if;
end;
$$;

comment on column public.user_progression.credits_month_key is
  'Reporting-only calendar month of last credit earn. Does not reset spendable balance (lifetime credits).';

-- ---- 7. apply_user_progression_rewards — lifetime accumulation ---------------
create or replace function public.apply_user_progression_rewards(
  _user_id         uuid,
  _correct         smallint,
  _total           smallint,
  _xp_earned       integer,
  _credits_earned  integer,
  _month_key       date
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prog         public.user_progression%rowtype;
  v_new_xp       integer;
  v_new_level    smallint;
  v_old_level    smallint;
  v_new_credits  integer;
  v_new_total_q  integer;
  v_new_total_c  integer;
  v_new_total_a  integer;
  v_new_streak   smallint;
  v_new_longest  smallint;
  v_today        date := current_date;
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
  v_new_credits := v_prog.credits + _credits_earned;

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
  uuid, smallint, smallint, integer, integer, date
) is
  'Shared progression update for Solo and PvP/MP rewards. Lifetime credit accumulation.';

revoke all on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date
) from public, anon, authenticated;

-- ---- 8. Revoke calculate_pvp_credit_award from clients --------------------------
revoke all on function public.calculate_pvp_credit_award(uuid, uuid, date, uuid)
  from public, anon, authenticated;
