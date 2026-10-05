import { supabase } from "@/lib/supabase/client";

export type QuizProgressStats = {
  gamesPlayed: number;
  wins: number;
  accuracy: number;
  currentStreak: number;
};

type ProgressionRow = {
  total_quizzes: number;
  total_correct: number;
  total_answered: number;
  current_streak: number;
};

type AttemptRow = {
  id: string;
  mode: string;
  score: number;
  correct: number;
  total: number;
};

function uniqueAttempts(rows: AttemptRow[]): AttemptRow[] {
  const seen = new Set<string>();
  const unique: AttemptRow[] = [];
  for (const row of rows) {
    if (seen.has(row.id)) continue;
    seen.add(row.id);
    unique.push(row);
  }
  return unique;
}

function accuracyFrom(correct: number, answered: number): number {
  if (answered <= 0) return 0;
  return Math.round((correct / answered) * 100);
}

function isSoloFamily(mode: string): boolean {
  const normalized = mode.toLowerCase();
  return normalized === "solo" || normalized === "daily";
}

async function countCompetitiveWins(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from("pvp_rooms" as never)
    .select("id", { count: "exact", head: true })
    .eq("winner_user_id" as never, userId);

  if (error) return 0;
  return count ?? 0;
}

/** Live quiz snapshot for the signed-in explorer (RLS-scoped). */
export async function fetchQuizProgressStats(userId: string): Promise<QuizProgressStats> {
  const [progressionResult, attemptsResult, competitiveWins] = await Promise.all([
    supabase
      .from("user_progression")
      .select("total_quizzes, total_correct, total_answered, current_streak")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase.from("quiz_attempts").select("id, mode, score, correct, total").eq("user_id", userId),
    countCompetitiveWins(userId),
  ]);

  if (progressionResult.error) throw new Error(progressionResult.error.message);
  if (attemptsResult.error) throw new Error(attemptsResult.error.message);

  const progression = (progressionResult.data ?? null) as ProgressionRow | null;
  const attempts = uniqueAttempts((attemptsResult.data ?? []) as AttemptRow[]);

  const gamesPlayed = attempts.length > 0 ? attempts.length : (progression?.total_quizzes ?? 0);

  const attemptCorrect = attempts.reduce((sum, row) => sum + (Number(row.correct) || 0), 0);
  const attemptAnswered = attempts.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
  const accuracy =
    attemptAnswered > 0
      ? accuracyFrom(attemptCorrect, attemptAnswered)
      : accuracyFrom(progression?.total_correct ?? 0, progression?.total_answered ?? 0);

  const soloWins = attempts.filter(
    (row) => isSoloFamily(row.mode) && row.total > 0 && row.score === row.total,
  ).length;

  return {
    gamesPlayed: Math.max(0, gamesPlayed),
    wins: Math.max(0, competitiveWins + soloWins),
    accuracy,
    currentStreak: Math.max(0, progression?.current_streak ?? 0),
  };
}
