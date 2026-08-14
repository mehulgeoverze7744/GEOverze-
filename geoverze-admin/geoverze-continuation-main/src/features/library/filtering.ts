import type { LibraryFilterState, LibraryResource } from "@/features/library/types";

export function matchesLibrarySearch(item: LibraryResource, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [
    item.id,
    item.title,
    item.slug,
    item.author,
    item.category,
    item.country,
    item.language,
    ...item.tags,
  ]
    .join(" ")
    .toLowerCase()
    .includes(q);
}

export function filterLibrary(list: LibraryResource[], query: string, filters: LibraryFilterState) {
  return list.filter((item) => {
    if (!matchesLibrarySearch(item, query)) return false;
    if (filters.status !== "all" && item.status !== filters.status) return false;
    if (filters.category !== "all" && item.category !== filters.category) return false;
    if (filters.region !== "all" && item.region !== filters.region) return false;
    if (filters.difficulty !== "all" && item.difficulty !== filters.difficulty) return false;
    if (filters.language !== "all" && item.language !== filters.language) return false;
    if (filters.featured !== "all" && String(item.featured) !== filters.featured) return false;
    return true;
  });
}
