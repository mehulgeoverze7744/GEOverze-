/** Pure filter/sort helpers for quiz history. */
import type { ModeFilter, QuizRun, RangeFilter, ResultFilter, SortKey } from "../data/history";

const DAY = 86_400_000;

export type HistoryFilters = {
  mode: ModeFilter;
  result: ResultFilter;
  range: RangeFilter;
  sort: SortKey;
};

export const DEFAULT_FILTERS: HistoryFilters = {
  mode: "all",
  result: "all",
  range: "all",
  sort: "recent",
};

export function filterRuns(runs: readonly QuizRun[], filters: HistoryFilters): QuizRun[] {
  const cutoff =
    filters.range === "7d"
      ? Date.now() - 7 * DAY
      : filters.range === "30d"
        ? Date.now() - 30 * DAY
        : null;

  const filtered = runs.filter((run) => {
    if (filters.mode !== "all" && run.mode !== filters.mode) return false;
    if (filters.result !== "all" && run.result !== filters.result) return false;
    if (cutoff !== null && new Date(run.playedAt).getTime() < cutoff) return false;
    return true;
  });

  const sorted = [...filtered];
  if (filters.sort === "score") {
    sorted.sort((a, b) => b.score / b.total - a.score / a.total);
  } else if (filters.sort === "credits") {
    sorted.sort((a, b) => b.credits - a.credits);
  } else {
    sorted.sort((a, b) => new Date(b.playedAt).getTime() - new Date(a.playedAt).getTime());
  }
  return sorted;
}

export function summarise(runs: readonly QuizRun[]) {
  const credits = runs.reduce((sum, run) => sum + run.credits, 0);
  const wins = runs.filter((run) => run.result === "win").length;
  const answered = runs.reduce((sum, run) => sum + run.total, 0);
  const correct = runs.reduce((sum, run) => sum + run.score, 0);
  return {
    runs: runs.length,
    credits,
    wins,
    accuracy: answered === 0 ? 0 : Math.round((correct / answered) * 100),
  };
}
