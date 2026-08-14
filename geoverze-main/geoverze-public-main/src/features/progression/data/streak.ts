/** Streak placeholders. */
export const STREAK_DATA = {
  current: 12,
  longest: 34,
  weeklyGoal: 5,
  /** Mon–Sun state for the current week. */
  week: [
    { day: "Mon", state: "done" },
    { day: "Tue", state: "done" },
    { day: "Wed", state: "missed" },
    { day: "Thu", state: "done" },
    { day: "Fri", state: "done" },
    { day: "Sat", state: "today" },
    { day: "Sun", state: "upcoming" },
  ],
} as const;

export type StreakDayState = (typeof STREAK_DATA.week)[number]["state"];

export const STREAK_MESSAGES: readonly string[] = [
  "Twelve days strong. One quiz keeps it alive.",
  "Your longest run is 34 days — 22 to go for a new personal best.",
  "Streaks multiply your daily XP bonus. Consistency beats intensity.",
] as const;
