/**
 * Resolve a Gstore wishlist / recently-viewed id to a Product.
 *
 * Hearts persist canonical product ids (route slugs). Those ids come from three
 * catalogues: static PRODUCTS, listed merch, and storefront signature tees.
 * Lookup must cover all three so the Wishlist page can render what was saved.
 */
import {
  merchProductById,
  type GeostoreMerchProduct,
} from "../../marketing/data/geostoreMerch";

import { isPurchaseLocked, productById, productBySlug, type Product } from "../data/products";
import type { StoreCategoryId } from "../data/taxonomy";
import {
  storefrontTeeById,
  type StorefrontTeeProduct,
} from "../storefront/storefront-product-data";

function merchCategory(merch: GeostoreMerchProduct): StoreCategoryId {
  return merch.category === "hoodie" ? "hoodies" : "tshirts";
}

function merchAsProduct(merch: GeostoreMerchProduct): Product {
  const existing = productBySlug(merch.id);
  if (existing) return existing;

  return {
    id: merch.id,
    slug: merch.id,
    name: merch.title,
    tagline: merch.tagline,
    description: merch.tagline,
    category: merchCategory(merch),
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
    comingSoon: isPurchaseLocked({
      slug: merch.id,
      category: merchCategory(merch),
      comingSoon: false,
    }),
  };
}

function storefrontTeeAsProduct(tee: StorefrontTeeProduct): Product {
  const existing = productBySlug(tee.id);
  if (existing) return existing;

  return {
    id: tee.id,
    slug: tee.id,
    name: tee.name,
    tagline: tee.description.slice(0, 96),
    description: tee.description,
    category: "tshirts",
    group: "merch",
    price: 37_00,
    compareAt: null,
    credits: 499,
    mode: "hybrid",
    rating: 4.8,
    reviews: 0,
    popularity: 96,
    stock: "in-stock",
    releasedAt: "2026-10-01",
    limited: false,
    featured: true,
    bestSeller: true,
    options: [],
    features: [...tee.highlights],
    specs: [],
    tags: ["apparel", "t-shirt", "signature"],
    comingSoon: false,
  };
}

/** Map a saved product id to a catalogue Product, or undefined if unknown. */
export function resolveStoreProduct(id: string): Product | undefined {
  const key = id.trim();
  if (!key) return undefined;

  const catalog = productBySlug(key) ?? productById(key);
  if (catalog) return catalog;

  const merch = merchProductById(key);
  if (merch) return merchAsProduct(merch);

  const tee = storefrontTeeById(key);
  if (tee) return storefrontTeeAsProduct(tee);

  return undefined;
}
