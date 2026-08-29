-- =============================================================================
-- PAY-1d.4 — Digital entitlement / ownership architecture
--
-- Creates user_entitlements, internal grant_credit_order_entitlements(), and
-- extends place_credit_order() to grant durable digital ownership atomically
-- after spend_credits().
--
-- Non-consumable: avatar, badge, frame, theme (unique per user+product).
-- Consumable boost-double-xp: inactive; fulfillment deferred (not permanent).
--
-- Does NOT implement frontend, Razorpay, subscriptions, or physical fulfilment.
-- Does NOT modify spend_credits, expiry, FIFO, or settlement rules.
-- Safe to re-run: IF NOT EXISTS / CREATE OR REPLACE guards.
-- =============================================================================

-- ---- 1. user_entitlements ----------------------------------------------------
create table if not exists public.user_entitlements (
  id               uuid        primary key default gen_random_uuid(),
  user_id          uuid        not null references auth.users (id) on delete cascade,
  product_id       uuid        references public.store_products (id) on delete restrict,
  product_slug     text        not null,
  entitlement_type text        not null,
  source_type      text        not null,
  source_order_id  uuid        references public.store_orders (id) on delete restrict,
  granted_at       timestamptz not null default now(),
  metadata         jsonb       not null default '{}'::jsonb,
  constraint user_entitlements_entitlement_type_allowed check (
    entitlement_type in ('avatar', 'badge', 'frame', 'theme', 'boost')
  ),
  constraint user_entitlements_source_type_allowed check (
    source_type in (
      'credit_purchase',
      'admin_grant',
      'future_subscription',
      'future_promotion'
    )
  )
);

comment on table public.user_entitlements is
  'Append-only digital ownership grants. Client writes forbidden; granted via internal RPCs.';

comment on column public.user_entitlements.product_slug is
  'Snapshot slug at grant time. Immutable ownership record.';

create unique index if not exists user_entitlements_user_product_nonconsumable_idx
  on public.user_entitlements (user_id, product_id)
  where product_id is not null
    and entitlement_type in ('avatar', 'badge', 'frame', 'theme');

create unique index if not exists user_entitlements_order_product_idx
  on public.user_entitlements (source_order_id, product_id)
  where source_order_id is not null
    and product_id is not null;

create index if not exists user_entitlements_user_granted_idx
  on public.user_entitlements (user_id, granted_at desc);

create index if not exists user_entitlements_source_order_idx
  on public.user_entitlements (source_order_id);

-- ---- 2. RLS — SELECT own only; no client writes ------------------------------
alter table public.user_entitlements enable row level security;

revoke all on public.user_entitlements from public, anon, authenticated;
grant select on public.user_entitlements to authenticated;

drop policy if exists user_entitlements_select_own on public.user_entitlements;
create policy user_entitlements_select_own
  on public.user_entitlements
  for select
  to authenticated
  using (auth.uid() = user_id);

-- ---- 3. resolve_product_entitlement_type -------------------------------------
create or replace function public.resolve_product_entitlement_type(
  _metadata jsonb,
  _slug     text
)
returns text
language plpgsql
stable
set search_path = public
as $$
declare
  v_category text;
begin
  v_category := coalesce(_metadata ->> 'category', '');

  case v_category
    when 'avatars' then return 'avatar';
    when 'badges'  then return 'badge';
    when 'frames'  then return 'frame';
    when 'themes'  then return 'theme';
    when 'boosts'  then return 'boost';
    else
      raise exception 'unknown entitlement category for product %: %', _slug, v_category;
  end case;
end;
$$;

comment on function public.resolve_product_entitlement_type(jsonb, text) is
  'Maps store_products.metadata.category to entitlement_type. Server-side only.';

revoke all on function public.resolve_product_entitlement_type(jsonb, text)
  from public, anon, authenticated;

-- ---- 4. grant_credit_order_entitlements --------------------------------------
create or replace function public.grant_credit_order_entitlements(
  _order_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order           public.store_orders%rowtype;
  v_line            record;
  v_entitlement_type text;
  v_entitlement_id  uuid;
  v_granted         jsonb := '[]'::jsonb;
  v_existing        jsonb := '[]'::jsonb;
begin
  if _order_id is null then
    raise exception 'order_id is required';
  end if;

  select so.*
  into v_order
  from public.store_orders so
  where so.id = _order_id
  for update;

  if not found then
    raise exception 'order not found: %', _order_id;
  end if;

  if auth.uid() is not null and v_order.user_id is distinct from auth.uid() then
    raise exception 'order does not belong to authenticated user';
  end if;

  if v_order.status = 'completed'::public.store_order_status then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', ue.id,
          'product_id', ue.product_id,
          'product_slug', ue.product_slug,
          'entitlement_type', ue.entitlement_type,
          'source_order_id', ue.source_order_id,
          'granted_at', ue.granted_at
        )
        order by ue.product_id
      ),
      '[]'::jsonb
    )
    into v_existing
    from public.user_entitlements ue
    where ue.source_order_id = _order_id;

    return jsonb_build_object(
      'granted', v_existing,
      'idempotent_replay', true
    );
  end if;

  if v_order.status <> 'pending'::public.store_order_status then
    raise exception 'order % is not pending (status=%)', _order_id, v_order.status;
  end if;

  for v_line in
    select
      sol.id            as order_line_id,
      sol.product_id,
      sol.product_slug,
      sol.product_name,
      sol.quantity,
      sol.unit_credits,
      sol.line_credits,
      sol.fulfillment_type,
      sol.metadata      as line_metadata
    from public.store_order_lines sol
    where sol.order_id = _order_id
    order by sol.product_id
  loop
    if v_line.fulfillment_type <> 'digital'::public.store_product_fulfillment_type then
      raise exception 'cannot grant entitlement for non-digital line: %', v_line.product_slug;
    end if;

    if v_line.product_id is null then
      raise exception 'order line missing product_id: %', v_line.product_slug;
    end if;

    select public.resolve_product_entitlement_type(
      coalesce(sp.metadata, '{}'::jsonb) || coalesce(v_line.line_metadata, '{}'::jsonb),
      v_line.product_slug
    )
    into v_entitlement_type
    from public.store_products sp
    where sp.id = v_line.product_id;

    if v_entitlement_type = 'boost' then
      raise exception
        'consumable boost entitlement fulfillment is deferred; product % is not supported in PAY-1d.4',
        v_line.product_slug;
    end if;

    if v_line.quantity <> 1 then
      raise exception
        'non-consumable product % requires quantity 1, got %',
        v_line.product_slug,
        v_line.quantity;
    end if;

    if exists (
      select 1
      from public.user_entitlements ue
      where ue.user_id = v_order.user_id
        and ue.product_id = v_line.product_id
        and ue.entitlement_type in ('avatar', 'badge', 'frame', 'theme')
        and ue.source_order_id is distinct from _order_id
    ) then
      raise exception 'already own product: %', v_line.product_slug;
    end if;

    insert into public.user_entitlements (
      user_id,
      product_id,
      product_slug,
      entitlement_type,
      source_type,
      source_order_id,
      metadata
    ) values (
      v_order.user_id,
      v_line.product_id,
      v_line.product_slug,
      v_entitlement_type,
      'credit_purchase',
      _order_id,
      jsonb_build_object(
        'order_line_id', v_line.order_line_id,
        'product_name', v_line.product_name,
        'unit_credits', v_line.unit_credits,
        'line_credits', v_line.line_credits,
        'catalogue_slug', v_line.product_slug
      )
    )
    on conflict (source_order_id, product_id)
      where source_order_id is not null and product_id is not null
    do nothing
    returning id into v_entitlement_id;

    if v_entitlement_id is null then
      select ue.id
      into v_entitlement_id
      from public.user_entitlements ue
      where ue.source_order_id = _order_id
        and ue.product_id = v_line.product_id;
    end if;

    v_granted := v_granted || jsonb_build_array(
      jsonb_build_object(
        'id', v_entitlement_id,
        'product_id', v_line.product_id,
        'product_slug', v_line.product_slug,
        'entitlement_type', v_entitlement_type,
        'source_order_id', _order_id
      )
    );
  end loop;

  return jsonb_build_object(
    'granted', v_granted,
    'idempotent_replay', false
  );
end;
$$;

comment on function public.grant_credit_order_entitlements(uuid) is
  'Internal fulfillment: grants digital entitlements from immutable order-line snapshots. Not client-callable.';

revoke all on function public.grant_credit_order_entitlements(uuid)
  from public, anon, authenticated;

-- ---- 5. place_credit_order — add entitlement grant step ----------------------
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
  v_user_id              uuid;
  v_elem                 jsonb;
  v_product_id           uuid;
  v_quantity             integer;
  v_qty_num              numeric;
  v_existing_order       public.store_orders%rowtype;
  v_order_id             uuid;
  v_credits_total        integer;
  v_line_credits         integer;
  v_request_fingerprint  text;
  v_spend_result         jsonb;
  v_entitlement_result   jsonb;
  v_new_balance          integer;
  v_product              public.store_products%rowtype;
  v_line_rows            jsonb;
  v_entitlements         jsonb;
  v_entitlement_type     text;
  v_max_qty              constant integer := 99;
  v_max_key_len          constant integer := 128;
  v_max_lines            constant integer := 50;
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

    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', ue.id,
          'product_id', ue.product_id,
          'product_slug', ue.product_slug,
          'entitlement_type', ue.entitlement_type,
          'source_order_id', ue.source_order_id,
          'granted_at', ue.granted_at
        )
        order by ue.product_id
      ),
      '[]'::jsonb
    )
    into v_entitlements
    from public.user_entitlements ue
    where ue.source_order_id = v_existing_order.id;

    select up.credits
    into v_new_balance
    from public.user_progression up
    where up.user_id = v_user_id;

    return jsonb_build_object(
      'order_id', v_existing_order.id,
      'status', v_existing_order.status,
      'credits_total', v_existing_order.credits_total,
      'lines', v_line_rows,
      'entitlements', v_entitlements,
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

    v_entitlement_type := public.resolve_product_entitlement_type(
      coalesce(v_product.metadata, '{}'::jsonb),
      v_product.slug
    );

    if v_entitlement_type = 'boost' then
      raise exception
        'consumable boost products are not purchasable in PAY-1d.4: %',
        v_product.slug;
    end if;

    select tol.quantity
    into v_quantity
    from tmp_place_credit_order_lines tol
    where tol.product_id = v_product.id;

    if v_quantity > v_max_qty then
      raise exception 'quantity exceeds maximum of % per product', v_max_qty;
    end if;

    if v_entitlement_type in ('avatar', 'badge', 'frame', 'theme') then
      if v_quantity <> 1 then
        raise exception
          'non-consumable product % requires quantity 1, got %',
          v_product.slug,
          v_quantity;
      end if;

      if exists (
        select 1
        from public.user_entitlements ue
        where ue.user_id = v_user_id
          and ue.product_id = v_product.id
          and ue.entitlement_type in ('avatar', 'badge', 'frame', 'theme')
      ) then
        raise exception 'already own product: %', v_product.slug;
      end if;
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

      select coalesce(
        jsonb_agg(
          jsonb_build_object(
            'id', ue.id,
            'product_id', ue.product_id,
            'product_slug', ue.product_slug,
            'entitlement_type', ue.entitlement_type,
            'source_order_id', ue.source_order_id,
            'granted_at', ue.granted_at
          )
          order by ue.product_id
        ),
        '[]'::jsonb
      )
      into v_entitlements
      from public.user_entitlements ue
      where ue.source_order_id = v_existing_order.id;

      select up.credits
      into v_new_balance
      from public.user_progression up
      where up.user_id = v_user_id;

      return jsonb_build_object(
        'order_id', v_existing_order.id,
        'status', v_existing_order.status,
        'credits_total', v_existing_order.credits_total,
        'lines', v_line_rows,
        'entitlements', v_entitlements,
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
    coalesce(sp.metadata, '{}'::jsonb) || jsonb_build_object('catalogue_slug', sp.slug)
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

  v_entitlement_result := public.grant_credit_order_entitlements(v_order_id);
  v_entitlements := v_entitlement_result -> 'granted';

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
    'entitlements', v_entitlements,
    'new_balance', v_new_balance,
    'idempotent_replay', false
  );
end;
$$;

comment on function public.place_credit_order(jsonb, text) is
  'Authenticated credit-only checkout with atomic spend + digital entitlement grant.';

revoke all on function public.place_credit_order(jsonb, text)
  from public, anon;

grant execute on function public.place_credit_order(jsonb, text)
  to authenticated;

-- ---- 6. Re-assert PAY-1 security ---------------------------------------------
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

-- ---- 7. Post-migration production guard --------------------------------------
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
      'PAY-1d.4 aborted: credit_ledger_entries count % != expected 79',
      v_ledger_count;
  end if;

  if v_ledger_sum <> 266 then
    raise exception
      'PAY-1d.4 aborted: unexpired remaining sum % != expected 266',
      v_ledger_sum;
  end if;

  select coalesce(sum(credits), 0)::integer
  into v_balance_total
  from public.user_progression;

  if v_balance_total <> 266 then
    raise exception
      'PAY-1d.4 aborted: user_progression total % != expected 266',
      v_balance_total;
  end if;
end;
$$;
