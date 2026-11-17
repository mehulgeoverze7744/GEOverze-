/**
 * Gstore membership discount math.
 *
 * Product prices are GST-inclusive MRPs. Discount is applied once to the
 * inclusive merchandise subtotal, then GST is extracted from the reduced
 * amount. Shipping is never discounted.
 */

export function clampDiscountBps(bps: number): number {
  if (!Number.isFinite(bps) || bps <= 0) return 0;
  return Math.min(10000, Math.trunc(bps));
}

/** Round half-up paise discount from inclusive subtotal and basis points. */
export function computeMembershipDiscountMinor(subtotalMinor: number, discountBps: number): number {
  const bps = clampDiscountBps(discountBps);
  if (subtotalMinor <= 0 || bps <= 0) return 0;
  return Math.round((subtotalMinor * bps) / 10000);
}

export function membershipDiscountLabel(discountBps: number): string | null {
  const bps = clampDiscountBps(discountBps);
  if (bps <= 0) return null;
  const pct = bps / 100;
  const shown = Number.isInteger(pct) ? String(pct) : pct.toFixed(1);
  return `${shown}% member discount`;
}
