import assert from "node:assert/strict";
import test from "node:test";

import {
  evaluateShipmentEligibility,
  isValidIndiaPincode,
  orderRequiresPhysicalFulfillment,
} from "./shipmentEligibility.ts";

const physicalMap = new Map<string, boolean>([["tee-slug", true]]);

const paidOrder = {
  payment_status: "paid",
  order_status: "confirmed",
  shipping_pincode: "110001",
  shipping_line1: "12 Example St",
  shipping_city: "Delhi",
  shipping_state: "DL",
  shipping_country: "India",
};

test("unpaid order cannot create a shipment", () => {
  const result = evaluateShipmentEligibility({
    order: { ...paidOrder, payment_status: "pending" },
    lines: [{ product_slug: "tee-slug", quantity: 1 }],
    physicalBySlug: physicalMap,
    fulfillmentBySlug: new Map([
      [
        "tee-slug",
        {
          product_slug: "tee-slug",
          requires_shipping: true,
          logistics_ready: true,
          weight_g: 200,
          length_cm: 20,
          breadth_cm: 15,
          height_cm: 3,
        },
      ],
    ]),
    hasActiveShipment: false,
  });
  assert.equal(result.eligible, false);
  if (!result.eligible) assert.equal(result.code, "unpaid");
});

test("missing product dimensions block shipment", () => {
  const result = evaluateShipmentEligibility({
    order: paidOrder,
    lines: [{ product_slug: "tee-slug", quantity: 1 }],
    physicalBySlug: physicalMap,
    fulfillmentBySlug: new Map([
      [
        "tee-slug",
        {
          product_slug: "tee-slug",
          requires_shipping: true,
          logistics_ready: false,
          weight_g: null,
          length_cm: null,
          breadth_cm: null,
          height_cm: null,
        },
      ],
    ]),
    hasActiveShipment: false,
  });
  assert.equal(result.eligible, false);
  if (!result.eligible) assert.equal(result.code, "logistics_incomplete");
});

test("duplicate shipment blocked when active shipment exists", () => {
  const result = evaluateShipmentEligibility({
    order: paidOrder,
    lines: [{ product_slug: "tee-slug", quantity: 1 }],
    physicalBySlug: physicalMap,
    fulfillmentBySlug: new Map([
      [
        "tee-slug",
        {
          product_slug: "tee-slug",
          requires_shipping: true,
          logistics_ready: true,
          weight_g: 200,
          length_cm: 20,
          breadth_cm: 15,
          height_cm: 3,
        },
      ],
    ]),
    hasActiveShipment: true,
  });
  assert.equal(result.eligible, false);
  if (!result.eligible) assert.equal(result.code, "active_shipment_exists");
});

test("pincode validation accepts six-digit India pincodes", () => {
  assert.equal(isValidIndiaPincode("110001"), true);
  assert.equal(isValidIndiaPincode("11000"), false);
});

test("orderRequiresPhysicalFulfillment respects catalog flags", () => {
  const map = new Map([
    ["digital", false],
    ["tee", true],
  ]);
  assert.equal(
    orderRequiresPhysicalFulfillment([{ product_slug: "digital", quantity: 1 }], map),
    false,
  );
  assert.equal(
    orderRequiresPhysicalFulfillment([{ product_slug: "tee", quantity: 1 }], map),
    true,
  );
});