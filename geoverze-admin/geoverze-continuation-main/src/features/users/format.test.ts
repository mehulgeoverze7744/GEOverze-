import { describe, expect, it } from "vitest";

import { dateSortKey, formatDate, formatDateTime, parseIsoDate } from "./format";

describe("parseIsoDate", () => {
  it("accepts valid ISO timestamps", () => {
    const date = parseIsoDate("2025-03-15T08:30:00.000Z");
    expect(date).not.toBeNull();
    expect(date!.toISOString()).toBe("2025-03-15T08:30:00.000Z");
  });

  it("returns null for null, undefined, and empty string", () => {
    expect(parseIsoDate(null)).toBeNull();
    expect(parseIsoDate(undefined)).toBeNull();
    expect(parseIsoDate("")).toBeNull();
    expect(parseIsoDate("   ")).toBeNull();
  });

  it("returns null for malformed timestamps", () => {
    expect(parseIsoDate("not-a-date")).toBeNull();
    expect(parseIsoDate("2025-13-40")).toBeNull();
  });

  it("returns null for invalid Date objects", () => {
    expect(parseIsoDate(new Date("invalid"))).toBeNull();
  });
});

describe("formatDate", () => {
  it("formats valid ISO timestamps with en-IN locale", () => {
    expect(formatDate("2025-03-15T08:30:00.000Z")).toMatch(/15/);
    expect(formatDate("2025-03-15T08:30:00.000Z")).not.toBe("—");
  });

  it("returns em dash for null, undefined, empty, and malformed values", () => {
    expect(formatDate(null)).toBe("—");
    expect(formatDate(undefined)).toBe("—");
    expect(formatDate("")).toBe("—");
    expect(formatDate("garbage")).toBe("—");
    expect(formatDate(new Date("invalid"))).toBe("—");
  });

  it("does not throw when formatting many invalid rows", () => {
    const values = [null, "", undefined, "bad", "2025-01-01T00:00:00Z"] as const;
    expect(() => values.map((v) => formatDate(v))).not.toThrow();
    expect(formatDate("2025-01-01T00:00:00Z")).not.toBe("—");
  });
});

describe("formatDateTime", () => {
  it("formats valid values and falls back safely", () => {
    expect(formatDateTime("2025-03-15T08:30:00.000Z")).toContain("UTC");
    expect(formatDateTime("")).toBe("—");
  });
});

describe("dateSortKey", () => {
  it("sorts valid dates numerically and uses 0 for missing expiry", () => {
    const valid = dateSortKey("2025-06-01T00:00:00.000Z");
    const missing = dateSortKey("");
    expect(valid).toBeGreaterThan(missing);
    expect(missing).toBe(0);
  });
});