/**
 * Browse catalogue — the physical products shoppers can reach from the GEOstore
 * merchandise shelves. Digital packs and rewards stay on their own surfaces.
 */
import {
  isMerchStoreCategory,
  merchProductsForStoreCategory,
  type GeostoreMerchProduct,
} from "@/features/marketing/data/geostoreMerch";

import { productBySlug, productsInCategory, type Product } from "./products";
import { STORE_CATEGORIES, type StoreCategoryId, type StoreGroupId } from "./taxonomy";

/** Categories without a storefront shelf. */
const BROWSE_HIDDEN_CATEGORIES = new Set<StoreCategoryId>(["posters"]);

export type BrowseEntry = {
  product: Product;
  /** Set when the item only exists in the merch catalogue and renders as a merch card. */
  merch?: GeostoreMerchProduct;
};

function merchFacets(merch: GeostoreMerchProduct, category: StoreCategoryId): Product {
  return {
    id: merch.id,
    slug: merch.id,
    name: merch.title,
    tagline: merch.tagline,
    description: merch.tagline,
    category,
    group: "merch",
    price: merch.price,
    compareAt: null,
    credits: merch.credits,
    mode: "hybrid",
    rating: 0,
    reviews: 0,
    popularity: 0,
    stock: "in-stock",
    releasedAt: "",
    limited: false,
    featured: false,
    bestSeller: false,
    options: [],
    features: [],
    specs: [],
    tags: ["apparel", merch.categoryLabel.toLowerCase()],
    comingSoon: false,
  };
}

export const BROWSE_ENTRIES: readonly BrowseEntry[] = STORE_CATEGORIES.filter(
  (category) => category.group === "merch" && !BROWSE_HIDDEN_CATEGORIES.has(category.id),
).flatMap((category): BrowseEntry[] => {
  if (isMerchStoreCategory(category.id)) {
    return merchProductsForStoreCategory(category.id).map((merch) => {
      const product = productBySlug(merch.id);
      return product ? { product } : { product: merchFacets(merch, category.id), merch };
    });
  }
  return productsInCategory(category.id).map((product) => ({ product }));
});

export const BROWSE_PRODUCTS: readonly Product[] = BROWSE_ENTRIES.map((entry) => entry.product);

const MERCH_BY_SLUG = new Map<string, GeostoreMerchProduct>(
  BROWSE_ENTRIES.flatMap((entry) =>
    entry.merch ? [[entry.product.slug, entry.merch] as const] : [],
  ),
);

export function browseMerchForSlug(slug: string): GeostoreMerchProduct | undefined {
  return MERCH_BY_SLUG.get(slug);
}

export const BROWSE_CATEGORY_IDS: ReadonlySet<StoreCategoryId> = new Set(
  BROWSE_PRODUCTS.map((product) => product.category),
);

export const BROWSE_GROUP_IDS: ReadonlySet<StoreGroupId> = new Set(
  BROWSE_PRODUCTS.map((product) => product.group),
);
