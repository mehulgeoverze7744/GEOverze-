/**
 * Country mastery and world-progress model.
 *
 * Placeholder figures until the quiz engine reports per-country telemetry.
 * Shapes match the future `country_progress` aggregate.
 */

export type ContinentMastery = {
  id: string;
  label: string;
  /** Countries mastered (all question types answered correctly at least once). */
  mastered: number;
  /** Countries seen in at least one quiz. */
  visited: number;
  total: number;
};

export const CONTINENT_MASTERY: readonly ContinentMastery[] = [
  { id: "europe", label: "Europe", mastered: 38, visited: 44, total: 44 },
  { id: "asia", label: "Asia", mastered: 27, visited: 41, total: 49 },
  { id: "africa", label: "Africa", mastered: 19, visited: 34, total: 54 },
  { id: "north-america", label: "North America", mastered: 14, visited: 20, total: 23 },
  { id: "south-america", label: "South America", mastered: 11, visited: 12, total: 12 },
  { id: "oceania", label: "Oceania", mastered: 5, visited: 9, total: 14 },
  { id: "antarctica", label: "Antarctica", mastered: 0, visited: 1, total: 1 },
] as const;

export function masteryPct(entry: ContinentMastery) {
  return Math.round((entry.mastered / entry.total) * 100);
}

export const WORLD_TOTAL = CONTINENT_MASTERY.reduce((sum, c) => sum + c.total, 0);

export const WORLD_PROGRESS = {
  visited: CONTINENT_MASTERY.reduce((sum, c) => sum + c.visited, 0),
  completed: CONTINENT_MASTERY.reduce((sum, c) => sum + c.mastered, 0),
  total: WORLD_TOTAL,
} as const;

export const WORLD_REMAINING = WORLD_PROGRESS.total - WORLD_PROGRESS.completed;

/** Themed tracks shown next to country mastery. */
export type ThemeTrack = { id: string; label: string; value: number; detail: string };

export const THEME_TRACKS: readonly ThemeTrack[] = [
  { id: "capitals", label: "Capitals", value: 54, detail: "105 of 195" },
  { id: "flags", label: "Flags", value: 48, detail: "94 of 195" },
  { id: "borders", label: "Borders & shapes", value: 37, detail: "72 of 195" },
  { id: "physical", label: "Physical geography", value: 31, detail: "Beginner tier" },
  { id: "currencies", label: "Currencies", value: 22, detail: "43 of 195" },
] as const;
