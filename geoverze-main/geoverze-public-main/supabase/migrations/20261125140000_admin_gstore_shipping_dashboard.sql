-- Admin RPCs for Gstore shipment dashboard (require_admin; no direct RLS bypass from clients).

CREATE OR REPLACE FUNCTION public.admin_list_gstore_shipping_summaries()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.require_admin();
  RETURN (
    SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY t.created_at DESC), '[]'::jsonb)
    FROM (
      SELECT
        o.id AS order_id,
        o.order_number,
        o.payment_status,
        o.order_status,
        o.created_at,
        s.id AS shipment_id,
        COALESCE(s.shipment_status, 'none') AS shipment_status,
        s.courier_name,
        s.awb,
        s.tracking_url,
        (s.tracking_url IS NOT NULL OR NULLIF(BTRIM(s.awb), '') IS NOT NULL) AS tracking_available,
        cn_email.status AS order_email_status,
        EXISTS (
          SELECT 1
          FROM gstore_order_items i
          LEFT JOIN gstore_product_fulfillment f ON f.product_slug = i.product_slug
          WHERE i.order_id = o.id
            AND (
              f.product_slug IS NULL
              OR (f.requires_shipping AND NOT f.logistics_ready)
            )
        ) AS logistics_incomplete
      FROM gstore_orders o
      LEFT JOIN LATERAL (
        SELECT gs.*
        FROM gstore_shipments gs
        WHERE gs.order_id = o.id
        ORDER BY gs.created_at DESC
        LIMIT 1
      ) s ON TRUE
      LEFT JOIN LATERAL (
        SELECT n.status
        FROM commerce_notifications n
        WHERE n.kind = 'gstore_order'
          AND n.source_id = o.id
          AND n.channel = 'email'
        LIMIT 1
      ) cn_email ON TRUE
    ) t
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_get_gstore_order_shipping_detail(p_order_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order jsonb;
  v_items jsonb;
  v_shipment jsonb;
  v_events jsonb;
  v_notifications jsonb;
  v_fulfillment jsonb;
  v_shipment_id uuid;
BEGIN
  PERFORM public.require_admin();

  SELECT to_jsonb(o) INTO v_order
  FROM gstore_orders o
  WHERE o.id = p_order_id;
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'order not found' USING ERRCODE = 'P0002';
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(i) ORDER BY i.created_at), '[]'::jsonb) INTO v_items
  FROM gstore_order_items i
  WHERE i.order_id = p_order_id;

  SELECT to_jsonb(s), s.id INTO v_shipment, v_shipment_id
  FROM gstore_shipments s
  WHERE s.order_id = p_order_id
  ORDER BY s.created_at DESC
  LIMIT 1;

  v_shipment := COALESCE(v_shipment, 'null'::jsonb);

  IF v_shipment_id IS NOT NULL THEN
    SELECT COALESCE(jsonb_agg(to_jsonb(e) ORDER BY e.event_timestamp DESC NULLS LAST, e.created_at DESC), '[]'::jsonb)
    INTO v_events
    FROM gstore_shipment_events e
    WHERE e.shipment_id = v_shipment_id;
  ELSE
    v_events := '[]'::jsonb;
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(n) ORDER BY n.created_at DESC), '[]'::jsonb)
  INTO v_notifications
  FROM commerce_notifications n
  WHERE (
    n.source_id = p_order_id
    AND n.kind IN ('gstore_order', 'gstore_order_cancelled', 'gstore_order_refunded')
  )
  OR (
    v_shipment_id IS NOT NULL
    AND n.source_id = v_shipment_id
    AND n.kind LIKE 'gstore_shipment_%'
  );

  SELECT COALESCE(
    jsonb_agg(
      to_jsonb(f)
      ORDER BY f.product_slug
    ),
    '[]'::jsonb
  )
  INTO v_fulfillment
  FROM gstore_product_fulfillment f
  WHERE f.product_slug IN (
    SELECT DISTINCT i.product_slug FROM gstore_order_items i WHERE i.order_id = p_order_id
  );

  RETURN jsonb_build_object(
    'order', v_order,
    'items', v_items,
    'shipment', v_shipment,
    'shipment_events', v_events,
    'notifications', v_notifications,
    'fulfillment', v_fulfillment
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_upsert_gstore_product_fulfillment(
  p_product_slug text,
  p_weight_g integer DEFAULT NULL,
  p_length_cm numeric DEFAULT NULL,
  p_breadth_cm numeric DEFAULT NULL,
  p_height_cm numeric DEFAULT NULL,
  p_hsn_code text DEFAULT NULL,
  p_requires_shipping boolean DEFAULT true,
  p_admin_notes text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid;
  row public.gstore_product_fulfillment;
BEGIN
  actor := public.require_admin();

  INSERT INTO public.gstore_product_fulfillment (
    product_slug, requires_shipping, weight_g, length_cm, breadth_cm, height_cm, hsn_code, admin_notes
  )
  VALUES (
  p_product_slug, p_requires_shipping, p_weight_g, p_length_cm, p_breadth_cm, p_height_cm,
  NULLIF(BTRIM(p_hsn_code), ''), COALESCE(p_admin_notes, '')
  )
  ON CONFLICT (product_slug) DO UPDATE SET
    requires_shipping = EXCLUDED.requires_shipping,
    weight_g = EXCLUDED.weight_g,
    length_cm = EXCLUDED.length_cm,
    breadth_cm = EXCLUDED.breadth_cm,
    height_cm = EXCLUDED.height_cm,
    hsn_code = EXCLUDED.hsn_code,
    admin_notes = EXCLUDED.admin_notes
  RETURNING * INTO row;

  INSERT INTO public.admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
  VALUES (
    actor,
    'gstore.fulfillment_updated',
    'gstore_product_fulfillment',
    p_product_slug,
    jsonb_build_object(
      'weight_g', row.weight_g,
      'logistics_ready', row.logistics_ready
    )
  );

  RETURN to_jsonb(row);
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_gstore_shipment_action(
  p_order_id uuid,
  p_action text,
  p_payload jsonb DEFAULT '{}'::jsonb
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor uuid;
  v_payment text;
  v_shipment gstore_shipments;
  v_logistics_ok boolean;
  v_active_exists boolean;
BEGIN
  actor := public.require_admin();

  SELECT payment_status INTO v_payment FROM gstore_orders WHERE id = p_order_id;
  IF v_payment IS NULL THEN
    RAISE EXCEPTION 'order not found' USING ERRCODE = 'P0002';
  END IF;

  IF p_action IN ('create_shipment', 'retry_shipment') AND v_payment <> 'paid' THEN
    RETURN jsonb_build_object('ok', false, 'code', 'unpaid', 'message', 'Order is not paid.');
  END IF;

  SELECT NOT EXISTS (
    SELECT 1
    FROM gstore_order_items i
    LEFT JOIN gstore_product_fulfillment f ON f.product_slug = i.product_slug
    WHERE i.order_id = p_order_id
      AND (f.product_slug IS NULL OR (f.requires_shipping AND NOT f.logistics_ready))
  ) INTO v_logistics_ok;

  SELECT EXISTS (
    SELECT 1 FROM gstore_shipments s
    WHERE s.order_id = p_order_id
      AND s.shipment_status NOT IN ('failed', 'cancelled', 'delivered')
  ) INTO v_active_exists;

  IF p_action = 'create_shipment' THEN
    IF NOT v_logistics_ok THEN
      RETURN jsonb_build_object('ok', false, 'code', 'logistics_incomplete');
    END IF;
    IF v_active_exists THEN
      RETURN jsonb_build_object('ok', false, 'code', 'active_shipment_exists');
    END IF;
    INSERT INTO gstore_shipments (order_id, provider, shipment_status)
    VALUES (p_order_id, 'shiprocket', 'pending')
  RETURNING * INTO v_shipment;
    INSERT INTO admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (actor, 'gstore.shipment_create_requested', 'gstore_order', p_order_id::text,
      jsonb_build_object('shipment_id', v_shipment.id));
    RETURN jsonb_build_object(
      'ok', true,
      'code', 'pending_created',
      'shipment', to_jsonb(v_shipment),
      'message', 'Shipment row created. Shiprocket API runs on storefront app server when live mode is enabled.'
    );
  END IF;

  IF p_action = 'retry_shipment' THEN
    UPDATE gstore_shipments s
    SET shipment_status = 'pending',
        last_error = NULL,
        retry_count = s.retry_count + 1,
        updated_at = NOW()
    WHERE s.order_id = p_order_id
      AND s.shipment_status = 'failed'
    RETURNING * INTO v_shipment;
    IF NOT FOUND THEN
      RETURN jsonb_build_object('ok', false, 'code', 'no_failed_shipment');
    END IF;
    INSERT INTO admin_audit_logs (actor_id, action, entity_type, entity_id, metadata)
    VALUES (actor, 'gstore.shipment_retry', 'gstore_order', p_order_id::text,
      jsonb_build_object('shipment_id', v_shipment.id, 'retry_count', v_shipment.retry_count));
    RETURN jsonb_build_object('ok', true, 'code', 'retry_queued', 'shipment', to_jsonb(v_shipment));
  END IF;

  IF p_action IN (
    'check_serviceability', 'assign_awb', 'schedule_pickup', 'refresh_tracking'
  ) THEN
    IF v_payment <> 'paid' THEN
      RETURN jsonb_build_object('ok', false, 'code', 'unpaid');
    END IF;
    RETURN jsonb_build_object(
      'ok', false,
      'code', 'app_server_required',
      'message',
      'This action is executed on the GVRZE storefront application server (Shiprocket client). Live mode remains disabled until configured.'
    );
  END IF;

  RETURN jsonb_build_object('ok', false, 'code', 'unknown_action', 'action', p_action);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_list_gstore_shipping_summaries() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_get_gstore_order_shipping_detail(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_upsert_gstore_product_fulfillment(text, integer, numeric, numeric, numeric, text, boolean, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.admin_gstore_shipment_action(uuid, text, jsonb) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.admin_list_gstore_shipping_summaries() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_gstore_order_shipping_detail(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_upsert_gstore_product_fulfillment(text, integer, numeric, numeric, numeric, text, boolean, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_gstore_shipment_action(uuid, text, jsonb) TO authenticated;

NOTIFY pgrst, 'reload schema';