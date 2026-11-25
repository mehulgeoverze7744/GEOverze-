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

test("handleShiprocketWebhookHttpRequest accepts valid token on shiprocket path", async () => {
  const prevToken = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  const prevLive = process.env["SHIPROCKET_LIVE_ENABLED"];
  const prevUrl = process.env["SUPABASE_URL"];
  const prevKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";
  delete process.env["SHIPROCKET_LIVE_ENABLED"];
  delete process.env["SUPABASE_URL"];
  delete process.env["SUPABASE_SERVICE_ROLE_KEY"];

  const request = new Request("https://gvrze.com/api/webhooks/shiprocket", {
    method: "POST",
    headers: { "x-api-key": "expected-token", "content-type": "application/json" },
    body: JSON.stringify({ shipment_id: "999", awb: "X", current_status: "unknown" }),
  });

  const response = await handleShiprocketWebhookHttpRequest(request);
  const body = (await response.json()) as { ok: boolean; reason?: string };

  // Auth passes; processing may fail without Supabase — must not return 401.
  assert.notEqual(response.status, 401);
  assert.notEqual(body.reason, "unauthorized");

  if (prevToken) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prevToken;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  if (prevLive) process.env["SHIPROCKET_LIVE_ENABLED"] = prevLive;
  if (prevUrl) process.env["SUPABASE_URL"] = prevUrl;
  if (prevKey) process.env["SUPABASE_SERVICE_ROLE_KEY"] = prevKey;
});