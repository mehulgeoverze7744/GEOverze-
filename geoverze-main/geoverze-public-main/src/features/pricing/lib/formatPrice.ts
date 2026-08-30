/** Formats subscription catalog amounts stored as USD cents. */
export function formatUsdCents(cents: number): string {
  const value = cents / 100;
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}
