import { isLeaderboardAvailable, isLeaderboardPath } from "@/features/leaderboard";

/** Flip to `true` when daily objectives ship. Routes and components stay in place. */
export const DAILY_CHALLENGES_AVAILABLE = false;

/** Flip to `true` when weekly objectives ship. Routes and components stay in place. */
export const WEEKLY_CHALLENGES_AVAILABLE = false;

export function isDailyChallengesAvailable() {
  return DAILY_CHALLENGES_AVAILABLE;
}

export function isWeeklyChallengesAvailable() {
  return WEEKLY_CHALLENGES_AVAILABLE;
}

export function isDailyChallengesPath(to: string | undefined | null) {
  return to === "/play/daily-challenges";
}

export function isWeeklyChallengesPath(to: string | undefined | null) {
  return to === "/play/weekly-challenges";
}

/** Shared lock for Daily, Weekly, and Leaderboard progression nav items. */
export function isProgressionNavLocked(to: string | undefined | null) {
  if (isDailyChallengesPath(to) && !isDailyChallengesAvailable()) return true;
  if (isWeeklyChallengesPath(to) && !isWeeklyChallengesAvailable()) return true;
  return !isLeaderboardAvailable() && isLeaderboardPath(to);
}
