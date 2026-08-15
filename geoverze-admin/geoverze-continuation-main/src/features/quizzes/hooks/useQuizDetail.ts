import { useQuery } from "@tanstack/react-query";

import { fetchQuizById } from "@/features/quizzes/data/fetchQuizzes";

export const quizDetailQueryKey = (id: string) => ["quiz", id] as const;

export function useQuizDetail(id: string) {
  const query = useQuery({
    queryKey: quizDetailQueryKey(id),
    queryFn: () => fetchQuizById(id),
    enabled: Boolean(id),
  });

  return {
    quiz: query.data?.quiz ?? null,
    questions: query.data?.questions ?? [],
    loading: query.isLoading,
    error: query.error instanceof Error ? query.error.message : query.error ? String(query.error) : null,
    refetch: query.refetch,
  };
}
