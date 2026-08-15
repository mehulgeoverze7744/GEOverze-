import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { QuestionRecord } from "@/features/questions/types";
import {
  createQuestion,
  deleteQuestion,
  moveQuestion,
  reorderQuestions,
  updateQuestion,
} from "@/features/questions/data/question-mutations";
import { quizDetailQueryKey } from "@/features/quizzes/hooks/useQuizDetail";
import { quizzesQueryKey } from "@/features/quizzes/hooks/useQuizzes";

export function useQuestionMutations(quizId: string) {
  const queryClient = useQueryClient();

  const invalidate = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: quizDetailQueryKey(quizId) }),
      queryClient.invalidateQueries({ queryKey: quizzesQueryKey }),
    ]);
  };

  const create = useMutation({
    mutationFn: (question: QuestionRecord) => createQuestion(quizId, question),
    onSuccess: async () => {
      await invalidate();
      toast.success("Question added.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const update = useMutation({
    mutationFn: (question: QuestionRecord) => updateQuestion(question.id, question),
    onSuccess: async () => {
      await invalidate();
      toast.success("Question saved.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const remove = useMutation({
    mutationFn: (questionId: string) => deleteQuestion(questionId),
    onSuccess: async () => {
      await invalidate();
      toast.success("Question deleted.");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const reorder = useMutation({
    mutationFn: (orderedIds: string[]) => reorderQuestions(quizId, orderedIds),
    onSuccess: async () => {
      await invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const move = useMutation({
    mutationFn: ({
      questionId,
      orderedIds,
      delta,
    }: {
      questionId: string;
      orderedIds: string[];
      delta: number;
    }) => moveQuestion(quizId, questionId, orderedIds, delta),
    onSuccess: async () => {
      await invalidate();
    },
    onError: (error: Error) => toast.error(error.message),
  });

  return { create, update, remove, reorder, move };
}
