import { mapQuestionRow } from "@/features/quizzes/data/quiz-mapper";
import type { BankQuestionRecord } from "@/features/questions/types";
import type { Tables } from "@/lib/supabase/database.types";
import { supabase } from "@/lib/supabase/client";

type QuestionRow = Tables<"quiz_questions">;

type QuizEmbed = Pick<
  Tables<"quizzes">,
  "id" | "title" | "is_published" | "created_at" | "updated_at"
>;

type QuestionRowWithQuiz = QuestionRow & {
  quizzes: QuizEmbed | QuizEmbed[] | null;
};

function resolveQuizEmbed(embed: QuizEmbed | QuizEmbed[] | null): QuizEmbed | null {
  if (!embed) return null;
  return Array.isArray(embed) ? (embed[0] ?? null) : embed;
}

function mapBankQuestionRow(row: QuestionRowWithQuiz): BankQuestionRecord {
  const quiz = resolveQuizEmbed(row.quizzes);
  const question = mapQuestionRow(row);

  return {
    ...question,
    status: quiz?.is_published ? "published" : "draft",
    createdAt: quiz?.created_at ?? question.createdAt,
    updatedAt: quiz?.updated_at ?? question.updatedAt,
    quizId: row.quiz_id,
    quizTitle: quiz?.title ?? "Unknown quiz",
    quizPublished: quiz?.is_published ?? false,
    quizCreatedAt: quiz?.created_at ?? "",
    quizUpdatedAt: quiz?.updated_at ?? "",
    position: row.position,
  };
}

/**
 * Read-only fetch of every quiz_questions row with parent quiz metadata.
 * Uses the authenticated browser session and existing Admin RLS.
 */
export async function fetchAllQuizQuestions(): Promise<BankQuestionRecord[]> {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select(
      `
      *,
      quizzes:quiz_id (
        id,
        title,
        is_published,
        created_at,
        updated_at
      )
    `,
    )
    .order("position", { ascending: true });

  if (error) {
    throw new Error(`Failed to load question bank: ${error.message}`);
  }

  if (!data?.length) return [];

  return (data as QuestionRowWithQuiz[]).map(mapBankQuestionRow);
}
