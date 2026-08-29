-- =============================================================================
-- PAY-1d.2 — FIFO credit spending engine
--
-- Adds FIFO partial index and internal spend_credits() RPC (Option A+):
--   - mutates remaining_amount on positive earn lots only
--   - appends one consolidated negative store_spend ledger row
--   - reconciles user_progression.credits via reconcile_user_credits()
--
-- Does NOT implement place_credit_order, frontend, or user_entitlements.
-- Does NOT modify settlement, earning rules, expiry config, or store_products.
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE guards.
-- =============================================================================

-- ---- 1. FIFO spend index -----------------------------------------------------
create index if not exists credit_ledger_entries_fifo_spend_idx
  on public.credit_ledger_entries (user_id, expires_at asc, created_at asc, id asc)
  where amount > 0
    and remaining_amount > 0;

comment on index public.credit_ledger_entries_fifo_spend_idx is
  'FIFO lot selection for spend_credits. Query must also filter expires_at > now().';

-- ---- 2. spend_credits --------------------------------------------------------
create or replace function public.spend_credits(
  _user_id          uuid,
  _amount           integer,
  _idempotency_key  text,
  _entry_type       text,
  _reference_type   text,
  _reference_id     uuid,
  _metadata         jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing          public.credit_ledger_entries%rowtype;
  v_lot               record;
  v_amount_needed     integer;
  v_take              integer;
  v_lot_allocations   jsonb := '[]'::jsonb;
  v_ledger_entry_id   uuid;
  v_new_balance       integer;
  v_available         integer;
  v_stored_spent      integer;
begin
  if _user_id is null then
    raise exception 'user_id is required';
  end if;

  if _amount is null or _amount <= 0 then
    raise exception 'amount must be > 0';
  end if;

  if _idempotency_key is null or btrim(_idempotency_key) = '' then
    raise exception 'idempotency_key is required';
  end if;

  if _entry_type is null or btrim(_entry_type) = '' then
    raise exception 'entry_type is required';
  end if;

  if _entry_type <> 'store_spend' then
    raise exception 'entry_type must be store_spend';
  end if;

  -- Serialize concurrent spends for the same user.
  perform 1
  from public.user_progression up
  where up.user_id = _user_id
  for update;

  if not found then
    raise exception 'user_progression row not found for uid %. Run backfill.', _user_id;
  end if;

  -- Idempotency: return prior result when the spend key already exists.
  select cle.*
  into v_existing
  from public.credit_ledger_entries cle
  where cle.idempotency_key = _idempotency_key;

  if found then
    if v_existing.amount >= 0 then
      raise exception 'idempotency key already used for non-spend entry';
    end if;

    if v_existing.user_id is distinct from _user_id then
      raise exception 'idempotency payload mismatch: user_id';
    end if;

    v_stored_spent := abs(v_existing.amount);

    if v_stored_spent <> _amount then
      raise exception 'idempotency payload mismatch: amount';
    end if;

    if v_existing.entry_type is distinct from _entry_type then
      raise exception 'idempotency payload mismatch: entry_type';
    end if;

    if v_existing.reference_type is distinct from _reference_type then
      raise exception 'idempotency payload mismatch: reference_type';
    end if;

    if v_existing.reference_id is distinct from _reference_id then
      raise exception 'idempotency payload mismatch: reference_id';
    end if;

    select up.credits
    into v_new_balance
    from public.user_progression up
    where up.user_id = _user_id;

    return jsonb_build_object(
      'spent', v_stored_spent,
      'new_balance', v_new_balance,
      'lot_allocations', coalesce(v_existing.metadata -> 'lot_allocations', '[]'::jsonb),
      'ledger_entry_id', v_existing.id,
      'idempotent_replay', true
    );
  end if;

  v_amount_needed := _amount;

  select coalesce(sum(cle.remaining_amount), 0)::integer
  into v_available
  from public.credit_ledger_entries cle
  where cle.user_id = _user_id
    and cle.amount > 0
    and cle.remaining_amount is not null
    and cle.remaining_amount > 0
    and cle.expires_at is not null
    and cle.expires_at > now();

  if v_available < _amount then
    raise exception
      'insufficient credit balance: available %, requested %',
      v_available,
      _amount;
  end if;

  for v_lot in
    select
      cle.id,
      cle.remaining_amount,
      cle.amount,
      cle.expires_at,
      cle.created_at,
      cle.plan_tier_at_earn
    from public.credit_ledger_entries cle
    where cle.user_id = _user_id
      and cle.amount > 0
      and cle.remaining_amount is not null
      and cle.remaining_amount > 0
      and cle.expires_at is not null
      and cle.expires_at > now()
    order by cle.expires_at asc, cle.created_at asc, cle.id asc
    for update
  loop
    exit when v_amount_needed <= 0;

    v_take := least(v_lot.remaining_amount, v_amount_needed);

    update public.credit_ledger_entries cle
    set remaining_amount = cle.remaining_amount - v_take
    where cle.id = v_lot.id
      and cle.remaining_amount >= v_take;

    if not found then
      raise exception 'lot allocation failed for lot %', v_lot.id;
    end if;

    v_lot_allocations := v_lot_allocations || jsonb_build_array(
      jsonb_build_object(
        'lot_id', v_lot.id,
        'taken', v_take,
        'expires_at', v_lot.expires_at,
        'remaining_before', v_lot.remaining_amount,
        'remaining_after', v_lot.remaining_amount - v_take
      )
    );

    v_amount_needed := v_amount_needed - v_take;
  end loop;

  if v_amount_needed > 0 then
    raise exception
      'insufficient credit balance after lot walk: shortfall %',
      v_amount_needed;
  end if;

  begin
    insert into public.credit_ledger_entries (
      user_id,
      amount,
      entry_type,
      idempotency_key,
      reference_type,
      reference_id,
      metadata,
      expires_at,
      plan_tier_at_earn,
      remaining_amount
    ) values (
      _user_id,
      -_amount,
      _entry_type,
      _idempotency_key,
      _reference_type,
      _reference_id,
      coalesce(_metadata, '{}'::jsonb) || jsonb_build_object('lot_allocations', v_lot_allocations),
      null,
      null,
      null
    )
    returning id into v_ledger_entry_id;
  exception
    when unique_violation then
      select cle.*
      into v_existing
      from public.credit_ledger_entries cle
      where cle.idempotency_key = _idempotency_key;

      if not found or v_existing.amount >= 0 then
        raise;
      end if;

      v_stored_spent := abs(v_existing.amount);

      if v_stored_spent <> _amount
        or v_existing.user_id is distinct from _user_id
        or v_existing.entry_type is distinct from _entry_type
        or v_existing.reference_type is distinct from _reference_type
        or v_existing.reference_id is distinct from _reference_id
      then
        raise exception 'idempotency payload mismatch on concurrent replay';
      end if;

      select up.credits
      into v_new_balance
      from public.user_progression up
      where up.user_id = _user_id;

      return jsonb_build_object(
        'spent', v_stored_spent,
        'new_balance', v_new_balance,
        'lot_allocations', coalesce(v_existing.metadata -> 'lot_allocations', '[]'::jsonb),
        'ledger_entry_id', v_existing.id,
        'idempotent_replay', true
      );
  end;

  v_new_balance := public.reconcile_user_credits(_user_id);

  return jsonb_build_object(
    'spent', _amount,
    'new_balance', v_new_balance,
    'lot_allocations', v_lot_allocations,
    'ledger_entry_id', v_ledger_entry_id,
    'idempotent_replay', false
  );
end;
$$;

comment on function public.spend_credits(
  uuid, integer, text, text, text, uuid, jsonb
) is
  'Internal FIFO credit spend. Mutates earn-lot remaining_amount and appends one store_spend row. Not client-callable.';

revoke all on function public.spend_credits(
  uuid, integer, text, text, text, uuid, jsonb
) from public, anon, authenticated;

-- ---- 3. Re-assert PAY-0/PAY-1 security -------------------------------------
revoke all on function public.append_credit_ledger_entry(
  uuid, integer, text, text, text, uuid, date, jsonb, timestamptz, text
) from public, anon, authenticated;

revoke all on function public.reconcile_user_credits(uuid)
  from public, anon, authenticated;

revoke all on function public.get_user_plan_tier(uuid)
  from public, anon, authenticated;

revoke all on function public.compute_credit_expires_at(text, timestamptz)
  from public, anon, authenticated;

revoke all on function public.settle_pvp_match_rewards(uuid) from authenticated;
revoke all on function public.settle_multiplayer_match_rewards(uuid) from authenticated;

revoke all on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date, text, text, text, uuid, timestamptz
) from public, anon, authenticated;

revoke all on function public.calculate_pvp_credit_award(uuid, uuid, date, uuid)
  from public, anon, authenticated;

-- ---- 4. Post-migration production guard --------------------------------------
do $$
declare
  v_ledger_count integer;
  v_ledger_sum   integer;
  v_balance_total integer;
begin
  select count(*)::integer, coalesce(sum(remaining_amount), 0)::integer
  into v_ledger_count, v_ledger_sum
  from public.credit_ledger_entries;

  if v_ledger_count <> 79 then
    raise exception
      'PAY-1d.2 aborted: credit_ledger_entries count % != expected 79',
      v_ledger_count;
  end if;

  if v_ledger_sum <> 266 then
    raise exception
      'PAY-1d.2 aborted: unexpired remaining sum % != expected 266',
      v_ledger_sum;
  end if;

  select coalesce(sum(credits), 0)::integer
  into v_balance_total
  from public.user_progression;

  if v_balance_total <> 266 then
    raise exception
      'PAY-1d.2 aborted: user_progression total % != expected 266',
      v_balance_total;
  end if;
end;
$$;
