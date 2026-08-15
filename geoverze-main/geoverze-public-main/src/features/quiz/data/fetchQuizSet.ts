/**
 * Async resolver for quiz content stored in Supabase.
 *
 * Fetches public.quizzes + public.quiz_questions and converts the database
 * rows back into the frontend QuizSet / QuizQuestion shapes that the quiz
 * engine expects.
 *
 * Throws an explicit Error on any Supabase failure — there is no silent
 * fallback to static data.  Callers (useQuizSet) surface the error to the UI.
 */
import { supabase } from "@/lib/supabase/client";
import type { Tables } from "@/lib/supabase/database.types";
import {
  type Choice,
  type MapRegion,
  type QuestionMedia,
  type QuizQuestion,
  type QuizSet,
} from "./types";

type QuizRow = Tables<"quizzes">;
type QuestionRow = Tables<"quiz_questions">;

// ---------------------------------------------------------------------------
// Row → QuizQuestion mapper
// ---------------------------------------------------------------------------

function mapQuestion(row: QuestionRow): QuizQuestion {
  const base = {
    id: row.id,
    prompt: row.prompt,
    ...(row.explanation != null ? { explanation: row.explanation } : {}),
    ...(row.media != null ? { media: row.media as unknown as QuestionMedia } : {}),
  };

  switch (row.type) {
    case "single":
      return {
        ...base,
        type: "single",
        options: (row.options ?? []) as unknown as Choice[],
        answerId: row.answer_id!,
      };

    case "multiple":
      return {
        ...base,
        type: "multiple",
        options: (row.options ?? []) as unknown as Choice[],
        answerIds: row.answer_ids!,
      };

    case "boolean":
      return {
        ...base,
        type: "boolean",
        answer: row.answer_bool!,
      };

    case "image":
      return {
        ...base,
        type: "image",
        options: (row.options ?? []) as unknown as Choice[],
        answerId: row.answer_id!,
      };

    case "map":
      return {
        ...base,
        type: "map",
        regions: (row.regions ?? []) as unknown as MapRegion[],
        answerId: row.answer_id!,
        boardArt: row.board_art!,
      };

    case "typed":
      return {
        ...base,
        type: "typed",
        accepted: row.accepted!,
        ...(row.placeholder != null ? { placeholder: row.placeholder } : {}),
      };

    case "order":
      return {
        ...base,
        type: "order",
        items: row.items!,
      };

    case "dragdrop":
      return {
        ...base,
        type: "dragdrop",
        items: row.items!,
        targets: row.targets!,
      };
  }
}

// ---------------------------------------------------------------------------
// Row → QuizSet mapper
// ---------------------------------------------------------------------------

function mapQuizSet(quiz: QuizRow, questions: QuestionRow[]): QuizSet {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description ?? "",
    categoryId: quiz.category_id,
    creator: quiz.creator,
    art: quiz.art,
    difficulty: quiz.difficulty as QuizSet["difficulty"],
    minutes: quiz.minutes,
    language: quiz.language,
    rewards: { xp: quiz.reward_xp, credits: quiz.reward_credits },
    // highScore / bestStreak are per-user progression values not yet stored in
    // the quizzes table.  They will be populated from user_progression in a
    // later phase.
    highScore: 0,
    bestStreak: 0,
    questions: questions.map(mapQuestion),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch a complete QuizSet from Supabase.
 *
 * Throws an Error if the quiz is not found or if the database returns an
 * error.  The caller (useQuizSet) catches this and surfaces an error state
 * to the UI.
 */
export async function fetchQuizSet(id: string): Promise<QuizSet> {
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .single();

  if (quizError || !quiz) {
    throw new Error(
      `Quiz "${id}" could not be loaded: ${quizError?.message ?? "not found"}`,
    );
  }

  const { data: questions, error: questionsError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", id)
    .order("position");

  if (questionsError) {
    throw new Error(
      `Questions for quiz "${id}" could not be loaded: ${questionsError.message}`,
    );
  }

  return mapQuizSet(quiz, questions ?? []);
}
