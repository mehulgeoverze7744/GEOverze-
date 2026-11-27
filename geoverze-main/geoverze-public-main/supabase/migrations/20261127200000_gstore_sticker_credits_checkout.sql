-- Gstore sticker collections — pay with GVRZE Credits (authenticated).
-- Uses existing spend_credits ledger; does not modify place_credit_order.

ALTER TABLE public.gstore_orders
  ADD COLUMN IF NOT EXISTS credits_total INTEGER NOT NULL DEFAULT 0 CHECK (credits_total >= 0);

ALTER TABLE public.gstore_order_items
  ADD COLUMN IF NOT EXISTS unit_credits INTEGER NOT NULL DEFAULT 0 CHECK (unit_credits >= 0),
  ADD COLUMN IF NOT EXISTS line_credits INTEGER NOT NULL DEFAULT 0 CHECK (line_credits >= 0);

ALTER TABLE public.gstore_payments
  DROP CONSTRAINT IF EXISTS gstore_payments_provider_check;

ALTER TABLE public.gstore_payments
  ADD CONSTRAINT gstore_payments_provider_check
  CHECK (provider IN ('razorpay', 'mock', 'credits'));

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
  v_user_id        UUID;
  v_order_id       UUID;
  v_order_number   TEXT;
  v_payment_id     UUID;
  v_existing_id    UUID;
  v_item           JSONB;
  v_spend_result   JSONB;
  v_new_balance    INTEGER;
  v_client_total   INTEGER;
  v_slug           TEXT;
  v_unit_credits   INTEGER;
  v_allowed_credits CONSTANT INTEGER := 150;
  v_allowed_slugs TEXT[] := ARRAY[
    'different-by-default', 'off-the-map', 'main-character-energy', 'the-random-archive'
  ];
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  IF p_credits_total IS NULL OR p_credits_total <= 0 THEN
    RAISE EXCEPTION 'credits_total must be positive' USING ERRCODE = 'P0002';
  END IF;

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
    IF v_slug IS NULL OR NOT (v_slug = ANY (v_allowed_slugs)) THEN
      RAISE EXCEPTION 'Invalid sticker slug for credits checkout: %', v_slug;
    END IF;
    v_unit_credits := COALESCE((v_item->>'unit_credits')::INTEGER, 0);
    IF v_unit_credits <> v_allowed_credits THEN
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
    credits_total, shipping_method, idempotency_key, is_mock,
    order_status, payment_status
  ) VALUES (
    v_order_id, v_order_number, v_user_id,
    p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_name, p_shipping_line1, p_shipping_line2,
    p_shipping_city, p_shipping_state, p_shipping_pincode, p_shipping_country,
    p_delivery_notes,
    0, 0, 0, 0, 0,
    p_credits_total, p_shipping_method, p_idempotency_key, false,
    'confirmed', 'paid'
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

  v_spend_result := public.spend_credits(
    v_user_id,
    p_credits_total,
    p_idempotency_key,
    'store_spend',
    'gstore_order',
    v_order_id,
    jsonb_build_object('kind', 'gstore_sticker_credits')
  );

  v_new_balance := (v_spend_result->>'new_balance')::INTEGER;

  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'credits_total', p_credits_total,
    'new_balance', v_new_balance,
    'idempotent', false
  );
END;
$$;

REVOKE ALL ON FUNCTION public.create_gstore_credits_order FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.create_gstore_credits_order TO authenticated;