import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { rowsForSizes, sizeGuideKindForCategory } from "./sizeGuide.ts";

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
});
