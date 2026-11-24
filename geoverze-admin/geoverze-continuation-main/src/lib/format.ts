/** Locale-aware numeric and currency formatters for the Admin Dashboard (INR default). */

export const num = (value: number) => value.toLocaleString("en-IN");

/**
 * Formats a major currency amount (already in rupees/dollars, not paise/cents).
 * Defaults to INR for GVRZE production data.
 */
export const money = (value: number, currency = "INR") =>
  new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(value);

/**
 * subscription_plans.monthly_price_cents / annual_price_cents store whole INR rupees
 * (legacy Stripe-style column name — not paise).
 */
export const moneyCatalogRupees = (rupees: number) => money(rupees, "INR");

/** Convert provider minor units (paise / cents) to a display currency string. */
export const moneyMinor = (minor: number, currency = "INR") => money(minor / 100, currency);

/** Credit amounts are units, not currency — never pass credits through money(). */
export const formatCredits = (amount: number) =>
  `${amount.toLocaleString("en-IN")} ${amount === 1 ? "credit" : "credits"}`;

export function daysSince(iso: string | null | undefined) {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}