import { useQuery } from "@tanstack/react-query";

import {
  fetchPublishedCollectionBySlug,
  fetchPublishedCollections,
} from "@/features/library/data/fetchPublishedCollections";

export const publishedCollectionsQueryKey = ["publishedCollections"] as const;

export function usePublishedCollections() {
  const query = useQuery({
    queryKey: publishedCollectionsQueryKey,
    queryFn: fetchPublishedCollections,
  });

  return {
    collections: query.data ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

export function useCollectionBySlug(slug: string) {
  const query = useQuery({
    queryKey: [...publishedCollectionsQueryKey, slug] as const,
    queryFn: () => fetchPublishedCollectionBySlug(slug),
    enabled: Boolean(slug),
  });

  return {
    collection: query.data?.collection,
    articles: query.data?.articles ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
  };
}
