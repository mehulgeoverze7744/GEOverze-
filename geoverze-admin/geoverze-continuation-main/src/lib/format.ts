export const num = (value: number) => value.toLocaleString("en-US");

export const money = (value: number, currency = "USD") =>
  new Intl.NumberFormat(currency === "INR" ? "en-IN" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "INR" ? 2 : 0,
  }).format(value);

/** Convert provider minor units (paise / cents) to a display currency string. */
export const moneyMinor = (minor: number, currency = "INR") => money(minor / 100, currency);

export function daysSince(iso: string | null | undefined) {
  if (!iso) return Number.POSITIVE_INFINITY;
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 86400000));
}
