/**
 * Map Shiprocket webhook processing outcomes to HTTP responses.
 * Shiprocket expects HTTP 200 on accepted callbacks; 401 stays strict for auth.
 */

import type { WebhookProcessResult } from "./shiprocketWebhookProcess.server.ts";

export type WebhookHttpResponse = { status: number; body: Record<string, unknown> };

export function shiprocketWebhookTestAck(): WebhookHttpResponse {
  return {
    status: 200,
    body: { ok: true, accepted: true, test: true },
  };
}

export function mapWebhookProcessResultToHttp(result: WebhookProcessResult): WebhookHttpResponse {
  if (result.ok) {
    return {
      status: 200,
      body: {
        ok: true,
        accepted: true,
        duplicate: result.duplicate,
        ...(result.shipmentId ? { shipmentId: result.shipmentId } : {}),
      },
    };
  }

  const { reason, retryable } = result;

  if (retryable || reason === "service_client_unavailable" || reason === "shipment_not_found") {
    if (reason === "shipment_not_found") {
      console.warn("[shiprocket-webhook] shipment not found — requesting provider retry");
    }
    return { status: 503, body: { ok: false, reason, retryable: true } };
  }

  return { status: 422, body: { ok: false, reason } };
}