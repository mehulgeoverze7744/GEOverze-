import assert from "node:assert/strict";
import test from "node:test";

import {
  isShiprocketWebhookTestPayload,
  resolveShipmentLookup,
} from "./shiprocketWebhookPayload.server.ts";

test("detects Shiprocket dashboard test body", () => {
  assert.equal(isShiprocketWebhookTestPayload({ test: true }), true);
  assert.equal(isShiprocketWebhookTestPayload({}), true);
});

test("does not treat official sample as test payload", () => {
  assert.equal(
    isShiprocketWebhookTestPayload({
      awb: "19041424751540",
      current_status: "IN TRANSIT",
      sr_order_id: 348456385,
      order_id: "1373900_150876814",
    }),
    false,
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