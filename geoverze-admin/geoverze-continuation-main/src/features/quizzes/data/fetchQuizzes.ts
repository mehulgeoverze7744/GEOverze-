import { supabase } from "@/lib/supabase/client";
import type { QuestionRecord } from "@/features/questions/types";
import type { QuizRecord } from "@/features/quizzes/types";

import { mapQuestionRow, mapQuizRow } from "./quiz-mapper";

export type QuizDetail = {
  quiz: QuizRecord;
  questions: QuestionRecord[];
};

/**
 * Read-only catalogue fetch. Uses the authenticated browser session and RLS.
 * Throws on Supabase errors — no mock fallback.
 */
export async function fetchQuizzes(): Promise<QuizRecord[]> {
  const { data: rows, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load quizzes: ${error.message}`);
  }

  if (!rows?.length) return [];

  const quizIds = rows.map((row) => row.id);
  const { data: questionRows, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("id, quiz_id")
    .in("quiz_id", quizIds);

  if (questionsError) {
    throw new Error(`Failed to load quiz question counts: ${questionsError.message}`);
  }

  const idsByQuiz = new Map<string, string[]>();
  for (const question of questionRows ?? []) {
    const list = idsByQuiz.get(question.quiz_id) ?? [];
    list.push(question.id);
    idsByQuiz.set(question.quiz_id, list);
  }

  return rows.map((row) => {
    const questionIds = idsByQuiz.get(row.id) ?? [];
    return mapQuizRow(row, {
      questionIds,
      questionCount: questionIds.length,
    });
  });
}

/**
 * Read-only quiz detail fetch including ordered questions.
 * Throws if the quiz is missing or Supabase returns an error.
 */
export async function fetchQuizById(id: string): Promise<QuizDetail> {
  const { data: row, error } = await supabase.from("quizzes").select("*").eq("id", id).single();

  if (error) {
    throw new Error(`Quiz "${id}" could not be loaded: ${error.message}`);
  }

  if (!row) {
    throw new Error(`Quiz "${id}" not found`);
  }

  const { data: questionRows, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", id)
    .order("position", { ascending: true });

  if (questionsError) {
    throw new Error(`Questions for quiz "${id}" could not be loaded: ${questionsError.message}`);
  }

  const questions = (questionRows ?? []).map(mapQuestionRow);
  const questionIds = questions.map((question) => question.id);

  return {
    quiz: mapQuizRow(row, {
      questionIds,
      questionCount: questions.length,
    }),
    questions,
  };
}
