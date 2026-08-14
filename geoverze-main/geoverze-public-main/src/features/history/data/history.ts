/**
 * Quiz history model.
 *
 * Placeholder rows until the quiz engine persists sessions. Shapes match the
 * future `quiz_sessions` table so the table component can bind unchanged.
 */

export type QuizMode = "solo" | "pvp" | "multiplayer" | "daily";
export type QuizResult = "win" | "loss" | "complete";

export type QuizRun = {
  id: string;
  title: string;
  mode: QuizMode;
  score: number;
  total: number;
  /** ISO timestamp of the run. */
  playedAt: string;
  /** Duration in seconds. */
  duration: number;
  result: QuizResult;
  credits: number;
};

export const MODE_LABEL: Record<QuizMode, string> = {
  solo: "Solo",
  pvp: "PvP duel",
  multiplayer: "Multiplayer",
  daily: "Daily challenge",
};

export const RESULT_LABEL: Record<QuizResult, string> = {
  win: "Win",
  loss: "Loss",
  complete: "Completed",
};

const DAY = 86_400_000;
const ago = (days: number, hour: number) => {
  const d = new Date(Date.now() - days * DAY);
  d.setHours(hour, 15, 0, 0);
  return d.toISOString();
};

export const QUIZ_RUNS: readonly QuizRun[] = [
  {
    id: "q1",
    title: "Capitals of Asia",
    mode: "solo",
    score: 18,
    total: 20,
    playedAt: ago(0, 9),
    duration: 214,
    result: "complete",
    credits: 0,
  },
  {
    id: "q2",
    title: "Flag duel vs. Meridian",
    mode: "pvp",
    score: 11,
    total: 12,
    playedAt: ago(0, 8),
    duration: 168,
    result: "win",
    credits: 1,
  },
  {
    id: "q3",
    title: "Daily challenge",
    mode: "daily",
    score: 4,
    total: 5,
    playedAt: ago(1, 20),
    duration: 92,
    result: "complete",
    credits: 0,
  },
  {
    id: "q4",
    title: "Rivers & basins",
    mode: "solo",
    score: 15,
    total: 20,
    playedAt: ago(1, 12),
    duration: 305,
    result: "complete",
    credits: 0,
  },
  {
    id: "q5",
    title: "Flags of South America",
    mode: "multiplayer",
    score: 12,
    total: 12,
    playedAt: ago(2, 19),
    duration: 187,
    result: "win",
    credits: 1,
  },
  {
    id: "q6",
    title: "Border shapes sprint",
    mode: "pvp",
    score: 7,
    total: 12,
    playedAt: ago(3, 21),
    duration: 151,
    result: "loss",
    credits: 0,
  },
  {
    id: "q7",
    title: "Landmarks of the world",
    mode: "solo",
    score: 17,
    total: 20,
    playedAt: ago(4, 10),
    duration: 288,
    result: "complete",
    credits: 0,
  },
  {
    id: "q8",
    title: "Oceans & trenches",
    mode: "multiplayer",
    score: 9,
    total: 15,
    playedAt: ago(6, 18),
    duration: 231,
    result: "loss",
    credits: 0,
  },
  {
    id: "q9",
    title: "European capitals duel",
    mode: "pvp",
    score: 12,
    total: 12,
    playedAt: ago(9, 20),
    duration: 143,
    result: "win",
    credits: 1,
  },
  {
    id: "q10",
    title: "Daily challenge",
    mode: "daily",
    score: 5,
    total: 5,
    playedAt: ago(11, 7),
    duration: 78,
    result: "complete",
    credits: 0,
  },
  {
    id: "q11",
    title: "Currencies of Africa",
    mode: "solo",
    score: 13,
    total: 20,
    playedAt: ago(18, 15),
    duration: 342,
    result: "complete",
    credits: 0,
  },
  {
    id: "q12",
    title: "World mega quiz",
    mode: "multiplayer",
    score: 41,
    total: 50,
    playedAt: ago(26, 17),
    duration: 812,
    result: "win",
    credits: 1,
  },
] as const;

export type ModeFilter = QuizMode | "all";
export type ResultFilter = QuizResult | "all";
export type RangeFilter = "all" | "7d" | "30d";
export type SortKey = "recent" | "score" | "credits";

export const MODE_FILTERS: readonly { id: ModeFilter; label: string }[] = [
  { id: "all", label: "All modes" },
  { id: "solo", label: "Solo" },
  { id: "pvp", label: "PvP" },
  { id: "multiplayer", label: "Multiplayer" },
  { id: "daily", label: "Daily" },
] as const;

export const RESULT_FILTERS: readonly { id: ResultFilter; label: string }[] = [
  { id: "all", label: "Any result" },
  { id: "win", label: "Wins" },
  { id: "loss", label: "Losses" },
  { id: "complete", label: "Completed" },
] as const;

export const RANGE_FILTERS: readonly { id: RangeFilter; label: string }[] = [
  { id: "all", label: "All time" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
] as const;

export const SORT_OPTIONS: readonly { id: SortKey; label: string }[] = [
  { id: "recent", label: "Most recent" },
  { id: "score", label: "Highest score" },
  { id: "credits", label: "Credits earned" },
] as const;

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatClock(iso: string) {
  return new Date(iso).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
