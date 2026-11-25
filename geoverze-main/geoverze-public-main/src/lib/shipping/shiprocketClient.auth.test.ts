import assert from "node:assert/strict";
import test from "node:test";

import {
  clearShiprocketTokenCache,
  setShiprocketFetchForTests,
  shiprocketLiveEnabled,
} from "./shiprocketClient.server.ts";

test("401 response clears cached token and retries once", async () => {
  const prevLive = process.env["SHIPROCKET_LIVE_ENABLED"];
  const prevEmail = process.env["SHIPROCKET_EMAIL"];
  const prevPassword = process.env["SHIPROCKET_PASSWORD"];
  process.env["SHIPROCKET_LIVE_ENABLED"] = "true";
  process.env["SHIPROCKET_EMAIL"] = "test@example.com";
  process.env["SHIPROCKET_PASSWORD"] = "secret";
  clearShiprocketTokenCache();

  let authCalls = 0;
  let apiCalls = 0;
  setShiprocketFetchForTests(async (input, init) => {
    const url = String(input);
    if (url.includes("/auth/login")) {
      authCalls += 1;
      return new Response(JSON.stringify({ token: `tok-${authCalls}` }), { status: 200 });
    }
    apiCalls += 1;
    if (apiCalls === 1) {
      return new Response("unauthorized", { status: 401 });
    }
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  });

  const { checkServiceability } = await import("./shiprocketClient.server.ts");
  const result = await checkServiceability({
    pickupPincode: "110001",
    deliveryPincode: "400001",
    weightKg: 0.5,
  });

  assert.equal(result.ok, true);
  assert.ok(authCalls >= 2, "expected token refresh after 401");
  setShiprocketFetchForTests(null);
  clearShiprocketTokenCache();
  if (prevLive) process.env["SHIPROCKET_LIVE_ENABLED"] = prevLive;
  else delete process.env["SHIPROCKET_LIVE_ENABLED"];
  if (prevEmail) process.env["SHIPROCKET_EMAIL"] = prevEmail;
  else delete process.env["SHIPROCKET_EMAIL"];
  if (prevPassword) process.env["SHIPROCKET_PASSWORD"] = prevPassword;
  else delete process.env["SHIPROCKET_PASSWORD"];
});

test("shiprocketLiveEnabled remains false by default in CI", () => {
  const prev = process.env["SHIPROCKET_LIVE_ENABLED"];
  delete process.env["SHIPROCKET_LIVE_ENABLED"];
  assert.equal(shiprocketLiveEnabled(), false);
  if (prev) process.env["SHIPROCKET_LIVE_ENABLED"] = prev;
});