/** Flip to `true` when global standings ship. Routes and components stay in place. */
export const LEADERBOARD_AVAILABLE = false;

export function isLeaderboardAvailable() {
  return LEADERBOARD_AVAILABLE;
}

export function isLeaderboardPath(to: string | undefined | null) {
  return to === "/leaderboard" || to === "/play/leaderboard";
}
