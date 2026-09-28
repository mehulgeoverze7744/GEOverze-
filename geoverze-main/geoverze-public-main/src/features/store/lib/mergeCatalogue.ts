import type { StoreProductRow } from "../data/fetchStoreProducts";
import { productBySlug, type Product, type StockState } from "../data/products";
import { isStorefrontRewardSlug, staticStorefrontRewardProducts } from "../data/storefrontRewards";

/** Presentation product merged with server-authoritative catalogue fields. */
export type StoreCatalogueProduct = Product & {
  /** Server UUID — required for place_credit_order. */
  serverProductId: string | null;
  /** True when this item can be purchased via place_credit_order. */
  purchasable: boolean;
};

function stockFromServer(active: boolean, staticStock: StockState): StockState {
  if (!active) return "sold-out";
  return staticStock;
}

/** Overlay server catalogue onto static presentation metadata (matched by slug). */
export function mergeServerCatalogue(
  serverRows: readonly StoreProductRow[],
): StoreCatalogueProduct[] {
  return serverRows.map((row) => {
    const presentation = productBySlug(row.slug);

    if (!presentation) {
      return {
        id: row.id,
        slug: row.slug,
        name: row.name,
        tagline: row.description.slice(0, 80) || row.name,
        description: row.description,
        category: "avatars",
        group: "rewards",
        price: null,
        compareAt: null,
        credits: row.credit_price,
        mode: "credits",
        rating: 4.5,
        reviews: 0,
        popularity: 50,
        stock: row.active ? "in-stock" : "sold-out",
        releasedAt: row.created_at.slice(0, 10),
        limited: false,
        featured: false,
        bestSeller: false,
        options: [],
        features: [],
        specs: [],
        tags: [],
        comingSoon: false,
        serverProductId: row.id,
        purchasable: row.active && row.fulfillment_type === "digital",
      };
    }

    return {
      ...presentation,
      credits: row.credit_price,
      price: null,
      mode: "credits",
      stock: stockFromServer(row.active, presentation.stock),
      serverProductId: row.id,
      purchasable: row.active && row.fulfillment_type === "digital",
    };
  });
}

/** Listed storefront rewards: server rows plus any static prizes not yet seeded. */
export function rewardShelfProducts(
  catalogue: readonly StoreCatalogueProduct[],
): StoreCatalogueProduct[] {
  const items = [...catalogue];
  const serverSlugs = new Set(catalogue.map((p) => p.slug));

  for (const prize of staticStorefrontRewardProducts()) {
    if (serverSlugs.has(prize.slug)) continue;
    items.push({
      ...prize,
      serverProductId: null,
      purchasable: false,
    });
  }

  return items.filter((product) => isStorefrontRewardSlug(product.slug));
}

export function catalogueProductBySlug(
  catalogue: readonly StoreCatalogueProduct[],
  slug: string,
): StoreCatalogueProduct | undefined {
  return catalogue.find((p) => p.slug === slug);
}
