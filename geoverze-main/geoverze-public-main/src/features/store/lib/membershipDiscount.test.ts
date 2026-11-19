import assert from "node:assert/strict";
import test from "node:test";

import {
  computeTaxMinor,
  computeOrderTotalMinor,
  GSTORE_STANDARD_TEE_PRICE_MINOR,
} from "./gstoreProductPrices.ts";
import {
  clampDiscountBps,
  computeMembershipDiscountMinor,
  membershipDiscountLabel,
} from "./membershipDiscount.ts";

test("Basic 3% and Pro 10% discounts apply once to GST-inclusive subtotal", () => {
  const subtotal = GSTORE_STANDARD_TEE_PRICE_MINOR;
  const basic = computeMembershipDiscountMinor(subtotal, 300);
  const pro = computeMembershipDiscountMinor(subtotal, 1000);
  assert.equal(basic, Math.round((subtotal * 300) / 10000));
  assert.equal(pro, Math.round((subtotal * 1000) / 10000));
  assert.equal(computeMembershipDiscountMinor(subtotal, 300), basic);
  assert.notEqual(basic + basic, computeMembershipDiscountMinor(subtotal, 300));
});

test("discount is never stacked from a client-supplied second percentage", () => {
  const subtotal = 549_900;
  const first = computeMembershipDiscountMinor(subtotal, 1000);
  const stacked = computeMembershipDiscountMinor(subtotal - first, 1000);
  assert.notEqual(first + stacked, first);
  assert.equal(computeMembershipDiscountMinor(subtotal, 1000), first);
});

test("GST is extracted from the discounted inclusive amount and not added again", () => {
  const subtotal = GSTORE_STANDARD_TEE_PRICE_MINOR;
  const shipping = 0;
  const discount = computeMembershipDiscountMinor(subtotal, 300);
  const discounted = subtotal - discount;
  const gst = computeTaxMinor(discounted, shipping);
  const total = computeOrderTotalMinor(subtotal, shipping, discount);
  assert.equal(total, discounted);
  assert.ok(gst > 0);
  assert.notEqual(total + gst, total);
});

test("zero and invalid basis points produce no discount", () => {
  assert.equal(clampDiscountBps(-3), 0);
  assert.equal(computeMembershipDiscountMinor(GSTORE_STANDARD_TEE_PRICE_MINOR, 0), 0);
  assert.equal(membershipDiscountLabel(300), "3% member discount");
  assert.equal(membershipDiscountLabel(1000), "10% member discount");
  assert.equal(membershipDiscountLabel(0), null);
});
