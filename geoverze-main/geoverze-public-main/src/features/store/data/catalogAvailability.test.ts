import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ACCESSORIES_STICKER_SLUGS,
  isLookbookProduct,
  isPurchaseLockedProduct,
  isRetiredProductSlug,
  isSlugAvailableForSale,
  isStorefrontUnlistedSlug,
  RETIRED_PRODUCT_SLUGS,
} from "./catalogAvailability.ts";
import { STOREFRONT_TEES } from "../storefront/storefront-product-data.ts";

describe("Gstore catalog availability", () => {
  it("retires legacy sticker packs and Midnight Black tee", () => {
    assert.equal(isRetiredProductSlug("flag-sticker-pack"), true);
    assert.equal(isRetiredProductSlug("continent-sticker-set"), true);
    assert.equal(isRetiredProductSlug("midnight-black-tshirt"), true);
    assert.equal(isRetiredProductSlug("vintage-expedition-sticker-collection"), true);
    assert.equal(isRetiredProductSlug("the-cartographers-collection"), true);
    assert.equal(RETIRED_PRODUCT_SLUGS.size, 8);
    assert.equal(isPurchaseLockedProduct({ slug: "flag-sticker-pack", category: "stickers" }), true);
    assert.equal(isSlugAvailableForSale("flag-sticker-pack", "accessories"), false);
    assert.equal(isSlugAvailableForSale("vintage-expedition-sticker-collection", "accessories"), false);
  });

  it("keeps live sticker collections purchasable on Accessories", () => {
    assert.deepEqual(ACCESSORIES_STICKER_SLUGS, [
      "different-by-default",
      "off-the-map",
      "main-character-energy",
      "the-random-archive",
    ]);
    for (const slug of ACCESSORIES_STICKER_SLUGS) {
      assert.equal(isRetiredProductSlug(slug), false);
      assert.equal(isLookbookProduct({ slug, category: "stickers" }), false);
      assert.equal(isPurchaseLockedProduct({ slug, category: "stickers" }), false);
      assert.equal(isSlugAvailableForSale(slug, "accessories"), true);
    }
  });

  it("does not lock storefront T-shirts", () => {
    assert.ok(STOREFRONT_TEES.every((tee) => tee.id !== "midnight-black-tshirt"));
    assert.ok(STOREFRONT_TEES.some((tee) => tee.id === "ignite"));
    assert.ok(STOREFRONT_TEES.some((tee) => tee.id === "eden"));
    assert.ok(STOREFRONT_TEES.some((tee) => tee.id === "orbit-tshirt"));
    assert.ok(STOREFRONT_TEES.some((tee) => tee.id === "pace"));
    assert.ok(STOREFRONT_TEES.some((tee) => tee.id === "eclipse"));
    for (const tee of STOREFRONT_TEES) {
      assert.equal(isPurchaseLockedProduct({ slug: tee.id, category: "tshirts" }), false);
      assert.equal(isSlugAvailableForSale(tee.id, "tshirts"), true);
    }
  });

  it("temporarily hides Atlas Encyclopedia and globe lookbook SKUs from storefront", () => {
    for (const slug of ["field-notebook", "crystal-earth-globe", "vintage-world-globe"]) {
      assert.equal(isStorefrontUnlistedSlug(slug), true);
      assert.equal(isSlugAvailableForSale(slug, "accessories"), false);
    }
    assert.equal(isStorefrontUnlistedSlug("blue-ocean-globe"), false);
  });

  it("locks hoodies and accessory merch as Coming Soon lookbook", () => {
    assert.equal(isLookbookProduct({ slug: "hoodie-every-point-has-a-story", category: "hoodies" }), true);
    assert.equal(isLookbookProduct({ slug: "crystal-earth-globe", category: "accessories" }), true);
    assert.equal(isLookbookProduct({ slug: "orbital-horizon-mug", category: "mugs" }), true);
    assert.equal(isLookbookProduct({ slug: "cartographer-cap", category: "caps" }), true);
    assert.equal(isLookbookProduct({ slug: "field-notebook", category: "accessories" }), true);
    assert.equal(isPurchaseLockedProduct({ slug: "hoodie-every-point-has-a-story", category: "hoodies" }), true);
    assert.equal(isPurchaseLockedProduct({ slug: "crystal-earth-globe", category: "accessories" }), true);
    assert.equal(isPurchaseLockedProduct({ slug: "orbital-horizon-mug", category: "mugs" }), true);
    assert.equal(isSlugAvailableForSale("hoodie-every-point-has-a-story", "hoodies"), false);
    assert.equal(isSlugAvailableForSale("crystal-earth-globe", "accessories"), false);
    assert.equal(isSlugAvailableForSale("orbital-horizon-mug", "accessories"), false);
    assert.equal(isSlugAvailableForSale("cartographer-cap", "caps"), false);
  });
});