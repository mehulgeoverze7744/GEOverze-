/** Slugs seeded in production store_products (credit-only digital rewards). */
export const PRODUCTION_REWARD_SLUGS = [
  "avatar-navigator",
  "avatar-astronomer",
  "badge-continental-sweep",
  "badge-streak-keeper",
  "frame-bronze-meridian",
  "frame-obsidian-edge",
  "theme-deep-space",
  "theme-sandstone",
  "boost-double-xp",
] as const;

const PRODUCTION_REWARD_SLUG_SET = new Set<string>(PRODUCTION_REWARD_SLUGS);

export function isProductionRewardSlug(slug: string): boolean {
  return PRODUCTION_REWARD_SLUG_SET.has(slug);
}

/** Purchasable non-consumable rewards (boost excluded). */
export function isPurchasableRewardSlug(slug: string): boolean {
  return isProductionRewardSlug(slug) && slug !== "boost-double-xp";
}
