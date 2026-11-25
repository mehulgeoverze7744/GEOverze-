import assert from "node:assert/strict";
import test from "node:test";

import {
  verifyShiprocketWebhook,
  verifyShiprocketWebhookToken,
} from "./shiprocketWebhookVerify.server.ts";

test("verifyShiprocketWebhookToken rejects missing secret", () => {
  const prev = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  assert.equal(verifyShiprocketWebhookToken("token"), false);
  if (prev) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prev;
});

test("verifyShiprocketWebhook accepts matching token header", () => {
  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "shared-secret";
  assert.equal(
    verifyShiprocketWebhook("{}", { token: "shared-secret" }),
    true,
  );
  assert.equal(verifyShiprocketWebhook("{}", { token: "wrong" }), false);
});