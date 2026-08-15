/**
 * Fetches the live published quiz catalogue from Supabase.
 *
 * Runtime source of truth for Play Hub discovery — not the static quizzes.ts list.
 */
import { supabase } from "@/lib/supabase/client";

import {
  mapPublishedQuizRows,
  type PublishedQuizRow,
} from "./quiz-catalog-mapper";
import type { Quiz } from "./quizzes";

/**
 * Load all published quizzes with question counts in one round trip.
 *
 * Uses a nested select on quiz_questions(id) so counts come from the DB
 * without a separate aggregation table or migration.
 */
export async function fetchPublishedQuizzes(): Promise<Quiz[]> {
  const { data, error } = await supabase
    .from("quizzes")
    .select("*, quiz_questions(id)")
    .eq("is_published", true)
    .order("updated_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to load published quizzes: ${error.message}`);
  }

  return mapPublishedQuizRows((data ?? []) as PublishedQuizRow[]);
}
