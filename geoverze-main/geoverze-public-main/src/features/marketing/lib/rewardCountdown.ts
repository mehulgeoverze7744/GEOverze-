/** Canonical monthly reward-cycle reset — change here if backend defines another zone. */
export const REWARD_CYCLE_TIMEZONE = "Asia/Kolkata";

export type RewardCountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function kolkataCalendarParts(now: Date) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: REWARD_CYCLE_TIMEZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: false,
  }).formatToParts(now);

  const read = (type: Intl.DateTimeFormatPartTypes) =>
    Number(parts.find((p) => p.type === type)?.value ?? 0);

  return {
    year: read("year"),
    month: read("month"),
    day: read("day"),
    hour: read("hour"),
    minute: read("minute"),
    second: read("second"),
  };
}

/** Midnight on the 1st of a calendar month in Asia/Kolkata, as a UTC instant. */
export function monthStartInRewardTimezone(year: number, month: number): Date {
  const istOffsetMs = (5 * 60 + 30) * 60 * 1000;
  return new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0) - istOffsetMs);
}

/** 00:00:00 on the first day of the next calendar month in the reward timezone. */
export function nextRewardDropTarget(now = new Date()): Date {
  const { year, month } = kolkataCalendarParts(now);
  let targetYear = year;
  let targetMonth = month + 1;
  if (targetMonth > 12) {
    targetMonth = 1;
    targetYear += 1;
  }
  return monthStartInRewardTimezone(targetYear, targetMonth);
}

export function rewardCountdownParts(target: Date, now = new Date()): RewardCountdownParts {
  const diffMs = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86_400);
  const hours = Math.floor((totalSeconds % 86_400) / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return { days, hours, minutes, seconds };
}

export function formatCountdownSegment(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatRewardCountdown(parts: RewardCountdownParts): string {
  return `${formatCountdownSegment(parts.days)} DAYS : ${formatCountdownSegment(parts.hours)} HOURS : ${formatCountdownSegment(parts.minutes)} MINS`;
}
