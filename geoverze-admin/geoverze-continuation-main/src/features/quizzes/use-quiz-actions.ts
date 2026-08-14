import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { PendingConfirm } from "@/components/shared/confirm-dialog";
import type { QuizRecord, QuizStatus, QuizVisibility } from "@/features/quizzes/types";
import { catalogDaysAgo } from "@/lib/catalog";
import { notReady } from "@/lib/placeholder";

/**
 * Quiz catalogue mutations. Local state only — every handler is a single
 * swap point for a Lovable Cloud call once the backend is connected.
 */
export function useQuizActions(initial: QuizRecord[]) {
  const [quizzes, setQuizzes] = useState(initial);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  const patch = useCallback((ids: string[], changes: Partial<QuizRecord>) => {
    const set = new Set(ids);
    setQuizzes((prev) =>
      prev.map((quiz) =>
        set.has(quiz.id) ? { ...quiz, ...changes, updatedAt: catalogDaysAgo(0, 12) } : quiz,
      ),
    );
  }, []);

  const setStatus = useCallback(
    (ids: string[], status: QuizStatus) => {
      patch(ids, { status });
      toast.success(ids.length === 1 ? `Quiz ${status}.` : `${ids.length} quizzes ${status}.`);
    },
    [patch],
  );

  const setVisibility = useCallback(
    (ids: string[], visibility: QuizVisibility) => {
      patch(ids, { visibility });
      toast.success(`Visibility set to ${visibility}.`);
    },
    [patch],
  );

  const save = useCallback((quiz: QuizRecord) => {
    setQuizzes((prev) => {
      const exists = prev.some((entry) => entry.id === quiz.id);
      if (!exists) return [{ ...quiz }, ...prev];
      return prev.map((entry) => (entry.id === quiz.id ? { ...quiz } : entry));
    });
    toast.success("Quiz saved.");
  }, []);

  const duplicate = useCallback((quiz: QuizRecord) => {
    const copy: QuizRecord = {
      ...quiz,
      id: `QZ-${Math.floor(Math.random() * 9000) + 9000}`,
      title: `${quiz.title} (copy)`,
      status: "draft",
      plays: 0,
      ratingCount: 0,
      updatedAt: catalogDaysAgo(0, 12),
    };
    setQuizzes((prev) => [copy, ...prev]);
    toast.success("Quiz duplicated as a draft.");
  }, []);

  const remove = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setQuizzes((prev) => prev.filter((quiz) => !set.has(quiz.id)));
    toast.success(ids.length === 1 ? "Quiz deleted." : `${ids.length} quizzes deleted.`);
  }, []);

  const requestDelete = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Delete this quiz?" : `Delete ${ids.length} quizzes?`,
        description:
          "Play history stays in analytics, but the quiz is removed from the catalogue. This cannot be undone.",
        confirmLabel: "Delete",
        destructive: true,
        onConfirm: () => remove(ids),
      }),
    [remove],
  );

  const requestArchive = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Archive this quiz?" : `Archive ${ids.length} quizzes?`,
        description: "Archived quizzes stay visible to admins but cannot be played.",
        confirmLabel: "Archive",
        onConfirm: () => setStatus(ids, "archived"),
      }),
    [setStatus],
  );

  const publish = useCallback((ids: string[]) => setStatus(ids, "published"), [setStatus]);
  const unpublish = useCallback((ids: string[]) => setStatus(ids, "draft"), [setStatus]);

  const placeholder = notReady;

  return useMemo(
    () => ({
      quizzes,
      confirm,
      setConfirm,
      save,
      duplicate,
      publish,
      unpublish,
      setVisibility,
      requestArchive,
      requestDelete,
      placeholder,
    }),
    [
      quizzes,
      confirm,
      save,
      duplicate,
      publish,
      unpublish,
      setVisibility,
      requestArchive,
      requestDelete,
      placeholder,
    ],
  );
}
