import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { QuizRecord } from "@/features/quizzes/types";
import {
  createQuiz,
  deleteQuiz,
  duplicateQuiz,
  publishQuiz,
  unpublishQuiz,
  updateQuiz,
} from "@/features/quizzes/data/quiz-mutations";
import { quizDetailQueryKey } from "@/features/quizzes/hooks/useQuizDetail";
import { quizzesQueryKey } from "@/features/quizzes/hooks/useQuizzes";

function invalidateCatalogue(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.invalidateQueries({ queryKey: quizzesQueryKey });
}

function invalidateDetail(queryClient: ReturnType<typeof useQueryClient>, id: string) {
  return queryClient.invalidateQueries({ queryKey: quizDetailQueryKey(id) });
}

export function useQuizMutations() {
  const queryClient = useQueryClient();

  const create = useMutation({
    mutationFn: (quiz: QuizRecord) => createQuiz(quiz),
    onSuccess: async (created) => {
      await invalidateCatalogue(queryClient);
      toast.success(`“${created.title}” created as a draft.`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const update = useMutation({
    mutationFn: (quiz: QuizRecord) => updateQuiz(quiz),
    onSuccess: async (_data, quiz) => {
      await Promise.all([
        invalidateCatalogue(queryClient),
        invalidateDetail(queryClient, quiz.id),
      ]);
      toast.success("Quiz saved.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const publish = useMutation({
    mutationFn: (id: string) => publishQuiz(id),
    onSuccess: async (_data, id) => {
      await Promise.all([invalidateCatalogue(queryClient), invalidateDetail(queryClient, id)]);
      toast.success("Quiz published.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const unpublish = useMutation({
    mutationFn: (id: string) => unpublishQuiz(id),
    onSuccess: async (_data, id) => {
      await Promise.all([invalidateCatalogue(queryClient), invalidateDetail(queryClient, id)]);
      toast.success("Quiz unpublished.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteQuiz(id),
    onSuccess: async () => {
      await invalidateCatalogue(queryClient);
      toast.success("Quiz deleted.");
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const duplicate = useMutation({
    mutationFn: (id: string) => duplicateQuiz(id),
    onSuccess: async (newId) => {
      await invalidateCatalogue(queryClient);
      toast.success("Quiz duplicated as a draft.");
      return newId;
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    create,
    update,
    publish,
    unpublish,
    remove,
    duplicate,
  };
}
