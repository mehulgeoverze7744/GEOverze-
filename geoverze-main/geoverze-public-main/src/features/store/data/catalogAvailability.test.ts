import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isLookbookProduct,
  isPurchaseLockedProduct,
  isRetiredProductSlug,
  isSlugAvailableForSale,
  RETIRED_PRODUCT_SLUGS,
} from "./catalogAvailability.ts";
import { STOREFRONT_TEES } from "../storefront/storefront-product-data.ts";

describe("Gstore catalog availability", () => {
  it("retires Flag Sticker Pack and Continent Sticker Set", () => {
    assert.equal(isRetiredProductSlug("flag-sticker-pack"), true);
    assert.equal(isRetiredProductSlug("continent-sticker-set"), true);
    assert.equal(RETIRED_PRODUCT_SLUGS.size, 2);
    assert.equal(isPurchaseLockedProduct({ slug: "flag-sticker-pack", category: "stickers" }), true);
    assert.equal(isSlugAvailableForSale("flag-sticker-pack", "accessories"), false);
    assert.equal(isSlugAvailableForSale("continent-sticker-set", "accessories"), false);
  });

  it("keeps remaining sticker packs purchasable", () => {
    for (const slug of [
      "vintage-expedition-sticker-collection",
      "the-explorers-trail",
      "beyond-the-horizon",
      "the-atlas-archive",
      "the-cartographers-collection",
    ]) {
      assert.equal(isRetiredProductSlug(slug), false);
      assert.equal(isLookbookProduct({ slug, category: "stickers" }), false);
      assert.equal(isPurchaseLockedProduct({ slug, category: "stickers" }), false);
      assert.equal(isSlugAvailableForSale(slug, "accessories"), true);
    }
    assert.equal(
      isLookbookProduct({ slug: "vintage-expedition-sticker-collection", category: "accessories" }),
      false,
    );
  });

  it("does not lock storefront T-shirts", () => {
    assert.ok(STOREFRONT_TEES.some((tee) => tee.id === "midnight-black-tshirt"));
    for (const tee of STOREFRONT_TEES) {
      assert.equal(isPurchaseLockedProduct({ slug: tee.id, category: "tshirts" }), false);
      assert.equal(isSlugAvailableForSale(tee.id, "tshirts"), true);
    }
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
