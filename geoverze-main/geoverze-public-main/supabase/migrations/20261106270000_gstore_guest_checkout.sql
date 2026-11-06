-- ============================================================
-- GVRZE Gstore Guest Checkout Support
-- Migration: 20261106270000_gstore_guest_checkout.sql
--
-- Adds:
--   1. guest_token column    — secure UUID for guest order lookup
--   2. guest_email index     — for guest order search by email
--   3. create_gstore_order_guest — anon-callable RPC for guest orders
--      IMPORTANT: This function is callable by anon role BUT is
--      protected by rate-limiting in the application layer.
--      Guest orders have user_id = NULL and use guest_token for lookup.
--   4. get_guest_order_detail — lookup by order_number + guest_token
--   5. admin_update_gstore_order — SECURITY DEFINER for admin use
-- ============================================================


-- ── 1. Add guest_token to gstore_orders ──────────────────────────────────

ALTER TABLE public.gstore_orders
  ADD COLUMN IF NOT EXISTS guest_token UUID DEFAULT NULL;

-- Index for guest order lookup (order_number + guest_token)
CREATE INDEX IF NOT EXISTS gstore_orders_guest_token_idx
  ON public.gstore_orders (guest_token)
  WHERE guest_token IS NOT NULL;

-- Index for email lookup (admin / guest order status)
CREATE INDEX IF NOT EXISTS gstore_orders_email_idx
  ON public.gstore_orders (customer_email, created_at DESC);

-- Allow anon users to SELECT their own guest orders (via guest_token)
-- Users can read guest orders with their token, or their own auth orders
CREATE POLICY "Guest users can read own guest orders by token"
  ON public.gstore_orders FOR SELECT
  USING (
    -- Authenticated: already covered by existing policy
    -- Guest: match by guest_token (UUID)
    guest_token IS NOT NULL AND guest_token::text = current_setting('request.jwt.claims', true)::json->>'guest_token'
  );

-- ── 2. create_gstore_order_guest RPC ─────────────────────────────────────
--
-- Callable by anon role (no JWT required).
-- Creates a guest order with user_id = NULL and returns a guest_token
-- that the guest can use to look up their order later.
--
-- The server function (gstoreServerFns.ts) must use the SERVICE ROLE
-- key to call this — do NOT call it directly from the browser client.
-- The service role key is NEVER sent to the client.

CREATE OR REPLACE FUNCTION public.create_gstore_order_guest(
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
  v_order_id     UUID;
  v_order_number TEXT;
  v_payment_id   UUID;
  v_guest_token  UUID;
  v_existing_id  UUID;
  v_item         JSONB;
BEGIN
  -- Input sanity
  IF p_customer_email IS NULL OR p_customer_email = '' THEN
    RAISE EXCEPTION 'Guest email is required' USING ERRCODE = 'P0010';
  END IF;

  IF p_total_minor <= 0 THEN
    RAISE EXCEPTION 'Order total must be positive' USING ERRCODE = 'P0002';
  END IF;

  -- Idempotency: return existing order if key already processed
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM public.gstore_orders
    WHERE idempotency_key = p_idempotency_key
      AND user_id IS NULL
      AND customer_email = p_customer_email
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      RETURN (
        SELECT jsonb_build_object(
          'order_id',     o.id,
          'order_number', o.order_number,
          'payment_id',   gp.id,
          'guest_token',  o.guest_token,
          'idempotent',   true
        )
        FROM public.gstore_orders o
        LEFT JOIN public.gstore_payments gp ON gp.order_id = o.id
        WHERE o.id = v_existing_id
        LIMIT 1
      );
    END IF;
  END IF;

  -- Generate identifiers
  v_order_number := 'GV-' || nextval('gstore_order_number_seq')::TEXT;
  v_order_id     := gen_random_uuid();
  v_guest_token  := gen_random_uuid();

  -- Insert guest order (user_id = NULL)
  INSERT INTO public.gstore_orders (
    id, order_number, user_id, guest_token,
    customer_name, customer_email, customer_phone,
    shipping_name, shipping_line1, shipping_line2,
    shipping_city, shipping_state, shipping_pincode, shipping_country,
    delivery_notes,
    subtotal_minor, shipping_minor, tax_minor, discount_minor, total_minor,
    shipping_method, idempotency_key, is_mock,
    order_status, payment_status
  ) VALUES (
    v_order_id, v_order_number, NULL, v_guest_token,
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_name, p_shipping_line1, p_shipping_line2,
    p_shipping_city, p_shipping_state, p_shipping_pincode, p_shipping_country,
    p_delivery_notes,
    p_subtotal_minor, p_shipping_minor, p_tax_minor, p_discount_minor, p_total_minor,
    p_shipping_method, p_idempotency_key, p_is_mock,
    'pending', 'unpaid'
  );

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.gstore_order_items (
      order_id, product_id, product_name, product_slug, sku, category,
      options, quantity, unit_price_minor, line_total_minor
    ) VALUES (
      v_order_id,
      v_item->>'product_id', v_item->>'product_name', v_item->>'product_slug',
      COALESCE(v_item->>'sku', ''), COALESCE(v_item->>'category', ''),
      COALESCE(v_item->'options', '{}'),
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price_minor')::BIGINT,
      (v_item->>'line_total_minor')::BIGINT
    );
  END LOOP;

  -- Insert pending payment record
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
    'guest_token',  v_guest_token,
    'idempotent',   false
  );
END;
$$;

-- Allow authenticated server functions to call this via service role
REVOKE ALL ON FUNCTION public.create_gstore_order_guest FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_gstore_order_guest TO service_role;


-- ── 3. confirm_gstore_payment_guest RPC ──────────────────────────────────
--
-- Confirms payment for a guest order. Called with service role.
-- Verifies order belongs to the same guest_token before updating.

CREATE OR REPLACE FUNCTION public.confirm_gstore_payment_guest(
  p_order_id            UUID,
  p_payment_id          UUID,
  p_guest_token         UUID,
  p_provider_order_id   TEXT,
  p_provider_payment_id TEXT,
  p_provider_signature  TEXT,
  p_outcome             TEXT   -- 'success' | 'failed' | 'cancel'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_order_guest_token UUID;
BEGIN
  -- Verify guest_token matches
  SELECT guest_token INTO v_order_guest_token
  FROM public.gstore_orders
  WHERE id = p_order_id AND user_id IS NULL;

  IF v_order_guest_token IS NULL THEN
    RAISE EXCEPTION 'Guest order not found' USING ERRCODE = 'P0003';
  END IF;

  IF v_order_guest_token <> p_guest_token THEN
    RAISE EXCEPTION 'Invalid guest token' USING ERRCODE = 'P0004';
  END IF;

  IF p_outcome = 'success' THEN
    UPDATE public.gstore_payments SET
      provider_order_id   = p_provider_order_id,
      provider_payment_id = p_provider_payment_id,
      provider_signature  = p_provider_signature,
      status              = 'paid',
      updated_at          = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id;

    UPDATE public.gstore_orders SET
      payment_status = 'paid',
      order_status   = 'confirmed',
      updated_at     = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'outcome', 'success');
  ELSIF p_outcome = 'failed' THEN
    UPDATE public.gstore_payments SET status = 'failed', updated_at = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id;
    UPDATE public.gstore_orders SET payment_status = 'failed', updated_at = NOW()
    WHERE id = p_order_id;
    RETURN jsonb_build_object('success', false, 'outcome', 'failed');
  ELSE
    UPDATE public.gstore_payments SET status = 'cancelled', updated_at = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id;
    UPDATE public.gstore_orders SET payment_status = 'cancelled', order_status = 'cancelled', updated_at = NOW()
    WHERE id = p_order_id;
    RETURN jsonb_build_object('success', false, 'outcome', 'cancelled');
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_gstore_payment_guest FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_gstore_payment_guest TO service_role;


-- ── 4. get_guest_order_detail ─────────────────────────────────────────────
--
-- Secure guest order lookup: requires both order_number AND guest_token.
-- Returns NULL (via empty result) if either doesn't match.

CREATE OR REPLACE FUNCTION public.get_guest_order_detail(
  p_order_number TEXT,
  p_guest_token  UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_order public.gstore_orders;
  v_items JSONB;
BEGIN
  SELECT * INTO v_order
  FROM public.gstore_orders
  WHERE order_number = p_order_number
    AND guest_token  = p_guest_token
    AND user_id IS NULL
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT jsonb_agg(jsonb_build_object(
    'id',               i.id,
    'product_name',     i.product_name,
    'product_slug',     i.product_slug,
    'options',          i.options,
    'quantity',         i.quantity,
    'unit_price_minor', i.unit_price_minor,
    'line_total_minor', i.line_total_minor
  ))
  INTO v_items
  FROM public.gstore_order_items i
  WHERE i.order_id = v_order.id;

  RETURN jsonb_build_object(
    'id',              v_order.id,
    'order_number',    v_order.order_number,
    'order_status',    v_order.order_status,
    'payment_status',  v_order.payment_status,
    'total_minor',     v_order.total_minor,
    'subtotal_minor',  v_order.subtotal_minor,
    'shipping_minor',  v_order.shipping_minor,
    'tax_minor',       v_order.tax_minor,
    'shipping_method', v_order.shipping_method,
    'tracking_number', v_order.tracking_number,
    'customer_name',   v_order.customer_name,
    'customer_email',  v_order.customer_email,
    'shipping_name',   v_order.shipping_name,
    'shipping_line1',  v_order.shipping_line1,
    'shipping_line2',  v_order.shipping_line2,
    'shipping_city',   v_order.shipping_city,
    'shipping_state',  v_order.shipping_state,
    'shipping_pincode',v_order.shipping_pincode,
    'shipping_country',v_order.shipping_country,
    'is_mock',         v_order.is_mock,
    'created_at',      v_order.created_at,
    'items',           COALESCE(v_items, '[]'::jsonb)
  );
END;
$$;

REVOKE ALL ON FUNCTION public.get_guest_order_detail FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_guest_order_detail TO anon, authenticated, service_role;


-- ── 5. admin_update_gstore_order ─────────────────────────────────────────
--
-- Admin-only: update order_status and tracking_number.
-- Uses service role; the calling server function must verify admin identity.

CREATE OR REPLACE FUNCTION public.admin_update_gstore_order(
  p_order_id       UUID,
  p_order_status   TEXT   DEFAULT NULL,
  p_tracking_number TEXT  DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_order_status IS NOT NULL THEN
    IF p_order_status NOT IN ('pending','confirmed','processing','shipped','delivered','cancelled','refunded') THEN
      RAISE EXCEPTION 'Invalid order status: %', p_order_status USING ERRCODE = 'P0007';
    END IF;
    UPDATE public.gstore_orders
    SET order_status = p_order_status, updated_at = NOW()
    WHERE id = p_order_id;
  END IF;

  IF p_tracking_number IS NOT NULL THEN
    UPDATE public.gstore_orders
    SET tracking_number = p_tracking_number, updated_at = NOW()
    WHERE id = p_order_id;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_update_gstore_order FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_gstore_order TO service_role;


-- ── 6. Admin orders view (service role only) ─────────────────────────────

CREATE OR REPLACE VIEW public.gstore_orders_admin_view AS
SELECT
  o.id,
  o.order_number,
  o.user_id,
  o.customer_name,
  o.customer_email,
  o.customer_phone,
  o.shipping_city,
  o.shipping_state,
  o.total_minor,
  o.currency,
  o.order_status,
  o.payment_status,
  o.shipping_method,
  o.tracking_number,
  o.is_mock,
  o.created_at,
  o.updated_at,
  COUNT(i.id)::integer AS item_count
FROM public.gstore_orders o
LEFT JOIN public.gstore_order_items i ON i.order_id = o.id
GROUP BY o.id;

-- Only service role can query this view
REVOKE ALL ON public.gstore_orders_admin_view FROM PUBLIC, anon, authenticated;
GRANT SELECT ON public.gstore_orders_admin_view TO service_role;
