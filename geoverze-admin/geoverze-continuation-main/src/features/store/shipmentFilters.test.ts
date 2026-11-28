import { describe, expect, it } from "vitest";

import {
  deriveShipmentFilterBucket,
  formatGstoreShipmentStatusForAdmin,
  matchesShipmentFilter,
} from "./shipmentFilters";

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

  it("marks paid orders without shipment as awaiting_shipment", () => {
    expect(
      deriveShipmentFilterBucket({
        payment_status: "paid",
        shipment_status: "none",
        logistics_incomplete: false,
      }),
    ).toBe("awaiting_shipment");
  });
});

describe("formatGstoreShipmentStatusForAdmin", () => {
  it("GV-10032 paid without shipment shows preparing copy", () => {
    expect(
      formatGstoreShipmentStatusForAdmin({
        paymentStatus: "paid",
        shipmentStatus: "none",
        trackingAvailable: false,
        awb: null,
      }),
    ).toBe("Paid — preparing shipment");
  });

  it("shows tracking available when flag set", () => {
    expect(
      formatGstoreShipmentStatusForAdmin({
        paymentStatus: "paid",
        shipmentStatus: "in_transit",
        trackingAvailable: true,
        awb: "123",
      }),
    ).toBe("Tracking available");
  });
});

describe("matchesShipmentFilter", () => {
  it("respects bucket", () => {
    expect(matchesShipmentFilter("shipment_failed", "shipment_failed")).toBe(true);
    expect(matchesShipmentFilter("delivered", "shipment_failed")).toBe(false);
    expect(matchesShipmentFilter("delivered", "all")).toBe(true);
  });
});