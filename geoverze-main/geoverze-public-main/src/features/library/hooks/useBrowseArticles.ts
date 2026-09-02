import { useQuery } from "@tanstack/react-query";

import { fetchBrowseArticles } from "@/features/library/data/fetchBrowseArticles";
import type { LibraryQuery } from "@/features/library/lib/filter";
import { sortArticles } from "@/features/library/lib/filter";
import {
  browseArticlesQueryKey,
  useLibraryAuthScope,
} from "@/features/library/lib/library-query-scope";

export { browseArticlesQueryKey };

export function useBrowseArticles(query: LibraryQuery, savedSlugs: readonly string[]) {
  const { scope, authReady } = useLibraryAuthScope();

  const browseQuery = useQuery({
    queryKey: browseArticlesQueryKey(query, scope),
    queryFn: () => fetchBrowseArticles(query),
    enabled: authReady,
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
    loading: !authReady || browseQuery.isPending,
    error:
      browseQuery.error instanceof Error
        ? browseQuery.error.message
        : browseQuery.error
          ? String(browseQuery.error)
          : null,
  };
}
