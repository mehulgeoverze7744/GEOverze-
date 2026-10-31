/**
 * Try-On Studio product catalogue helpers.
 *
 * Only wearable apparel (T-shirts and Hoodies) can be virtually tried-on.
 * Non-apparel (mugs, stickers, digital packs, rewards…) are excluded.
 */
import { productImageForSlug } from "../data/productImages";
import { PRODUCTS, type Product } from "../data/products";

/** Categories eligible for virtual try-on. */
export const TRY_ON_CATEGORY_IDS = ["tshirts", "hoodies"] as const;
export type TryOnCategoryId = (typeof TRY_ON_CATEGORY_IDS)[number];

export const TRY_ON_CATEGORY_LABELS: Record<TryOnCategoryId, string> = {
  tshirts: "T-Shirts",
  hoodies: "Hoodies",
};

/** Returns all apparel products eligible for the Try-On Studio. */
export function getTryOnProducts(): readonly Product[] {
  return PRODUCTS.filter(
    (p) =>
      (TRY_ON_CATEGORY_IDS as readonly string[]).includes(p.category) &&
      !p.comingSoon,
  );
}

/** Returns the best available image URL for a product in the try-on panel. */
export function tryOnProductImageUrl(product: Product): string {
  const img = productImageForSlug(product.slug);
  return img?.src ?? "";
}

/** Returns the best available image alt text for a product. */
export function tryOnProductImageAlt(product: Product): string {
  const img = productImageForSlug(product.slug);
  return img?.alt ?? `${product.name} product photo`;
}

/** Format product price for display (minor units → "$37.00"). */
export function formatTryOnPrice(product: Product): string {
  if (product.price !== null) {
    return `$${(product.price / 100).toFixed(2)}`;
  }
  if (product.credits !== null) {
    return `${product.credits} credits`;
  }
  return "—";
}
