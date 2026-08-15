/** Pure progression helpers. Display maths only — no persistence. */
import { LEVELS, type LevelTier } from "../data/levels";
import type { PlayerSnapshot } from "../data/player";

/**
 * XP required to reach each level (index = level - 1).
 * Matches the CASE statement in the Phase 2C SQL migration.
 */
export const XP_THRESHOLDS: readonly number[] = [
  0, 500, 1000, 2000, 3500, 5500, 8000, 10500, 12000, 13200, 14800, 16000, 17200, 18000, 19000,
  20400, 22000, 24000, 26200, 28500,
];

/** Derive the level title from the LEVELS ladder (levels 12+) or "Explorer" below. */
export function getLevelTitle(level: number): string {
  const found = [...LEVELS].reverse().find((t) => t.level <= level);
  return found?.title ?? "Explorer";
}

/** XP into the current level and XP required for the full level span. */
export function getXpProgress(
  xp: number,
  level: number,
): { xpIntoLevel: number; xpForLevel: number } {
  const idx = Math.max(0, level - 1);
  const currentThreshold = XP_THRESHOLDS[idx] ?? 0;
  const nextThreshold = XP_THRESHOLDS[idx + 1] ?? currentThreshold + 2000;
  return {
    xpIntoLevel: Math.max(0, xp - currentThreshold),
    xpForLevel: Math.max(1, nextThreshold - currentThreshold),
  };
}

export function xpProgress(player: PlayerSnapshot) {
  const pct = Math.min(100, Math.round((player.xpIntoLevel / player.xpForLevel) * 100));
  return { pct, remaining: Math.max(0, player.xpForLevel - player.xpIntoLevel) };
}

export function creditProgress(credits: number, goal: number) {
  const pct = Math.min(100, Math.round((credits / goal) * 100));
  return { pct, remaining: Math.max(0, goal - credits), eligible: credits >= goal };
}

export function nextLevel(level: number): LevelTier | null {
  return LEVELS.find((tier) => tier.level > level) ?? null;
}

export function currentTier(level: number): LevelTier | null {
  return [...LEVELS].reverse().find((tier) => tier.level <= level) ?? null;
}

/** Current month label plus the placeholder reset date. */
export function monthMeta(now: Date = new Date()) {
  const month = now.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const reset = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    month,
    resetLabel: reset.toLocaleDateString(undefined, {
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
  };
}

export function monthlyCreditTotal(entries: readonly { credits: number }[]) {
  return entries.reduce((sum, entry) => sum + entry.credits, 0);
}
