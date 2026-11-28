/**
 * HTTP entry for Shiprocket webhooks (wire from Nitro/server when credentials exist).
 */

import { verifyShiprocketWebhook } from "./shiprocketWebhookVerify.server.ts";
import {
  processShiprocketWebhook,
  type ShiprocketWebhookEnvelope,
} from "./shiprocketWebhookProcess.server.ts";
import {
  isShiprocketConnectivityProbe,
  resolveShipmentLookup,
} from "./shiprocketWebhookPayload.server.ts";
import {
  mapWebhookProcessResultToHttp,
  shiprocketWebhookTestAck,
} from "./shiprocketWebhookResponse.server.ts";
import {
  classifyConnectivityProbeAckCategory,
  type CarrierWebhookAckCategory,
} from "./shiprocketWebhookDiagnostics.server.ts";

export type ShiprocketWebhookHandlerResult = {
  status: number;
  body: Record<string, unknown>;
  ackCategory: CarrierWebhookAckCategory;
};

export async function handleShiprocketWebhookRequest(input: {
  rawBody: string;
  headers: { token?: string | null; signature?: string | null };
}): Promise<ShiprocketWebhookHandlerResult> {
  if (!verifyShiprocketWebhook(input.rawBody, input.headers)) {
    return {
      status: 401,
      body: { ok: false, reason: "unauthorized" },
      ackCategory: "unauthorized",
    };
  }

  let envelope: ShiprocketWebhookEnvelope;
  try {
    envelope = JSON.parse(input.rawBody) as ShiprocketWebhookEnvelope;
  } catch {
    return {
      status: 400,
      body: { ok: false, reason: "invalid_json" },
      ackCategory: "internal_error",
    };
  }

  if (isShiprocketConnectivityProbe(envelope)) {
    const testAck = shiprocketWebhookTestAck();
    return {
      ...testAck,
      ackCategory: classifyConnectivityProbeAckCategory(envelope),
    };
  }

  if (!resolveShipmentLookup(envelope)) {
    return {
      status: 422,
      body: { ok: false, reason: "missing_routing_fields" },
      ackCategory: "internal_error",
    };
  }

  const result = await processShiprocketWebhook(input.rawBody, envelope);
  const http = mapWebhookProcessResultToHttp(result);
  let ackCategory: CarrierWebhookAckCategory = "internal_error";
  if (result.ok) {
    ackCategory = "processed_event";
  } else if (result.reason === "shipment_not_found") {
    ackCategory = "unknown_awb";
  }
  return { ...http, ackCategory };
}