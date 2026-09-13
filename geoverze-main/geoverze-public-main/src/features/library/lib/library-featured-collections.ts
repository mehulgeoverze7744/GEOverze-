import type { Collection } from "../data/collections";
import { CATEGORIES, type CategoryId } from "../data/taxonomy";

const categoryOrder = new Map<CategoryId, number>(CATEGORIES.map((category, index) => [category.id, index]));

/** Featured collections sorted by existing taxonomy category order. */
export function sortFeaturedCollectionsByTopic(collections: readonly Collection[]): Collection[] {
  return collections
    .filter((collection) => collection.featured)
    .sort((a, b) => {
      const left = categoryOrder.get(a.category) ?? Number.MAX_SAFE_INTEGER;
      const right = categoryOrder.get(b.category) ?? Number.MAX_SAFE_INTEGER;
      return left - right || a.title.localeCompare(b.title);
    });
}
