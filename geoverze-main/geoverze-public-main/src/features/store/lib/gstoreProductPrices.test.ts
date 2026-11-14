import assert from "node:assert/strict";
import test from "node:test";

import {
  computeOrderTotalMinor,
  computeShippingMinor,
  computeTaxMinor,
  FREE_SHIPPING_THRESHOLD_MINOR,
  getProductPrice,
  GSTORE_GST_RATE,
} from "./gstoreProductPrices.ts";

test("signature tees are ₹2,999 GST-inclusive", () => {
  const tee = getProductPrice("midnight-black-tshirt");
  assert.ok(tee);
  assert.equal(tee.priceMinor, 299_900);
});

test("GST is extracted from inclusive MRP and never added again", () => {
  const subtotal = 299_900;
  const shipping = 0;
  const gst = computeTaxMinor(subtotal, shipping);
  const expected = Math.round((subtotal * GSTORE_GST_RATE) / (1 + GSTORE_GST_RATE));
  assert.equal(gst, expected);
  assert.equal(computeOrderTotalMinor(subtotal, shipping), subtotal);
  assert.notEqual(
    computeOrderTotalMinor(subtotal, shipping) + gst,
    computeOrderTotalMinor(subtotal, shipping),
  );
});

test("standard shipping is free at or above ₹3,999", () => {
  assert.equal(computeShippingMinor("standard", FREE_SHIPPING_THRESHOLD_MINOR, true), 0);
  assert.equal(computeShippingMinor("standard", 299_900, true), 0);
  assert.equal(computeShippingMinor("tracked", 299_900, true), 69_000);
  assert.equal(computeShippingMinor("standard", 299_900, false), 0);
});
