import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import type { PendingConfirm } from "@/components/shared/confirm-dialog";
import type { QuestionRecord, QuestionStatus } from "@/features/questions/types";
import { notReady } from "@/lib/placeholder";
import { catalogDaysAgo } from "@/lib/catalog";

/**
 * Question bank mutations. Local-only until the backend is connected —
 * each handler is a single swap point for a Cloud call.
 */
export function useQuestionActions(initial: QuestionRecord[]) {
  const [questions, setQuestions] = useState(initial);
  const [confirm, setConfirm] = useState<PendingConfirm | null>(null);

  const setStatus = useCallback((ids: string[], status: QuestionStatus) => {
    const set = new Set(ids);
    setQuestions((prev) =>
      prev.map((question) =>
        set.has(question.id) ? { ...question, status, updatedAt: catalogDaysAgo(0, 12) } : question,
      ),
    );
    toast.success(ids.length === 1 ? `Question ${status}.` : `${ids.length} questions ${status}.`);
  }, []);

  const save = useCallback((question: QuestionRecord) => {
    setQuestions((prev) => {
      const exists = prev.some((entry) => entry.id === question.id);
      if (!exists) return [{ ...question }, ...prev];
      return prev.map((entry) => (entry.id === question.id ? { ...question } : entry));
    });
    toast.success("Question saved.");
  }, []);

  const duplicate = useCallback((question: QuestionRecord) => {
    const copy: QuestionRecord = {
      ...question,
      id: `QN-${Math.floor(Math.random() * 9000) + 9000}`,
      prompt: `${question.prompt} (copy)`,
      status: "draft",
      usageCount: 0,
      updatedAt: catalogDaysAgo(0, 12),
    };
    setQuestions((prev) => [copy, ...prev]);
    toast.success("Question duplicated as a draft.");
  }, []);

  const remove = useCallback((ids: string[]) => {
    const set = new Set(ids);
    setQuestions((prev) => prev.filter((question) => !set.has(question.id)));
    toast.success(ids.length === 1 ? "Question deleted." : `${ids.length} questions deleted.`);
  }, []);

  const requestDelete = useCallback(
    (ids: string[], label: string) =>
      setConfirm({
        title: ids.length === 1 ? `Delete ${label}?` : `Delete ${ids.length} questions?`,
        description:
          "Deleted questions are removed from every quiz that references them. This cannot be undone.",
        confirmLabel: "Delete",
        destructive: true,
        onConfirm: () => remove(ids),
      }),
    [remove],
  );

  const requestArchive = useCallback(
    (ids: string[]) =>
      setConfirm({
        title: ids.length === 1 ? "Archive this question?" : `Archive ${ids.length} questions?`,
        description: "Archived questions stay searchable but cannot be added to new quizzes.",
        confirmLabel: "Archive",
        onConfirm: () => setStatus(ids, "archived"),
      }),
    [setStatus],
  );

  const restore = useCallback((ids: string[]) => setStatus(ids, "draft"), [setStatus]);
  const publish = useCallback((ids: string[]) => setStatus(ids, "published"), [setStatus]);

  const placeholder = notReady;

  return useMemo(
    () => ({
      questions,
      confirm,
      setConfirm,
      save,
      duplicate,
      publish,
      restore,
      requestArchive,
      requestDelete,
      placeholder,
    }),
    [
      questions,
      confirm,
      save,
      duplicate,
      publish,
      restore,
      requestArchive,
      requestDelete,
      placeholder,
    ],
  );
}
