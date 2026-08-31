import { useQuery } from "@tanstack/react-query";

import { fetchPublishedArticleBySlug } from "@/features/library/data/fetchPublishedArticles";

export const articleBySlugQueryKey = (slug: string) => ["libraryArticle", slug] as const;

export function useArticleBySlug(slug: string) {
  const query = useQuery({
    queryKey: articleBySlugQueryKey(slug),
    queryFn: () => fetchPublishedArticleBySlug(slug),
    enabled: Boolean(slug),
  });

  return {
    article: query.data ?? undefined,
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
