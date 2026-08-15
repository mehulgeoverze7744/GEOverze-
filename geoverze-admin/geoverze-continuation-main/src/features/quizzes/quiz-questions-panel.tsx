import { useState } from "react";
import { AlertTriangle, Plus, Trash2 } from "lucide-react";

import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { SectionHeader } from "@/components/shared/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  createBlankQuestion,
  QuestionEditor,
} from "@/features/questions/question-editor";
import { isComplexDbType } from "@/features/questions/data/question-mapper";
import { useQuestionMutations } from "@/features/questions/hooks/useQuestionMutations";
import type { QuestionRecord } from "@/features/questions/types";

export interface QuizQuestionsPanelProps {
  quizId: string;
  questions: QuestionRecord[];
}

export function QuizQuestionsPanel({ quizId, questions }: QuizQuestionsPanelProps) {
  const mutations = useQuestionMutations(quizId);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<QuestionRecord | null>(null);

  const orderedIds = questions.map((q) => q.id);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (question: QuestionRecord) => {
    setEditing(question);
    setEditorOpen(true);
  };

  const handleSave = (question: QuestionRecord) => {
    if (editing?.id) {
      mutations.update.mutate({ ...question, id: editing.id });
    } else {
      mutations.create.mutate(question);
    }
  };

  return (
    <>
      <section className="rounded-lg border border-border bg-card">
        <SectionHeader
          title={`Question set (${questions.length})`}
          description="Create, edit and reorder questions for this quiz."
          className="border-b border-border px-4 py-3"
          actions={
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" aria-hidden="true" />
              Add question
            </Button>
          }
        />

        {questions.length === 0 ? (
          <EmptyState
            title="No questions yet"
            description="Add at least three questions before publishing this quiz."
            action={
              <Button size="sm" variant="outline" className="mt-2" onClick={openCreate}>
                Add first question
              </Button>
            }
          />
        ) : (
          <ol className="divide-y divide-border">
            {questions.map((question, index) => {
              const dbType = question.preservedDbFields?.["type"];
              const isComplex = dbType != null && isComplexDbType(dbType);

              return (
                <li key={question.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="w-6 shrink-0 text-xs text-muted-foreground tabular">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">{question.prompt}</p>
                    <p className="text-xs text-muted-foreground">
                      {question.type}
                      {isComplex ? " · complex type (limited editing)" : ""}
                    </p>
                    {isComplex && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Map, order and drag-drop fields are preserved in the database. Only prompt
                        and explanation can be edited here.
                      </p>
                    )}
                  </div>
                  <DifficultyBadge level={question.difficulty} />
                  <StatusBadge status={question.status} />
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      disabled={mutations.move.isPending}
                      onClick={() =>
                        mutations.move.mutate({
                          questionId: question.id,
                          orderedIds,
                          delta: -1,
                        })
                      }
                      aria-label={`Move question ${index + 1} up`}
                    >
                      ↑
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2"
                      disabled={mutations.move.isPending}
                      onClick={() =>
                        mutations.move.mutate({
                          questionId: question.id,
                          orderedIds,
                          delta: 1,
                        })
                      }
                      aria-label={`Move question ${index + 1} down`}
                    >
                      ↓
                    </Button>
                    <Button variant="outline" size="sm" className="h-7" onClick={() => openEdit(question)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 text-destructive"
                      onClick={() => setDeleteTarget(question)}
                      aria-label={`Delete question ${index + 1}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ol>
        )}

        {questions.length > 0 && questions.length < 3 && (
          <Alert className="m-4 border-warning/30 bg-warning/10">
            <AlertTriangle className="size-4" aria-hidden="true" />
            <AlertDescription>
              Publishing requires at least 3 questions. Add {3 - questions.length} more.
            </AlertDescription>
          </Alert>
        )}
      </section>

      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        question={editing}
        onSave={handleSave}
        quizScoped
      />

      {deleteTarget && (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && setDeleteTarget(null)}
          title="Delete this question?"
          description="This removes the question from this quiz permanently."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            mutations.remove.mutate(deleteTarget.id);
            setDeleteTarget(null);
          }}
        />
      )}
    </>
  );
}
