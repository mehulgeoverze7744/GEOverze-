import assert from "node:assert/strict";
import test from "node:test";

import { mapWebhookProcessResultToHttp } from "./shiprocketWebhookResponse.server.ts";

test("successful processing returns HTTP 200", () => {
  const res = mapWebhookProcessResultToHttp({ ok: true, duplicate: false, shipmentId: "ship-1" });
  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.accepted, true);
  assert.equal(res.body.shipmentId, "ship-1");
});

test("duplicate event returns HTTP 200", () => {
  const res = mapWebhookProcessResultToHttp({ ok: true, duplicate: true, shipmentId: "ship-1" });
  assert.equal(res.status, 200);
  assert.equal(res.body.duplicate, true);
});

test("unknown shipment returns HTTP 503 for provider retry", () => {
  const res = mapWebhookProcessResultToHttp({
    ok: false,
    reason: "shipment_not_found",
    retryable: true,
  });
  assert.equal(res.status, 503);
  assert.equal(res.body.retryable, true);
  assert.equal(res.body.reason, "shipment_not_found");
});

test("duplicate success still maps to HTTP 200 after reconciliation", () => {
  const res = mapWebhookProcessResultToHttp({ ok: true, duplicate: true, shipmentId: "ship-1" });
  assert.equal(res.status, 200);
  assert.equal(res.body.duplicate, true);
});

test("database failure returns HTTP 503", () => {
  const res = mapWebhookProcessResultToHttp({
    ok: false,
    reason: "event_persist_failed",
    retryable: true,
  });
  assert.equal(res.status, 503);
  assert.equal(res.body.retryable, true);
});