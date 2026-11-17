import { supabase } from "@/lib/supabase/client";

export type CategoryPerformance = {
  id: string;
  label: string;
  quizzes: number;
  accuracy: number;
  correct: number;
  answered: number;
};

export type MonthlyTrendPoint = {
  label: string;
  quizzes: number;
  accuracy: number;
};

export type AdvancedAnalytics = {
  totalQuizzes: number;
  accuracy: number;
  correct: number;
  answered: number;
  soloCount: number;
  pvpCount: number;
  multiplayerCount: number;
  categories: CategoryPerformance[];
  trend: MonthlyTrendPoint[];
  strengths: string[];
  weaknesses: string[];
};

type AttemptJoin = {
  id: string;
  mode: string;
  correct: number;
  total: number;
  completed_at: string;
  quizzes: { category_id: string | null; title: string | null } | null;
};

function monthKey(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return date.toLocaleDateString(undefined, { month: "short", year: "numeric" });
}

function labelCategory(id: string): string {
  return id
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (ch) => ch.toUpperCase());
}

/** Pro analytics from completed quiz_attempts (RLS-scoped). */
export async function fetchAdvancedAnalytics(userId: string): Promise<AdvancedAnalytics> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id, mode, correct, total, completed_at, quizzes(category_id, title)")
    .eq("user_id", userId)
    .order("completed_at", { ascending: true });

  if (error) throw new Error(error.message);

  const attempts = (data ?? []) as unknown as AttemptJoin[];
  const unique = new Map<string, AttemptJoin>();
  for (const row of attempts) unique.set(row.id, row);
  const rows = [...unique.values()];

  const correct = rows.reduce((sum, row) => sum + (Number(row.correct) || 0), 0);
  const answered = rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
  const accuracy = answered > 0 ? Math.round((correct / answered) * 1000) / 10 : 0;

  const byCategory = new Map<string, { correct: number; answered: number; quizzes: number }>();
  const byMonth = new Map<string, { correct: number; answered: number; quizzes: number }>();

  let soloCount = 0;
  let pvpCount = 0;
  let multiplayerCount = 0;

  for (const row of rows) {
    const mode = row.mode.toLowerCase();
    if (mode === "pvp") pvpCount += 1;
    else if (mode === "multiplayer") multiplayerCount += 1;
    else soloCount += 1;

    const categoryId = row.quizzes?.category_id ?? "general";
    const cat = byCategory.get(categoryId) ?? { correct: 0, answered: 0, quizzes: 0 };
    cat.correct += Number(row.correct) || 0;
    cat.answered += Number(row.total) || 0;
    cat.quizzes += 1;
    byCategory.set(categoryId, cat);

    const month = monthKey(row.completed_at);
    const point = byMonth.get(month) ?? { correct: 0, answered: 0, quizzes: 0 };
    point.correct += Number(row.correct) || 0;
    point.answered += Number(row.total) || 0;
    point.quizzes += 1;
    byMonth.set(month, point);
  }

  const categories: CategoryPerformance[] = [...byCategory.entries()]
    .map(([id, stats]) => ({
      id,
      label: labelCategory(id),
      quizzes: stats.quizzes,
      correct: stats.correct,
      answered: stats.answered,
      accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.quizzes - a.quizzes);

  const ranked = [...categories].sort((a, b) => b.accuracy - a.accuracy);
  const strengths = ranked.filter((row) => row.answered >= 8).slice(0, 3).map((row) => row.label);
  const weaknesses = ranked
    .filter((row) => row.answered >= 8)
    .slice(-3)
    .reverse()
    .map((row) => row.label);

  const trend: MonthlyTrendPoint[] = [...byMonth.entries()].map(([label, stats]) => ({
    label,
    quizzes: stats.quizzes,
    accuracy: stats.answered > 0 ? Math.round((stats.correct / stats.answered) * 1000) / 10 : 0,
  }));

  return {
    totalQuizzes: rows.length,
    accuracy,
    correct,
    answered,
    soloCount,
    pvpCount,
    multiplayerCount,
    categories,
    trend,
    strengths,
    weaknesses,
  };
}
