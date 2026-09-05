/** Catalogue filtering, sorting and search for the GEOstore browse surfaces. */
import type { Product } from "../data/products";
import {
  PRICE_BANDS,
  type AvailabilityId,
  type CreditFilterId,
  type PriceBandId,
  type StoreSortId,
} from "../data/taxonomy";

export type ProductFilters = {
  group: string;
  category: string;
  price: string;
  credits: string;
  availability: string;
  query: string;
  /** Credits the shopper currently holds — used by the `affordable` filter. */
  balance: number | null;
};

function matchesPrice(product: Product, band: PriceBandId): boolean {
  const definition = PRICE_BANDS.find((b) => b.id === band);
  if (!definition) return true;
  if (product.price === null) return false;
  return product.price >= definition.min && product.price < definition.max;
}

function matchesCredits(product: Product, filter: CreditFilterId, balance: number | null): boolean {
  if (filter === "credits-accepted") return product.credits !== null;
  if (filter === "credits-only") return product.credits !== null && product.price === null;
  if (balance === null) return false;
  return product.credits !== null && product.credits <= balance;
}

export function filterProducts(
  products: readonly Product[],
  filters: ProductFilters,
): readonly Product[] {
  const query = filters.query.trim().toLowerCase();

  return products.filter((product) => {
    if (filters.group !== "all" && product.group !== filters.group) return false;
    if (filters.category !== "all" && product.category !== filters.category) return false;
    if (filters.price !== "all" && !matchesPrice(product, filters.price as PriceBandId))
      return false;
    if (
      filters.credits !== "all" &&
      !matchesCredits(product, filters.credits as CreditFilterId, filters.balance)
    ) {
      return false;
    }
    if (
      filters.availability !== "all" &&
      product.stock !== (filters.availability as AvailabilityId)
    ) {
      return false;
    }
    if (query) {
      const haystack = [product.name, product.tagline, product.description, ...product.tags]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

export function sortProducts(products: readonly Product[], sort: StoreSortId): Product[] {
  const list = [...products];
  const price = (p: Product) => p.price ?? Number.POSITIVE_INFINITY;
  const credits = (p: Product) => p.credits ?? Number.POSITIVE_INFINITY;

  switch (sort) {
    case "newest":
      return list.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt));
    case "price-asc":
      return list.sort((a, b) => price(a) - price(b));
    case "price-desc":
      return list.sort((a, b) => price(b) - price(a));
    case "rating":
      return list.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews);
    case "credits-asc":
      return list.sort((a, b) => credits(a) - credits(b));
    case "popular":
    default:
      return list.sort((a, b) => b.popularity - a.popularity);
  }
}

export function bestSellers(products: readonly Product[], limit = 4): readonly Product[] {
  return products.filter((p) => p.bestSeller).slice(0, limit);
}

/** Credit-claimable items ordered by cheapest first. */
export function creditPicks(
  products: readonly Product[],
  balance: number | null,
  limit = 4,
): readonly Product[] {
  if (balance === null) return [];
  return products
    .filter((p) => p.credits !== null && p.credits <= balance)
    .sort((a, b) => (a.credits ?? 0) - (b.credits ?? 0))
    .slice(0, limit);
}
