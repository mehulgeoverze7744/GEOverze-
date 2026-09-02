import { useQuery } from "@tanstack/react-query";

import {
  fetchPublishedCollectionBySlug,
  fetchPublishedCollections,
} from "@/features/library/data/fetchPublishedCollections";
import {
  publishedCollectionsQueryKey,
  useLibraryAuthScope,
} from "@/features/library/lib/library-query-scope";

export { publishedCollectionsQueryKey };

export function usePublishedCollections() {
  const { scope, authReady } = useLibraryAuthScope();

  const query = useQuery({
    queryKey: publishedCollectionsQueryKey(scope),
    queryFn: fetchPublishedCollections,
    enabled: authReady,
  });

  return {
    collections: query.data ?? [],
    loading: !authReady || query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

export function useCollectionBySlug(slug: string) {
  const { scope, authReady } = useLibraryAuthScope();

  const query = useQuery({
    queryKey: [...publishedCollectionsQueryKey(scope), slug] as const,
    queryFn: () => fetchPublishedCollectionBySlug(slug),
    enabled: authReady && Boolean(slug),
  });

  return {
    collection: query.data?.collection,
    articles: query.data?.articles ?? [],
    loading: !authReady || query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}
