import { useQuery } from "@tanstack/react-query";

import {
  fetchArticlePageState,
  type ArticlePageState,
} from "@/features/library/data/fetchPublishedArticles";
import type { Article } from "@/features/library/data/articles";
import {
  articleBySlugQueryKey,
  useLibraryAuthScope,
} from "@/features/library/lib/library-query-scope";
import { useLibrarySubscriptionTier } from "./useLibrarySubscriptionTier";

export function useArticleBySlug(slug: string) {
  const { scope, authReady } = useLibraryAuthScope();
  const { tier, tierReady } = useLibrarySubscriptionTier();

  const query = useQuery({
    queryKey: articleBySlugQueryKey(slug, scope, tier),
    queryFn: () => fetchArticlePageState(slug),
    enabled: authReady && tierReady && Boolean(slug),
  });

  const pageState = query.data;

  return {
    pageState,
    article: pageState?.status === "ready" ? pageState.article : undefined,
    loading: !authReady || !tierReady || query.isPending,
    error:
      query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: () => {
      void query.refetch();
    },
  };
}

export function articleFromPageState(pageState: ArticlePageState | undefined): Article | undefined {
  return pageState?.status === "ready" ? pageState.article : undefined;
}

export { articleBySlugQueryKey };
