-- Gstore product fulfillment metadata (weight, dimensions, HSN) for carrier APIs.
-- Rows are seeded from active price-book slugs with NULL logistics until admins configure them.

CREATE TABLE IF NOT EXISTS public.gstore_product_fulfillment (
  product_slug       TEXT PRIMARY KEY,
  requires_shipping  BOOLEAN     NOT NULL DEFAULT true,
  weight_g           INTEGER     CHECK (weight_g IS NULL OR weight_g > 0),
  length_cm          NUMERIC(8, 2) CHECK (length_cm IS NULL OR length_cm > 0),
  breadth_cm         NUMERIC(8, 2) CHECK (breadth_cm IS NULL OR breadth_cm > 0),
  height_cm          NUMERIC(8, 2) CHECK (height_cm IS NULL OR height_cm > 0),
  hsn_code           TEXT,
  logistics_ready    BOOLEAN     NOT NULL DEFAULT false,
  admin_notes        TEXT        NOT NULL DEFAULT '',
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS gstore_product_fulfillment_ready_idx
  ON public.gstore_product_fulfillment (logistics_ready, requires_shipping);

ALTER TABLE public.gstore_product_fulfillment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read product fulfillment metadata"
  ON public.gstore_product_fulfillment FOR SELECT
  USING (true);

REVOKE ALL ON public.gstore_product_fulfillment FROM PUBLIC;
GRANT SELECT ON public.gstore_product_fulfillment TO anon, authenticated;
GRANT ALL ON public.gstore_product_fulfillment TO service_role;

COMMENT ON TABLE public.gstore_product_fulfillment IS
  'Per-SKU shipping dimensions and HSN. logistics_ready is set by admins when all required fields are present.';

INSERT INTO public.gstore_product_fulfillment (product_slug, requires_shipping)
SELECT DISTINCT pe.product_slug, true
FROM public.gstore_price_entries pe
WHERE pe.is_active = true
ON CONFLICT (product_slug) DO NOTHING;

CREATE OR REPLACE FUNCTION public.touch_gstore_product_fulfillment()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := NOW();
  NEW.logistics_ready := (
    NOT NEW.requires_shipping
    OR (
      NEW.weight_g IS NOT NULL
      AND NEW.length_cm IS NOT NULL
      AND NEW.breadth_cm IS NOT NULL
      AND NEW.height_cm IS NOT NULL
    )
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS gstore_product_fulfillment_touch ON public.gstore_product_fulfillment;
CREATE TRIGGER gstore_product_fulfillment_touch
  BEFORE INSERT OR UPDATE ON public.gstore_product_fulfillment
  FOR EACH ROW
  EXECUTE FUNCTION public.touch_gstore_product_fulfillment();