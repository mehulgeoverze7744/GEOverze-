import type { QuestionRecord } from "@/features/questions/types";
import { validateQuestion } from "@/features/questions/validation";
import {
  EDITOR_SUPPORTED_TYPES,
  isComplexDbType,
  questionRecordToRow,
  questionRecordToUpdate,
  type QuestionRecordWithPreserved,
} from "@/features/questions/data/question-mapper";
import { supabase } from "@/lib/supabase/client";

import { mapQuestionRow } from "@/features/quizzes/data/quiz-mapper";

export async function createQuestion(
  quizId: string,
  question: QuestionRecord,
): Promise<QuestionRecord> {
  if (!EDITOR_SUPPORTED_TYPES.includes(question.type)) {
    throw new Error(
      `Cannot create "${question.type}" questions from the editor yet. Supported types: ${EDITOR_SUPPORTED_TYPES.join(", ")}.`,
    );
  }

  const issues = validateQuestion(question);
  if (issues.length > 0) {
    throw new Error(issues.map((i) => i.message).join(" "));
  }

  const { data: maxRow, error: maxError } = await supabase
    .from("quiz_questions")
    .select("position")
    .eq("quiz_id", quizId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    throw new Error(`Could not determine question position: ${maxError.message}`);
  }

  const position = (maxRow?.position ?? 0) + 1;
  const id = crypto.randomUUID();
  const payload = questionRecordToRow(quizId, position, question, id);

  const { data, error } = await supabase
    .from("quiz_questions")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Could not create question: ${error.message}`);
  }

  return mapQuestionRow(data);
}

export async function updateQuestion(
  questionId: string,
  question: QuestionRecordWithPreserved,
): Promise<void> {
  const dbType = question.preservedDbFields?.["type"];
  if (dbType && isComplexDbType(dbType)) {
    const { error } = await supabase
      .from("quiz_questions")
      .update({
        prompt: question.prompt.trim(),
        explanation: question.explanation.trim() || null,
      })
      .eq("id", questionId);

    if (error) {
      throw new Error(`Could not update question: ${error.message}`);
    }
    return;
  }

  if (!EDITOR_SUPPORTED_TYPES.includes(question.type)) {
    throw new Error(
      `Cannot save "${question.type}" questions from the editor. Only prompt/explanation can be edited for complex types.`,
    );
  }

  const issues = validateQuestion(question);
  if (issues.length > 0) {
    throw new Error(issues.map((i) => i.message).join(" "));
  }

  const payload = questionRecordToUpdate(question);
  const { error } = await supabase.from("quiz_questions").update(payload).eq("id", questionId);

  if (error) {
    throw new Error(`Could not update question: ${error.message}`);
  }
}

export async function deleteQuestion(questionId: string): Promise<void> {
  const { data: row, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("quiz_id, position")
    .eq("id", questionId)
    .single();

  if (fetchError || !row) {
    throw new Error(`Question not found: ${fetchError?.message ?? "missing"}`);
  }

  const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId);

  if (error) {
    throw new Error(`Could not delete question: ${error.message}`);
  }

  const { data: remaining, error: listError } = await supabase
    .from("quiz_questions")
    .select("id")
    .eq("quiz_id", row.quiz_id)
    .order("position", { ascending: true });

  if (listError) {
    throw new Error(`Question deleted but reorder failed: ${listError.message}`);
  }

  if (remaining?.length) {
    await reorderQuestions(
      row.quiz_id,
      remaining.map((q) => q.id),
    );
  }
}

/**
 * Safe two-phase reorder using only valid positive positions.
 *
 * Constraints: UNIQUE (quiz_id, position), CHECK (position >= 1), position is smallint.
 *
 * Phase 1 — move every row to a non-overlapping staging band above the current max
 *           (tempBase .. tempBase + n - 1), freeing slots 1..n.
 * Phase 2 — assign final positions 1..n in the desired order.
 *
 * Preserves question UUIDs. No negative/zero positions.
 */
export async function reorderQuestions(
  quizId: string,
  orderedQuestionIds: string[],
): Promise<void> {
  const n = orderedQuestionIds.length;
  if (n === 0) return;

  const { data: existing, error: fetchError } = await supabase
    .from("quiz_questions")
    .select("id, position")
    .eq("quiz_id", quizId);

  if (fetchError) {
    throw new Error(`Could not load questions for reorder: ${fetchError.message}`);
  }

  if (!existing || existing.length !== n) {
    throw new Error(
      "Reorder requires the full question list for this quiz. Refresh and try again.",
    );
  }

  const existingIds = new Set(existing.map((row) => row.id));
  for (const id of orderedQuestionIds) {
    if (!existingIds.has(id)) {
      throw new Error("Reorder list contains a question that does not belong to this quiz.");
    }
  }

  const maxPos = Math.max(...existing.map((row) => row.position), n);
  const tempBase = maxPos + 1;

  if (tempBase + n - 1 > 32767) {
    throw new Error("Question positions exceed the allowed range. Contact support.");
  }

  for (let i = 0; i < n; i++) {
    const id = orderedQuestionIds[i] as string;
    const { error } = await supabase
      .from("quiz_questions")
      .update({ position: tempBase + i })
      .eq("id", id)
      .eq("quiz_id", quizId);

    if (error) {
      throw new Error(`Could not reorder questions (phase 1): ${error.message}`);
    }
  }

  for (let i = 0; i < n; i++) {
    const id = orderedQuestionIds[i] as string;
    const { error } = await supabase
      .from("quiz_questions")
      .update({ position: i + 1 })
      .eq("id", id)
      .eq("quiz_id", quizId);

    if (error) {
      throw new Error(`Could not reorder questions (phase 2): ${error.message}`);
    }
  }
}

export async function moveQuestion(
  quizId: string,
  questionId: string,
  orderedQuestionIds: string[],
  delta: number,
): Promise<void> {
  const index = orderedQuestionIds.indexOf(questionId);
  if (index < 0) return;

  const target = index + delta;
  if (target < 0 || target >= orderedQuestionIds.length) return;

  const next = [...orderedQuestionIds];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item as string);
  await reorderQuestions(quizId, next);
}
