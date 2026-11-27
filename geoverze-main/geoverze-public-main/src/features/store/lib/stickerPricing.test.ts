import assert from "node:assert/strict";
import test from "node:test";

import type { Product } from "../data/products.ts";
import {
  GSTORE_STICKER_CREDITS,
  getProductPrice,
  getStickerCreditPrice,
} from "./gstoreProductPrices.ts";
import {
  STICKER_PAYMENT_CREDITS,
  STICKER_PAYMENT_OPTION_KEY,
  assertHomogeneousGstoreCheckout,
  creditsDueForStickerLines,
  formatStickerPdpPriceLabel,
  isShopableStickerSlug,
  toStickerCartLine,
} from "./stickerPricing.ts";

const STICKERS = [
  "different-by-default",
  "off-the-map",
  "main-character-energy",
  "the-random-archive",
] as const;

const stubSticker = (slug: (typeof STICKERS)[number]): Product =>
  ({
    id: slug,
    slug,
    name: slug,
    tagline: "",
    description: "",
    category: "stickers",
    group: "merch",
    price: 15_000,
    compareAt: null,
    credits: GSTORE_STICKER_CREDITS,
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

test("all four sticker collections expose ₹150 and 150 credits", () => {
  for (const slug of STICKERS) {
    assert.equal(isShopableStickerSlug(slug), true);
    assert.equal(getStickerCreditPrice(slug), GSTORE_STICKER_CREDITS);
    const row = getProductPrice(slug);
    assert.ok(row);
    assert.equal(row.priceMinor, 15_000);
    assert.equal(row.creditPrice, GSTORE_STICKER_CREDITS);
  }
  assert.match(formatStickerPdpPriceLabel(), /₹150/);
  assert.match(formatStickerPdpPriceLabel(), /150 CREDITS/);
});

test("sticker cart lines encode payment method in options and line totals", () => {
  const product = stubSticker("different-by-default");

  const inrLine = toStickerCartLine(product, {}, 2, "inr");
  assert.equal(inrLine.unitAmount, 15_000);
  assert.equal(inrLine.unitCredits, null);
  assert.equal(inrLine.options[STICKER_PAYMENT_OPTION_KEY], "INR");

  const creditLine = toStickerCartLine(product, {}, 2, "credits");
  assert.equal(creditLine.unitAmount, null);
  assert.equal(creditLine.unitCredits, GSTORE_STICKER_CREDITS);
  assert.equal(creditLine.options[STICKER_PAYMENT_OPTION_KEY], STICKER_PAYMENT_CREDITS);
  assert.equal(creditsDueForStickerLines([creditLine]), GSTORE_STICKER_CREDITS * 2);
});

test("checkout rejects mixed INR and credits sticker lines", () => {
  const product = stubSticker("off-the-map");
  const inr = toStickerCartLine(product, {}, 1, "inr");
  const credits = toStickerCartLine(product, {}, 1, "credits");
  assert.throws(() => assertHomogeneousGstoreCheckout([inr, credits]), /Mixed/);
  assert.doesNotThrow(() => assertHomogeneousGstoreCheckout([inr]));
  assert.doesNotThrow(() => assertHomogeneousGstoreCheckout([credits]));
});