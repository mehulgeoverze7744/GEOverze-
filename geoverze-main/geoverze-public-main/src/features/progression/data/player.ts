/**
 * Placeholder player progression snapshot.
 *
 * Every number here is illustrative. Shapes match what the future backend will
 * return, so wiring a real API means replacing this module only.
 */

export type PlayerSnapshot = {
  level: number;
  levelTitle: string;
  xp: number;
  /** XP required to reach the next level, measured from level start. */
  xpIntoLevel: number;
  xpForLevel: number;
  credits: number;
  monthlyGoal: number;
  currentStreak: number;
  longestStreak: number;
  accuracy: number;
  totalQuizzes: number;
  countriesExplored: number;
  countriesTotal: number;
  favoriteCategory: string;
};

export const PLAYER: PlayerSnapshot = {
  level: 14,
  levelTitle: "Cartographer",
  xp: 18_420,
  xpIntoLevel: 620,
  xpForLevel: 1_000,
  credits: 63,
  monthlyGoal: 100,
  currentStreak: 12,
  longestStreak: 34,
  accuracy: 87.4,
  totalQuizzes: 248,
  countriesExplored: 141,
  countriesTotal: 195,
  favoriteCategory: "Flags",
};

/** Monthly credit tracker shown across progression surfaces. */
export const MONTHLY_CREDITS = {
  goal: 100,
  rewardLabel: "GEOverze rewards",
  note: "Monthly earning progress resets each calendar month. Unused credits follow the rollover window for your plan.",
} as const;

/** @deprecated Use MONTHLY_CREDITS — kept for import compatibility during cutover. */
export const REDEMPTION = MONTHLY_CREDITS;
