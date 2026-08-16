import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { duplicateQuestionToQuiz } from "@/features/questions/data/duplicateQuestionToQuiz";
import { questionBankQueryKey } from "@/features/questions/hooks/useQuestionBank";
import { quizDetailQueryKey } from "@/features/quizzes/hooks/useQuizDetail";
import { quizzesQueryKey } from "@/features/quizzes/hooks/useQuizzes";

export function useDuplicateQuestionToQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      sourceQuestionId,
      targetQuizId,
    }: {
      sourceQuestionId: string;
      targetQuizId: string;
    }) => duplicateQuestionToQuiz(sourceQuestionId, targetQuizId),
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: questionBankQueryKey }),
        queryClient.invalidateQueries({ queryKey: quizDetailQueryKey(result.targetQuizId) }),
        queryClient.invalidateQueries({ queryKey: quizzesQueryKey }),
      ]);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}
