-- Idempotent commerce notification ledger for Gstore orders and memberships.
-- Delivery happens in the app server; this table only prevents duplicate
-- email/SMS when Razorpay webhooks or verify endpoints retry.

CREATE TABLE IF NOT EXISTS public.commerce_notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind        TEXT NOT NULL CHECK (kind IN ('gstore_order', 'subscription')),
  source_id   UUID NOT NULL,
  channel     TEXT NOT NULL CHECK (channel IN ('email', 'sms')),
  status      TEXT NOT NULL DEFAULT 'pending'
                CHECK (status IN ('pending', 'sent', 'skipped', 'failed')),
  error       TEXT,
  sent_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (kind, source_id, channel)
);

CREATE INDEX IF NOT EXISTS commerce_notifications_source_idx
  ON public.commerce_notifications (kind, source_id);

ALTER TABLE public.commerce_notifications ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.commerce_notifications FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.commerce_notifications TO service_role;

COMMENT ON TABLE public.commerce_notifications IS
  'Ledger of order/subscription confirmation email and SMS. Unique per kind+source+channel so webhook retries cannot double-send.';
