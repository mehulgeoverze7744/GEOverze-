-- ============================================================
-- GVRZE Unified Payment Infrastructure — DB Schema
-- Migration: 20261106280000_payment_infrastructure.sql
--
-- Adds:
--   1. payment_providers    — registry of configured payment providers
--   2. payment_currencies   — enabled currencies with minor unit config
--   3. shipping_zones       — shipping zone config (India active, intl ready)
--   4. payment_audit_log    — immutable audit trail for payment events
--   5. gstore_price_entries — currency-specific product prices (future)
--   6. admin_get_payment_audit_log — service role only RPC
-- ============================================================


-- ── 1. payment_providers ──────────────────────────────────────────────────────
-- Registry of payment gateway providers.
-- Controls which providers are active, with what priority.
-- Only service role can write; anon/authenticated read their own data.

CREATE TABLE IF NOT EXISTS public.payment_providers (
  id              TEXT PRIMARY KEY CHECK (id IN ('razorpay', 'stripe', 'paypal', 'mock')),
  name            TEXT NOT NULL,
  enabled         BOOLEAN NOT NULL DEFAULT false,
  supports_one_time    BOOLEAN NOT NULL DEFAULT false,
  supports_subscriptions BOOLEAN NOT NULL DEFAULT false,
  supported_countries  TEXT[] NOT NULL DEFAULT '{}',
  supported_currencies TEXT[] NOT NULL DEFAULT '{}',
  priority        INTEGER NOT NULL DEFAULT 10,
  admin_note      TEXT NOT NULL DEFAULT '',
  activated_at    TIMESTAMPTZ,
  activated_by    TEXT,  -- admin email
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.payment_providers ENABLE ROW LEVEL SECURITY;

-- Only service role can read/write (no user-facing reads needed)
CREATE POLICY "Service role can manage payment providers"
  ON public.payment_providers
  FOR ALL
  USING (true);

REVOKE ALL ON public.payment_providers FROM anon, authenticated;
GRANT ALL ON public.payment_providers TO service_role;

-- Seed initial provider data (matches config.ts)
INSERT INTO public.payment_providers (id, name, enabled, supports_one_time, supports_subscriptions, supported_countries, supported_currencies, priority, admin_note)
VALUES
  ('razorpay', 'Razorpay', true,  true, true,  ARRAY['IN'],            ARRAY['INR'],                    1, 'Active provider for India. Handles both subscriptions and one-time Gstore payments.'),
  ('stripe',   'Stripe',   false, true, true,  ARRAY['US','GB','SG','AE'], ARRAY['USD','GBP','EUR','SGD','AED'], 2, 'NOT ACTIVE. Requires STRIPE_PUBLISHABLE_KEY + STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET.'),
  ('paypal',   'PayPal',   false, true, false, ARRAY['US','GB'],       ARRAY['USD','GBP','EUR'],        3, 'NOT ACTIVE. Requires PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET.'),
  ('mock',     'Mock Gateway (Testing)', false, true, true, ARRAY['IN','US','GB','SG','AE'], ARRAY['INR','USD','GBP','EUR','SGD','AED'], 0, 'Test-only provider. Activated by MOCK_PAYMENTS_ENABLED=true env var.')
ON CONFLICT (id) DO NOTHING;


-- ── 2. payment_currencies ─────────────────────────────────────────────────────
-- Currency registry — matches currencies.ts
-- Authoritative source of which currencies are enabled in GVRZE.

CREATE TABLE IF NOT EXISTS public.payment_currencies (
  code                TEXT PRIMARY KEY,  -- ISO 4217 (e.g. 'INR')
  name                TEXT NOT NULL,
  symbol              TEXT NOT NULL,
  minor_unit_factor   INTEGER NOT NULL DEFAULT 100,  -- 100 for 2-decimal, 1 for JPY
  decimal_places      INTEGER NOT NULL DEFAULT 2,
  locale              TEXT NOT NULL DEFAULT 'en-IN',
  enabled             BOOLEAN NOT NULL DEFAULT false,
  disabled_reason     TEXT,
  enabled_at          TIMESTAMPTZ,
  enabled_by          TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.payment_currencies ENABLE ROW LEVEL SECURITY;

-- Public read (checkout UI needs to know enabled currencies)
CREATE POLICY "Anyone can read enabled currencies"
  ON public.payment_currencies FOR SELECT USING (true);

-- Only service role can write
REVOKE INSERT, UPDATE, DELETE ON public.payment_currencies FROM anon, authenticated;
GRANT SELECT ON public.payment_currencies TO anon, authenticated;
GRANT ALL ON public.payment_currencies TO service_role;

-- Seed currencies (matches currencies.ts)
INSERT INTO public.payment_currencies (code, name, symbol, minor_unit_factor, decimal_places, locale, enabled, disabled_reason)
VALUES
  ('INR', 'Indian Rupee',       '₹',   100,  2, 'en-IN', true,  NULL),
  ('USD', 'US Dollar',          '$',   100,  2, 'en-US', false, 'Pending international expansion approval'),
  ('EUR', 'Euro',               '€',   100,  2, 'de-DE', false, 'Pending international expansion approval'),
  ('GBP', 'British Pound',      '£',   100,  2, 'en-GB', false, 'Pending international expansion approval'),
  ('SGD', 'Singapore Dollar',   'S$',  100,  2, 'en-SG', false, 'Pending international expansion approval'),
  ('AED', 'UAE Dirham',         'د.إ', 100,  2, 'ar-AE', false, 'Pending international expansion approval'),
  ('JPY', 'Japanese Yen',       '¥',   1,    0, 'ja-JP', false, 'Pending international expansion approval')
ON CONFLICT (code) DO NOTHING;


-- ── 3. shipping_zones ─────────────────────────────────────────────────────────
-- Shipping zone configuration — matches shippingZones.ts
-- Controls which zones are active and their shipping method rates.

CREATE TABLE IF NOT EXISTS public.shipping_zones (
  id                           TEXT PRIMARY KEY,  -- e.g. 'india'
  name                         TEXT NOT NULL,
  countries                    TEXT[] NOT NULL DEFAULT '{}',
  currency_code                TEXT NOT NULL REFERENCES public.payment_currencies(code),
  enabled                      BOOLEAN NOT NULL DEFAULT false,
  disabled_reason              TEXT,
  free_shipping_threshold_minor BIGINT NOT NULL DEFAULT 0,
  supports_physical            BOOLEAN NOT NULL DEFAULT true,
  supports_digital             BOOLEAN NOT NULL DEFAULT true,
  operations_notes             TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.shipping_zone_methods (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  zone_id         TEXT NOT NULL REFERENCES public.shipping_zones(id) ON DELETE CASCADE,
  method_id       TEXT NOT NULL,  -- e.g. 'standard', 'tracked', 'express'
  label           TEXT NOT NULL,
  note            TEXT NOT NULL DEFAULT '',
  price_minor     BIGINT NOT NULL DEFAULT 0,
  trackable       BOOLEAN NOT NULL DEFAULT false,
  estimated_days_min INTEGER NOT NULL DEFAULT 1,
  estimated_days_max INTEGER NOT NULL DEFAULT 7,
  carrier         TEXT,
  display_order   INTEGER NOT NULL DEFAULT 0,
  UNIQUE (zone_id, method_id)
);

ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zone_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read shipping zones" ON public.shipping_zones FOR SELECT USING (true);
CREATE POLICY "Anyone can read shipping methods" ON public.shipping_zone_methods FOR SELECT USING (true);

GRANT SELECT ON public.shipping_zones TO anon, authenticated;
GRANT SELECT ON public.shipping_zone_methods TO anon, authenticated;
GRANT ALL ON public.shipping_zones TO service_role;
GRANT ALL ON public.shipping_zone_methods TO service_role;

-- Seed India zone
INSERT INTO public.shipping_zones (id, name, countries, currency_code, enabled, free_shipping_threshold_minor, supports_physical, supports_digital, operations_notes)
VALUES
  ('india', 'India', ARRAY['IN'], 'INR', true, 399900, true, true, 'COD is NOT offered. Prepaid only via Razorpay.'),
  ('us_canada', 'United States & Canada', ARRAY['US'], 'USD', false, 15000, true, true, 'Pending international shipping carrier contracts. Customs handling TBD.'),
  ('europe', 'Europe (UK + EU)', ARRAY['GB'], 'GBP', false, 10000, true, true, 'Post-Brexit customs implications for UK. VAT OSS may apply for EU.')
ON CONFLICT (id) DO NOTHING;

-- Seed India shipping methods
INSERT INTO public.shipping_zone_methods (zone_id, method_id, label, note, price_minor, trackable, estimated_days_min, estimated_days_max, carrier, display_order)
VALUES
  ('india', 'standard', 'Standard Delivery',         '5–7 business days · Free above ₹3,999', 0,       false, 5, 7, 'India Post / Delhivery', 1),
  ('india', 'tracked',  'Tracked Delivery — ₹690',   '3–5 business days with tracking',        69000,   true,  3, 5, 'Delhivery / DTDC',       2),
  ('india', 'express',  'Express Delivery — ₹1,499', '1–2 business days',                     149900,  true,  1, 2, 'BlueDart / FedEx India',  3)
ON CONFLICT (zone_id, method_id) DO NOTHING;


-- ── 4. payment_audit_log ──────────────────────────────────────────────────────
-- Immutable audit trail for all payment events.
-- INSERT only — no UPDATE or DELETE allowed.
-- Used for compliance, debugging, duplicate detection.

CREATE TABLE IF NOT EXISTS public.payment_audit_log (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event             TEXT NOT NULL,
  provider          TEXT NOT NULL CHECK (provider IN ('razorpay', 'stripe', 'paypal', 'mock', 'system')),
  billing_type      TEXT NOT NULL CHECK (billing_type IN ('ONE_TIME', 'RECURRING')),
  purpose           TEXT NOT NULL,
  amount_minor      BIGINT,
  currency          TEXT,
  order_id          UUID,
  payment_id        UUID,
  provider_order_id TEXT,
  provider_payment_id TEXT,
  success           BOOLEAN NOT NULL,
  error             TEXT,
  metadata          JSONB NOT NULL DEFAULT '{}',
  user_id           UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address        TEXT,  -- Optional: set server-side for fraud analysis
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS payment_audit_log_order_id_idx ON public.payment_audit_log (order_id);
CREATE INDEX IF NOT EXISTS payment_audit_log_payment_id_idx ON public.payment_audit_log (payment_id);
CREATE INDEX IF NOT EXISTS payment_audit_log_provider_idx ON public.payment_audit_log (provider, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_audit_log_event_idx ON public.payment_audit_log (event, created_at DESC);
CREATE INDEX IF NOT EXISTS payment_audit_log_created_at_idx ON public.payment_audit_log (created_at DESC);

ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Users can read audit log entries for their own payments
CREATE POLICY "Users can read own payment audit log"
  ON public.payment_audit_log FOR SELECT
  USING (auth.uid() = user_id);

-- Service role can insert (from server functions)
-- No UPDATE or DELETE permitted at the policy level
REVOKE UPDATE, DELETE ON public.payment_audit_log FROM service_role;
GRANT INSERT, SELECT ON public.payment_audit_log TO service_role;

-- Function to insert audit log entry (called from server functions)
CREATE OR REPLACE FUNCTION public.insert_payment_audit_log(
  p_event               TEXT,
  p_provider            TEXT,
  p_billing_type        TEXT,
  p_purpose             TEXT,
  p_success             BOOLEAN,
  p_amount_minor        BIGINT   DEFAULT NULL,
  p_currency            TEXT     DEFAULT NULL,
  p_order_id            UUID     DEFAULT NULL,
  p_payment_id          UUID     DEFAULT NULL,
  p_provider_order_id   TEXT     DEFAULT NULL,
  p_provider_payment_id TEXT     DEFAULT NULL,
  p_error               TEXT     DEFAULT NULL,
  p_metadata            JSONB    DEFAULT '{}',
  p_user_id             UUID     DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO public.payment_audit_log (
    event, provider, billing_type, purpose, success,
    amount_minor, currency, order_id, payment_id,
    provider_order_id, provider_payment_id,
    error, metadata, user_id
  ) VALUES (
    p_event, p_provider, p_billing_type, p_purpose, p_success,
    p_amount_minor, p_currency, p_order_id, p_payment_id,
    p_provider_order_id, p_provider_payment_id,
    p_error, p_metadata, p_user_id
  )
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.insert_payment_audit_log TO service_role;
REVOKE EXECUTE ON FUNCTION public.insert_payment_audit_log FROM anon, authenticated;


-- ── 5. gstore_price_entries ───────────────────────────────────────────────────
-- Currency-specific product prices.
-- Currently only INR is populated (via gstoreProductPrices.ts).
-- When new currencies are enabled, add price entries here.
--
-- This table is the DB-backed source of truth.
-- gstoreProductPrices.ts serves as a code-level cache/fallback.

CREATE TABLE IF NOT EXISTS public.gstore_price_entries (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug     TEXT NOT NULL,
  currency_code    TEXT NOT NULL REFERENCES public.payment_currencies(code),
  price_minor      BIGINT NOT NULL CHECK (price_minor > 0),
  is_active        BOOLEAN NOT NULL DEFAULT true,
  valid_from       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  valid_until      TIMESTAMPTZ,  -- NULL = no expiry (indefinite price)
  created_by       TEXT,  -- admin email
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (product_slug, currency_code, valid_from)
);

CREATE INDEX IF NOT EXISTS gstore_price_entries_slug_idx ON public.gstore_price_entries (product_slug, currency_code, is_active);

ALTER TABLE public.gstore_price_entries ENABLE ROW LEVEL SECURITY;

-- Prices are public (users need to see them)
CREATE POLICY "Anyone can read active prices"
  ON public.gstore_price_entries FOR SELECT
  USING (is_active = true AND (valid_until IS NULL OR valid_until > NOW()));

GRANT SELECT ON public.gstore_price_entries TO anon, authenticated;
GRANT ALL ON public.gstore_price_entries TO service_role;

-- Seed INR prices for all products (matches gstoreProductPrices.ts)
INSERT INTO public.gstore_price_entries (product_slug, currency_code, price_minor, created_by)
VALUES
  -- Storefront Signature Tees
  ('midnight-black-tshirt',           'INR', 299900, 'system'),
  ('cherry-blossom-tshirt',           'INR', 299900, 'system'),
  ('golden-arc-tshirt',               'INR', 299900, 'system'),
  ('new-age-tshirt',                  'INR', 299900, 'system'),
  -- Catalogue T-Shirts
  ('tshirt-know-the-capital',         'INR', 370000, 'system'),
  ('meridian-tee',                    'INR', 340000, 'system'),
  ('continents-tee',                  'INR', 340000, 'system'),
  ('latitude-longitude-tee',          'INR', 320000, 'system'),
  ('country-silhouette-tee',          'INR', 320000, 'system'),
  -- Hoodies
  ('hoodie-every-point-has-a-story',  'INR', 549900, 'system'),
  ('atlas-hoodie',                    'INR', 499900, 'system'),
  ('expedition-hoodie',               'INR', 549900, 'system'),
  ('born-to-roam-hoodie',             'INR', 499900, 'system'),
  -- Accessories
  ('flag-sticker-pack',               'INR', 120000, 'system'),
  ('continent-sticker-set',           'INR',  99900, 'system'),
  ('vintage-expedition-sticker-collection', 'INR', 149900, 'system'),
  ('old-world-mug',                   'INR', 220000, 'system'),
  ('expedition-enamel-mug',           'INR', 199900, 'system'),
  ('desk-globe-mini',                 'INR', 349900, 'system'),
  ('bronze-world-map-poster',         'INR', 450000, 'system')
ON CONFLICT DO NOTHING;


-- ── 6. Admin RPC for payment audit log ───────────────────────────────────────

CREATE OR REPLACE FUNCTION public.admin_get_payment_audit_log(
  p_provider    TEXT    DEFAULT NULL,
  p_event       TEXT    DEFAULT NULL,
  p_order_id    UUID    DEFAULT NULL,
  p_limit       INTEGER DEFAULT 100,
  p_offset      INTEGER DEFAULT 0
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows JSONB;
BEGIN
  SELECT jsonb_agg(row_to_json(r))
  INTO v_rows
  FROM (
    SELECT *
    FROM public.payment_audit_log
    WHERE (p_provider IS NULL OR provider = p_provider)
      AND (p_event    IS NULL OR event    = p_event)
      AND (p_order_id IS NULL OR order_id = p_order_id)
    ORDER BY created_at DESC
    LIMIT p_limit OFFSET p_offset
  ) r;

  RETURN COALESCE(v_rows, '[]'::jsonb);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_get_payment_audit_log FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_get_payment_audit_log TO service_role;


-- ── 7. Update triggers for updated_at ────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_payment_providers_updated_at') THEN
    CREATE TRIGGER set_payment_providers_updated_at
      BEFORE UPDATE ON public.payment_providers
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_payment_currencies_updated_at') THEN
    CREATE TRIGGER set_payment_currencies_updated_at
      BEFORE UPDATE ON public.payment_currencies
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_shipping_zones_updated_at') THEN
    CREATE TRIGGER set_shipping_zones_updated_at
      BEFORE UPDATE ON public.shipping_zones
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;
