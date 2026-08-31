import { useQuery } from "@tanstack/react-query";

import {
  fetchFeaturedArticles,
  fetchPublishedArticles,
  fetchRecentArticles,
} from "@/features/library/data/fetchPublishedArticles";

export const publishedArticlesQueryKey = ["publishedArticles"] as const;

export function usePublishedArticles() {
  const query = useQuery({
    queryKey: publishedArticlesQueryKey,
    queryFn: fetchPublishedArticles,
  });

  return {
    articles: query.data ?? [],
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

export function useFeaturedArticles(limit = 6) {
  const query = useQuery({
    queryKey: [...publishedArticlesQueryKey, "featured", limit] as const,
    queryFn: () => fetchFeaturedArticles(limit),
  });

  return {
    articles: query.data ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
  };
}

export function useRecentArticles(limit = 6) {
  const query = useQuery({
    queryKey: [...publishedArticlesQueryKey, "recent", limit] as const,
    queryFn: () => fetchRecentArticles(limit),
  });

  return {
    articles: query.data ?? [],
    loading: query.isPending,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
  };
}
