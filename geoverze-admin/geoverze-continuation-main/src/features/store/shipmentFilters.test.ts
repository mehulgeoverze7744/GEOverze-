import { describe, expect, it } from "vitest";

import { deriveShipmentFilterBucket, matchesShipmentFilter } from "./shipmentFilters";

describe("deriveShipmentFilterBucket", () => {
  it("flags logistics incomplete paid orders", () => {
    expect(
      deriveShipmentFilterBucket({
        payment_status: "paid",
        shipment_status: "none",
        logistics_incomplete: true,
      }),
    ).toBe("logistics_incomplete");
  });

  it("does not mark unpaid orders as awaiting shipment", () => {
    expect(
      deriveShipmentFilterBucket({
        payment_status: "pending",
        shipment_status: "none",
        logistics_incomplete: false,
      }),
    ).toBe("all");
  });
});

describe("matchesShipmentFilter", () => {
  it("respects bucket", () => {
    expect(matchesShipmentFilter("shipment_failed", "shipment_failed")).toBe(true);
    expect(matchesShipmentFilter("delivered", "shipment_failed")).toBe(false);
    expect(matchesShipmentFilter("delivered", "all")).toBe(true);
  });
});