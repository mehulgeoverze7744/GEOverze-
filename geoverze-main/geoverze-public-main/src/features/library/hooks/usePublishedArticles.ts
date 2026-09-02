import { useQuery } from "@tanstack/react-query";

import {
  fetchFeaturedArticles,
  fetchPublishedArticles,
  fetchRecentArticles,
} from "@/features/library/data/fetchPublishedArticles";
import {
  publishedArticlesQueryKey,
  useLibraryAuthScope,
} from "@/features/library/lib/library-query-scope";

export { publishedArticlesQueryKey };

export function usePublishedArticles() {
  const { scope, authReady } = useLibraryAuthScope();

  const query = useQuery({
    queryKey: publishedArticlesQueryKey(scope),
    queryFn: fetchPublishedArticles,
    enabled: authReady,
  });

  return {
    articles: query.data ?? [],
    loading: !authReady || query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

export function useFeaturedArticles(limit = 6) {
  const { scope, authReady } = useLibraryAuthScope();

  const query = useQuery({
    queryKey: [...publishedArticlesQueryKey(scope), "featured", limit] as const,
    queryFn: () => fetchFeaturedArticles(limit),
    enabled: authReady,
  });

  return {
    articles: query.data ?? [],
    loading: !authReady || query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}

export function useRecentArticles(limit = 6) {
  const { scope, authReady } = useLibraryAuthScope();

  const query = useQuery({
    queryKey: [...publishedArticlesQueryKey(scope), "recent", limit] as const,
    queryFn: () => fetchRecentArticles(limit),
    enabled: authReady,
  });

  return {
    articles: query.data ?? [],
    loading: !authReady || query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}
