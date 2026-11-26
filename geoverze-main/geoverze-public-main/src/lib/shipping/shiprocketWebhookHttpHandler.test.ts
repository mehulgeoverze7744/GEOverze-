import assert from "node:assert/strict";
import test from "node:test";

import {
  CARRIER_WEBHOOK_PATHNAMES,
  handleShiprocketWebhookHttpRequest,
  matchesCarrierWebhookRoute,
} from "./shiprocketWebhookHttpHandler.server.ts";

test("carrier webhook paths include shiprocket and neutral carrier URLs", () => {
  assert.deepEqual(CARRIER_WEBHOOK_PATHNAMES, [
    "/api/webhooks/shiprocket",
    "/api/webhooks/carrier",
  ]);
});

test("matchesCarrierWebhookRoute accepts both POST webhook paths only", () => {
  assert.equal(matchesCarrierWebhookRoute("POST", "/api/webhooks/shiprocket"), true);
  assert.equal(matchesCarrierWebhookRoute("POST", "/api/webhooks/carrier"), true);
  assert.equal(matchesCarrierWebhookRoute("GET", "/api/webhooks/carrier"), false);
  assert.equal(matchesCarrierWebhookRoute("POST", "/api/webhooks/carrier/extra"), false);
  assert.equal(matchesCarrierWebhookRoute("POST", "/api/webhooks/razorpay"), false);
});

test("handleShiprocketWebhookHttpRequest rejects invalid webhook token", async () => {
  const prev = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";

  const request = new Request("https://gvrze.com/api/webhooks/carrier", {
    method: "POST",
    headers: { "x-api-key": "wrong-token", "content-type": "application/json" },
    body: "{}",
  });

  const response = await handleShiprocketWebhookHttpRequest(request);
  const body = (await response.json()) as { ok: boolean; reason?: string };

  assert.equal(response.status, 401);
  assert.equal(body.ok, false);
  assert.equal(body.reason, "unauthorized");

  if (prev) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prev;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
});

test("handleShiprocketWebhookHttpRequest returns 200 for authenticated test callback", async () => {
  const prevToken = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";

  const request = new Request("https://gvrze.com/api/webhooks/carrier", {
    method: "POST",
    headers: { "x-api-key": "expected-token", "content-type": "application/json" },
    body: JSON.stringify({ test: true }),
  });

  const response = await handleShiprocketWebhookHttpRequest(request);
  const body = (await response.json()) as { ok: boolean; test?: boolean };

  assert.equal(response.status, 200);
  assert.equal(body.ok, true);
  assert.equal(body.test, true);

  if (prevToken) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prevToken;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
});