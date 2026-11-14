/**
 * Pure Razorpay HMAC helpers — safe to unit-test without network access.
 * Never import Key Secret into client bundles; only server code should
 * pass the secret into these functions.
 */

import "@tanstack/react-start/server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

/** Constant-time hex comparison. Length mismatch fails closed. */
export function timingSafeHexEqual(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const left = a.toLowerCase();
  const right = b.toLowerCase();
  if (left.length !== right.length || left.length === 0) return false;
  try {
    return timingSafeEqual(Buffer.from(left, "utf8"), Buffer.from(right, "utf8"));
  } catch {
    return false;
  }
}

export function hmacSha256Hex(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

/** One-time order checkout: HMAC-SHA256(orderId|paymentId). */
export function verifyRazorpayOrderSignature(input: {
  keySecret: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}): boolean {
  const expected = hmacSha256Hex(
    input.keySecret,
    `${input.razorpayOrderId}|${input.razorpayPaymentId}`,
  );
  return timingSafeHexEqual(expected, input.razorpaySignature);
}

/** Subscription checkout: HMAC-SHA256(paymentId|subscriptionId). */
export function verifyRazorpaySubscriptionSignature(input: {
  keySecret: string;
  razorpayPaymentId: string;
  razorpaySubscriptionId: string;
  razorpaySignature: string;
}): boolean {
  const expected = hmacSha256Hex(
    input.keySecret,
    `${input.razorpayPaymentId}|${input.razorpaySubscriptionId}`,
  );
  return timingSafeHexEqual(expected, input.razorpaySignature);
}

/** Webhook: HMAC-SHA256(rawBody) compared to X-Razorpay-Signature. */
export function verifyRazorpayWebhookSignature(input: {
  webhookSecret: string;
  rawBody: string;
  signature: string;
}): boolean {
  const expected = hmacSha256Hex(input.webhookSecret, input.rawBody);
  return timingSafeHexEqual(expected, input.signature);
}

export type CapturedPaymentCheck = {
  status: string;
  amount: number;
  currency: string;
  orderId: string | null;
  captured: boolean;
};

/**
 * Confirms a fetched Razorpay payment is captured for the expected
 * order amount/currency. Never treat `authorized` as paid.
 */
export function assertCapturedPayment(
  payment: CapturedPaymentCheck,
  expected: { amountMinor: number; currency: string; orderId?: string },
): { ok: true } | { ok: false; message: string } {
  const status = payment.status.toLowerCase();
  const captured = payment.captured || status === "captured";
  if (!captured || status !== "captured") {
    return { ok: false, message: `Payment is not captured (status=${payment.status}).` };
  }
  if (payment.amount !== expected.amountMinor) {
    return {
      ok: false,
      message: `Payment amount mismatch: expected ${expected.amountMinor}, got ${payment.amount}.`,
    };
  }
  if (payment.currency.toUpperCase() !== expected.currency.toUpperCase()) {
    return {
      ok: false,
      message: `Payment currency mismatch: expected ${expected.currency}, got ${payment.currency}.`,
    };
  }
  if (expected.orderId && payment.orderId && payment.orderId !== expected.orderId) {
    return {
      ok: false,
      message: `Payment order mismatch: expected ${expected.orderId}, got ${payment.orderId}.`,
    };
  }
  return { ok: true };
}
