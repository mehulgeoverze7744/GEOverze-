/** Pure progression helpers. Display maths only — no persistence. */
import { LEVELS, type LevelTier } from "../data/levels";
import type { PlayerSnapshot } from "../data/player";

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
