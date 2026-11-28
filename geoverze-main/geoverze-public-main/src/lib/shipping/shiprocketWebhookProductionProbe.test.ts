import assert from "node:assert/strict";
import test from "node:test";

import { handleShiprocketWebhookRequest } from "./shiprocketWebhookHandler.server.ts";
import { SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS } from "./shiprocketWebhookPayload.server.ts";

/**
 * Regression: Shiprocket dashboard test (~700B) uses doc identifiers with partial scans and
 * string status ids. Before the fix this skipped connectivity probes and returned 503
 * service_client_unavailable in under a few milliseconds.
 */
test("shiprocket dashboard probe payload returns 200 without database", async () => {
  const prevToken = process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  const prevUrl = process.env["SUPABASE_URL"];
  const prevKey = process.env["SUPABASE_SERVICE_ROLE_KEY"];

  process.env["SHIPROCKET_WEBHOOK_TOKEN"] = "expected-token";
  delete process.env["SUPABASE_URL"];
  delete process.env["SUPABASE_SERVICE_ROLE_KEY"];

  const scan = {
    activity: "Delivered",
    date: "2023-05-23 11:43:52",
    location: "MUMBAI",
    status: "Delivered",
  };

  const envelope = {
    awb: Number(SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.awb),
    order_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.order_id,
    current_status: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.current_status,
    current_status_id: "7",
    shipment_status: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.shipment_status,
    shipment_status_id: "7",
    current_timestamp: "23 05 2023 11:43:52",
    channel_order_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.channel_order_id,
    channel: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.channel,
    courier_name: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.courier_name,
    etd: "2023-05-25",
    scans: Array.from({ length: 4 }, () => scan),
  };

  const rawBody = JSON.stringify(envelope);
  assert.ok(
    Buffer.byteLength(rawBody) >= 680 && Buffer.byteLength(rawBody) <= 760,
    `expected dashboard-sized body, got ${Buffer.byteLength(rawBody)}`,
  );

  const res = await handleShiprocketWebhookRequest({
    rawBody,
    headers: { token: "expected-token" },
  });

  assert.equal(res.status, 200);
  assert.equal(res.body.ok, true);
  assert.equal(res.body.test, true);
  assert.equal(res.ackCategory, "downloaded_sample");

  if (prevToken) process.env["SHIPROCKET_WEBHOOK_TOKEN"] = prevToken;
  else delete process.env["SHIPROCKET_WEBHOOK_TOKEN"];
  if (prevUrl) process.env["SUPABASE_URL"] = prevUrl;
  if (prevKey) process.env["SUPABASE_SERVICE_ROLE_KEY"] = prevKey;
});