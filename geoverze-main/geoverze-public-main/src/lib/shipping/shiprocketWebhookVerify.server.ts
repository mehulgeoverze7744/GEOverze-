/**
 * Verify inbound Shiprocket webhook authentication.
 *
 * Shiprocket commonly sends a shared token header; confirm against dashboard settings.
 * Set SHIPROCKET_WEBHOOK_TOKEN server-side (never VITE_*).
 */

import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyShiprocketWebhookToken(headerValue: string | null | undefined): boolean {
  const secret = process.env["SHIPROCKET_WEBHOOK_TOKEN"]?.trim() ?? "";
  if (!secret) return false;
  if (!headerValue) return false;
  const received = headerValue.trim();
  try {
    const a = Buffer.from(received, "utf8");
    const b = Buffer.from(secret, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/** Optional HMAC-SHA256 body signature (if configured with SHIPROCKET_WEBHOOK_HMAC_SECRET). */
export function verifyShiprocketWebhookHmac(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env["SHIPROCKET_WEBHOOK_HMAC_SECRET"]?.trim() ?? "";
  if (!secret || !signatureHeader) return false;
  const digest = createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
  try {
    const a = Buffer.from(signatureHeader.trim(), "utf8");
    const b = Buffer.from(digest, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function verifyShiprocketWebhook(
  rawBody: string,
  headers: { token?: string | null; signature?: string | null },
): boolean {
  if (verifyShiprocketWebhookToken(headers.token)) return true;
  if (verifyShiprocketWebhookHmac(rawBody, headers.signature ?? null)) return true;
  return false;
}