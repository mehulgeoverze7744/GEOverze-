-- Standard graphic T-shirt price: ₹2,699 GST-inclusive (269900 paise).
-- Retires prior active INR rows without changing historical order line items.

UPDATE public.gstore_price_entries
SET
  is_active = false,
  valid_until = NOW()
WHERE currency_code = 'INR'
  AND is_active = true
  AND product_slug IN (
    'midnight-black-tshirt',
    'cherry-blossom-tshirt',
    'golden-arc-tshirt',
    'new-age-tshirt',
    'orbit-tshirt',
    'ignite',
    'eden',
    'pace',
    'eclipse',
    'vanta',
    'monogram',
    'earthform',
    'flux',
    'vertical',
    'tshirt-know-the-capital',
    'meridian-tee',
    'continents-tee',
    'latitude-longitude-tee',
    'country-silhouette-tee'
  );

INSERT INTO public.gstore_price_entries (product_slug, currency_code, price_minor, created_by)
VALUES
  ('midnight-black-tshirt', 'INR', 269900, 'system'),
  ('cherry-blossom-tshirt', 'INR', 269900, 'system'),
  ('golden-arc-tshirt', 'INR', 269900, 'system'),
  ('new-age-tshirt', 'INR', 269900, 'system'),
  ('orbit-tshirt', 'INR', 269900, 'system'),
  ('ignite', 'INR', 269900, 'system'),
  ('eden', 'INR', 269900, 'system'),
  ('pace', 'INR', 269900, 'system'),
  ('eclipse', 'INR', 269900, 'system'),
  ('vanta', 'INR', 269900, 'system'),
  ('monogram', 'INR', 269900, 'system'),
  ('earthform', 'INR', 269900, 'system'),
  ('flux', 'INR', 269900, 'system'),
  ('vertical', 'INR', 269900, 'system'),
  ('tshirt-know-the-capital', 'INR', 269900, 'system'),
  ('meridian-tee', 'INR', 269900, 'system'),
  ('continents-tee', 'INR', 269900, 'system'),
  ('latitude-longitude-tee', 'INR', 269900, 'system'),
  ('country-silhouette-tee', 'INR', 269900, 'system')
ON CONFLICT DO NOTHING;