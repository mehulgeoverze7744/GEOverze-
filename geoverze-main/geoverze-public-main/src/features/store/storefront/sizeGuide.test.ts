import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  checkoutSizeForProduct,
  isSelectableTshirtSize,
  rowsForSizes,
  sizeGuideKindForCategory,
  tshirtSizesFrom,
} from "./sizeGuide.ts";

describe("sizeGuide", () => {
  it("maps category slugs", () => {
    assert.equal(sizeGuideKindForCategory("hoodies"), "hoodies");
    assert.equal(sizeGuideKindForCategory("tshirts"), "tshirts");
    assert.equal(sizeGuideKindForCategory("accessories"), "apparel");
  });

  it("filters rows to available sizes without inventing extras", () => {
    const rows = rowsForSizes(["S", "M", "L"]);
    assert.deepEqual(
      rows.map((row) => row.size),
      ["S", "M", "L"],
    );
  });

  it("drops XS and XXL from T-shirt selectors", () => {
    assert.equal(isSelectableTshirtSize("XS"), false);
    assert.equal(isSelectableTshirtSize("XXL"), false);
    assert.deepEqual(tshirtSizesFrom(["XS", "S", "M", "L", "XL", "XXL"]), [
      "S",
      "M",
      "L",
      "XL",
    ]);
  });

  it("blocks XS/XXL on T-shirt checkout but keeps hoodie sizes", () => {
    assert.equal(checkoutSizeForProduct("tshirts", "XS"), undefined);
    assert.equal(checkoutSizeForProduct("tshirts", "XXL"), undefined);
    assert.equal(checkoutSizeForProduct("tshirts", "M"), "M");
    assert.equal(checkoutSizeForProduct("hoodies", "XXL"), "XXL");
  });
});
