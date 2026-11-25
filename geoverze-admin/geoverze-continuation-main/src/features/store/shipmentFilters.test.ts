import assert from "node:assert/strict";
import test from "node:test";

import { deriveShipmentFilterBucket, matchesShipmentFilter } from "./shipmentFilters.ts";

test("deriveShipmentFilterBucket flags logistics incomplete paid orders", () => {
  assert.equal(
    deriveShipmentFilterBucket({
      payment_status: "paid",
      shipment_status: "none",
      logistics_incomplete: true,
    }),
    "logistics_incomplete",
  );
});

test("unpaid orders awaiting shipment filter only when paid", () => {
  assert.equal(
    deriveShipmentFilterBucket({
      payment_status: "pending",
      shipment_status: "none",
      logistics_incomplete: false,
    }),
    "all",
  );
});

test("matchesShipmentFilter respects bucket", () => {
  assert.equal(matchesShipmentFilter("shipment_failed", "shipment_failed"), true);
  assert.equal(matchesShipmentFilter("delivered", "shipment_failed"), false);
  assert.equal(matchesShipmentFilter("delivered", "all"), true);
});