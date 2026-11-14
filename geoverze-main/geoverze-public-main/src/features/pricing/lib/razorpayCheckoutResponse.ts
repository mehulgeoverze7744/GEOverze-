/**
 * Normalizes Razorpay Standard Checkout handler payloads.
 * Checkout.js usually returns snake_case fields; some wrappers use camelCase
 * or nest values. Never treat a missing signature as an empty string.
 */

export type NormalizedRazorpayCheckoutResponse = {
  paymentId: string;
  signature: string;
  orderId: string;
  subscriptionId: string;
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function readString(source: Record<string, unknown>, keys: readonly string[]): string {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === "string" && value.trim().length > 0) return value.trim();
  }
  return "";
}

export function normalizeRazorpayCheckoutResponse(
  raw: unknown,
): NormalizedRazorpayCheckoutResponse {
  const root = asRecord(raw);
  const nested = asRecord(root["razorpay"]);
  const sources = [root, nested];
  const paymentKeys = [
    "razorpay_payment_id",
    "razorpayPaymentId",
    "payment_id",
    "paymentId",
  ] as const;
  const signatureKeys = [
    "razorpay_signature",
    "razorpaySignature",
    "signature",
  ] as const;
  const orderKeys = ["razorpay_order_id", "razorpayOrderId", "order_id", "orderId"] as const;
  const subscriptionKeys = [
    "razorpay_subscription_id",
    "razorpaySubscriptionId",
    "subscription_id",
    "subscriptionId",
  ] as const;

  let paymentId = "";
  let signature = "";
  let orderId = "";
  let subscriptionId = "";
  for (const source of sources) {
    paymentId ||= readString(source, paymentKeys);
    signature ||= readString(source, signatureKeys);
    orderId ||= readString(source, orderKeys);
    subscriptionId ||= readString(source, subscriptionKeys);
  }

  return { paymentId, signature, orderId, subscriptionId };
}

/** Customer-facing copy. Never forwards Zod, JSON schema, or stack traces. */
export function customerFacingPaymentError(error: unknown): string {
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  const compact = raw.replace(/\s+/g, " ").trim();
  if (
    /expected string, received undefined/i.test(compact) ||
    /validation error/i.test(compact) ||
    /invalid_type/i.test(compact) ||
    /rzp_signature/i.test(compact) ||
    /"path"\s*:/i.test(compact)
  ) {
    return "Payment confirmation was incomplete. If you were charged, membership will activate shortly.";
  }
  if (/signature/i.test(compact)) {
    return "Payment could not be verified. If you were charged, check your billing dashboard in a moment.";
  }
  if (/not captured|authorized/i.test(compact)) {
    return "Razorpay has not captured this payment yet. Membership will activate once capture is confirmed.";
  }
  if (compact.length > 0 && compact.length < 180 && !/at\s+\S+\s+\(/.test(compact)) {
    return compact;
  }
  return "Payment could not be confirmed yet. If you were charged, membership will activate shortly.";
}
