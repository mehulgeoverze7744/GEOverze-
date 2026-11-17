-- Deactivate Midnight Black T-Shirt in the Gstore price ledger.
-- Historical gstore_order_items rows are left untouched.

UPDATE public.gstore_price_entries
SET is_active = false
WHERE product_slug = 'midnight-black-tshirt';
