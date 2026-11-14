/**
 * GVRZE apparel size mapping.
 *
 * The catalogue only defines size labels (XS–XXL). There is no factory
 * measurement table in the repo, so this guide is a labelled size-mapping
 * reference — not a claimed garment spec.
 */

export const APPAREL_SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"] as const;

export type ApparelSizeId = (typeof APPAREL_SIZE_ORDER)[number];

export type SizeGuideRow = {
  size: ApparelSizeId;
  fit: string;
  note: string;
};

export const APPAREL_SIZE_GUIDE: readonly SizeGuideRow[] = [
  { size: "XS", fit: "Extra small", note: "Closest, shortest unisex fit." },
  { size: "S", fit: "Small", note: "Standard small — usual starting size." },
  { size: "M", fit: "Medium", note: "Regular unisex mid size." },
  { size: "L", fit: "Large", note: "Roomier chest and length." },
  { size: "XL", fit: "Extra large", note: "Relaxed oversized starting point." },
  { size: "XXL", fit: "2X large", note: "Most generous chest and length." },
];

export type SizeGuideKind = "tshirts" | "hoodies" | "sweatshirts" | "apparel";

export function sizeGuideKindForCategory(categorySlug: string): SizeGuideKind {
  if (categorySlug === "hoodies") return "hoodies";
  if (categorySlug === "sweatshirts") return "sweatshirts";
  if (categorySlug === "tshirts") return "tshirts";
  return "apparel";
}

export function sizeGuideTitle(kind: SizeGuideKind): string {
  if (kind === "hoodies") return "Hoodie size guide";
  if (kind === "sweatshirts") return "Sweatshirt size guide";
  if (kind === "tshirts") return "T-shirt size guide";
  return "Apparel size guide";
}

export function rowsForSizes(available: readonly string[]): SizeGuideRow[] {
  const wanted = new Set(available.map((s) => s.toUpperCase()));
  const filtered = APPAREL_SIZE_GUIDE.filter((row) => wanted.has(row.size));
  return filtered.length > 0 ? [...filtered] : [...APPAREL_SIZE_GUIDE];
}
