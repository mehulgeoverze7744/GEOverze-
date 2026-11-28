import assert from "node:assert/strict";
import test from "node:test";

import {
  buildCarrierWebhookRequestLog,
  buildCarrierWebhookResponseLog,
  classifyConnectivityProbeAckCategory,
  hasCarrierWebhookApiKeyHeader,
  hasCarrierWebhookHmacHeader,
  normalizeCarrierWebhookPathname,
  sanitizeCarrierWebhookLogRecord,
  sanitizeExceptionForLog,
  serializeCarrierWebhookRequestLog,
  serializeCarrierWebhookResponseLog,
} from "./shiprocketWebhookDiagnostics.server.ts";
import {
  SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS,
  SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS,
} from "./shiprocketWebhookPayload.server.ts";
import { handleShiprocketWebhookHttpRequest } from "./shiprocketWebhookHttpHandler.server.ts";

test("normalizeCarrierWebhookPathname strips trailing slashes", () => {
  assert.equal(
    normalizeCarrierWebhookPathname("https://gvrze.com/api/webhooks/carrier/"),
    "/api/webhooks/carrier",
  );
  assert.equal(
    normalizeCarrierWebhookPathname("https://gvrze.com/api/webhooks/shiprocket"),
    "/api/webhooks/shiprocket",
  );
});

test("header presence helpers never expose secret values", () => {
  const withKey = new Request("https://gvrze.com/api/webhooks/carrier", {
    method: "POST",
    headers: { "x-api-key": "super-secret-token-value" },
  });
  const withHmac = new Request("https://gvrze.com/api/webhooks/carrier", {
    method: "POST",
    headers: { "x-shiprocket-hmac": "deadbeef" },
  });

  assert.equal(hasCarrierWebhookApiKeyHeader(withKey), true);
  assert.equal(hasCarrierWebhookHmacHeader(withHmac), true);
  assert.equal(hasCarrierWebhookApiKeyHeader(withHmac), false);
  assert.equal(hasCarrierWebhookHmacHeader(withKey), false);
});

test("classifyConnectivityProbeAckCategory distinguishes doc samples", () => {
  const downloaded = {
    awb: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.awb,
    order_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.order_id,
    current_status: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.current_status,
    current_status_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.current_status_id,
    shipment_status: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.shipment_status,
    shipment_status_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.shipment_status_id,
    channel_order_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.channel_order_id,
    channel: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.channel,
    courier_name: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.courier_name,
    scans: Array.from(
      { length: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.scansLength },
      () => ({}),
    ),
  };

  assert.equal(classifyConnectivityProbeAckCategory(downloaded), "downloaded_sample");
  assert.equal(
    classifyConnectivityProbeAckCategory({
      awb: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.awb,
      order_id: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.order_id,
      sr_order_id: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.sr_order_id,
    }),
    "official_demo",
  );
  assert.equal(classifyConnectivityProbeAckCategory({ test: true }), "explicit_test");
});

test("serialized request logs contain only privacy-safe fields", () => {
  const json = serializeCarrierWebhookRequestLog(
    buildCarrierWebhookRequestLog({
      correlationId: "cid-1",
      method: "POST",
      pathname: "/api/webhooks/carrier",
      contentType: "application/json",
      hasApiKey: true,
      hasHmac: false,
      bodyByteLength: 128,
    }),
  );

  const parsed = JSON.parse(json) as Record<string, unknown>;
  assert.deepEqual(Object.keys(parsed).sort(), [
    "bodyByteLength",
    "contentType",
    "correlationId",
    "event",
    "hasApiKey",
    "hasHmac",
    "method",
    "pathname",
  ]);
  assert.equal(parsed.event, "carrier_webhook_request");
  assert.equal(parsed.hasApiKey, true);
  assert.equal(json.includes("super-secret"), false);
  assert.equal(json.includes("authorization"), false);
});

test("sanitizeCarrierWebhookLogRecord drops forbidden keys", () => {
  const sanitized = sanitizeCarrierWebhookLogRecord({
    correlationId: "abc",
    "x-api-key": "leak",
    authorization: "Bearer leak",
    rawBody: '{"awb":"123"}',
    token: "nope",
    hasApiKey: true,
  });

  assert.equal(sanitized.correlationId, "abc");
  assert.equal(sanitized.hasApiKey, true);
  assert.equal("x-api-key" in sanitized, false);
  assert.equal("authorization" in sanitized, false);
  assert.equal("rawBody" in sanitized, false);
  assert.equal("token" in sanitized, false);
});

test("serialized response logs classify acknowledgement without leaking body", () => {
  const json = serializeCarrierWebhookResponseLog(
    buildCarrierWebhookResponseLog({
      correlationId: "cid-2",
      status: 200,
      ackCategory: "downloaded_sample",
      elapsedMs: 12,
      responseBodyByteLength: 42,
    }),
  );

  const parsed = JSON.parse(json) as Record<string, unknown>;
  assert.equal(parsed.ackCategory, "downloaded_sample");
  assert.equal(parsed.status, 200);
  assert.equal(json.includes("accepted"), false);
  assert.equal(json.includes("awb"), false);
});

test("http handler diagnostics never echo webhook token in logs", async () => {
  const prevToken = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "diag-test-token-do-not-log";

  const infoLines: string[] = [];
  const originalInfo = console.info;
  console.info = (...args: unknown[]) => {
    infoLines.push(args.map(String).join(" "));
  };

  try {
    const request = new Request("https://gvrze.com/api/webhooks/shiprocket", {
      method: "POST",
      headers: {
        "x-api-key": "diag-test-token-do-not-log",
        "content-type": "application/json",
      },
      body: JSON.stringify({ test: true }),
    });

    const response = await handleShiprocketWebhookHttpRequest(request);
    assert.equal(response.status, 200);

    const combined = infoLines.join("\n");
    assert.equal(combined.includes("diag-test-token-do-not-log"), false);
    assert.equal(combined.includes("[carrier-webhook-diag]"), true);
    assert.equal(combined.includes('"ackCategory":"explicit_test"'), true);
    assert.equal(combined.includes('"pathname":"/api/webhooks/shiprocket"'), true);
  } finally {
    console.info = originalInfo;
    if (prevToken) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prevToken;
    else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  }
});

test("sanitizeExceptionForLog redacts inline secrets", () => {
  const sanitized = sanitizeExceptionForLog(
    new Error("Unauthorized x-api-key Bearer eyJhbGciOiJIUzI1NiJ9.fail"),
  );
  assert.equal(sanitized.message.includes("x-api-key"), false);
  assert.equal(sanitized.message.includes("Bearer"), false);
  assert.equal(sanitized.message.includes("[redacted]"), true);
});

test("non-POST carrier webhook logs method and internal_error category", async () => {
  const infoLines: string[] = [];
  const originalInfo = console.info;
  console.info = (...args: unknown[]) => {
    infoLines.push(args.map(String).join(" "));
  };

  try {
    const response = await handleShiprocketWebhookHttpRequest(
      new Request("https://gvrze.com/api/webhooks/carrier", { method: "GET" }),
    );
    assert.equal(response.status, 405);
    const combined = infoLines.join("\n");
    assert.equal(combined.includes('"method":"GET"'), true);
    assert.equal(combined.includes('"ackCategory":"internal_error"'), true);
    assert.equal(combined.includes('"bodyByteLength":0'), true);
  } finally {
    console.info = originalInfo;
  }
});