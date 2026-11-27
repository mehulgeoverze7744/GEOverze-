-- Gstore: two delivery options — Standard (FREE, 7 days) and Express (+₹150, 3–4 days).
-- Removes legacy tracked / ₹690, express ₹1,499, and free-shipping threshold logic.

ALTER TABLE public.gstore_orders
  ADD COLUMN IF NOT EXISTS shipping_payment_status TEXT NOT NULL DEFAULT 'not_required'
    CHECK (shipping_payment_status IN ('not_required', 'unpaid', 'paid', 'failed')),
  ADD COLUMN IF NOT EXISTS delivery_estimate TEXT NOT NULL DEFAULT '';

CREATE OR REPLACE FUNCTION public.gstore_shipping_minor(
  p_method TEXT,
  p_has_physical BOOLEAN
)
RETURNS BIGINT
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  IF NOT p_has_physical THEN
    RETURN 0;
  END IF;

  IF p_method = 'standard' THEN
    RETURN 0;
  ELSIF p_method = 'express' THEN
    RETURN 15000;
  END IF;

  RAISE EXCEPTION 'Invalid shipping method: %', p_method USING ERRCODE = 'P0006';
END;
$$;

CREATE OR REPLACE FUNCTION public.gstore_delivery_estimate(p_method TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN p_method = 'express' THEN 'Priority delivery within 3–4 days'
    WHEN p_method = 'standard' THEN 'Delivery within 7 days'
    ELSE ''
  END;
$$;

UPDATE public.shipping_zones
SET free_shipping_threshold_minor = 0,
    updated_at = NOW()
WHERE id = 'india';

DELETE FROM public.shipping_zone_methods
WHERE zone_id = 'india' AND method_id = 'tracked';

INSERT INTO public.shipping_zone_methods (
  zone_id, method_id, label, note, price_minor, trackable,
  estimated_days_min, estimated_days_max, carrier, display_order
)
VALUES
  ('india', 'standard', 'Standard Delivery — FREE', 'Delivery within 7 days', 0, false, 5, 7, 'India Post / Delhivery', 1),
  ('india', 'express', 'Express Delivery — ₹150', 'Priority delivery within 3–4 days', 15000, true, 3, 4, 'Delhivery / BlueDart', 2)
ON CONFLICT (zone_id, method_id) DO UPDATE SET
  label = EXCLUDED.label,
  note = EXCLUDED.note,
  price_minor = EXCLUDED.price_minor,
  trackable = EXCLUDED.trackable,
  estimated_days_min = EXCLUDED.estimated_days_min,
  estimated_days_max = EXCLUDED.estimated_days_max,
  carrier = EXCLUDED.carrier,
  display_order = EXCLUDED.display_order;

-- ── INR checkout: validate shipping on create ───────────────────────────────

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
  v_expected_ship BIGINT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  IF p_shipping_method NOT IN ('standard', 'express') THEN
    RAISE EXCEPTION 'Invalid shipping method' USING ERRCODE = 'P0006';
  END IF;

  v_expected_ship := public.gstore_shipping_minor(p_shipping_method, TRUE);
  IF p_shipping_minor IS DISTINCT FROM v_expected_ship THEN
    RAISE EXCEPTION 'Invalid shipping amount' USING ERRCODE = 'P0007';
  END IF;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM public.gstore_orders
    WHERE idempotency_key = p_idempotency_key
      AND user_id         = v_user_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      RETURN (
        SELECT jsonb_build_object(
          'order_id',     o.id,
          'order_number', o.order_number,
          'payment_id',   gp.id,
          'idempotent',   true
        )
        FROM public.gstore_orders o
        LEFT JOIN public.gstore_payments gp
          ON gp.order_id = o.id AND gp.provider IN ('razorpay', 'mock')
        WHERE o.id = v_existing_id
        ORDER BY gp.created_at DESC
        LIMIT 1
      );
    END IF;
  END IF;

  IF p_total_minor <= 0 THEN
    RAISE EXCEPTION 'Order total must be positive' USING ERRCODE = 'P0002';
  END IF;

  v_order_number := 'GV-' || nextval('gstore_order_number_seq')::TEXT;
  v_order_id     := gen_random_uuid();

  INSERT INTO public.gstore_orders (
    id, order_number, user_id,
    customer_name, customer_email, customer_phone,
    shipping_name, shipping_line1, shipping_line2,
    shipping_city, shipping_state, shipping_pincode, shipping_country,
    delivery_notes,
    subtotal_minor, shipping_minor, tax_minor, discount_minor, total_minor,
    shipping_method, delivery_estimate, shipping_payment_status,
    idempotency_key, is_mock,
    order_status, payment_status
  ) VALUES (
    v_order_id, v_order_number, v_user_id,
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_name, p_shipping_line1, p_shipping_line2,
    p_shipping_city, p_shipping_state, p_shipping_pincode, p_shipping_country,
    p_delivery_notes,
    p_subtotal_minor, p_shipping_minor, p_tax_minor, p_discount_minor, p_total_minor,
    p_shipping_method, public.gstore_delivery_estimate(p_shipping_method), 'not_required',
    p_idempotency_key, p_is_mock,
    'pending', 'unpaid'
  );

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
  v_expected_ship BIGINT;
BEGIN
  IF p_customer_email IS NULL OR p_customer_email = '' THEN
    RAISE EXCEPTION 'Guest email is required' USING ERRCODE = 'P0010';
  END IF;

  IF p_shipping_method NOT IN ('standard', 'express') THEN
    RAISE EXCEPTION 'Invalid shipping method' USING ERRCODE = 'P0006';
  END IF;

  v_expected_ship := public.gstore_shipping_minor(p_shipping_method, TRUE);
  IF p_shipping_minor IS DISTINCT FROM v_expected_ship THEN
    RAISE EXCEPTION 'Invalid shipping amount' USING ERRCODE = 'P0007';
  END IF;

  IF p_total_minor <= 0 THEN
    RAISE EXCEPTION 'Order total must be positive' USING ERRCODE = 'P0002';
  END IF;

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

  v_order_number := 'GV-' || nextval('gstore_order_number_seq')::TEXT;
  v_order_id     := gen_random_uuid();
  v_guest_token  := gen_random_uuid();

  INSERT INTO public.gstore_orders (
    id, order_number, user_id, guest_token,
    customer_name, customer_email, customer_phone,
    shipping_name, shipping_line1, shipping_line2,
    shipping_city, shipping_state, shipping_pincode, shipping_country,
    delivery_notes,
    subtotal_minor, shipping_minor, tax_minor, discount_minor, total_minor,
    shipping_method, delivery_estimate, shipping_payment_status,
    idempotency_key, is_mock,
    order_status, payment_status
  ) VALUES (
    v_order_id, v_order_number, NULL, v_guest_token,
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_name, p_shipping_line1, p_shipping_line2,
    p_shipping_city, p_shipping_state, p_shipping_pincode, p_shipping_country,
    p_delivery_notes,
    p_subtotal_minor, p_shipping_minor, p_tax_minor, p_discount_minor, p_total_minor,
    p_shipping_method, public.gstore_delivery_estimate(p_shipping_method), 'not_required',
    p_idempotency_key, p_is_mock,
    'pending', 'unpaid'
  );

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

REVOKE ALL ON FUNCTION public.create_gstore_order_guest FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.create_gstore_order_guest TO service_role;

-- ── Credits checkout + optional express shipping (INR via Razorpay) ─────────

CREATE OR REPLACE FUNCTION public.create_gstore_credits_order(
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
  p_shipping_method  TEXT,
  p_items            JSONB,
  p_idempotency_key  TEXT,
  p_credits_total    INTEGER
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id              UUID;
  v_order_id             UUID;
  v_order_number         TEXT;
  v_payment_id           UUID;
  v_shipping_payment_id  UUID;
  v_existing_id          UUID;
  v_item                 JSONB;
  v_spend_result         JSONB;
  v_new_balance          INTEGER;
  v_client_total         INTEGER;
  v_slug                 TEXT;
  v_unit_credits         INTEGER;
  v_expected             INTEGER;
  v_shipping_minor       BIGINT;
  v_delivery_estimate    TEXT;
  v_requires_ship_pay    BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  IF p_credits_total IS NULL OR p_credits_total <= 0 THEN
    RAISE EXCEPTION 'credits_total must be positive' USING ERRCODE = 'P0002';
  END IF;

  IF p_shipping_method NOT IN ('standard', 'express') THEN
    RAISE EXCEPTION 'Invalid shipping method' USING ERRCODE = 'P0006';
  END IF;

  v_shipping_minor := public.gstore_shipping_minor(p_shipping_method, TRUE);
  v_delivery_estimate := public.gstore_delivery_estimate(p_shipping_method);
  v_requires_ship_pay := v_shipping_minor > 0;

  IF p_idempotency_key IS NOT NULL THEN
    SELECT id INTO v_existing_id
    FROM public.gstore_orders
    WHERE idempotency_key = p_idempotency_key
      AND user_id = v_user_id
    LIMIT 1;

    IF v_existing_id IS NOT NULL THEN
      RETURN (
        SELECT jsonb_build_object(
          'order_id', o.id,
          'order_number', o.order_number,
          'credits_total', o.credits_total,
          'shipping_minor', o.shipping_minor,
          'requires_shipping_payment', o.shipping_payment_status = 'unpaid',
          'shipping_payment_id', (
            SELECT gp.id FROM public.gstore_payments gp
            WHERE gp.order_id = o.id
              AND gp.provider IN ('razorpay', 'mock')
              AND gp.status IN ('pending', 'paid')
            ORDER BY gp.created_at DESC
            LIMIT 1
          ),
          'new_balance', (
            SELECT credits FROM public.user_progression up WHERE up.user_id = v_user_id
          ),
          'idempotent', true
        )
        FROM public.gstore_orders o
        WHERE o.id = v_existing_id
        LIMIT 1
      );
    END IF;
  END IF;

  v_client_total := 0;
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    v_slug := COALESCE(v_item->>'product_slug', v_item->>'product_id');
    v_expected := public.gstore_credit_price_for_slug(v_slug);
    IF v_slug IS NULL OR v_expected IS NULL THEN
      RAISE EXCEPTION 'Credits checkout not available for: %', v_slug;
    END IF;
    v_unit_credits := COALESCE((v_item->>'unit_credits')::INTEGER, 0);
    IF v_unit_credits <> v_expected THEN
      RAISE EXCEPTION 'Invalid credits price for %', v_slug;
    END IF;
    v_client_total := v_client_total + v_unit_credits * (v_item->>'quantity')::INTEGER;
  END LOOP;

  IF v_client_total <> p_credits_total THEN
    RAISE EXCEPTION 'credits_total mismatch';
  END IF;

  v_order_number := 'GV-' || nextval('gstore_order_number_seq')::TEXT;
  v_order_id     := gen_random_uuid();

  INSERT INTO public.gstore_orders (
    id, order_number, user_id,
    customer_name, customer_email, customer_phone,
    shipping_name, shipping_line1, shipping_line2,
    shipping_city, shipping_state, shipping_pincode, shipping_country,
    delivery_notes,
    subtotal_minor, shipping_minor, tax_minor, discount_minor, total_minor,
    credits_total, shipping_method, delivery_estimate, shipping_payment_status,
    idempotency_key, is_mock,
    order_status, payment_status
  ) VALUES (
    v_order_id, v_order_number, v_user_id,
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_name, p_shipping_line1, p_shipping_line2,
    p_shipping_city, p_shipping_state, p_shipping_pincode, p_shipping_country,
    p_delivery_notes,
    0, v_shipping_minor, 0, 0, v_shipping_minor,
    p_credits_total, p_shipping_method, v_delivery_estimate,
    CASE WHEN v_requires_ship_pay THEN 'unpaid' ELSE 'not_required' END,
    p_idempotency_key, false,
    CASE WHEN v_requires_ship_pay THEN 'pending' ELSE 'confirmed' END,
    CASE WHEN v_requires_ship_pay THEN 'pending' ELSE 'paid' END
  );

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items) LOOP
    INSERT INTO public.gstore_order_items (
      order_id, product_id, product_name, product_slug, sku, category,
      options, quantity, unit_price_minor, line_total_minor,
      unit_credits, line_credits
    ) VALUES (
      v_order_id,
      v_item->>'product_id',
      v_item->>'product_name',
      v_item->>'product_slug',
      COALESCE(v_item->>'sku', ''),
      COALESCE(v_item->>'category', 'accessories'),
      COALESCE(v_item->'options', '{}'),
      (v_item->>'quantity')::INTEGER,
      0,
      0,
      (v_item->>'unit_credits')::INTEGER,
      (v_item->>'line_credits')::INTEGER
    );
  END LOOP;

  v_payment_id := gen_random_uuid();
  INSERT INTO public.gstore_payments (
    id, order_id, provider, amount_minor, currency, status, is_mock,
    payment_method
  ) VALUES (
    v_payment_id, v_order_id, 'credits', 0, 'INR', 'paid', false, 'credits'
  );

  IF v_requires_ship_pay THEN
    v_shipping_payment_id := gen_random_uuid();
    INSERT INTO public.gstore_payments (
      id, order_id, provider, amount_minor, currency, status, is_mock,
      payment_method
    ) VALUES (
      v_shipping_payment_id, v_order_id, 'razorpay', v_shipping_minor, 'INR', 'pending', false,
      'express_shipping'
    );
  END IF;

  v_spend_result := public.spend_credits(
    v_user_id,
    p_credits_total,
    p_idempotency_key,
    'store_spend',
    'gstore_order',
    v_order_id,
    jsonb_build_object(
      'kind', 'gstore_hybrid_credits',
      'shipping_method', p_shipping_method
    )
  );

  v_new_balance := (v_spend_result->>'new_balance')::INTEGER;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'credits_total', p_credits_total,
    'shipping_minor', v_shipping_minor,
    'requires_shipping_payment', v_requires_ship_pay,
    'shipping_payment_id', v_shipping_payment_id,
    'new_balance', v_new_balance,
    'idempotent', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_gstore_credits_order FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_gstore_credits_order TO authenticated;

-- Mark express shipping paid when Razorpay confirms (credits hybrid orders).

CREATE OR REPLACE FUNCTION public.confirm_gstore_payment(
  p_order_id           UUID,
  p_payment_id         UUID,
  p_provider_order_id  TEXT,
  p_provider_payment_id TEXT,
  p_provider_signature  TEXT,
  p_outcome            TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user_id    UUID;
  v_order      public.gstore_orders;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  SELECT * INTO v_order FROM public.gstore_orders WHERE id = p_order_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found' USING ERRCODE = 'P0003';
  END IF;
  IF v_order.user_id <> v_user_id THEN
    RAISE EXCEPTION 'Forbidden' USING ERRCODE = 'P0004';
  END IF;

  IF p_outcome = 'success' AND v_order.payment_status = 'paid' THEN
    RETURN jsonb_build_object('success', true, 'outcome', 'success', 'idempotent', true);
  END IF;

  IF p_outcome = 'success' THEN
    UPDATE public.gstore_payments SET
      provider_order_id   = p_provider_order_id,
      provider_payment_id = p_provider_payment_id,
      provider_signature  = p_provider_signature,
      status              = 'paid',
      verified_at         = NOW(),
      updated_at          = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id
      AND status IS DISTINCT FROM 'paid';

    UPDATE public.gstore_orders SET
      payment_status = 'paid',
      shipping_payment_status = CASE
        WHEN shipping_payment_status = 'unpaid' THEN 'paid'
        ELSE shipping_payment_status
      END,
      order_status   = CASE WHEN order_status = 'pending' THEN 'confirmed' ELSE order_status END,
      updated_at     = NOW()
    WHERE id = p_order_id AND payment_status IS DISTINCT FROM 'paid';

    RETURN jsonb_build_object('success', true, 'outcome', 'success', 'idempotent', false);

  ELSIF p_outcome = 'failed' THEN
    IF v_order.payment_status = 'paid' THEN
      RETURN jsonb_build_object('success', true, 'outcome', 'success', 'idempotent', true);
    END IF;
    UPDATE public.gstore_payments SET status = 'failed', updated_at = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id AND status = 'pending';
    UPDATE public.gstore_orders SET
      payment_status = 'failed',
      shipping_payment_status = CASE
        WHEN shipping_payment_status = 'unpaid' THEN 'failed'
        ELSE shipping_payment_status
      END,
      updated_at = NOW()
    WHERE id = p_order_id AND payment_status <> 'paid';
    RETURN jsonb_build_object('success', false, 'outcome', 'failed');

  ELSIF p_outcome = 'cancel' THEN
    IF v_order.payment_status = 'paid' THEN
      RETURN jsonb_build_object('success', true, 'outcome', 'success', 'idempotent', true);
    END IF;
    UPDATE public.gstore_payments SET status = 'pending', updated_at = NOW()
    WHERE id = p_payment_id AND order_id = p_order_id AND status = 'pending';
    RETURN jsonb_build_object('success', false, 'outcome', 'cancelled');

  ELSE
    RAISE EXCEPTION 'Invalid outcome: %', p_outcome USING ERRCODE = 'P0005';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.confirm_gstore_payment FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.confirm_gstore_payment TO authenticated;