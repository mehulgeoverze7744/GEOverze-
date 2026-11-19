-- Split storefront tee pricing: PRIME ₹2,999 (299900), BASICS ₹2,699 (269900).
-- Retires the blanket 269900 ledger from 20261119130000 without altering past orders.

UPDATE public.gstore_price_entries
SET
  is_active = false,
  valid_until = NOW()
WHERE currency_code = 'INR'
  AND is_active = true
  AND product_slug IN (
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
    'midnight-black-tshirt'
  );

INSERT INTO public.gstore_price_entries (product_slug, currency_code, price_minor, created_by)
VALUES
  ('cherry-blossom-tshirt', 'INR', 299900, 'system'),
  ('golden-arc-tshirt', 'INR', 299900, 'system'),
  ('new-age-tshirt', 'INR', 299900, 'system'),
  ('orbit-tshirt', 'INR', 299900, 'system'),
  ('ignite', 'INR', 299900, 'system'),
  ('eden', 'INR', 299900, 'system'),
  ('pace', 'INR', 299900, 'system'),
  ('eclipse', 'INR', 299900, 'system'),
  ('midnight-black-tshirt', 'INR', 299900, 'system'),
  ('vanta', 'INR', 269900, 'system'),
  ('monogram', 'INR', 269900, 'system'),
  ('earthform', 'INR', 269900, 'system'),
  ('flux', 'INR', 269900, 'system'),
  ('vertical', 'INR', 269900, 'system')
ON CONFLICT DO NOTHING;