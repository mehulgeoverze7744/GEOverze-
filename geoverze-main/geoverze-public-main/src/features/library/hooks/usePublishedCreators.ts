import { useQuery } from "@tanstack/react-query";

import {
  fetchCreatorByHandle,
  fetchPublishedCreators,
} from "@/features/library/data/fetchPublishedCreators";
import { fetchArticlesByCreator } from "@/features/library/data/fetchPublishedArticles";
import { LIBRARY_CATALOGUE_CACHE_VERSION } from "@/features/library/lib/library-catalogue";
import {
  publishedCreatorsQueryKey,
  useLibraryAuthScope,
} from "@/features/library/lib/library-query-scope";

export { publishedCreatorsQueryKey };

export function usePublishedCreators() {
  const { scope, authReady } = useLibraryAuthScope();

  const query = useQuery({
    queryKey: publishedCreatorsQueryKey(scope),
    queryFn: fetchPublishedCreators,
    enabled: authReady,
  });

  return {
    creators: query.data ?? [],
    loading: !authReady || query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

export function useCreatorByHandle(handle: string) {
  const { scope, authReady } = useLibraryAuthScope();

  const creatorQuery = useQuery({
    queryKey: [...publishedCreatorsQueryKey(scope), handle] as const,
    queryFn: () => fetchCreatorByHandle(handle),
    enabled: authReady && Boolean(handle),
  });

  const articlesQuery = useQuery({
    queryKey: [
      ...publishedCreatorsQueryKey(scope),
      handle,
      "articles",
      LIBRARY_CATALOGUE_CACHE_VERSION,
    ] as const,
    queryFn: () => fetchArticlesByCreator(handle),
    enabled: authReady && Boolean(handle),
  });

  return {
    creator: creatorQuery.data ?? undefined,
    articles: articlesQuery.data ?? [],
    loading: !authReady || creatorQuery.isPending || articlesQuery.isPending,
    error:
      creatorQuery.error instanceof Error
        ? creatorQuery.error.message
        : articlesQuery.error instanceof Error
          ? articlesQuery.error.message
          : null,
  };
}
