import { useEffect, useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { StatusBadge } from "@/components/shared/status-badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDuplicateQuestionToQuiz } from "@/features/questions/hooks/useDuplicateQuestionToQuiz";
import type { BankQuestionRecord } from "@/features/questions/types";
import { useQuizzes } from "@/features/quizzes/hooks/useQuizzes";

export interface DuplicateToQuizDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  source: BankQuestionRecord | null;
  onOpenInQuiz?: (quizId: string) => void;
}

export function DuplicateToQuizDialog({
  open,
  onOpenChange,
  source,
  onOpenInQuiz,
}: DuplicateToQuizDialogProps) {
  const { quizzes, loading: quizzesLoading } = useQuizzes();
  const duplicate = useDuplicateQuestionToQuiz();
  const [targetQuizId, setTargetQuizId] = useState("");
  const [publishedConfirmOpen, setPublishedConfirmOpen] = useState(false);

  const sortedQuizzes = useMemo(
    () => [...quizzes].sort((a, b) => a.title.localeCompare(b.title)),
    [quizzes],
  );

  const selectedQuiz = useMemo(
    () => sortedQuizzes.find((quiz) => quiz.id === targetQuizId) ?? null,
    [sortedQuizzes, targetQuizId],
  );

  useEffect(() => {
    if (!open) {
      setTargetQuizId("");
      setPublishedConfirmOpen(false);
    }
  }, [open]);

  const runDuplicate = async () => {
    if (!source || !targetQuizId) return;

    try {
      const result = await duplicate.mutateAsync({
        sourceQuestionId: source.id,
        targetQuizId,
      });

      const targetTitle = selectedQuiz?.title ?? result.targetQuizId;

      toast.success("New question created.", {
        description: `A copy was added to “${targetTitle}” at position ${result.position}. The source question was not changed.`,
        action: onOpenInQuiz
          ? {
              label: "Open in quiz",
              onClick: () => onOpenInQuiz(result.targetQuizId),
            }
          : undefined,
      });

      onOpenChange(false);
    } catch {
      // Error toast handled by mutation hook.
    }
  };

  const handleDuplicateClick = () => {
    if (!source || !targetQuizId) return;

    if (selectedQuiz?.status === "published") {
      setPublishedConfirmOpen(true);
      return;
    }

    void runDuplicate();
  };

  const sourceLabel = source
    ? `${source.type} · ${source.quizTitle} · #${source.position}`
    : "";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Duplicate to quiz</DialogTitle>
            <DialogDescription>
              Copy this question into another quiz as a new row. The source question stays in its
              original quiz unchanged.
            </DialogDescription>
          </DialogHeader>

          {source && (
            <div className="space-y-4">
              <div className="rounded-md border border-border bg-muted/40 px-3 py-2">
                <p className="text-sm font-medium text-foreground line-clamp-2">{source.prompt}</p>
                <p className="mt-1 text-xs text-muted-foreground">{sourceLabel}</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="duplicate-target-quiz" className="text-sm font-medium text-foreground">
                  Target quiz
                </label>
                <Select
                  {...(targetQuizId ? { value: targetQuizId } : {})}
                  onValueChange={setTargetQuizId}
                  disabled={quizzesLoading || duplicate.isPending}
                >
                  <SelectTrigger id="duplicate-target-quiz">
                    <SelectValue placeholder={quizzesLoading ? "Loading quizzes…" : "Select a quiz"} />
                  </SelectTrigger>
                  <SelectContent>
                    {sortedQuizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id}>
                        {quiz.title} ({quiz.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedQuiz && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Target status:</span>
                  <StatusBadge status={selectedQuiz.status} />
                  <span>· {selectedQuiz.questionCount} questions</span>
                </div>
              )}

              {selectedQuiz?.status === "published" && (
                <Alert variant="destructive">
                  <AlertTriangle className="size-4" aria-hidden="true" />
                  <AlertDescription>
                    This quiz is published. The copied question will appear immediately in public
                    play.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={duplicate.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleDuplicateClick}
              disabled={!source || !targetQuizId || duplicate.isPending || quizzesLoading}
            >
              {duplicate.isPending ? "Duplicating…" : "Duplicate"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={publishedConfirmOpen}
        onOpenChange={setPublishedConfirmOpen}
        title="Duplicate into published quiz?"
        description="This quiz is published. The copied question will appear immediately in public play."
        confirmLabel="Duplicate anyway"
        onConfirm={() => {
          setPublishedConfirmOpen(false);
          void runDuplicate();
        }}
      />
    </>
  );
}
