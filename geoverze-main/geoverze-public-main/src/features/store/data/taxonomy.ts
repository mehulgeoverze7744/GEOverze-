/**
 * GEOstore taxonomy.
 *
 * One source of truth for groups, categories and facet options so the
 * storefront, browse filters and category shelves never drift apart.
 */
import {
  Award,
  BadgeCheck,
  BookOpen,
  Compass,
  Frame,
  Globe2,
  GraduationCap,
  Layers,
  type LucideIcon,
  Map,
  Package,
  Palette,
  Shirt,
  Sparkles,
  Sticker,
  Coffee,
  Crown,
  Zap,
} from "lucide-react";

export type StoreGroupId = "merch" | "digital" | "rewards" | "more";

export type StoreCategoryId =
  | "tshirts"
  | "hoodies"
  | "caps"
  | "mugs"
  | "stickers"
  | "posters"
  | "accessories"
  | "quiz-packs"
  | "learning-packs"
  | "country-collections"
  | "theme-packs"
  | "premium-resources"
  | "avatars"
  | "badges"
  | "frames"
  | "themes"
  | "boosts";

export type StoreGroup = {
  id: StoreGroupId;
  label: string;
  blurb: string;
  icon: LucideIcon;
};

export const STORE_GROUPS: readonly StoreGroup[] = [
  {
    id: "merch",
    label: "Merchandise",
    blurb: "Wearables and desk objects cut from the GEOverze material language.",
    icon: Package,
  },
  {
    id: "digital",
    label: "Digital products",
    blurb: "Question packs, atlases and study material that unlock instantly.",
    icon: Layers,
  },
  {
    id: "rewards",
    label: "Rewards",
    blurb: "Profile finishes and collectibles you can claim with credits.",
    icon: Sparkles,
  },
  {
    id: "more",
    label: "More coming",
    blurb: "Print editions, classroom kits and season drops are in production.",
    icon: Compass,
  },
] as const;

export type StoreCategory = {
  id: StoreCategoryId;
  label: string;
  group: StoreGroupId;
  blurb: string;
  icon: LucideIcon;
};

export const STORE_CATEGORIES: readonly StoreCategory[] = [
  {
    id: "tshirts",
    label: "T-shirts",
    group: "merch",
    blurb: "Heavyweight cotton, bronze prints.",
    icon: Shirt,
  },
  {
    id: "hoodies",
    label: "Hoodies",
    group: "merch",
    blurb: "Brushed fleece for long sessions.",
    icon: Shirt,
  },
  {
    id: "caps",
    label: "Caps",
    group: "merch",
    blurb: "Embroidered emblems, low profile.",
    icon: Crown,
  },
  {
    id: "mugs",
    label: "Mugs",
    group: "merch",
    blurb: "Enamel and ceramic, map glazed.",
    icon: Coffee,
  },
  {
    id: "stickers",
    label: "Stickers",
    group: "merch",
    blurb: "Die-cut vinyl, weatherproof.",
    icon: Sticker,
  },
  {
    id: "posters",
    label: "Posters",
    group: "merch",
    blurb: "Archival prints of the world.",
    icon: Map,
  },
  {
    id: "accessories",
    label: "Accessories",
    group: "merch",
    blurb: "Totes, pins and desk pieces.",
    icon: Package,
  },
  {
    id: "quiz-packs",
    label: "Quiz packs",
    group: "digital",
    blurb: "Curated question sets by theme.",
    icon: Globe2,
  },
  {
    id: "learning-packs",
    label: "Learning packs",
    group: "digital",
    blurb: "Guided study across a region.",
    icon: GraduationCap,
  },
  {
    id: "country-collections",
    label: "Country collections",
    group: "digital",
    blurb: "Everything about one nation.",
    icon: BookOpen,
  },
  {
    id: "theme-packs",
    label: "Theme packs",
    group: "digital",
    blurb: "Flags, rivers, capitals, climate.",
    icon: Layers,
  },
  {
    id: "premium-resources",
    label: "Premium resources",
    group: "digital",
    blurb: "Atlases, datasets and worksheets.",
    icon: Award,
  },
  {
    id: "avatars",
    label: "Avatars",
    group: "rewards",
    blurb: "Exclusive explorer portraits.",
    icon: BadgeCheck,
  },
  { id: "badges", label: "Badges", group: "rewards", blurb: "Display-only honours.", icon: Award },
  {
    id: "frames",
    label: "Profile frames",
    group: "rewards",
    blurb: "Metal finishes for your profile.",
    icon: Frame,
  },
  {
    id: "themes",
    label: "Special themes",
    group: "rewards",
    blurb: "Alternate interface palettes.",
    icon: Palette,
  },
  {
    id: "boosts",
    label: "Quiz boosts",
    group: "rewards",
    blurb: "Score multipliers — arriving soon.",
    icon: Zap,
  },
] as const;

export function categoryById(id: string): StoreCategory | undefined {
  return STORE_CATEGORIES.find((c) => c.id === id);
}

export function categoryLabel(id: string): string {
  return categoryById(id)?.label ?? "Store";
}

export function categoryIcon(id: string): LucideIcon {
  return categoryById(id)?.icon ?? Package;
}

export function categoriesInGroup(group: StoreGroupId): readonly StoreCategory[] {
  return STORE_CATEGORIES.filter((c) => c.group === group);
}

/** Browse facets. `all` is always prepended by the UI. */
export const PRICE_BANDS = [
  { id: "under-15", label: "Under $15", min: 0, max: 1_500 },
  { id: "15-35", label: "$15 – $35", min: 1_500, max: 3_500 },
  { id: "35-75", label: "$35 – $75", min: 3_500, max: 7_500 },
  { id: "75-plus", label: "$75+", min: 7_500, max: Number.POSITIVE_INFINITY },
] as const;

export type PriceBandId = (typeof PRICE_BANDS)[number]["id"];

export const CREDIT_FILTERS = [
  { id: "credits-accepted", label: "Credits accepted" },
  { id: "credits-only", label: "Credits only" },
  { id: "affordable", label: "Within my credits" },
] as const;

export type CreditFilterId = (typeof CREDIT_FILTERS)[number]["id"];

export const AVAILABILITY = [
  { id: "in-stock", label: "In stock" },
  { id: "low", label: "Low stock" },
  { id: "preorder", label: "Pre-order" },
  { id: "sold-out", label: "Sold out" },
] as const;

export type AvailabilityId = (typeof AVAILABILITY)[number]["id"];

export const STORE_SORTS = [
  { id: "popular", label: "Popular" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: low to high" },
  { id: "price-desc", label: "Price: high to low" },
  { id: "rating", label: "Top rated" },
  { id: "credits-asc", label: "Fewest credits" },
] as const;

export type StoreSortId = (typeof STORE_SORTS)[number]["id"];
