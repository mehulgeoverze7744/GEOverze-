import { useQuery } from "@tanstack/react-query";

import { fetchQuizzes } from "@/features/quizzes/data/fetchQuizzes";

export const quizzesQueryKey = ["quizzes"] as const;

export function useQuizzes() {
  const query = useQuery({
    queryKey: quizzesQueryKey,
    queryFn: fetchQuizzes,
  });

  return {
    quizzes: query.data ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}
