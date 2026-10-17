import { supabase } from "@/lib/supabase/client";

import {
  STREAK_WEEKLY_GOAL,
  calendarDateInZone,
  completionDatesFromTimestamps,
  computeStreakStats,
  type StreakStats,
} from "../lib/streakStats";

export const streakStatsQueryKey = ["streakStats"] as const;

type RpcStreakPayload = {
  current?: number;
  longest?: number;
  last_active_date?: string | null;
  weekly_goal?: number;
  days_this_week?: number;
  week_done?: boolean[];
};

function fromRpc(payload: RpcStreakPayload, today: string): StreakStats | null {
  if (typeof payload.current !== "number" || typeof payload.longest !== "number") {
    return null;
  }
  const computed = computeStreakStats([], today, payload.weekly_goal ?? STREAK_WEEKLY_GOAL);
  const weekDone = payload.week_done;
  const week =
    Array.isArray(weekDone) && weekDone.length === 7
      ? computed.week.map((day, index) => {
          const done = Boolean(weekDone[index]);
          const state = done
            ? "done"
            : day.isToday
              ? "today"
              : day.state === "upcoming"
                ? "upcoming"
                : "missed";
          return { ...day, done, state };
        })
      : computed.week;
  const daysThisWeek =
    typeof payload.days_this_week === "number"
      ? payload.days_this_week
      : week.filter((day) => day.done).length;
  const weeklyGoal = payload.weekly_goal ?? STREAK_WEEKLY_GOAL;

  return {
    current: Math.max(0, payload.current),
    longest: Math.max(0, payload.longest),
    lastActiveDate: payload.last_active_date ?? null,
    weeklyGoal,
    daysThisWeek,
    weekPercent: Math.min(100, Math.round((daysThisWeek / weeklyGoal) * 100)),
    week,
  };
}

async function fromAttempts(userId: string, today: string): Promise<StreakStats> {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("completed_at")
    .eq("user_id", userId);

  if (error) throw new Error(error.message);

  const dates = completionDatesFromTimestamps(
    (data ?? []).map((row) => (row as { completed_at?: string }).completed_at),
  );
  return computeStreakStats(dates, today);
}

/** Live streak snapshot for the signed-in user. Prefers the server RPC. */
export async function fetchStreakStats(userId: string): Promise<StreakStats> {
  const today = calendarDateInZone(new Date());

  const rpc = await supabase.rpc("get_my_streak_stats");
  if (!rpc.error && rpc.data && typeof rpc.data === "object") {
    const parsed = fromRpc(rpc.data as RpcStreakPayload, today);
    if (parsed) return parsed;
  }

  return fromAttempts(userId, today);
}
