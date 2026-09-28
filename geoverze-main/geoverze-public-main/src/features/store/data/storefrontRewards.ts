/**
 * Visible GEOstore / Profile reward catalogue.
 *
 * Badges, frames and boosts remain in PRODUCTS and store_products for
 * existing entitlements and direct links — they are not listed here.
 */
import { productBySlug, type Product } from "./products";
import { categoryById, type StoreCategory } from "./taxonomy";

export const STOREFRONT_REWARD_SLUGS = [
  "iphone-duo",
  "ps5",
  "theme-deep-space",
  "theme-sandstone",
  "avatar-navigator",
  "avatar-astronomer",
] as const;

export type StorefrontRewardSlug = (typeof STOREFRONT_REWARD_SLUGS)[number];

export const STOREFRONT_REWARD_CATEGORY_IDS = ["prizes", "themes", "avatars"] as const;

export type StorefrontRewardCategoryId = (typeof STOREFRONT_REWARD_CATEGORY_IDS)[number];

export function isStorefrontRewardSlug(slug: string): slug is StorefrontRewardSlug {
  return (STOREFRONT_REWARD_SLUGS as readonly string[]).includes(slug);
}

export function isStorefrontRewardCategory(id: string): id is StorefrontRewardCategoryId {
  return (STOREFRONT_REWARD_CATEGORY_IDS as readonly string[]).includes(id);
}

export type StorefrontRewardGroup<T extends Product> = {
  category: StoreCategory;
  products: T[];
};

/** Groups listed rewards by category, categories ordered by highest credit cost. */
export function groupStorefrontRewards<T extends Product>(
  products: readonly T[],
): StorefrontRewardGroup<T>[] {
  const listed = products.filter((product) => isStorefrontRewardSlug(product.slug));

  const ranked = STOREFRONT_REWARD_CATEGORY_IDS.map((id) => {
    const inCategory = listed
      .filter((product) => product.category === id)
      .sort((a, b) => (b.credits ?? 0) - (a.credits ?? 0));
    const maxCredits = inCategory.reduce((max, product) => Math.max(max, product.credits ?? 0), 0);
    return { id, inCategory, maxCredits };
  })
    .filter((group) => group.inCategory.length > 0)
    .sort((a, b) => b.maxCredits - a.maxCredits);

  return ranked.flatMap((group) => {
    const category = categoryById(group.id);
    return category ? [{ category, products: group.inCategory }] : [];
  });
}

/** Static rows to merge when a listed reward is not yet in store_products. */
export function staticStorefrontRewardProducts(): Product[] {
  return STOREFRONT_REWARD_SLUGS.map(productBySlug).filter((product): product is Product =>
    Boolean(product),
  );
}
