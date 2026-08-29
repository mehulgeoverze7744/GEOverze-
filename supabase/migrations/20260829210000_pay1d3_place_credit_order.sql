-- =============================================================================
-- PAY-1d.3 — Credit-only order placement
--
-- Adds place_credit_order() orchestration RPC:
--   - validates active digital store_products (server pricing only)
--   - creates store_orders + store_order_lines snapshots
--   - calls internal spend_credits() atomically
--   - completes order on success; full rollback on failure
--
-- Does NOT implement user_entitlements, frontend, Razorpay, or physical fulfilment.
-- Does NOT modify spend_credits, settlement, expiry, or historical ledger rows.
-- Safe to re-run: CREATE OR REPLACE / IF NOT EXISTS guards.
-- =============================================================================

-- ---- 1. place_credit_order ---------------------------------------------------
create or replace function public.place_credit_order(
  _lines            jsonb,
  _idempotency_key  text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id             uuid;
  v_elem                jsonb;
  v_product_id          uuid;
  v_quantity            integer;
  v_qty_num             numeric;
  v_existing_order      public.store_orders%rowtype;
  v_order_id            uuid;
  v_credits_total       integer;
  v_line_credits        integer;
  v_request_fingerprint text;
  v_spend_result        jsonb;
  v_new_balance         integer;
  v_product             public.store_products%rowtype;
  v_line_rows           jsonb;
  v_max_qty             constant integer := 99;
  v_max_key_len         constant integer := 128;
  v_max_lines           constant integer := 50;
begin
  v_user_id := auth.uid();

  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  if _idempotency_key is null or btrim(_idempotency_key) = '' then
    raise exception 'idempotency_key is required';
  end if;

  if length(_idempotency_key) > v_max_key_len then
    raise exception 'idempotency_key exceeds maximum length %', v_max_key_len;
  end if;

  if _lines is null or jsonb_typeof(_lines) <> 'array' then
    raise exception 'lines must be a JSON array';
  end if;

  if jsonb_array_length(_lines) = 0 then
    raise exception 'lines must not be empty';
  end if;

  if jsonb_array_length(_lines) > v_max_lines then
    raise exception 'lines exceed maximum of % items', v_max_lines;
  end if;

  drop table if exists pg_temp.tmp_place_credit_order_lines;
  create temp table tmp_place_credit_order_lines (
    product_id uuid primary key,
    quantity   integer not null check (quantity > 0)
  ) on commit drop;

  for v_elem in
    select value
    from jsonb_array_elements(_lines)
  loop
    if v_elem ->> 'product_id' is null or btrim(v_elem ->> 'product_id') = '' then
      raise exception 'product_id is required for every line';
    end if;

    begin
      v_product_id := (v_elem ->> 'product_id')::uuid;
    exception
      when invalid_text_representation then
        raise exception 'invalid product_id UUID: %', v_elem ->> 'product_id';
    end;

    if v_elem -> 'quantity' is null then
      raise exception 'quantity is required for every line';
    end if;

    if jsonb_typeof(v_elem -> 'quantity') <> 'number' then
      raise exception 'quantity must be a number';
    end if;

    v_qty_num := (v_elem ->> 'quantity')::numeric;

    if v_qty_num is null or v_qty_num <> trunc(v_qty_num) or v_qty_num <= 0 then
      raise exception 'quantity must be a positive integer';
    end if;

    v_quantity := v_qty_num::integer;

    if v_quantity > v_max_qty then
      raise exception 'quantity exceeds maximum of % per line', v_max_qty;
    end if;

    insert into tmp_place_credit_order_lines (product_id, quantity)
    values (v_product_id, v_quantity)
    on conflict (product_id) do update
      set quantity = tmp_place_credit_order_lines.quantity + excluded.quantity;

    if (
      select sum(quantity)
      from tmp_place_credit_order_lines
    ) > v_max_qty * v_max_lines then
      raise exception 'total requested quantity exceeds allowed maximum';
    end if;
  end loop;

  select md5(
    coalesce(
      (
        select string_agg(
          tol.product_id::text || ':' || tol.quantity::text,
          ','
          order by tol.product_id
        )
        from tmp_place_credit_order_lines tol
      ),
      ''
    )
  )
  into v_request_fingerprint;

  select so.*
  into v_existing_order
  from public.store_orders so
  where so.user_id = v_user_id
    and so.idempotency_key = _idempotency_key;

  if found then
    if coalesce(v_existing_order.metadata ->> 'request_fingerprint', '')
      is distinct from v_request_fingerprint
    then
      raise exception 'idempotency conflict: key already used for a different request';
    end if;

    if v_existing_order.status <> 'completed'::public.store_order_status then
      raise exception 'existing order for idempotency key is not completed';
    end if;

    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'line_id', sol.id,
          'product_id', sol.product_id,
          'product_slug', sol.product_slug,
          'product_name', sol.product_name,
          'quantity', sol.quantity,
          'unit_credits', sol.unit_credits,
          'line_credits', sol.line_credits,
          'fulfillment_type', sol.fulfillment_type
        )
        order by sol.product_id
      ),
      '[]'::jsonb
    )
    into v_line_rows
    from public.store_order_lines sol
    where sol.order_id = v_existing_order.id;

    select up.credits
    into v_new_balance
    from public.user_progression up
    where up.user_id = v_user_id;

    return jsonb_build_object(
      'order_id', v_existing_order.id,
      'status', v_existing_order.status,
      'credits_total', v_existing_order.credits_total,
      'lines', v_line_rows,
      'new_balance', v_new_balance,
      'idempotent_replay', true
    );
  end if;

  v_credits_total := 0;

  for v_product in
    select sp.*
    from public.store_products sp
    inner join tmp_place_credit_order_lines tol on tol.product_id = sp.id
    where sp.active = true
    order by sp.id
    for update of sp
  loop
    if v_product.fulfillment_type = 'physical'::public.store_product_fulfillment_type then
      raise exception 'physical products cannot be purchased with credits: %', v_product.slug;
    end if;

    if v_product.credit_price <= 0 then
      raise exception 'product has invalid credit price: %', v_product.slug;
    end if;

    select tol.quantity
    into v_quantity
    from tmp_place_credit_order_lines tol
    where tol.product_id = v_product.id;

    if v_quantity > v_max_qty then
      raise exception 'quantity exceeds maximum of % per product', v_max_qty;
    end if;

    v_line_credits := v_product.credit_price * v_quantity;

    if v_line_credits / v_quantity <> v_product.credit_price then
      raise exception 'line credit overflow for product %', v_product.slug;
    end if;

    if v_credits_total > 2147483647 - v_line_credits then
      raise exception 'order credits_total overflow';
    end if;

    v_credits_total := v_credits_total + v_line_credits;
  end loop;

  if (
    select count(*)
    from tmp_place_credit_order_lines tol
  ) <> (
    select count(*)
    from public.store_products sp
    inner join tmp_place_credit_order_lines tol on tol.product_id = sp.id
    where sp.active = true
  ) then
    raise exception 'one or more products are missing or inactive';
  end if;

  if v_credits_total <= 0 then
    raise exception 'credits_total must be > 0';
  end if;

  begin
    insert into public.store_orders (
      user_id,
      status,
      credits_total,
      idempotency_key,
      placed_at,
      metadata
    ) values (
      v_user_id,
      'pending'::public.store_order_status,
      v_credits_total,
      _idempotency_key,
      null,
      jsonb_build_object(
        'request_fingerprint', v_request_fingerprint,
        'request_lines', (
          select coalesce(
            jsonb_agg(
              jsonb_build_object(
                'product_id', tol.product_id,
                'quantity', tol.quantity
              )
              order by tol.product_id
            ),
            '[]'::jsonb
          )
          from tmp_place_credit_order_lines tol
        ),
        'line_count', (select count(*) from tmp_place_credit_order_lines)
      )
    )
    returning id into v_order_id;
  exception
    when unique_violation then
      select so.*
      into v_existing_order
      from public.store_orders so
      where so.user_id = v_user_id
        and so.idempotency_key = _idempotency_key;

      if not found then
        raise;
      end if;

      if coalesce(v_existing_order.metadata ->> 'request_fingerprint', '')
        is distinct from v_request_fingerprint
      then
        raise exception 'idempotency conflict: key already used for a different request';
      end if;

      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'line_id', sol.id,
            'product_id', sol.product_id,
            'product_slug', sol.product_slug,
            'product_name', sol.product_name,
            'quantity', sol.quantity,
            'unit_credits', sol.unit_credits,
            'line_credits', sol.line_credits,
            'fulfillment_type', sol.fulfillment_type
          )
          order by sol.product_id
        ),
        '[]'::jsonb
      )
      into v_line_rows
      from public.store_order_lines sol
      where sol.order_id = v_existing_order.id;

      select up.credits
      into v_new_balance
      from public.user_progression up
      where up.user_id = v_user_id;

      return jsonb_build_object(
        'order_id', v_existing_order.id,
        'status', v_existing_order.status,
        'credits_total', v_existing_order.credits_total,
        'lines', v_line_rows,
        'new_balance', v_new_balance,
        'idempotent_replay', true
      );
  end;

  insert into public.store_order_lines (
    order_id,
    product_id,
    product_slug,
    product_name,
    quantity,
    unit_credits,
    line_credits,
    fulfillment_type,
    metadata
  )
  select
    v_order_id,
    sp.id,
    sp.slug,
    sp.name,
    tol.quantity,
    sp.credit_price,
    sp.credit_price * tol.quantity,
    sp.fulfillment_type,
    jsonb_build_object('catalogue_slug', sp.slug)
  from tmp_place_credit_order_lines tol
  inner join public.store_products sp on sp.id = tol.product_id
  order by sp.id;

  v_spend_result := public.spend_credits(
    v_user_id,
    v_credits_total,
    'spend:order:' || v_order_id::text,
    'store_spend',
    'store_order',
    v_order_id,
    jsonb_build_object(
      'order_id', v_order_id,
      'request_fingerprint', v_request_fingerprint,
      'credits_total', v_credits_total,
      'line_count', (select count(*) from tmp_place_credit_order_lines)
    )
  );

  v_new_balance := (v_spend_result ->> 'new_balance')::integer;

  update public.store_orders so
  set
    status    = 'completed'::public.store_order_status,
    placed_at = now()
  where so.id = v_order_id;

  select coalesce(
    jsonb_agg(
      jsonb_build_object(
        'line_id', sol.id,
        'product_id', sol.product_id,
        'product_slug', sol.product_slug,
        'product_name', sol.product_name,
        'quantity', sol.quantity,
        'unit_credits', sol.unit_credits,
        'line_credits', sol.line_credits,
        'fulfillment_type', sol.fulfillment_type
      )
      order by sol.product_id
    ),
    '[]'::jsonb
  )
  into v_line_rows
  from public.store_order_lines sol
  where sol.order_id = v_order_id;

  return jsonb_build_object(
    'order_id', v_order_id,
    'status', 'completed',
    'credits_total', v_credits_total,
    'lines', v_line_rows,
    'new_balance', v_new_balance,
    'idempotent_replay', false
  );
end;
$$;

comment on function public.place_credit_order(jsonb, text) is
  'Authenticated credit-only checkout. Validates catalogue pricing, creates order snapshots, and spends credits atomically.';

revoke all on function public.place_credit_order(jsonb, text)
  from public, anon;

grant execute on function public.place_credit_order(jsonb, text)
  to authenticated;

-- ---- 2. Re-assert internal spend + PAY-1 security ----------------------------
revoke all on function public.spend_credits(
  uuid, integer, text, text, text, uuid, jsonb
) from public, anon, authenticated;

revoke all on function public.append_credit_ledger_entry(
  uuid, integer, text, text, text, uuid, date, jsonb, timestamptz, text
) from public, anon, authenticated;

revoke all on function public.reconcile_user_credits(uuid)
  from public, anon, authenticated;

revoke all on function public.settle_pvp_match_rewards(uuid) from authenticated;
revoke all on function public.settle_multiplayer_match_rewards(uuid) from authenticated;

revoke all on function public.apply_user_progression_rewards(
  uuid, smallint, smallint, integer, integer, date, text, text, text, uuid, timestamptz
) from public, anon, authenticated;

-- ---- 3. Post-migration production guard --------------------------------------
do $$
declare
  v_ledger_count  integer;
  v_ledger_sum    integer;
  v_balance_total integer;
begin
  select count(*)::integer, coalesce(sum(remaining_amount), 0)::integer
  into v_ledger_count, v_ledger_sum
  from public.credit_ledger_entries;

  if v_ledger_count <> 79 then
    raise exception
      'PAY-1d.3 aborted: credit_ledger_entries count % != expected 79',
      v_ledger_count;
  end if;

  if v_ledger_sum <> 266 then
    raise exception
      'PAY-1d.3 aborted: unexpired remaining sum % != expected 266',
      v_ledger_sum;
  end if;

  select coalesce(sum(credits), 0)::integer
  into v_balance_total
  from public.user_progression;

  if v_balance_total <> 266 then
    raise exception
      'PAY-1d.3 aborted: user_progression total % != expected 266',
      v_balance_total;
  end if;
end;
$$;
