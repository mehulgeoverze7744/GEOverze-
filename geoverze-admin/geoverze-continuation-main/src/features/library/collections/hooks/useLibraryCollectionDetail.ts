import { useQuery } from "@tanstack/react-query";

import { fetchLibraryCollectionById } from "../data/fetchLibraryCollections";

export const libraryCollectionDetailQueryKey = (id: string) => ["library-collection", id] as const;

export function useLibraryCollectionDetail(id: string) {
  const query = useQuery({
    queryKey: libraryCollectionDetailQueryKey(id),
    queryFn: () => fetchLibraryCollectionById(id),
    enabled: Boolean(id),
  });

  return {
    collection: query.data ?? null,
    loading: query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => void query.refetch(),
  };
}
