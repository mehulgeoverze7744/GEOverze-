import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import {
  rankRecommendedArticles,
  type UserLibrarySignals,
} from "@/features/library/lib/recommendations";
import { useLibraryStore } from "@/stores/libraryStore";

import { usePublishedArticles } from "./usePublishedArticles";
import { useLibrarySubscriptionTier } from "./useLibrarySubscriptionTier";
import { libraryCatalogueQueryScope, useLibraryAuthScope } from "../lib/library-query-scope";

export function libraryRecommendedQueryKey(
  scope: string,
  signedIn: boolean,
  libraryStateKey: string,
  catalogueKey: string,
  limit: number,
) {
  return [
    "libraryRecommended",
    ...libraryCatalogueQueryScope(scope),
    signedIn,
    libraryStateKey,
    catalogueKey,
    limit,
  ] as const;
}

function libraryStateKey(signals: UserLibrarySignals): string {
  const progressSlugs = Object.keys(signals.progress).sort();
  return JSON.stringify({
    bookmarks: [...signals.bookmarks].sort(),
    likes: [...signals.likes].sort(),
    completed: [...signals.completed].sort(),
    progress: progressSlugs.map((slug) => [slug, signals.progress[slug] ?? 0]),
    signedIn: signals.signedIn,
  });
}

function catalogueKey(articles: readonly { slug: string }[]): string {
  return articles
    .map((article) => article.slug)
    .sort()
    .join("|");
}

/** User-scoped recommendations derived from catalogue aggregates + local library state. */
export function useRecommendedArticles(limit = 6, exclude: readonly string[] = []) {
  const { scope, authReady } = useLibraryAuthScope();
  const { signedIn } = useLibrarySubscriptionTier();
  const bookmarks = useLibraryStore((s) => s.bookmarks);
  const likes = useLibraryStore((s) => s.likes);
  const completed = useLibraryStore((s) => s.completed);
  const progress = useLibraryStore((s) => s.progress);
  const { articles, loading: catalogueLoading, error } = usePublishedArticles();

  const signals: UserLibrarySignals = useMemo(
    () => ({ signedIn, bookmarks, likes, completed, progress }),
    [signedIn, bookmarks, likes, completed, progress],
  );

  const stateKey = useMemo(() => libraryStateKey(signals), [signals]);
  const catKey = useMemo(() => catalogueKey(articles), [articles]);
  const excludeKey = useMemo(() => [...exclude].sort().join("|"), [exclude]);

  const query = useQuery({
    queryKey: [...libraryRecommendedQueryKey(scope, signedIn, stateKey, catKey, limit), excludeKey],
    queryFn: () => rankRecommendedArticles(articles, signals, limit, exclude),
    enabled: authReady && !catalogueLoading,
  });

  return {
    articles: query.data ?? [],
    loading: !authReady || catalogueLoading || query.isPending,
    error: error ?? (query.error instanceof Error ? query.error.message : null),
  };
}
