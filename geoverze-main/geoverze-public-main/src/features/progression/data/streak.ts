import { STREAK_WEEKLY_GOAL, type StreakDayState } from "../lib/streakStats";

export { STREAK_WEEKLY_GOAL };
export type { StreakDayState };

/** @deprecated Use computeStreakStats / useStreakStats — kept for import compatibility. */
export const STREAK_DATA = {
  current: 0,
  longest: 0,
  weeklyGoal: STREAK_WEEKLY_GOAL,
  week: [
    { day: "Mon", state: "upcoming" },
    { day: "Tue", state: "upcoming" },
    { day: "Wed", state: "upcoming" },
    { day: "Thu", state: "upcoming" },
    { day: "Fri", state: "upcoming" },
    { day: "Sat", state: "upcoming" },
    { day: "Sun", state: "upcoming" },
  ],
} as const;
