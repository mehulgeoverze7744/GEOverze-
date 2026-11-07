-- iPhone Duo reward: 7,000 credits → 15,000 credits.
-- place_credit_order reads store_products.credit_price, so this is the
-- authoritative redemption cost. Other rewards are unchanged.

UPDATE public.store_products
SET
  credit_price = 15000,
  updated_at = NOW()
WHERE slug = 'iphone-duo'
  AND credit_price IS DISTINCT FROM 15000;
