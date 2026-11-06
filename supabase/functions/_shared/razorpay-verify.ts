/**
 * Server-side Razorpay signature verification for subscriptions.
 *
 * Uses Web Crypto (available in Deno / Edge Function runtime).
 * Never import this in browser code — RAZORPAY_KEY_SECRET is server-only.
 *
 * Razorpay signing specification:
 *   HMAC-SHA256( razorpay_payment_id + "|" + razorpay_subscription_id,
 *                RAZORPAY_KEY_SECRET )
 *
 * Reference: https://razorpay.com/docs/payments/subscriptions/build-integration/#step-6-handle-payment-capture
 */

export async function verifyRazorpaySignature(
  paymentId: string,
  subscriptionId: string,
  signature: string,
  keySecret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();
  const payload = `${paymentId}|${subscriptionId}`;

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(keySecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(payload),
  );

  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // Constant-time comparison to prevent timing attacks
  return constantTimeEquals(computed, signature);
}

/** Constant-time string comparison. Both strings must be hex of the same length. */
function constantTimeEquals(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

/**
 * Verifies a Razorpay webhook signature.
 * Payload is the raw request body string; header is X-Razorpay-Signature.
 *
 * HMAC-SHA256( rawBody, RAZORPAY_WEBHOOK_SECRET )
 */
export async function verifyRazorpayWebhook(
  rawBody: string,
  signature: string,
  webhookSecret: string,
): Promise<boolean> {
  const encoder = new TextEncoder();

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBytes = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(rawBody),
  );

  const computed = Array.from(new Uint8Array(signatureBytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return constantTimeEquals(computed, signature);
}
