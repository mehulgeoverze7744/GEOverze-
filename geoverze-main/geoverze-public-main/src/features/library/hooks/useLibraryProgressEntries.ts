import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useLibraryStore } from "@/stores/libraryStore";

import type { Article } from "../data/articles";
import { fetchCatalogueArticlesBySlugs } from "../data/fetchPublishedArticles";
import { LIBRARY_CATALOGUE_CACHE_VERSION } from "../lib/library-catalogue";
import { useLibraryAuthScope } from "../lib/library-query-scope";

export type LibraryProgressEntry = {
  slug: string;
  percent: number;
  article: Article;
};

export const libraryProgressArticlesQueryKey = (scope: string, slugs: readonly string[]) =>
  [
    "libraryProgressArticles",
    LIBRARY_CATALOGUE_CACHE_VERSION,
    scope,
    [...slugs].sort().join("|"),
  ] as const;

/** Resolve in-progress and completed entries against catalogue metadata. */
export function useLibraryProgressEntries() {
  const progress = useLibraryStore((s) => s.progress);
  const completedSlugs = useLibraryStore((s) => s.completed);
  const { scope, authReady } = useLibraryAuthScope();

  const trackedSlugs = useMemo(() => {
    const slugs = new Set<string>(completedSlugs);
    for (const [slug, percent] of Object.entries(progress)) {
      if (percent > 0) slugs.add(slug);
    }
    return [...slugs];
  }, [progress, completedSlugs]);

  const query = useQuery({
    queryKey: libraryProgressArticlesQueryKey(scope, trackedSlugs),
    queryFn: () => fetchCatalogueArticlesBySlugs(trackedSlugs),
    enabled: authReady && trackedSlugs.length > 0,
  });

  const articlesBySlug = useMemo(
    () => new Map((query.data ?? []).map((article) => [article.slug, article])),
    [query.data],
  );

  const inProgress = useMemo(() => {
    return Object.entries(progress)
      .filter(([slug, percent]) => percent > 0 && percent < 100 && !completedSlugs.includes(slug))
      .sort((a, b) => b[1] - a[1])
      .flatMap(([slug, percent]) => {
        const article = articlesBySlug.get(slug);
        return article ? [{ slug, percent, article }] : [];
      });
  }, [progress, completedSlugs, articlesBySlug]);

  const completed = useMemo(() => {
    return completedSlugs.flatMap((slug) => {
      const article = articlesBySlug.get(slug);
      return article ? [{ slug, percent: 100, article }] : [];
    });
  }, [completedSlugs, articlesBySlug]);

  return {
    inProgress,
    completed,
    loading: !authReady || (trackedSlugs.length > 0 && query.isPending),
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
  };
}
