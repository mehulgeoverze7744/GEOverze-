import assert from "node:assert/strict";
import test from "node:test";

import { handleShiprocketWebhookRequest } from "./shiprocketWebhookHandler.server.ts";
import {
  SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS,
  isShiprocketOfficialDocumentationDemoPayload,
  isShiprocketWebhookTestPayload,
} from "./shiprocketWebhookPayload.server.ts";
import { mapWebhookProcessResultToHttp } from "./shiprocketWebhookResponse.server.ts";

const OFFICIAL_DEMO_BODY = {
  awb: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.awb,
  courier_name: "Delhivery Surface",
  current_status: "IN TRANSIT",
  current_status_id: 20,
  shipment_status: "IN TRANSIT",
  shipment_status_id: 18,
  current_timestamp: "23 05 2023 11:43:52",
  order_id: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.order_id,
  sr_order_id: Number(SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.sr_order_id),
};

function withToken(run: () => Promise<void> | void) {
  const prevToken = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  const prevUrl = process.env["SUPABASE_URL"];
  const prevKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];
  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";
  delete process.env["SUPABASE_URL"];
  delete process.env["SUPABASE_SERVICE_ROLE_KEY"];
  return Promise.resolve(run()).finally(() => {
    if (prevToken) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prevToken;
    else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
    if (prevUrl) process.env["SUPABASE_URL"] = prevUrl;
    else delete process.env["SUPABASE_URL"];
    if (prevKey) process.env["SUPABASE_SERVICE_ROLE_KEY"] = prevKey;
    else delete process.env["SUPABASE_SERVICE_ROLE_KEY"];
  });
}

test("official doc demo identifiers are recognized only as a full triple", () => {
  assert.equal(isShiprocketOfficialDocumentationDemoPayload(OFFICIAL_DEMO_BODY), true);
  assert.equal(
    isShiprocketOfficialDocumentationDemoPayload({
      ...OFFICIAL_DEMO_BODY,
      awb: "19041424751541",
    }),
    false,
  );
  assert.equal(isShiprocketWebhookTestPayload(OFFICIAL_DEMO_BODY), false);
});

test("1. invalid authentication with official demo payload -> 401", async () => {
  await withToken(async () => {
    const res = await handleShiprocketWebhookRequest({
      rawBody: JSON.stringify(OFFICIAL_DEMO_BODY),
      headers: { token: "wrong" },
    });
    assert.equal(res.status, 401);
  });
});

test("2. authenticated explicit test callback -> 200", async () => {
  await withToken(async () => {
    const res = await handleShiprocketWebhookRequest({
      rawBody: JSON.stringify({ test: true }),
      headers: { token: "expected-token" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.test, true);
  });
});

test("3. exact official demo payload -> 200 without database writes", async () => {
  await withToken(async () => {
    const res = await handleShiprocketWebhookRequest({
      rawBody: JSON.stringify(OFFICIAL_DEMO_BODY),
      headers: { token: "expected-token" },
    });
    assert.equal(res.status, 200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.accepted, true);
    assert.equal(res.body.test, true);
  });
});

test("4. modified unrecognized AWB with doc order ids -> 503", async () => {
  await withToken(async () => {
    const res = await handleShiprocketWebhookRequest({
      rawBody: JSON.stringify({
        ...OFFICIAL_DEMO_BODY,
        awb: "19041424751541",
      }),
      headers: { token: "expected-token" },
    });
    assert.equal(res.status, 503);
    assert.equal(res.body.retryable, true);
  });
});

test("5. genuine unknown AWB -> 503", async () => {
  await withToken(async () => {
    const res = await handleShiprocketWebhookRequest({
      rawBody: JSON.stringify({
        awb: "88223344556611",
        order_id: "customer-order-xyz",
        current_status: "IN TRANSIT",
      }),
      headers: { token: "expected-token" },
    });
    assert.equal(res.status, 503);
    assert.equal(res.body.retryable, true);
  });
});

test("6-8. duplicate reconciliation and DB failure HTTP mapping", () => {
  const dup = mapWebhookProcessResultToHttp({ ok: true, duplicate: true, shipmentId: "s1" });
  assert.equal(dup.status, 200);
  assert.equal(dup.body.duplicate, true);

  const dbFail = mapWebhookProcessResultToHttp({
    ok: false,
    reason: "event_persist_failed",
    retryable: true,
  });
  assert.equal(dbFail.status, 503);

  const unknown = mapWebhookProcessResultToHttp({
    ok: false,
    reason: "shipment_not_found",
    retryable: true,
  });
  assert.equal(unknown.status, 503);
});