import type { LibraryCollection, CollectionFilterState } from "./types";

export function matchesCollectionSearch(collection: LibraryCollection, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    collection.title.toLowerCase().includes(q) ||
    collection.slug.toLowerCase().includes(q) ||
    collection.description.toLowerCase().includes(q) ||
    collection.curatorHandle.toLowerCase().includes(q)
  );
}

export function filterCollections(
  collections: readonly LibraryCollection[],
  query: string,
  filters: CollectionFilterState,
): LibraryCollection[] {
  return collections.filter((collection) => {
    if (!matchesCollectionSearch(collection, query)) return false;
    if (filters.status !== "all" && collection.status !== filters.status) return false;
    if (filters.category !== "all" && collection.subjectCategory !== filters.category) return false;
    if (filters.continent !== "all" && collection.continent !== filters.continent) return false;
    if (filters.featured === "yes" && !collection.featured) return false;
    if (filters.featured === "no" && collection.featured) return false;
    return true;
  });
}
