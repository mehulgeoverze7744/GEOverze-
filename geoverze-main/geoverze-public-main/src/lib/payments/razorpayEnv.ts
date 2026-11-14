/**
 * Client-safe Razorpay env helpers. Never read RAZORPAY_KEY_SECRET here.
 *
 * Vite only inlines *static* `import.meta.env.VITE_*` access. Dynamic
 * `import.meta.env[key]` is empty in both the browser and server functions.
 */

function firstNonEmpty(values: Array<string | undefined>): string {
  for (const value of values) {
    const trimmed = (value ?? "").trim();
    if (trimmed) return trimmed;
  }
  return "";
}

/** Publishable Razorpay Key ID. Safe to expose to the browser. */
export function readRazorpayKeyId(): string {
  return firstNonEmpty([
    process.env["RAZORPAY_KEY_ID"],
    process.env["VITE_RAZORPAY_KEY_ID"],
    process.env["NEXT_PUBLIC_RAZORPAY_KEY_ID"],
    import.meta.env.VITE_RAZORPAY_KEY_ID,
    import.meta.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  ]);
}

/**
 * True only when mock payments were explicitly opted in.
 * A configured Razorpay Key ID always wins over a leftover VITE_MOCK_PAYMENTS=true
 * (Vite does not let empty .env.local values unset a process env var).
 */
export function isMockPaymentsExplicit(): boolean {
  if ((process.env["MOCK_PAYMENTS_ENABLED"] ?? "").trim() === "true") return true;
  if (readRazorpayKeyId()) return false;
  const values = [process.env["VITE_MOCK_PAYMENTS"], import.meta.env.VITE_MOCK_PAYMENTS];
  return values.some((value) => (value ?? "").trim() === "true");
}

export function readRazorpayMode(): "test" | "live" {
  const explicit = firstNonEmpty([
    process.env["RAZORPAY_MODE"],
    import.meta.env.RAZORPAY_MODE,
  ]).toLowerCase();
  if (explicit === "live") return "live";
  if (explicit === "test") return "test";
  return readRazorpayKeyId().startsWith("rzp_live_") ? "live" : "test";
}
