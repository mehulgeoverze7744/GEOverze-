/**
 * HTTP entry for Shiprocket webhooks (wire from Nitro/server when credentials exist).
 */

import { verifyShiprocketWebhook } from "./shiprocketWebhookVerify.server.ts";
import {
  processShiprocketWebhook,
  type ShiprocketWebhookEnvelope,
} from "./shiprocketWebhookProcess.server.ts";
import {
  downloadedSampleMatchDiagnostics,
  isShiprocketConnectivityProbe,
  isShiprocketOfficialDocumentationDemoPayload,
  isShiprocketWebhookTestPayload,
  resolveShipmentLookup,
} from "./shiprocketWebhookPayload.server.ts";
import {
  mapWebhookProcessResultToHttp,
  shiprocketWebhookTestAck,
} from "./shiprocketWebhookResponse.server.ts";
import {
  classifyConnectivityProbeAckCategory,
  logCarrierWebhookStage,
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
  diagnostics?: { correlationId: string };
}): Promise<ShiprocketWebhookHandlerResult> {
  const correlationId = input.diagnostics?.correlationId ?? "no-correlation-id";

  const authOk = verifyShiprocketWebhook(input.rawBody, input.headers);
  logCarrierWebhookStage({
    event: "carrier_webhook_stage",
    correlationId,
    stage: "auth_verify",
    authOk,
  });

  if (!authOk) {
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
    logCarrierWebhookStage({
      event: "carrier_webhook_stage",
      correlationId,
      stage: "json_parse",
      authOk: true,
    });
    return {
      status: 400,
      body: { ok: false, reason: "invalid_json" },
      ackCategory: "internal_error",
    };
  }

  const downloadDiag = downloadedSampleMatchDiagnostics(envelope);
  const connectivityProbe = isShiprocketConnectivityProbe(envelope);
  logCarrierWebhookStage({
    event: "carrier_webhook_stage",
    correlationId,
    stage: "connectivity_probe",
    authOk: true,
    connectivityProbe,
    downloadSampleMatch: downloadDiag.matches,
    officialDemoMatch: isShiprocketOfficialDocumentationDemoPayload(envelope),
    explicitTestPayload: isShiprocketWebhookTestPayload(envelope),
    scansIsArray: downloadDiag.scansIsArray,
    scansLength: downloadDiag.scansLength,
    awbOk: downloadDiag.awbOk,
    orderIdOk: downloadDiag.orderIdOk,
    currentStatusIdOk: downloadDiag.currentStatusIdOk,
    shipmentStatusIdOk: downloadDiag.shipmentStatusIdOk,
    courierNameOk: downloadDiag.courierNameOk,
  });

  if (connectivityProbe) {
    const testAck = shiprocketWebhookTestAck();
    return {
      ...testAck,
      ackCategory: classifyConnectivityProbeAckCategory(envelope),
    };
  }

  const routing = resolveShipmentLookup(envelope);
  logCarrierWebhookStage({
    event: "carrier_webhook_stage",
    correlationId,
    stage: "routing_check",
    authOk: true,
    routingResolved: routing !== null,
  });

  if (!routing) {
    return {
      status: 422,
      body: { ok: false, reason: "missing_routing_fields" },
      ackCategory: "internal_error",
    };
  }

  const result = await processShiprocketWebhook(input.rawBody, envelope);
  logCarrierWebhookStage({
    event: "carrier_webhook_stage",
    correlationId,
    stage: "shipment_process",
    authOk: true,
    routingResolved: true,
    processOk: result.ok,
    processReason: result.ok ? "ok" : result.reason,
  });

  const http = mapWebhookProcessResultToHttp(result);
  let ackCategory: CarrierWebhookAckCategory = "internal_error";
  if (result.ok) {
    ackCategory = "processed_event";
  } else if (result.reason === "shipment_not_found") {
    ackCategory = "unknown_awb";
  }
  return { ...http, ackCategory };
}