import { supabase } from "@/lib/supabase/client";

import { ratingFor, type RunSummary } from "../lib/session";
import type { AttemptResult } from "../lib/quizResultPersist";

type AttemptRow = {
  id: string;
  attempt_id?: string | null;
  quiz_id: string;
  user_id: string;
  correct: number;
  total: number;
  score: number;
  best_streak: number;
  duration_ms: number;
  xp_earned: number;
  credits_earned: number;
};

export type OwnedQuizAttemptView = {
  summary: RunSummary;
  serverResult: AttemptResult;
};

function toView(row: AttemptRow): OwnedQuizAttemptView {
  const accuracy = row.total === 0 ? 0 : row.correct / row.total;
  const wrong = Math.max(0, row.total - row.correct);
  return {
    summary: {
      total: row.total,
      correct: row.correct,
      wrong,
      skipped: 0,
      accuracy,
      score: row.score,
      xp: row.xp_earned,
      credits: row.credits_earned,
      streak: 0,
      bestStreak: row.best_streak,
      durationMs: row.duration_ms,
      rating: ratingFor(accuracy),
    },
    serverResult: {
      xp_earned: row.xp_earned,
      credits_earned: row.credits_earned,
      new_xp: 0,
      new_level: 0,
      level_up: false,
      new_streak: 0,
      new_credits: 0,
      total_quizzes: 0,
      total_correct: row.correct,
      total_answered: row.total,
      correct: row.correct,
      total: row.total,
      score: row.score,
      best_streak: row.best_streak,
      duplicate: true,
    },
  };
}

/** Load the signed-in user's own attempt. RLS must still restrict the row. */
export async function fetchOwnedQuizAttempt(
  userId: string,
  quizId: string,
  attemptId?: string | null,
): Promise<OwnedQuizAttemptView | null> {
  if (!userId || !quizId) return null;

  let query = supabase
    .from("quiz_attempts")
    .select(
      "id, attempt_id, quiz_id, user_id, correct, total, score, best_streak, duration_ms, xp_earned, credits_earned",
    )
    .eq("user_id", userId)
    .eq("quiz_id", quizId)
    .order("completed_at", { ascending: false })
    .limit(1);

  const safeAttemptId = attemptId && /^[0-9a-f-]{36}$/i.test(attemptId) ? attemptId : null;

  if (safeAttemptId) {
    query = supabase
      .from("quiz_attempts")
      .select(
        "id, attempt_id, quiz_id, user_id, correct, total, score, best_streak, duration_ms, xp_earned, credits_earned",
      )
      .eq("user_id", userId)
      .eq("quiz_id", quizId)
      .or(`id.eq.${safeAttemptId},attempt_id.eq.${safeAttemptId}`)
      .limit(1);
  }

  const { data, error } = await query;
  if (error || !data?.[0]) return null;
  const row = data[0] as unknown as AttemptRow;
  if (row.user_id !== userId || row.quiz_id !== quizId) return null;
  return toView(row);
}
