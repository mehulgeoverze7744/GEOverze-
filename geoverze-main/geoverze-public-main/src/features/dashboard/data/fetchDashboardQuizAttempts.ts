import { supabase } from "@/lib/supabase/client";

export const DASHBOARD_RECENT_QUIZ_LIMIT = 6;
export const QUIZ_HISTORY_LIMIT = 200;

export type DashboardQuizAttempt = {
  id: string;
  quizId: string;
  title: string;
  mode: string;
  score: number;
  total: number;
  creditsEarned: number;
  completedAt: string;
  durationMs: number;
};

type AttemptRow = {
  id: string;
  attempt_id?: string | null;
  quiz_id: string;
  user_id: string;
  mode: string;
  score: number;
  total: number;
  credits_earned: number;
  completed_at: string;
  duration_ms: number;
};

type QuizTitleRow = {
  id: string;
  title: string;
};

function uniqueAttempts(rows: AttemptRow[]): AttemptRow[] {
  const seenIds = new Set<string>();
  const seenAttemptIds = new Set<string>();
  const unique: AttemptRow[] = [];

  for (const row of rows) {
    if (seenIds.has(row.id)) continue;
    const attemptKey = row.attempt_id?.trim();
    if (attemptKey && seenAttemptIds.has(attemptKey)) continue;
    seenIds.add(row.id);
    if (attemptKey) seenAttemptIds.add(attemptKey);
    unique.push(row);
  }

  return unique;
}

/** Latest completed quiz attempts for the signed-in explorer. */
export async function fetchDashboardQuizAttempts(
  userId: string,
  limit = DASHBOARD_RECENT_QUIZ_LIMIT,
): Promise<DashboardQuizAttempt[]> {
  if (!userId) return [];

  const fetchLimit = Math.max(1, limit);

  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(
      "id, attempt_id, quiz_id, user_id, mode, score, total, credits_earned, completed_at, duration_ms",
    )
    .eq("user_id", userId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(fetchLimit);

  if (error) throw new Error(error.message);

  const rows = uniqueAttempts((data ?? []) as AttemptRow[]).filter(
    (row) => row.user_id === userId,
  );

  const quizIds = [...new Set(rows.map((row) => row.quiz_id).filter(Boolean))];
  const titlesById = new Map<string, string>();

  if (quizIds.length > 0) {
    const { data: quizzes, error: quizzesError } = await supabase
      .from("quizzes")
      .select("id, title")
      .in("id", quizIds);

    if (quizzesError) throw new Error(quizzesError.message);

    for (const quiz of (quizzes ?? []) as QuizTitleRow[]) {
      if (quiz.title) titlesById.set(quiz.id, quiz.title);
    }
  }

  return rows.map((row) => ({
    id: row.id,
    quizId: row.quiz_id,
    title: titlesById.get(row.quiz_id) ?? row.quiz_id,
    mode: row.mode,
    score: row.score,
    total: row.total,
    creditsEarned: row.credits_earned,
    completedAt: row.completed_at,
    durationMs: row.duration_ms,
  }));
}
