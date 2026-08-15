import { useQuery } from "@tanstack/react-query";

import { fetchPublishedQuizzes } from "../data/fetchPublishedQuizzes";
import type { Quiz } from "../data/quizzes";

export const publishedQuizzesQueryKey = ["publishedQuizzes"] as const;

export type UsePublishedQuizzesResult = {
  quizzes: Quiz[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
};

/**
 * React Query hook for the Supabase-published quiz catalogue.
 */
export function usePublishedQuizzes(): UsePublishedQuizzesResult {
  const query = useQuery({
    queryKey: publishedQuizzesQueryKey,
    queryFn: fetchPublishedQuizzes,
  });

  return {
    quizzes: query.data ?? [],
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
