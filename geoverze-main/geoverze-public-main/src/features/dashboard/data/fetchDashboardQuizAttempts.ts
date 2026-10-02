import { supabase } from "@/lib/supabase/client";

export type DashboardQuizAttempt = {
  id: string;
  quizId: string;
  title: string;
  mode: string;
  score: number;
  total: number;
  creditsEarned: number;
  completedAt: string;
};

type AttemptRow = {
  id: string;
  quiz_id: string;
  mode: string;
  score: number;
  total: number;
  credits_earned: number;
  completed_at: string;
  quizzes: { title: string } | { title: string }[] | null;
};

function quizTitle(row: AttemptRow): string {
  const related = row.quizzes;
  if (Array.isArray(related)) return related[0]?.title ?? "Quiz";
  return related?.title ?? "Quiz";
}

/** Latest quiz attempts for the signed-in explorer (RLS-scoped). */
export async function fetchDashboardQuizAttempts(limit = 6): Promise<DashboardQuizAttempt[]> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select(
      "id, quiz_id, mode, score, total, credits_earned, completed_at, quizzes!quiz_attempts_quiz_id_fkey(title)",
    )
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) throw new Error(error.message);

  return ((data ?? []) as AttemptRow[]).map((row) => ({
    id: row.id,
    quizId: row.quiz_id,
    title: quizTitle(row),
    mode: row.mode,
    score: row.score,
    total: row.total,
    creditsEarned: row.credits_earned,
    completedAt: row.completed_at,
  }));
}
