import assert from "node:assert/strict";
import test from "node:test";

import { logCarrierWebhookPayloadShape } from "./shiprocketWebhookDiagnostics.server.ts";
import {
  SHIPROCKET_PRODUCTION_DASHBOARD_TEST_SHAPE,
  isShiprocketConnectivityProbe,
  shiprocketWebhookEnvelopeStructureDiagnostics,
} from "./shiprocketWebhookPayload.server.ts";
import { handleShiprocketWebhookRequest } from "./shiprocketWebhookHandler.server.ts";

const SCAN_ROW = {
  date: "2023-05-19 11:59:16",
  status: "X-UCI",
  activity: "Manifested - Manifest uploaded",
  location: "Chomu_SamodRd_D (Rajasthan)",
  "sr-status": "5",
  "sr-status-label": "MANIFEST GENERATED",
};

/** Inferred from production correlation 3a5702e3 diagnostic flags (no secret values). */
export function buildShiprocketDashboardLiveTestEnvelope() {
  return {
    awb: "81112233445566",
    order_id: "shiprocket-dashboard-live-test",
    sr_order_id: 9022113344,
    courier_name: "Delhivery Surface",
    current_status: "Delivered",
    current_status_id: SHIPROCKET_PRODUCTION_DASHBOARD_TEST_SHAPE.deliveredStatusId,
    shipment_status: "Delivered",
    shipment_status_id: SHIPROCKET_PRODUCTION_DASHBOARD_TEST_SHAPE.deliveredStatusId,
    current_timestamp: "23 05 2023 11:43:52",
    etd: "2023-05-25",
    scans: Array.from({ length: SHIPROCKET_PRODUCTION_DASHBOARD_TEST_SHAPE.scansLength }, () => SCAN_ROW),
  };
}

test("structure diagnostics expose types and scan field names only", () => {
  const envelope = buildShiprocketDashboardLiveTestEnvelope();
  const shape = shiprocketWebhookEnvelopeStructureDiagnostics(envelope);

  assert.equal(shape.hasAwb, true);
  assert.equal(shape.awbJsonType, "string");
  assert.equal(shape.hasOrderId, true);
  assert.equal(shape.scansLength, 2);
  assert.equal(shape.hasTestBoolean, false);
  assert.equal(shape.hasWebhookTestBoolean, false);
  assert.match(shape.firstScanFieldNames, /activity/);
  assert.match(shape.firstScanFieldNames, /sr-status-label/);

  const lines: string[] = [];
  const prev = console.info;
  console.info = (...args: unknown[]) => {
    lines.push(args.map(String).join(" "));
  };
  try {
    logCarrierWebhookPayloadShape({ correlationId: "shape-test", shape });
  } finally {
    console.info = prev;
  }

  const combined = lines.join("\n");
  assert.equal(combined.includes("81112233445566"), false);
  assert.equal(combined.includes("shiprocket-dashboard-live-test"), false);
  assert.equal(combined.includes("Delhivery"), false);
  assert.equal(combined.includes("carrier_webhook_payload_shape"), true);
  assert.equal(combined.includes('"scansLength":2'), true);
});

test("dashboard live shape is not a connectivity probe and hits service_client without Supabase", async () => {
  const envelope = buildShiprocketDashboardLiveTestEnvelope();
  assert.equal(isShiprocketConnectivityProbe(envelope), false);

  const prevToken = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  const prevUrl = process.env["SUPABASE_URL"];
  const prevKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";
  delete process.env["SUPABASE_URL"];
  delete process.env["SUPABASE_SERVICE_ROLE_KEY"];

  const res = await handleShiprocketWebhookRequest({
    rawBody: JSON.stringify(envelope),
    headers: { token: "expected-token" },
  });

  assert.equal(res.status, 503);
  assert.equal(res.body.reason, "service_client_unavailable");
  assert.equal(res.ackCategory, "internal_error");

  if (prevToken) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prevToken;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  if (prevUrl) process.env["SUPABASE_URL"] = prevUrl;
  if (prevKey) process.env["SUPABASE_SERVICE_ROLE_KEY"] = prevKey;
});