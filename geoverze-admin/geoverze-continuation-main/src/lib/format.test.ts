import { describe, expect, it } from "vitest";

import { formatCredits, money, moneyCatalogRupees, moneyMinor } from "./format";

describe("admin currency formatters", () => {
  it("formats INR major units", () => {
    expect(money(2999)).toMatch(/₹.*2,?999/);
    expect(money(99)).toMatch(/₹.*99/);
  });

  it("formats INR minor units (paise)", () => {
    expect(moneyMinor(299_900)).toMatch(/₹.*2,?999/);
    expect(moneyMinor(9_900)).toMatch(/₹.*99/);
  });

  it("formats subscription catalog rupees without dividing again", () => {
    expect(moneyCatalogRupees(499)).toMatch(/₹.*499/);
  });

  it("does not format credits as currency", () => {
    expect(formatCredits(120)).toBe("120 credits");
    expect(formatCredits(1)).toBe("1 credit");
  });
});