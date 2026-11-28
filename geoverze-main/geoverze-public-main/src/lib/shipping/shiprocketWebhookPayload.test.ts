import assert from "node:assert/strict";
import test from "node:test";

import {
  SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS,
  SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS,
  isShiprocketConnectivityProbe,
  isShiprocketDownloadedDocumentationSamplePayload,
  isShiprocketOfficialDocumentationDemoPayload,
  isShiprocketWebhookTestPayload,
  resolveShipmentLookup,
} from "./shiprocketWebhookPayload.server.ts";

const DOWNLOADED_SAMPLE_BODY = {
  awb: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.awb,
  order_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.order_id,
  current_status: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.current_status,
  current_status_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.current_status_id,
  shipment_status: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.shipment_status,
  shipment_status_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.shipment_status_id,
  channel_order_id: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.channel_order_id,
  channel: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.channel,
  courier_name: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.courier_name,
  scans: Array.from({ length: SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.scansLength }, () => ({})),
};

test("detects Shiprocket dashboard test body", () => {
  assert.equal(isShiprocketWebhookTestPayload({ test: true }), true);
  assert.equal(isShiprocketWebhookTestPayload({}), true);
});

test("does not treat official sample as explicit test payload", () => {
  assert.equal(
    isShiprocketWebhookTestPayload({
      awb: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.awb,
      current_status: "IN TRANSIT",
      sr_order_id: Number(SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.sr_order_id),
      order_id: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.order_id,
    }),
    false,
  );
  assert.equal(
    isShiprocketOfficialDocumentationDemoPayload({
      awb: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.awb,
      order_id: SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.order_id,
      sr_order_id: Number(SHIPROCKET_OFFICIAL_DOC_DEMO_IDENTIFIERS.sr_order_id),
    }),
    true,
  );
});

test("numeric awb is coerced for routing and connectivity probe", () => {
  const numericBody = {
    ...DOWNLOADED_SAMPLE_BODY,
    awb: Number(SHIPROCKET_DOWNLOADED_DOC_SAMPLE_IDENTIFIERS.awb),
  };
  assert.equal(isShiprocketConnectivityProbe(numericBody), true);
  assert.deepEqual(resolveShipmentLookup({ awb: 88223344556611 }), {
    kind: "awb",
    value: "88223344556611",
  });
  assert.equal(isShiprocketWebhookTestPayload({ awb: 59629792084, order_id: "x" }), false);
});

test("downloaded doc sample requires full identifying and placeholder fields", () => {
  assert.equal(isShiprocketDownloadedDocumentationSamplePayload(DOWNLOADED_SAMPLE_BODY), true);
  assert.equal(
    isShiprocketDownloadedDocumentationSamplePayload({
      ...DOWNLOADED_SAMPLE_BODY,
      courier_name: "Delhivery",
    }),
    false,
  );
  assert.equal(
    isShiprocketDownloadedDocumentationSamplePayload({
      ...DOWNLOADED_SAMPLE_BODY,
      scans: [],
    }),
    false,
  );
  assert.equal(
    isShiprocketDownloadedDocumentationSamplePayload({
      ...DOWNLOADED_SAMPLE_BODY,
      current_status_id: "7",
      shipment_status_id: "7",
      scans: Array.from({ length: 4 }, () => ({})),
    }),
    true,
  );
  assert.equal(isShiprocketWebhookTestPayload(DOWNLOADED_SAMPLE_BODY), false);
});

test("resolveShipmentLookup prefers awb then provider ids", () => {
  assert.deepEqual(resolveShipmentLookup({ awb: " AWB1 " }), { kind: "awb", value: "AWB1" });
  assert.deepEqual(resolveShipmentLookup({ sr_order_id: 99 }), {
    kind: "provider_shipment_id",
    value: "99",
  });
  assert.deepEqual(resolveShipmentLookup({ order_id: "1373900_150876814" }), {
    kind: "provider_order_id",
    value: "1373900_150876814",
  });
});