import assert from "node:assert/strict";
import test from "node:test";

import {
  mapShiprocketStatusToShipmentStatus,
  resolveProviderEventId,
} from "./shiprocketWebhookProcess.server.ts";

test("mapShiprocketStatusToShipmentStatus normalizes carrier labels", () => {
  assert.equal(mapShiprocketStatusToShipmentStatus("Out For Delivery"), "out_for_delivery");
  assert.equal(mapShiprocketStatusToShipmentStatus("DELIVERED"), "delivered");
});

test("resolveProviderEventId is stable for identical scan data", () => {
  const envelope = {
    awb: "AWB123",
    current_status: "In Transit",
    scans: [{ activity: "Reached hub", date: "2026-01-01T10:00:00Z" }],
  };
  const a = resolveProviderEventId(envelope, JSON.stringify(envelope));
  const b = resolveProviderEventId(envelope, JSON.stringify(envelope));
  assert.equal(a, b);
  assert.ok(a.includes("AWB123"));
});

test("duplicate webhook events use distinct provider_event_id per status change", () => {
  const base = {
    awb: "AWB123",
    scans: [{ activity: "Picked up", date: "2026-01-01T09:00:00Z" }],
  };
  const first = resolveProviderEventId(
    { ...base, current_status: "Picked Up" },
    "{}",
  );
  const second = resolveProviderEventId(
    { ...base, current_status: "In Transit", scans: [{ activity: "Hub", date: "2026-01-02" }] },
    "{}",
  );
  assert.notEqual(first, second);
});