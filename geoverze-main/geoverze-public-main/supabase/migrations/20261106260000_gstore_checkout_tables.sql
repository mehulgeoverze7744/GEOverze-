-- ============================================================
-- GVRZE Gstore One-Time Product Checkout Infrastructure
-- Migration: 20261106260000_gstore_checkout_tables.sql
--
-- Creates:
--   1. gstore_orders          — physical / digital product orders
--   2. gstore_order_items     — per-line snapshots (price-locked)
--   3. gstore_payments        — payment transaction records
--   4. create_gstore_order    — RPC: insert order + items atomically
--   5. confirm_gstore_payment — RPC: verify + mark order paid
--   6. cancel_gstore_order    — RPC: cancel a pending order
--
-- SECURITY:
--   RLS: users can read their own orders/items/payments only.
--   Writes go through SECURITY DEFINER RPCs (runs as postgres,
--   bypasses RLS for server-trusted inserts).
--   The RPCs validate auth.uid() before every mutation.
--
-- CURRENCY: All money amounts stored in INR minor units (paise).
--   ₹1 = 100 paise.  Razorpay expects paise.
-- ============================================================


-- ── 1. gstore_orders ──────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gstore_orders (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     TEXT        NOT NULL UNIQUE,

  -- Owner (NULL = guest order)
  user_id          UUID        REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Customer info snapshot (captured at order time, never changes)
  customer_name    TEXT        NOT NULL,
  customer_email   TEXT        NOT NULL,
  customer_phone   TEXT        NOT NULL DEFAULT '',

  -- Shipping address snapshot
  shipping_name    TEXT        NOT NULL,
  shipping_line1   TEXT        NOT NULL,
  shipping_line2   TEXT        NOT NULL DEFAULT '',
  shipping_city    TEXT        NOT NULL,
  shipping_state   TEXT        NOT NULL,
  shipping_pincode TEXT        NOT NULL,
  shipping_country TEXT        NOT NULL DEFAULT 'India',
  delivery_notes   TEXT        NOT NULL DEFAULT '',

  -- Amounts (INR paise, all server-calculated, never trusted from client)
  subtotal_minor   BIGINT      NOT NULL CHECK (subtotal_minor >= 0),
  shipping_minor   BIGINT      NOT NULL DEFAULT 0 CHECK (shipping_minor >= 0),
  tax_minor        BIGINT      NOT NULL DEFAULT 0 CHECK (tax_minor >= 0),
  discount_minor   BIGINT      NOT NULL DEFAULT 0 CHECK (discount_minor >= 0),
  total_minor      BIGINT      NOT NULL CHECK (total_minor >= 0),
  currency         TEXT        NOT NULL DEFAULT 'INR',

  -- Lifecycle
  order_status     TEXT        NOT NULL DEFAULT 'pending'
                               CHECK (order_status IN (
                                 'pending','confirmed','processing',
                                 'shipped','delivered','cancelled','refunded'
                               )),
  payment_status   TEXT        NOT NULL DEFAULT 'unpaid'
                               CHECK (payment_status IN (
                                 'unpaid','pending','paid',
                                 'failed','cancelled','refunded'
                               )),

  -- Shipping
  shipping_method  TEXT        NOT NULL DEFAULT 'standard',
  tracking_number  TEXT,

  -- Idempotency: prevents double-submit from the same checkout session
  idempotency_key  TEXT        UNIQUE,

  -- Flags
  is_mock          BOOLEAN     NOT NULL DEFAULT false,

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for user order history lookups
CREATE INDEX IF NOT EXISTS gstore_orders_user_id_idx
  ON public.gstore_orders (user_id, created_at DESC);

-- Index for idempotency checks
CREATE INDEX IF NOT EXISTS gstore_orders_idempotency_idx
  ON public.gstore_orders (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- RLS
ALTER TABLE public.gstore_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own gstore orders"
  ON public.gstore_orders FOR SELECT
  USING (auth.uid() = user_id);

-- No INSERT/UPDATE policies — all writes go through SECURITY DEFINER RPCs


-- ── 2. gstore_order_items ─────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gstore_order_items (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id         UUID        NOT NULL
                               REFERENCES public.gstore_orders(id)
                               ON DELETE CASCADE,

  -- Product snapshot (price-locked at time of purchase; survives product edits)
  product_id       TEXT        NOT NULL,
  product_name     TEXT        NOT NULL,
  product_slug     TEXT        NOT NULL,
  sku              TEXT        NOT NULL DEFAULT '',
  category         TEXT        NOT NULL DEFAULT '',

  -- Selected variants (e.g. { "Size": "L", "Colour": "Charcoal" })
  options          JSONB       NOT NULL DEFAULT '{}',

  -- Pricing snapshot (INR paise)
  quantity         INTEGER     NOT NULL CHECK (quantity > 0),
  unit_price_minor BIGINT      NOT NULL CHECK (unit_price_minor >= 0),
  line_total_minor BIGINT      NOT NULL CHECK (line_total_minor >= 0),

  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for looking up items by order
CREATE INDEX IF NOT EXISTS gstore_order_items_order_id_idx
  ON public.gstore_order_items (order_id);

-- RLS (users can read items for their own orders via JOIN policy)
ALTER TABLE public.gstore_order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read items of own gstore orders"
  ON public.gstore_order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gstore_orders o
      WHERE o.id = gstore_order_items.order_id
        AND o.user_id = auth.uid()
    )
  );


-- ── 3. gstore_payments ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.gstore_payments (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID        NOT NULL
                                   REFERENCES public.gstore_orders(id)
                                   ON DELETE CASCADE,

  provider             TEXT        NOT NULL DEFAULT 'razorpay'
                                   CHECK (provider IN ('razorpay', 'mock')),

  -- Razorpay identifiers (populated after payment)
  provider_order_id    TEXT,          -- rzp order_id  (order_xxxx)
  provider_payment_id  TEXT,          -- rzp payment_id (pay_xxxx)
  provider_signature   TEXT,          -- rzp hmac signature (verified server-side)

  amount_minor         BIGINT      NOT NULL CHECK (amount_minor >= 0),
  currency             TEXT        NOT NULL DEFAULT 'INR',

  status               TEXT        NOT NULL DEFAULT 'pending'
                                   CHECK (status IN (
                                     'pending','paid','failed','cancelled','refunded'
                                   )),

  is_mock              BOOLEAN     NOT NULL DEFAULT false,

  -- Idempotency: prevents double-webhook processing
  idempotency_key      TEXT        UNIQUE,

  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for looking up payment by Razorpay order id
CREATE INDEX IF NOT EXISTS gstore_payments_provider_order_idx
  ON public.gstore_payments (provider_order_id)
  WHERE provider_order_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS gstore_payments_order_id_idx
  ON public.gstore_payments (order_id);

-- RLS
ALTER TABLE public.gstore_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read payments for own gstore orders"
  ON public.gstore_payments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.gstore_orders o
      WHERE o.id = gstore_payments.order_id
        AND o.user_id = auth.uid()
    )
  );


-- ── Sequence for human-readable order numbers ─────────────────────────────

CREATE SEQUENCE IF NOT EXISTS gstore_order_number_seq START 10001;


-- ── 4. create_gstore_order RPC ───────────────────────────────────────────
--
-- Atomically:
--   a. Checks idempotency (returns existing order if key matches).
--   b. Inserts gstore_orders row.
--   c. Inserts gstore_order_items rows.
--   d. Inserts a pending gstore_payments row.
--   e. Returns the new order id + order number + payment row id.
--
-- Called by: gstoreServerFns.ts → createGstoreOrderFn
-- Auth:      auth.uid() must not be null (authenticated users only).
--
-- p_items JSON schema:
--   [{ product_id, product_name, product_slug, sku, category,
--      options, quantity, unit_price_minor, line_total_minor }]

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

  -- Idempotency: return existing order if key already processed
  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM public.gstore_orders
    WHERE idempotency_key = p_idempotency_key
      AND user_id = v_user_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      SELECT jsonb_build_object(
        'order_id',     o.id,
        'order_number', o.order_number,
        'payment_id',   p.id,
        'idempotent',   true
      )
      INTO STRICT
        (SELECT jsonb_build_object(
           'order_id',     o.id,
           'order_number', o.order_number,
           'payment_id',   gp.id,
           'idempotent',   true
         )
         FROM public.gstore_orders o
         LEFT JOIN public.gstore_payments gp ON gp.order_id = o.id
         WHERE o.id = v_existing_id
         LIMIT 1);
    END IF;

    -- Simpler idempotency return
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

  -- Amount sanity check
  IF p_total_minor <= 0 THEN
    RAISE EXCEPTION 'Order total must be positive' USING ERRCODE = 'P0002';
  END IF;

  -- Generate order number: GV-XXXXX
  v_order_number := 'GV-' || nextval('gstore_order_number_seq')::TEXT;
  v_order_id     := gen_random_uuid();

  -- Insert order
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

  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.gstore_order_items (
      order_id, product_id, product_name, product_slug, sku, category,
      options, quantity, unit_price_minor, line_total_minor
    ) VALUES (
      v_order_id,
      v_item->>'product_id',
      v_item->>'product_name',
      v_item->>'product_slug',
      COALESCE(v_item->>'sku', ''),
      COALESCE(v_item->>'category', ''),
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
    'idempotent',   false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_gstore_order FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_gstore_order TO authenticated;


-- ── 5. confirm_gstore_payment RPC ─────────────────────────────────────────
--
-- Called after successful Razorpay payment verification (server-side).
-- Updates payment record with provider IDs + signature, marks order paid.
--
-- p_outcome: 'success' | 'failed' | 'cancel'

CREATE OR REPLACE FUNCTION public.confirm_gstore_payment(
  p_order_id           UUID,
  p_payment_id         UUID,
  p_provider_order_id  TEXT,
  p_provider_payment_id TEXT,
  p_provider_signature  TEXT,
  p_outcome            TEXT   -- 'success' | 'failed' | 'cancel'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id    UUID;
  v_order_user UUID;
BEGIN
  -- Auth guard
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  -- Ownership check
  SELECT user_id INTO v_order_user
  FROM public.gstore_orders
  WHERE id = p_order_id;

  IF v_order_user IS NULL THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0003';
  END IF;

  IF v_order_user <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = 'P0004';
  END IF;

  IF p_outcome = 'success' THEN
    -- Mark payment paid
    UPDATE public.gstore_payments SET
      provider_order_id   = p_provider_order_id,
      provider_payment_id = p_provider_payment_id,
      provider_signature  = p_provider_signature,
      status              = 'paid',
      updated_at          = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id;

    -- Mark order confirmed + paid
    UPDATE public.gstore_orders SET
      payment_status = 'paid',
      order_status   = 'confirmed',
      updated_at     = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', true, 'outcome', 'success');

  ELSIF p_outcome = 'failed' THEN
    UPDATE public.gstore_payments SET
      status     = 'failed',
      updated_at = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id;

    UPDATE public.gstore_orders SET
      payment_status = 'failed',
      updated_at     = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', false, 'outcome', 'failed');

  ELSIF p_outcome = 'cancel' THEN
    UPDATE public.gstore_payments SET
      status     = 'cancelled',
      updated_at = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id;

    UPDATE public.gstore_orders SET
      payment_status = 'cancelled',
      order_status   = 'cancelled',
      updated_at     = NOW()
    WHERE id = p_order_id;

    RETURN jsonb_build_object('success', false, 'outcome', 'cancelled');

  ELSE
    RAISE EXCEPTION 'Invalid outcome: %', p_outcome USING ERRCODE = 'P0005';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_gstore_payment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_gstore_payment TO authenticated;


-- ── 6. cancel_gstore_order RPC ───────────────────────────────────────────
--
-- Cancels a pending/unpaid order (before payment capture).
-- Users can only cancel their own pending orders.

CREATE OR REPLACE FUNCTION public.cancel_gstore_order(
  p_order_id UUID
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id    UUID;
  v_order_user UUID;
  v_status     TEXT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  SELECT user_id, order_status INTO v_order_user, v_status
  FROM public.gstore_orders
  WHERE id = p_order_id;

  IF v_order_user IS NULL THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0003';
  END IF;

  IF v_order_user <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = 'P0004';
  END IF;

  IF v_status NOT IN ('pending', 'confirmed') THEN
    RAISE EXCEPTION 'Order cannot be cancelled in status: %', v_status
      USING ERRCODE = 'P0006';
  END IF;

  UPDATE public.gstore_orders SET
    order_status   = 'cancelled',
    payment_status = 'cancelled',
    updated_at     = NOW()
  WHERE id = p_order_id;

  UPDATE public.gstore_payments SET
    status     = 'cancelled',
    updated_at = NOW()
  WHERE order_id = p_order_id AND status = 'pending';

  RETURN jsonb_build_object('success', true);
END;
$$;

REVOKE ALL ON FUNCTION public.cancel_gstore_order FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_gstore_order TO authenticated;


-- ── Trigger: auto-update updated_at ──────────────────────────────────────

CREATE OR REPLACE FUNCTION public.gstore_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER gstore_orders_updated_at
  BEFORE UPDATE ON public.gstore_orders
  FOR EACH ROW EXECUTE FUNCTION public.gstore_set_updated_at();

CREATE TRIGGER gstore_payments_updated_at
  BEFORE UPDATE ON public.gstore_payments
  FOR EACH ROW EXECUTE FUNCTION public.gstore_set_updated_at();
