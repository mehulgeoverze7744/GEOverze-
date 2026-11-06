/**
 * INR currency formatters for GVRZE subscription billing.
 *
 * Two distinct value types exist in the billing system:
 *
 * 1. CATALOG amounts (subscription_plans.monthly_price_cents / annual_price_cents)
 *    Despite the "_cents" naming convention (borrowed from Stripe/USD), these
 *    columns store WHOLE INDIAN RUPEES — not paise.
 *    Examples: 99 → ₹99, 499 → ₹499, 999 → ₹999
 *    Use: formatInrRupees(99) → "₹99"
 *
 * 2. PAYMENT amounts (billing_payments.charge_amount_minor, billing_price_snapshots)
 *    These ARE stored in paise (smallest INR unit), following standard payment
 *    processor conventions.
 *    Examples: 49900 → ₹499, 9900 → ₹99
 *    Use: formatInrPaise(49900) → "₹499"
 *
 * Always use en-IN locale for Indian number formatting (lakhs/crores grouping).
 */

/**
 * Formats a catalog rupee amount (whole rupees, not paise).
 * Example: formatInrRupees(499) → "₹499"
 */
export function formatInrRupees(rupees: number): string {
  return rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats a payment paise amount (100 paise = ₹1).
 * Example: formatInrPaise(49900) → "₹499"
 */
export function formatInrPaise(paise: number): string {
  const rupees = paise / 100;
  return rupees.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Formats any INR amount in minor units (paise) where the currency is known.
 * Falls back to INR if currency is not recognized.
 * Example: formatMinorAmount(49900, "INR") → "₹499"
 */
export function formatMinorAmount(amountMinor: number, currency: string): string {
  const code = currency.trim().toUpperCase();
  const amount = amountMinor / 100;
  try {
    return amount.toLocaleString("en-IN", {
      style: "currency",
      currency: code.length === 3 ? code : "INR",
      minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return `₹${amount.toFixed(2)}`;
  }
}
