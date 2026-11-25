-- Gstore shipment records and Shiprocket (or other provider) webhook event log.

CREATE TABLE IF NOT EXISTS public.gstore_shipments (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id                UUID NOT NULL REFERENCES public.gstore_orders(id) ON DELETE CASCADE,
  provider                TEXT NOT NULL DEFAULT 'shiprocket'
                            CHECK (provider IN ('shiprocket')),
  provider_order_id       TEXT,
  provider_shipment_id    TEXT,
  awb                     TEXT,
  courier_id              TEXT,
  courier_name            TEXT,
  shipment_status         TEXT NOT NULL DEFAULT 'pending'
                            CHECK (shipment_status IN (
                              'pending', 'created', 'awb_assigned', 'pickup_scheduled',
                              'picked_up', 'in_transit', 'out_for_delivery', 'delivered',
                              'exception', 'failed', 'cancelled'
                            )),
  tracking_url            TEXT,
  estimated_delivery_date DATE,
  pickup_scheduled_at     TIMESTAMPTZ,
  last_tracking_event     TEXT,
  raw_last_payload        JSONB,
  retry_count             INTEGER NOT NULL DEFAULT 0 CHECK (retry_count >= 0),
  last_error              TEXT,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS gstore_shipments_order_active_uidx
  ON public.gstore_shipments (order_id)
  WHERE shipment_status NOT IN ('failed', 'cancelled', 'delivered');

CREATE UNIQUE INDEX IF NOT EXISTS gstore_shipments_provider_order_uidx
  ON public.gstore_shipments (provider, provider_order_id)
  WHERE provider_order_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS gstore_shipments_provider_awb_uidx
  ON public.gstore_shipments (provider, awb)
  WHERE awb IS NOT NULL;

CREATE INDEX IF NOT EXISTS gstore_shipments_order_id_idx
  ON public.gstore_shipments (order_id, created_at DESC);

CREATE INDEX IF NOT EXISTS gstore_shipments_status_idx
  ON public.gstore_shipments (shipment_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS public.gstore_shipment_events (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shipment_id       UUID NOT NULL REFERENCES public.gstore_shipments(id) ON DELETE CASCADE,
  provider_event_id TEXT NOT NULL,
  status            TEXT,
  event_description TEXT,
  event_timestamp   TIMESTAMPTZ,
  raw_payload       JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (shipment_id, provider_event_id)
);

CREATE INDEX IF NOT EXISTS gstore_shipment_events_shipment_idx
  ON public.gstore_shipment_events (shipment_id, event_timestamp DESC);

ALTER TABLE public.gstore_shipments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gstore_shipment_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.gstore_shipments FROM PUBLIC, anon, authenticated;
REVOKE ALL ON public.gstore_shipment_events FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.gstore_shipments TO service_role;
GRANT ALL ON public.gstore_shipment_events TO service_role;

CREATE OR REPLACE FUNCTION public.touch_gstore_shipments()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gstore_shipments_touch ON public.gstore_shipments;
CREATE TRIGGER gstore_shipments_touch
  BEFORE UPDATE ON public.gstore_shipments
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_gstore_shipments();

COMMENT ON TABLE public.gstore_shipments IS
  'One active shipment per Gstore order (partial unique index). Provider API ids and AWB stored server-side.';
COMMENT ON TABLE public.gstore_shipment_events IS
  'Idempotent webhook timeline; duplicate provider_event_id per shipment is rejected.';