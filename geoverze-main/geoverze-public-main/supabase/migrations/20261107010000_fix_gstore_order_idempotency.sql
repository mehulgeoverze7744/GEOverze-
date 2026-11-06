-- ============================================================
-- Fix: create_gstore_order idempotency RETURN placement bug
-- Migration: 20261107010000_fix_gstore_order_idempotency.sql
--
-- BUG in 20261106260000_gstore_checkout_tables.sql:
--   The idempotency RETURN was placed OUTSIDE the
--   `IF v_existing_id IS NOT NULL THEN` block but INSIDE the
--   `IF p_idempotency_key IS NOT NULL THEN` block.
--
--   Result: for every new order (v_existing_id IS NULL), the function
--   executed RETURN before the INSERT, returning NULL JSONB and never
--   creating the order.
--
--   Additionally the inner `SELECT ... INTO STRICT (SELECT ...)` block
--   used invalid PL/pgSQL syntax.
--
-- FIX: Move the RETURN inside the inner IF so it only fires when an
--      existing idempotent order is found.  New orders fall through to
--      the INSERT logic as intended.
-- ============================================================

CREATE OR REPLACE FUNCTION public.create_gstore_order(
  p_customer_name    TEXT,
  p_customer_email   TEXT,
  p_customer_phone   TEXT,
  p_shipping_name    TEXT,
  p_shipping_line1   TEXT,
  p_shipping_line2   TEXT,
  p_shipping_city    TEXT,
  p_shipping_state   TEXT,
  p_shipping_pincode TEXT,
  p_shipping_country TEXT,
  p_delivery_notes   TEXT,
  p_subtotal_minor   BIGINT,
  p_shipping_minor   BIGINT,
  p_tax_minor        BIGINT,
  p_discount_minor   BIGINT,
  p_total_minor      BIGINT,
  p_shipping_method  TEXT,
  p_items            JSONB,
  p_idempotency_key  TEXT,
  p_is_mock          BOOLEAN DEFAULT false
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id      UUID;
  v_order_id     UUID;
  v_order_number TEXT;
  v_payment_id   UUID;
  v_existing_id  UUID;
  v_item         JSONB;
BEGIN
  -- Auth guard
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- ── Idempotency ────────────────────────────────────────────────────────
  -- FIX: RETURN is now INSIDE the `IF v_existing_id IS NOT NULL` block.
  -- When no existing order is found (new checkout), execution falls through
  -- to the INSERT code below instead of returning NULL.
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM public.gstore_orders
    WHERE idempotency_key = p_idempotency_key
      AND user_id         = v_user_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      -- Idempotent replay — return the existing order without re-inserting.
      RETURN (
        SELECT jsonb_build_object(
          'order_id',     o.id,
          'order_number', o.order_number,
          'payment_id',   gp.id,
          'idempotent',   true
        )
        FROM public.gstore_orders o
        LEFT JOIN public.gstore_payments gp ON gp.order_id = o.id
        WHERE o.id = v_existing_id
        LIMIT 1
      );
    END IF;
    -- v_existing_id IS NULL → no existing order → fall through to INSERT
  END IF;

  -- ── Amount sanity check ───────────────────────────────────────────────
  IF p_total_minor <= 0 THEN
    RAISE EXCEPTION 'Order total must be positive' USING ERRCODE = 'P0002';
  END IF;

  -- ── Generate order number and IDs ─────────────────────────────────────
  v_order_number := 'GV-' || nextval('gstore_order_number_seq')::TEXT;
  v_order_id     := gen_random_uuid();

  -- ── Insert order ──────────────────────────────────────────────────────
  INSERT INTO public.gstore_orders (
    id, order_number, user_id,
    customer_name, customer_email, customer_phone,
    shipping_name, shipping_line1, shipping_line2,
    shipping_city, shipping_state, shipping_pincode, shipping_country,
    delivery_notes,
    subtotal_minor, shipping_minor, tax_minor, discount_minor, total_minor,
    shipping_method, idempotency_key, is_mock,
    order_status, payment_status
  ) VALUES (
    v_order_id, v_order_number, v_user_id,
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_name, p_shipping_line1, p_shipping_line2,
    p_shipping_city, p_shipping_state, p_shipping_pincode, p_shipping_country,
    p_delivery_notes,
    p_subtotal_minor, p_shipping_minor, p_tax_minor, p_discount_minor, p_total_minor,
    p_shipping_method, p_idempotency_key, p_is_mock,
    'pending', 'unpaid'
  );

  -- ── Insert order items ────────────────────────────────────────────────
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.gstore_order_items (
      order_id, product_id, product_name, product_slug, sku, category,
      options, quantity, unit_price_minor, line_total_minor
    ) VALUES (
      v_order_id,
      v_item->>'product_id',
      v_item->>'product_name',
      v_item->>'product_slug',
      COALESCE(v_item->>'sku',      ''),
      COALESCE(v_item->>'category', ''),
      COALESCE(v_item->'options',   '{}'),
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price_minor')::BIGINT,
      (v_item->>'line_total_minor')::BIGINT
    );
  END LOOP;

  -- ── Insert pending payment record ─────────────────────────────────────
  v_payment_id := gen_random_uuid();
  INSERT INTO public.gstore_payments (
    id, order_id, provider, amount_minor, currency, status, is_mock
  ) VALUES (
    v_payment_id, v_order_id,
    CASE WHEN p_is_mock THEN 'mock' ELSE 'razorpay' END,
    p_total_minor, 'INR', 'pending', p_is_mock
  );

  RETURN jsonb_build_object(
    'order_id',     v_order_id,
    'order_number', v_order_number,
    'payment_id',   v_payment_id,
    'idempotent',   false
  );
END;
$$;

-- Preserve the same grants as the original function
REVOKE ALL ON FUNCTION public.create_gstore_order FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_gstore_order TO authenticated;
