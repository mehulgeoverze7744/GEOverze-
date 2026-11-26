import assert from "node:assert/strict";
import test from "node:test";

import type { WebhookProcessResult } from "./shiprocketWebhookProcess.server.ts";
import { mapWebhookProcessResultToHttp } from "./shiprocketWebhookResponse.server.ts";

/**
 * Documents retry behavior when event insert succeeded but shipment update failed:
 * unique constraint => duplicate path runs applyTrackingUpdateToShipment again.
 */
test("partial failure path remains retryable until shipment sync succeeds", () => {
  const failedUpdate: WebhookProcessResult = {
    ok: false,
    reason: "shipment_update_failed",
    retryable: true,
  };
  const retryHttp = mapWebhookProcessResultToHttp(failedUpdate);
  assert.equal(retryHttp.status, 503);
  assert.equal(retryHttp.body.retryable, true);

  const reconciled: WebhookProcessResult = { ok: true, duplicate: true, shipmentId: "id-1" };
  const successHttp = mapWebhookProcessResultToHttp(reconciled);
  assert.equal(successHttp.status, 200);
  assert.equal(successHttp.body.duplicate, true);
});