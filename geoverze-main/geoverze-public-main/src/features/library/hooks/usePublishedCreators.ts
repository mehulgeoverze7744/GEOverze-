import { useQuery } from "@tanstack/react-query";

import {
  fetchCreatorByHandle,
  fetchPublishedCreators,
} from "@/features/library/data/fetchPublishedCreators";
import { fetchArticlesByCreator } from "@/features/library/data/fetchPublishedArticles";

export const publishedCreatorsQueryKey = ["publishedCreators"] as const;

export function usePublishedCreators() {
  const query = useQuery({
    queryKey: publishedCreatorsQueryKey,
    queryFn: fetchPublishedCreators,
  });

  return {
    creators: query.data ?? [],
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

export function useCreatorByHandle(handle: string) {
  const creatorQuery = useQuery({
    queryKey: [...publishedCreatorsQueryKey, handle] as const,
    queryFn: () => fetchCreatorByHandle(handle),
    enabled: Boolean(handle),
  });

  const articlesQuery = useQuery({
    queryKey: [...publishedCreatorsQueryKey, handle, "articles"] as const,
    queryFn: () => fetchArticlesByCreator(handle),
    enabled: Boolean(handle),
  });

  return {
    creator: creatorQuery.data ?? undefined,
    articles: articlesQuery.data ?? [],
    loading: creatorQuery.isPending || articlesQuery.isPending,
    error:
      creatorQuery.error instanceof Error
        ? creatorQuery.error.message
        : articlesQuery.error instanceof Error
          ? articlesQuery.error.message
          : null,
  };
}
