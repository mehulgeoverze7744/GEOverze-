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

/** Redemption rule shown across the credit surfaces. */
export const REDEMPTION = {
  goal: 100,
  rewardLabel: "US$1",
  note: "Credits reset at the end of every calendar month.",
} as const;
