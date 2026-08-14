/** Money and credit formatting for the GEOstore. */

/** Formats minor units as USD. `null` renders as an em dash. */
export function money(minor: number | null): string {
  if (minor === null) return "—";
  const value = minor / 100;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

/** Formats a credit amount, e.g. `90 credits`. */
export function credits(amount: number | null): string {
  if (amount === null) return "—";
  return `${amount.toLocaleString("en-US")} ${amount === 1 ? "credit" : "credits"}`;
}

/** Percentage saved between a list price and a sale price. */
export function discountPercent(price: number | null, compareAt: number | null): number | null {
  if (price === null || compareAt === null || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Human date, e.g. `18 Jan 2026`. */
export function shortDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** Whole days between now and an ISO date, floored at zero. */
export function daysUntil(iso: string): number {
  const end = new Date(iso).getTime();
  if (Number.isNaN(end)) return 0;
  return Math.max(0, Math.ceil((end - Date.now()) / 86_400_000));
}
