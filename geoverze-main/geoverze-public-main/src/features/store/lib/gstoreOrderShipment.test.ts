import assert from "node:assert/strict";
import test from "node:test";

import { buildGstoreShippingCustomerView } from "./gstoreOrderShipment.ts";

test("paid order without shipment shows preparing state", () => {
  const view = buildGstoreShippingCustomerView({
    payment_status: "paid",
    order_status: "confirmed",
    tracking_number: null,
    shipment: null,
  });
  assert.equal(view.showTrackButton, false);
  assert.match(view.headline, /Preparing/i);
});

test("GV-10032: paid order with shipment row but no AWB shows preparation in progress", () => {
  const view = buildGstoreShippingCustomerView({
    payment_status: "paid",
    order_status: "confirmed",
    tracking_number: null,
    shipment: {
      awb: null,
      courier_name: null,
      tracking_url: null,
      shipment_status: "pending",
    },
  });
  assert.equal(view.showTrackButton, false);
  assert.equal(view.headline, "Shipment preparation in progress");
});

test("paid order with AWB but no tracking URL does not invent a link", () => {
  const view = buildGstoreShippingCustomerView({
    payment_status: "paid",
    order_status: "confirmed",
    tracking_number: null,
    shipment: {
      awb: "123456789",
      courier_name: "Delhivery",
      tracking_url: null,
      shipment_status: "in_transit",
    },
  });
  assert.equal(view.showTrackButton, false);
  assert.equal(view.trackingUrl, null);
  assert.equal(view.awbLabel, "123456789");
});

test("shipment with valid tracking URL enables Track My Order", () => {
  const view = buildGstoreShippingCustomerView({
    payment_status: "paid",
    order_status: "shipped",
    tracking_number: null,
    shipment: {
      awb: "123456789",
      courier_name: "Delhivery",
      tracking_url: "https://track.carrier.example/awb/123",
      shipment_status: "in_transit",
    },
  });
  assert.equal(view.showTrackButton, true);
  assert.equal(view.trackingUrl, "https://track.carrier.example/awb/123");
});

test("rejects non-http tracking_url values", () => {
  const view = buildGstoreShippingCustomerView({
    payment_status: "paid",
    order_status: "shipped",
    tracking_number: null,
    shipment: {
      awb: "1",
      courier_name: "X",
      tracking_url: "javascript:alert(1)",
      shipment_status: "in_transit",
    },
  });
  assert.equal(view.showTrackButton, false);
  assert.equal(view.trackingUrl, null);
});