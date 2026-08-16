import type { Tables, TablesInsert } from "@/lib/supabase/database.types";
import { supabase } from "@/lib/supabase/client";

const MAX_POSITION = 32767;

export type DuplicateQuestionResult = {
  newQuestionId: string;
  targetQuizId: string;
  position: number;
  targetPublished: boolean;
};

type QuestionContentFields = Pick<
  Tables<"quiz_questions">,
  | "type"
  | "prompt"
  | "explanation"
  | "media"
  | "options"
  | "answer_id"
  | "answer_ids"
  | "answer_bool"
  | "regions"
  | "board_art"
  | "accepted"
  | "placeholder"
  | "items"
  | "targets"
>;

function copyContentFields(source: Tables<"quiz_questions">): QuestionContentFields {
  return {
    type: source.type,
    prompt: source.prompt,
    explanation: source.explanation,
    media: source.media,
    options: source.options,
    answer_id: source.answer_id,
    answer_ids: source.answer_ids,
    answer_bool: source.answer_bool,
    regions: source.regions,
    board_art: source.board_art,
    accepted: source.accepted,
    placeholder: source.placeholder,
    items: source.items,
    targets: source.targets,
  };
}

/**
 * Copies one quiz_questions row into a target quiz as a new row.
 * Raw DB → DB copy — source row is never updated.
 */
export async function duplicateQuestionToQuiz(
  sourceQuestionId: string,
  targetQuizId: string,
): Promise<DuplicateQuestionResult> {
  const { data: source, error: sourceError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("id", sourceQuestionId)
    .single();

  if (sourceError || !source) {
    throw new Error(`Source question not found: ${sourceError?.message ?? "missing row"}`);
  }

  const { data: targetQuiz, error: targetError } = await supabase
    .from("quizzes")
    .select("id, is_published")
    .eq("id", targetQuizId)
    .single();

  if (targetError || !targetQuiz) {
    throw new Error(`Target quiz not found: ${targetError?.message ?? "missing row"}`);
  }

  const { data: maxRow, error: maxError } = await supabase
    .from("quiz_questions")
    .select("position")
    .eq("quiz_id", targetQuizId)
    .order("position", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (maxError) {
    throw new Error(`Could not determine question position: ${maxError.message}`);
  }

  const position = (maxRow?.position ?? 0) + 1;

  if (position > MAX_POSITION) {
    throw new Error("Question positions exceed the allowed range. Contact support.");
  }

  const newQuestionId = crypto.randomUUID();
  const payload: TablesInsert<"quiz_questions"> = {
    id: newQuestionId,
    quiz_id: targetQuizId,
    position,
    ...copyContentFields(source),
  };

  const { error: insertError } = await supabase.from("quiz_questions").insert(payload);

  if (insertError) {
    throw new Error(`Could not duplicate question: ${insertError.message}`);
  }

  return {
    newQuestionId,
    targetQuizId,
    position,
    targetPublished: targetQuiz.is_published,
  };
}
