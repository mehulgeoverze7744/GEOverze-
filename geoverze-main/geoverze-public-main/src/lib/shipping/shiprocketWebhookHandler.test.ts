import assert from "node:assert/strict";
import test from "node:test";

import { handleShiprocketWebhookRequest } from "./shiprocketWebhookHandler.server.ts";

test("invalid token returns 401", async () => {
  const prev = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";

  const res = await handleShiprocketWebhookRequest({
    rawBody: JSON.stringify({ test: true }),
    headers: { token: "wrong" },
  });

  assert.equal(res.status, 401);
  assert.equal(res.body.reason, "unauthorized");

  if (prev) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prev;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
});

test("malformed JSON returns 400", async () => {
  const prev = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";

  const res = await handleShiprocketWebhookRequest({
    rawBody: "{not-json",
    headers: { token: "expected-token" },
  });

  assert.equal(res.status, 400);
  assert.equal(res.body.reason, "invalid_json");

  if (prev) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prev;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
});

test("authenticated test payload returns 200 without DB", async () => {
  const prev = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  const prevUrl = process.env["SUPABASE_URL"];
  const prevKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";
  delete process.env["SUPABASE_URL"];
  delete process.env["SUPABASE_SERVICE_ROLE_KEY"];

  const res = await handleShiprocketWebhookRequest({
    rawBody: JSON.stringify({ test: true }),
    headers: { token: "expected-token" },
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.test, true);
  assert.equal(res.body.accepted, true);

  if (prev) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prev;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  if (prevUrl) process.env["SUPABASE_URL"] = prevUrl;
  if (prevKey) process.env["SUPABASE_SERVICE_ROLE_KEY"] = prevKey;
});

test("authenticated tracking payload without service client returns 503", async () => {
  const prev = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  const prevUrl = process.env["SUPABASE_URL"];
  const prevKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";
  delete process.env["SUPABASE_URL"];
  delete process.env["SUPABASE_SERVICE_ROLE_KEY"];

  const res = await handleShiprocketWebhookRequest({
    rawBody: JSON.stringify({
      awb: "19041424751540",
      current_status: "IN TRANSIT",
      order_id: "1373900_150876814",
    }),
    headers: { token: "expected-token" },
  });

  assert.equal(res.status, 503);
  assert.equal(res.body.reason, "service_client_unavailable");
  assert.equal(res.body.retryable, true);

  if (prev) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prev;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  if (prevUrl) process.env["SUPABASE_URL"] = prevUrl;
  if (prevKey) process.env["SUPABASE_SERVICE_ROLE_KEY"] = prevKey;
});