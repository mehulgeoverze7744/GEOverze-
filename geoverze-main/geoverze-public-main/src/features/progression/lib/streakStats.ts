/** Calendar zone used for streak days — matches monthly reward-cycle midnight. */
export const STREAK_CALENDAR_TIMEZONE = "Asia/Kolkata";

/** Distinct qualifying days needed to fill the weekly goal meter. */
export const STREAK_WEEKLY_GOAL = 5;

export const WEEKDAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

export type StreakDayState = "done" | "missed" | "today" | "upcoming";

export type StreakWeekDay = {
  day: (typeof WEEKDAY_LABELS)[number];
  done: boolean;
  isToday: boolean;
  state: StreakDayState;
};

export type StreakStats = {
  current: number;
  longest: number;
  lastActiveDate: string | null;
  weeklyGoal: number;
  daysThisWeek: number;
  weekPercent: number;
  week: StreakWeekDay[];
};

const EMPTY_WEEK: StreakWeekDay[] = WEEKDAY_LABELS.map((day, index) => ({
  day,
  done: false,
  isToday: index === 0,
  state: index === 0 ? "today" : "upcoming",
}));

export const EMPTY_STREAK_STATS: StreakStats = {
  current: 0,
  longest: 0,
  lastActiveDate: null,
  weeklyGoal: STREAK_WEEKLY_GOAL,
  daysThisWeek: 0,
  weekPercent: 0,
  week: EMPTY_WEEK,
};

/** "1 day" / "2 days" */
export function dayCountLabel(count: number): string {
  const safe = Number.isFinite(count) ? Math.max(0, Math.trunc(count)) : 0;
  return safe === 1 ? "1 day" : `${safe} days`;
}

export function calendarDateInZone(instant: Date, timeZone = STREAK_CALENDAR_TIMEZONE): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(instant);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "00";

  return `${read("year")}-${read("month")}-${read("day")}`;
}

function parseDateOnly(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

function addUtcDays(dateOnly: string, days: number): string {
  const next = parseDateOnly(dateOnly);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

/** ISO Monday (YYYY-MM-DD) for the week containing `today`. */
export function isoWeekStart(today: string): string {
  const weekday = parseDateOnly(today).getUTCDay();
  const mondayOffset = weekday === 0 ? -6 : 1 - weekday;
  return addUtcDays(today, mondayOffset);
}

function uniqueSortedDates(values: readonly string[]): string[] {
  const unique = new Set<string>();
  for (const value of values) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) unique.add(value);
  }
  return [...unique].sort();
}

function longestConsecutive(sorted: readonly string[]): number {
  if (sorted.length === 0) return 0;
  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const current = sorted[i];
    if (prev && current && current === addUtcDays(prev, 1)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }
  return best;
}

function currentFromHistory(sorted: readonly string[], today: string): number {
  const last = sorted[sorted.length - 1];
  if (!last) return 0;

  const yesterday = addUtcDays(today, -1);
  if (last !== today && last !== yesterday) return 0;

  let count = 1;
  let expected = addUtcDays(last, -1);
  for (let i = sorted.length - 2; i >= 0; i -= 1) {
    if (sorted[i] !== expected) break;
    count += 1;
    expected = addUtcDays(expected, -1);
  }
  return count;
}

function weekStates(sortedSet: ReadonlySet<string>, today: string): StreakWeekDay[] {
  const start = isoWeekStart(today);
  return WEEKDAY_LABELS.map((day, index) => {
    const date = addUtcDays(start, index);
    const done = sortedSet.has(date);
    const isToday = date === today;
    const state: StreakDayState = done
      ? "done"
      : isToday
        ? "today"
        : date < today
          ? "missed"
          : "upcoming";
    return { day, done, isToday, state };
  });
}

/**
 * Authoritative streak math from distinct qualifying completion days.
 * Extra dates (e.g. the completion being recorded) are merged before scoring.
 */
export function computeStreakStats(
  completionDates: readonly string[],
  today: string,
  weeklyGoal = STREAK_WEEKLY_GOAL,
): StreakStats {
  const sorted = uniqueSortedDates(completionDates);
  const set = new Set(sorted);
  const week = weekStates(set, today);
  const daysThisWeek = week.filter((day) => day.done).length;
  const goal = Math.max(1, weeklyGoal);

  return {
    current: currentFromHistory(sorted, today),
    longest: longestConsecutive(sorted),
    lastActiveDate: sorted[sorted.length - 1] ?? null,
    weeklyGoal: goal,
    daysThisWeek,
    weekPercent: Math.min(100, Math.round((daysThisWeek / goal) * 100)),
    week,
  };
}

export function completionDatesFromTimestamps(
  timestamps: readonly (string | Date | null | undefined)[],
  timeZone = STREAK_CALENDAR_TIMEZONE,
): string[] {
  const dates: string[] = [];
  for (const value of timestamps) {
    if (!value) continue;
    const instant = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(instant.getTime())) continue;
    dates.push(calendarDateInZone(instant, timeZone));
  }
  return dates;
}

/** Display rule for a cached counter: expire if last play is older than yesterday. */
export function liveCurrentStreak(
  storedCurrent: number,
  lastPlayedDate: string | null | undefined,
  today: string,
): number {
  const stored = Number.isFinite(storedCurrent) ? Math.max(0, Math.trunc(storedCurrent)) : 0;
  if (!lastPlayedDate) return 0;
  const yesterday = addUtcDays(today, -1);
  if (lastPlayedDate === today || lastPlayedDate === yesterday) return stored;
  return 0;
}
