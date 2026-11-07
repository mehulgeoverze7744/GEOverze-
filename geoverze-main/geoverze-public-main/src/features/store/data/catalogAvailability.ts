/**
 * Gstore catalogue availability — one place for retired SKUs, lookbook
 * (Coming Soon) categories, and purchase locks.
 *
 * Records stay in the catalogue so lookbook items can be restored later.
 * Retired SKUs stay in data for historical orders but are removed from every
 * public surface (browse, search, related, PDPs, checkout).
 */
import type { StoreCategoryId } from "./taxonomy";

/** Permanently removed from the live Gstore — no listings, search, or PDPs. */
export const RETIRED_PRODUCT_SLUGS = new Set([
  "flag-sticker-pack",
  "continent-sticker-set",
]);

/**
 * Live sticker packs. They are merchandised on the Accessories shelf and
 * priced under `accessories`, but they stay shoppable.
 */
export const ACCESSORIES_STICKER_SLUGS = [
  "vintage-expedition-sticker-collection",
  "the-explorers-trail",
  "beyond-the-horizon",
  "the-atlas-archive",
  "the-cartographers-collection",
] as const;

export const SHOPPABLE_STICKER_SLUGS = new Set<string>(ACCESSORIES_STICKER_SLUGS);

/**
 * Accessory merch that is lookbook-only (blurred Coming Soon).
 * Stickers use category `stickers`, so they stay shoppable.
 * Hoodies are tracked separately so their existing Coming Soon page is unchanged.
 */
export const ACCESSORY_LOOKBOOK_CATEGORY_IDS: ReadonlySet<StoreCategoryId> = new Set([
  "accessories",
  "caps",
  "mugs",
  "posters",
]);

export const LOOKBOOK_CATEGORY_IDS: ReadonlySet<StoreCategoryId> = new Set([
  "hoodies",
  ...ACCESSORY_LOOKBOOK_CATEGORY_IDS,
]);

/** Individual accessory SKUs kept in the catalogue as Coming Soon lookbook. */
export const LOOKBOOK_PRODUCT_SLUGS = new Set([
  "crystal-earth-globe",
  "vintage-world-globe",
  "blue-ocean-globe",
  "field-notebook",
  "desk-globe-mini",
]);

/** Back-compat alias used by accessories merchandising. */
export const ACCESSORIES_LOOKBOOK_SLUGS = LOOKBOOK_PRODUCT_SLUGS;

export function isRetiredProductSlug(slug: string): boolean {
  return RETIRED_PRODUCT_SLUGS.has(slug);
}

export function isShopableStickerSlug(slug: string): boolean {
  return SHOPPABLE_STICKER_SLUGS.has(slug);
}

export function isLookbookCategory(category: string): boolean {
  return LOOKBOOK_CATEGORY_IDS.has(category as StoreCategoryId);
}

export function isAccessoryLookbookCategory(category: string): boolean {
  return ACCESSORY_LOOKBOOK_CATEGORY_IDS.has(category as StoreCategoryId);
}

export function isAccessoriesLookbook(slug: string): boolean {
  return LOOKBOOK_PRODUCT_SLUGS.has(slug);
}

export function isLookbookProduct(product: {
  slug: string;
  category: string;
  comingSoon?: boolean;
}): boolean {
  if (isRetiredProductSlug(product.slug)) return false;
  if (isShopableStickerSlug(product.slug) || product.category === "stickers") {
    return Boolean(product.comingSoon);
  }
  if (product.comingSoon) return true;
  if (isLookbookCategory(product.category)) return true;
  return LOOKBOOK_PRODUCT_SLUGS.has(product.slug);
}

export function isPurchaseLockedProduct(product: {
  slug: string;
  category: string;
  comingSoon?: boolean;
}): boolean {
  return isRetiredProductSlug(product.slug) || isLookbookProduct(product);
}

/**
 * Checkout / cart eligibility.
 *
 * Price-catalog categories are not always the same as Product.category
 * (live stickers are priced under `accessories`), so stickers are allowed
 * by slug before accessory lookbook categories are locked.
 */
export function isSlugAvailableForSale(slug: string, priceCategory?: string): boolean {
  if (isRetiredProductSlug(slug)) return false;
  if (isShopableStickerSlug(slug)) return true;
  if (LOOKBOOK_PRODUCT_SLUGS.has(slug)) return false;
  if (priceCategory && isLookbookCategory(priceCategory)) return false;
  return true;
}

export function isCartLinePurchaseLocked(line: { slug: string; category: string }): boolean {
  if (isRetiredProductSlug(line.slug)) return true;
  if (isShopableStickerSlug(line.slug)) return false;
  if (LOOKBOOK_PRODUCT_SLUGS.has(line.slug)) return true;
  return isLookbookCategory(line.category);
}
