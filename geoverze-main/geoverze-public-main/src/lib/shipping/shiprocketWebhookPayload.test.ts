import assert from "node:assert/strict";
import test from "node:test";

import {
  SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS,
  isShiprocketOfficialDocumentationDemoPayload,
  isShiprocketWebhookTestPayload,
  resolveShipmentLookup,
} from "./shiprocketWebhookPayload.server.ts";

test("detects Shiprocket dashboard test body", () => {
  assert.equal(isShiprocketWebhookTestPayload({ test: true }), true);
  assert.equal(isShiprocketWebhookTestPayload({}), true);
});

test("does not treat official sample as explicit test payload", () => {
  assert.equal(
    isShiprocketWebhookTestPayload({
      awb: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.awb,
      current_status: "IN TRANSIT",
      sr_order_id: Number(SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.sr_order_id),
      order_id: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.order_id,
    }),
    false,
  );
  assert.equal(
    isShiprocketOfficialDocumentationDemoPayload({
      awb: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.awb,
      order_id: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.order_id,
      sr_order_id: Number(SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.sr_order_id),
    }),
    true,
  );
});

test("resolveShipmentLookup prefers awb then provider ids", () => {
  assert.deepEqual(resolveShipmentLookup({ awb: " AWB1 " }), { kind: "awb", value: "AWB1" });
  assert.deepEqual(resolveShipmentLookup({ sr_order_id: 99 }), {
    kind: "provider_shipment_id",
    value: "99",
  });
  assert.deepEqual(resolveShipmentLookup({ order_id: "1373900_150876814" }), {
    kind: "provider_order_id",
    value: "1373900_150876814",
  });
});