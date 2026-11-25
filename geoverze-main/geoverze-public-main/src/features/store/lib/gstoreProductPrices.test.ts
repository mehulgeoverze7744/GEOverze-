import assert from "node:assert/strict";
import test from "node:test";

import {
  computeOrderTotalMinor,
  computeShippingMinor,
  computeTaxMinor,
  FREE_SHIPPING_THRESHOLD_MINOR,
  getProductPrice,
  staticPresentationPriceMinor,
  GSTORE_BASICS_TEE_PRICE_MINOR,
  GSTORE_GST_RATE,
  GSTORE_PRIME_TEE_PRICE_MINOR,
} from "./gstoreProductPrices.ts";

const PRIME_SIGNATURE_SLUGS = [
  "midnight-black-tshirt",
  "cherry-blossom-tshirt",
  "golden-arc-tshirt",
  "orbit-tshirt",
  "new-age-tshirt",
  "ignite",
  "eden",
  "pace",
  "eclipse",
] as const;

const BASICS_SIGNATURE_SLUGS = ["vanta", "monogram", "earthform", "flux", "vertical"] as const;

test("PRIME storefront tees are ₹2,999 GST-inclusive", () => {
  for (const slug of PRIME_SIGNATURE_SLUGS) {
    const tee = getProductPrice(slug);
    assert.ok(tee, slug);
    assert.equal(tee.priceMinor, GSTORE_PRIME_TEE_PRICE_MINOR);
    assert.equal(tee.physical, true);
    assert.equal(tee.category, "tshirts");
  }
});

test("BASICS storefront tees are ₹2,699 GST-inclusive", () => {
  for (const slug of BASICS_SIGNATURE_SLUGS) {
    const tee = getProductPrice(slug);
    assert.ok(tee, slug);
    assert.equal(tee.priceMinor, GSTORE_BASICS_TEE_PRICE_MINOR);
    assert.equal(tee.physical, true);
    assert.equal(tee.category, "tshirts");
  }
});

test("GST is extracted from inclusive MRP and never added again", () => {
  const subtotal = GSTORE_PRIME_TEE_PRICE_MINOR;
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
  assert.equal(computeShippingMinor("standard", GSTORE_BASICS_TEE_PRICE_MINOR, true), 0);
  assert.equal(computeShippingMinor("tracked", GSTORE_BASICS_TEE_PRICE_MINOR, true), 69_000);
  assert.equal(computeShippingMinor("standard", GSTORE_BASICS_TEE_PRICE_MINOR, false), 0);
});

test("staticPresentationPriceMinor prefers authoritative catalogue over legacy paise", () => {
  assert.equal(
    staticPresentationPriceMinor("hoodie-every-point-has-a-story", 7_400),
    549_900,
  );
  assert.equal(staticPresentationPriceMinor("flag-sticker-pack", 120_000), 120_000);
  assert.equal(staticPresentationPriceMinor("explore-the-unknown", 8_200), null);
});