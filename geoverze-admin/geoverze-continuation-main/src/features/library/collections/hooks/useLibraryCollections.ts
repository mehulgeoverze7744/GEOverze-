import { useQuery } from "@tanstack/react-query";

import { fetchLibraryCollections } from "../data/fetchLibraryCollections";

export const libraryCollectionsQueryKey = ["library-collections"] as const;

export function useLibraryCollections() {
  const query = useQuery({
    queryKey: libraryCollectionsQueryKey,
    queryFn: fetchLibraryCollections,
  });

  return {
    collections: query.data ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => void query.refetch(),
  };
}
