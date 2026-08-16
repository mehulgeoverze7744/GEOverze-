import { useQuery } from "@tanstack/react-query";

import { fetchAllQuizQuestions } from "@/features/questions/data/fetchAllQuizQuestions";

export const questionBankQueryKey = ["question-bank"] as const;

export function useQuestionBank() {
  const query = useQuery({
    queryKey: questionBankQueryKey,
    queryFn: fetchAllQuizQuestions,
  });

  return {
    questions: query.data ?? [],
    loading: query.isLoading,
    error:
      query.error instanceof Error
        ? query.error.message
        : query.error
          ? String(query.error)
          : null,
    refetch: query.refetch,
  };
}
