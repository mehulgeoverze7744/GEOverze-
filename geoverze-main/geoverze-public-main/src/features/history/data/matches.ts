/**
 * Match history placeholder records.
 *
 * Shaped like a future `matches` endpoint: one row per completed run with the
 * opponent (when the mode had one), score, timing and rewards.
 */

export type MatchMode = "solo" | "pvp" | "multiplayer" | "practice" | "daily" | "weekly";
export type MatchOutcome = "win" | "loss" | "draw" | "complete";

export type MatchRecord = {
  id: string;
  quizId: string;
  quizTitle: string;
  mode: MatchMode;
  opponent: string | null;
  opponentFlag: string | null;
  score: number;
  total: number;
  accuracy: number;
  outcome: MatchOutcome;
  /** ISO timestamp. */
  playedAt: string;
  /** Seconds. */
  durationSec: number;
  xp: number;
  credits: number;
};

export const MATCH_MODE_LABEL: Record<MatchMode, string> = {
  solo: "Solo",
  pvp: "PvP duel",
  multiplayer: "Multiplayer",
  practice: "Practice",
  daily: "Daily challenge",
  weekly: "Weekly challenge",
};

export const MATCH_OUTCOME_LABEL: Record<MatchOutcome, string> = {
  win: "Win",
  loss: "Loss",
  draw: "Draw",
  complete: "Completed",
};

const HOUR = 3_600_000;
const ago = (hours: number) => new Date(Date.now() - hours * HOUR).toISOString();

export const MATCHES: readonly MatchRecord[] = [
  {
    id: "m-01",
    quizId: "q-flag-blitz",
    quizTitle: "Flag Blitz",
    mode: "pvp",
    opponent: "meridian_kai",
    opponentFlag: "🇯🇵",
    score: 42,
    total: 50,
    accuracy: 84,
    outcome: "win",
    playedAt: ago(3),
    durationSec: 284,
    xp: 320,
    credits: 4,
  },
  {
    id: "m-02",
    quizId: "q-atlas-sprint",
    quizTitle: "Atlas Sprint",
    mode: "solo",
    opponent: null,
    opponentFlag: null,
    score: 26,
    total: 30,
    accuracy: 87,
    outcome: "complete",
    playedAt: ago(9),
    durationSec: 412,
    xp: 240,
    credits: 3,
  },
  {
    id: "m-03",
    quizId: "q-pin-the-place",
    quizTitle: "Pin the Place",
    mode: "pvp",
    opponent: "atlas_emma",
    opponentFlag: "🇸🇪",
    score: 13,
    total: 20,
    accuracy: 65,
    outcome: "loss",
    playedAt: ago(27),
    durationSec: 498,
    xp: 120,
    credits: 1,
  },
  {
    id: "m-04",
    quizId: "q-capital-cities",
    quizTitle: "Capital Confusion",
    mode: "daily",
    opponent: null,
    opponentFlag: null,
    score: 9,
    total: 10,
    accuracy: 90,
    outcome: "complete",
    playedAt: ago(31),
    durationSec: 143,
    xp: 180,
    credits: 5,
  },
  {
    id: "m-05",
    quizId: "q-grand-tour",
    quizTitle: "The Grand Tour",
    mode: "multiplayer",
    opponent: "Room of 12",
    opponentFlag: "🌍",
    score: 31,
    total: 40,
    accuracy: 78,
    outcome: "win",
    playedAt: ago(52),
    durationSec: 626,
    xp: 410,
    credits: 6,
  },
  {
    id: "m-06",
    quizId: "q-deep-blue",
    quizTitle: "Deep Blue",
    mode: "practice",
    opponent: null,
    opponentFlag: null,
    score: 22,
    total: 25,
    accuracy: 88,
    outcome: "complete",
    playedAt: ago(74),
    durationSec: 505,
    xp: 0,
    credits: 0,
  },
  {
    id: "m-07",
    quizId: "q-monuments",
    quizTitle: "Monument Hunt",
    mode: "pvp",
    opponent: "noor.maps",
    opponentFlag: "🇲🇦",
    score: 18,
    total: 24,
    accuracy: 75,
    outcome: "draw",
    playedAt: ago(96),
    durationSec: 361,
    xp: 200,
    credits: 2,
  },
  {
    id: "m-08",
    quizId: "q-extremes",
    quizTitle: "Earth's Extremes",
    mode: "weekly",
    opponent: null,
    opponentFlag: null,
    score: 34,
    total: 40,
    accuracy: 85,
    outcome: "complete",
    playedAt: ago(140),
    durationSec: 742,
    xp: 520,
    credits: 8,
  },
  {
    id: "m-09",
    quizId: "q-wildlands",
    quizTitle: "Wildlands",
    mode: "solo",
    opponent: null,
    opponentFlag: null,
    score: 19,
    total: 30,
    accuracy: 63,
    outcome: "complete",
    playedAt: ago(168),
    durationSec: 455,
    xp: 150,
    credits: 2,
  },
  {
    id: "m-10",
    quizId: "q-riverrun",
    quizTitle: "River Run",
    mode: "pvp",
    opponent: "delta_ravi",
    opponentFlag: "🇮🇳",
    score: 21,
    total: 25,
    accuracy: 84,
    outcome: "win",
    playedAt: ago(210),
    durationSec: 322,
    xp: 300,
    credits: 4,
  },
];

export type MatchFilterState = {
  mode: string;
  outcome: string;
  query: string;
};

export const INITIAL_MATCH_FILTERS: MatchFilterState = {
  mode: "any",
  outcome: "any",
  query: "",
};

export function filterMatches(rows: readonly MatchRecord[], f: MatchFilterState): MatchRecord[] {
  const q = f.query.trim().toLowerCase();
  return rows.filter((row) => {
    if (f.mode !== "any" && row.mode !== f.mode) return false;
    if (f.outcome !== "any" && row.outcome !== f.outcome) return false;
    if (q && !`${row.quizTitle} ${row.opponent ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function summariseMatches(rows: readonly MatchRecord[]) {
  const wins = rows.filter((r) => r.outcome === "win").length;
  const xp = rows.reduce((n, r) => n + r.xp, 0);
  const credits = rows.reduce((n, r) => n + r.credits, 0);
  const accuracy =
    rows.length === 0 ? 0 : Math.round(rows.reduce((n, r) => n + r.accuracy, 0) / rows.length);
  return { played: rows.length, wins, xp, credits, accuracy };
}

export function formatMatchDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatMatchDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${String(s).padStart(2, "0")}s`;
}
