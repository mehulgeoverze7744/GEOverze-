import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  calendarDateInZone,
  computeStreakStats,
  completionDatesFromTimestamps,
  dayCountLabel,
  isoWeekStart,
  liveCurrentStreak,
} from "./streakStats.ts";

describe("computeStreakStats", () => {
  it("first qualifying completion today is a 1-day streak", () => {
    const stats = computeStreakStats(["2026-10-17"], "2026-10-17");
    assert.equal(stats.current, 1);
    assert.equal(stats.longest, 1);
    assert.equal(stats.lastActiveDate, "2026-10-17");
  });

  it("multiple completions on the same day count once", () => {
    const stats = computeStreakStats(
      ["2026-10-17", "2026-10-17", "2026-10-17"],
      "2026-10-17",
    );
    assert.equal(stats.current, 1);
    assert.equal(stats.longest, 1);
    assert.equal(stats.daysThisWeek, 1);
  });

  it("consecutive calendar days continue the streak", () => {
    const stats = computeStreakStats(
      ["2026-10-15", "2026-10-16", "2026-10-17"],
      "2026-10-17",
    );
    assert.equal(stats.current, 3);
    assert.equal(stats.longest, 3);
  });

  it("a missed calendar day breaks the current streak", () => {
    const stats = computeStreakStats(["2026-10-14", "2026-10-15"], "2026-10-17");
    assert.equal(stats.current, 0);
    assert.equal(stats.longest, 2);
  });

  it("a return after a gap restarts at 1 only after a completion that day", () => {
    const before = computeStreakStats(["2026-10-14"], "2026-10-17");
    assert.equal(before.current, 0);
    const after = computeStreakStats(["2026-10-14", "2026-10-17"], "2026-10-17");
    assert.equal(after.current, 1);
    assert.equal(after.longest, 1);
  });

  it("not playing today keeps yesterday's streak without adding a day", () => {
    const stats = computeStreakStats(["2026-10-15", "2026-10-16"], "2026-10-17");
    assert.equal(stats.current, 2);
    assert.equal(stats.lastActiveDate, "2026-10-16");
  });

  it("opening the app with no completions stays at zero", () => {
    const stats = computeStreakStats([], "2026-10-17");
    assert.equal(stats.current, 0);
    assert.equal(stats.longest, 0);
    assert.equal(stats.daysThisWeek, 0);
    assert.equal(stats.weekPercent, 0);
  });

  it("invalid or empty timestamps do not fabricate activity", () => {
    const dates = completionDatesFromTimestamps([null, undefined, "", "not-a-date"]);
    assert.deepEqual(dates, []);
    const stats = computeStreakStats(dates, "2026-10-17");
    assert.equal(stats.current, 0);
    assert.equal(stats.longest, 0);
  });

  it("personal best survives a broken current streak", () => {
    const stats = computeStreakStats(
      ["2026-10-01", "2026-10-02", "2026-10-03", "2026-10-04", "2026-10-10"],
      "2026-10-17",
    );
    assert.equal(stats.current, 0);
    assert.equal(stats.longest, 4);
  });

  it("weekly activity counts distinct qualifying days in the ISO week", () => {
    // 2026-10-17 is Saturday; week starts Monday 2026-10-12.
    const stats = computeStreakStats(
      ["2026-10-12", "2026-10-13", "2026-10-16", "2026-10-17"],
      "2026-10-17",
    );
    assert.equal(isoWeekStart("2026-10-17"), "2026-10-12");
    assert.equal(stats.daysThisWeek, 4);
    assert.equal(stats.weekPercent, 80);
    assert.deepEqual(
      stats.week.map((day) => day.state),
      ["done", "done", "missed", "missed", "done", "done", "upcoming"],
    );
  });

  it("Asia/Kolkata midnight is used so UTC evening stays on the local day", () => {
    const lateUtc = new Date("2026-10-16T20:30:00.000Z");
    assert.equal(calendarDateInZone(lateUtc, "Asia/Kolkata"), "2026-10-17");
    const dates = completionDatesFromTimestamps([lateUtc.toISOString()]);
    const stats = computeStreakStats(dates, "2026-10-17");
    assert.equal(stats.current, 1);
  });
});

describe("liveCurrentStreak", () => {
  it("does not increment a cached streak just because the date changed", () => {
    assert.equal(liveCurrentStreak(4, "2026-10-16", "2026-10-17"), 4);
    assert.equal(liveCurrentStreak(4, "2026-10-15", "2026-10-17"), 0);
  });

  it("treats missing history as zero rather than a placeholder", () => {
    assert.equal(liveCurrentStreak(12, null, "2026-10-17"), 0);
    assert.equal(liveCurrentStreak(1, undefined, "2026-10-17"), 0);
  });
});

describe("dayCountLabel", () => {
  it("uses singular grammar for one day", () => {
    assert.equal(dayCountLabel(1), "1 day");
    assert.equal(dayCountLabel(0), "0 days");
    assert.equal(dayCountLabel(2), "2 days");
  });
});
