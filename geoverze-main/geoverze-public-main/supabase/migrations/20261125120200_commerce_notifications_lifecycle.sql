-- Extend commerce_notifications for shipment lifecycle and record provider message ids.

ALTER TABLE public.commerce_notifications
  ADD COLUMN IF NOT EXISTS provider_message_id TEXT,
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER NOT NULL DEFAULT 0 CHECK (attempt_count >= 0);

ALTER TABLE public.commerce_notifications
  DROP CONSTRAINT IF EXISTS commerce_notifications_kind_check;

ALTER TABLE public.commerce_notifications
  ADD CONSTRAINT commerce_notifications_kind_check
  CHECK (kind IN (
    'gstore_order',
    'subscription',
    'gstore_shipment_created',
    'gstore_shipment_picked_up',
    'gstore_shipment_in_transit',
    'gstore_shipment_out_for_delivery',
    'gstore_shipment_delivered',
    'gstore_shipment_exception',
    'gstore_order_cancelled',
    'gstore_order_refunded'
  ));

COMMENT ON COLUMN public.commerce_notifications.provider_message_id IS
  'Resend email id (or SMS provider sid) when delivery succeeded.';
COMMENT ON COLUMN public.commerce_notifications.attempt_count IS
  'Increments on each send attempt; failed rows may be retried from the app server.';

NOTIFY pgrst, 'reload schema';