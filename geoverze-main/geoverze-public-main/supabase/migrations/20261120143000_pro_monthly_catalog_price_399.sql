-- Align Pro monthly catalog price to approved ₹399/month (whole INR rupees in subscription_plans).
-- Does NOT alter historical billing_payments or completed checkout snapshots.
-- Annual Pro remains ₹3999/year.

BEGIN;

UPDATE public.subscription_plans
SET
  monthly_price_cents = 399,
  updated_at = now()
WHERE tier = 'pro'
  AND monthly_price_cents <> 399;

UPDATE public.plan_promotions
SET
  metadata = jsonb_set(
    coalesce(metadata, '{}'::jsonb),
    '{standard_monthly_price_cents}',
    to_jsonb(399),
    true
  ),
  updated_at = now()
WHERE plan_tier = 'pro'
  AND billing_interval = 'monthly';

UPDATE public.billing_provider_plan_instances AS inst
SET charge_amount_minor = 39900
FROM public.billing_provider_prices AS bpp
WHERE inst.billing_provider_price_id = bpp.id
  AND bpp.plan_tier = 'pro'
  AND bpp.billing_interval = 'monthly'
  AND bpp.currency = 'INR'
  AND inst.charge_currency = 'INR'
  AND inst.charge_amount_minor = 49900;

COMMIT;