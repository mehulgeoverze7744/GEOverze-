import assert from "node:assert/strict";
import test from "node:test";

import type { Product } from "../data/products.ts";
import {
  GSTORE_BASICS_TEE_CREDITS,
  GSTORE_BASICS_TEE_PRICE_MINOR,
  GSTORE_PRIME_TEE_CREDITS,
  GSTORE_PRIME_TEE_PRICE_MINOR,
  GSTORE_STICKER_CREDITS,
  resolveGstoreCreditPrice,
} from "./gstoreProductPrices.ts";
import {
  GSTORE_PAYMENT_CREDITS,
  GSTORE_PAYMENT_OPTION_KEY,
  assertHomogeneousGstoreCheckout,
  creditsDueForGstoreCreditLines,
  formatDualPriceShort,
  productSupportsDualPayment,
  toGstoreDualPaymentCartLine,
} from "./gstoreDualPricing.ts";

const stubHybrid = (
  slug: string,
  priceMinor: number,
  credits: number,
  category: Product["category"] = "stickers",
): Product =>
  ({
    id: slug,
    slug,
    name: slug,
    tagline: "",
    description: "",
    category,
    group: "merch",
    price: priceMinor,
    compareAt: null,
    credits,
    mode: "hybrid",
    rating: 0,
    reviews: 0,
    popularity: 0,
    stock: "in-stock",
    releasedAt: "",
    limited: false,
    featured: false,
    bestSeller: false,
    options: [],
    features: [],
    specs: [],
    tags: [],
    comingSoon: false,
  }) as Product;

test("signature tees and stickers resolve server credit prices", () => {
  assert.equal(resolveGstoreCreditPrice("different-by-default"), GSTORE_STICKER_CREDITS);
  assert.equal(resolveGstoreCreditPrice("vanta"), GSTORE_BASICS_TEE_CREDITS);
  assert.equal(resolveGstoreCreditPrice("eclipse"), GSTORE_PRIME_TEE_CREDITS);
  assert.equal(resolveGstoreCreditPrice("meridian-tee"), null);
});

test("dual payment cart lines encode payment method and totals", () => {
  const sticker = stubHybrid("different-by-default", 15_000, GSTORE_STICKER_CREDITS);
  const inrLine = toGstoreDualPaymentCartLine(sticker, {}, 2, "inr");
  assert.equal(inrLine.unitAmount, 15_000);
  assert.equal(inrLine.options[GSTORE_PAYMENT_OPTION_KEY], "INR");

  const creditLine = toGstoreDualPaymentCartLine(sticker, {}, 2, "credits");
  assert.equal(creditLine.unitCredits, GSTORE_STICKER_CREDITS);
  assert.equal(creditLine.options[GSTORE_PAYMENT_OPTION_KEY], GSTORE_PAYMENT_CREDITS);
  assert.equal(creditsDueForGstoreCreditLines([creditLine]), GSTORE_STICKER_CREDITS * 2);
});

test("storefront basics tee supports dual payment UI", () => {
  const tee = stubHybrid("vanta", GSTORE_BASICS_TEE_PRICE_MINOR, GSTORE_BASICS_TEE_CREDITS, "tshirts");
  assert.equal(productSupportsDualPayment(tee), true);
  assert.match(
    formatDualPriceShort(GSTORE_BASICS_TEE_PRICE_MINOR, GSTORE_BASICS_TEE_CREDITS),
    /CREDITS/,
  );
});

test("checkout rejects mixed INR and credit hybrid lines", () => {
  const product = stubHybrid("off-the-map", 15_000, GSTORE_STICKER_CREDITS);
  const inr = toGstoreDualPaymentCartLine(product, {}, 1, "inr");
  const credits = toGstoreDualPaymentCartLine(product, {}, 1, "credits");
  assert.throws(() => assertHomogeneousGstoreCheckout([inr, credits]), /Mixed/);
});