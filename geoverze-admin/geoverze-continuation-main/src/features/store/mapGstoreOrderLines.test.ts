import { describe, expect, it } from "vitest";

import {
  groupGstoreOrderLinesByOrderId,
  mapGstoreOrderItemRow,
  type GstoreOrderItemRow,
} from "./mapGstoreOrderLines";

const GV_10032_ORDER_ID = "ad27ddec-b67d-457b-8962-698e2f4a2d45";

const bloomLine: GstoreOrderItemRow = {
  id: "item-bloom-1",
  order_id: GV_10032_ORDER_ID,
  product_slug: "bloom",
  product_name: "BLOOM",
  options: { Size: "S", Colour: "Cherry Blossom Pink" },
  quantity: 1,
  unit_price_minor: 299900,
};

describe("mapGstoreOrderItemRow", () => {
  it("maps GV-10032 BLOOM line with size and colour", () => {
    const line = mapGstoreOrderItemRow(bloomLine);
    expect(line.name).toBe("BLOOM");
    expect(line.quantity).toBe(1);
    expect(line.unitPrice).toBe(2999);
    expect(line.options).toEqual({ Size: "S", Colour: "Cherry Blossom Pink" });
  });
});

describe("groupGstoreOrderLinesByOrderId", () => {
  it("counts one item for GV-10032 UUID", () => {
    const map = groupGstoreOrderLinesByOrderId([bloomLine]);
    const lines = map.get(GV_10032_ORDER_ID) ?? [];
    expect(lines).toHaveLength(1);
    expect(lines.reduce((sum, l) => sum + l.quantity, 0)).toBe(1);
  });

  it("does not attach lines to unrelated order ids", () => {
    const map = groupGstoreOrderLinesByOrderId([bloomLine]);
    expect(map.get("other-order-id")).toBeUndefined();
  });
});