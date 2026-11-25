/**
 * HTTP entry for Shiprocket webhooks (wire from Nitro/server when credentials exist).
 */

import { verifyShiprocketWebhook } from "./shiprocketWebhookVerify.server.ts";
import {
  processShiprocketWebhook,
  type ShiprocketWebhookEnvelope,
} from "./shiprocketWebhookProcess.server.ts";

export async function handleShiprocketWebhookRequest(input: {
  rawBody: string;
  headers: { token?: string | null; signature?: string | null };
}): Promise<{ status: number; body: Record<string, unknown> }> {
  if (!verifyShiprocketWebhook(input.rawBody, input.headers)) {
    return { status: 401, body: { ok: false, reason: "unauthorized" } };
  }

  let envelope: ShiprocketWebhookEnvelope;
  try {
    envelope = JSON.parse(input.rawBody) as ShiprocketWebhookEnvelope;
  } catch {
    return { status: 400, body: { ok: false, reason: "invalid_json" } };
  }

  const result = await processShiprocketWebhook(input.rawBody, envelope);
  if (!result.ok) {
    return { status: 422, body: { ok: false, reason: result.reason } };
  }
  return { status: 200, body: { ok: true, duplicate: result.duplicate, shipmentId: result.shipmentId } };
}