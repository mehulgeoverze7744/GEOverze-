import type { Tables } from "@/lib/supabase/database.types";

import type { Difficulty } from "./categories";
import type { Quiz } from "./quizzes";

type QuizRow = Tables<"quizzes">;

/** Quiz row with embedded question ids from a nested Supabase select. */
export type PublishedQuizRow = QuizRow & {
  quiz_questions: { id: string }[];
};

function toDifficulty(value: string): Difficulty {
  if (value === "Easy" || value === "Medium" || value === "Hard" || value === "Expert") {
    return value;
  }
  return "Medium";
}

/** Days since the quiz was first created — lower values are newer. */
function ageDaysFromIso(iso: string): number {
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

/** Maps a published quizzes row (+ question count) to the Play Hub Quiz card shape. */
export function mapPublishedQuizRow(row: PublishedQuizRow): Quiz {
  return {
    id: row.id,
    title: row.title,
    categoryId: row.category_id,
    creator: row.creator,
    art: row.art,
    difficulty: toDifficulty(row.difficulty),
    questions: row.quiz_questions?.length ?? 0,
    minutes: row.minutes,
    players: 0,
    rating: 0,
    popularity: 0,
    ageDays: ageDaysFromIso(row.created_at),
  };
}

export function mapPublishedQuizRows(rows: PublishedQuizRow[]): Quiz[] {
  return rows.map(mapPublishedQuizRow);
}
