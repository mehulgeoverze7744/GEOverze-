import assert from "node:assert/strict";
import test from "node:test";

import {
  clearShiprocketTokenCache,
  createAdhocOrder,
  shiprocketLiveEnabled,
} from "./shiprocketClient.server.ts";

test("shiprocketLiveEnabled defaults to false", () => {
  const prev = process.env["SHIPROCKET_LIVE_ENABLED"];
  delete process.env["SHIPROCKET_LIVE_ENABLED"];
  assert.equal(shiprocketLiveEnabled(), false);
  if (prev) process.env["SHIPROCKET_LIVE_ENABLED"] = prev;
});

test("createAdhocOrder fails closed when live mode is disabled", async () => {
  const prev = process.env["SHIPROCKET_LIVE_ENABLED"];
  process.env["SHIPROCKET_LIVE_ENABLED"] = "false";
  clearShiprocketTokenCache();

  const result = await createAdhocOrder({
    gstoreOrderId: "00000000-0000-4000-8000-000000000001",
    orderNumber: "GVZ-TEST",
    customerName: "Test",
    customerEmail: "test@example.com",
    customerPhone: "9999999999",
    shippingAddress: {
      line1: "Line 1",
      line2: "",
      city: "Delhi",
      state: "DL",
      pincode: "110001",
      country: "India",
    },
    lines: [{ name: "Tee", sku: "tee", units: 1, selling_price: 100 }],
    subtotalRupee: 100,
    lengthCm: 20,
    breadthCm: 15,
    heightCm: 3,
    weightKg: 0.2,
  });

  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.error.code, "live_disabled");

  if (prev) process.env["SHIPROCKET_LIVE_ENABLED"] = prev;
  else delete process.env["SHIPROCKET_LIVE_ENABLED"];
});