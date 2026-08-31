import { useQuery } from "@tanstack/react-query";

import { fetchBrowseArticles } from "@/features/library/data/fetchBrowseArticles";
import type { LibraryQuery } from "@/features/library/lib/filter";
import { sortArticles } from "@/features/library/lib/filter";

export const browseArticlesQueryKey = (query: LibraryQuery) => ["browseArticles", query] as const;

export function useBrowseArticles(query: LibraryQuery, savedSlugs: readonly string[]) {
  const browseQuery = useQuery({
    queryKey: browseArticlesQueryKey(query),
    queryFn: () => fetchBrowseArticles(query),
  });

  let articles = browseQuery.data ?? [];

  if (query.saved) {
    const saved = new Set(savedSlugs);
    articles = articles.filter((a) => saved.has(a.slug));
  }

  if (query.sort === "bookmarked") {
    articles = sortArticles(articles, "bookmarked");
  } else if (query.sort === "popular") {
    articles = sortArticles(articles, "popular");
  }

  return {
    articles,
    loading: browseQuery.isPending,
    error:
      browseQuery.error instanceof Error
        ? browseQuery.error.message
        : browseQuery.error
          ? String(browseQuery.error)
          : null,
  };
}
