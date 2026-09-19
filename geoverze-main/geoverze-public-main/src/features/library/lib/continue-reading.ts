import { CONTINUE_READING_MIN_PERCENT } from "./article-reading-progress";

export const CONTINUE_READING_MAX_CARDS = 4;

/** Slugs eligible for the Continue Reading rail. */
export function isContinueReadingSlug(
  slug: string,
  progress: Readonly<Record<string, number>>,
  completed: readonly string[],
  dismissed: readonly string[],
): boolean {
  if (completed.includes(slug)) return false;
  if (dismissed.includes(slug)) return false;
  const percent = progress[slug];
  if (percent == null) return false;
  return percent >= CONTINUE_READING_MIN_PERCENT && percent < 100;
}

export function listContinueReadingSlugs(
  progress: Readonly<Record<string, number>>,
  completed: readonly string[],
  dismissed: readonly string[],
  progressReadAt: Readonly<Record<string, number>>,
): string[] {
  return Object.keys(progress)
    .filter((slug) => isContinueReadingSlug(slug, progress, completed, dismissed))
    .sort((a, b) => (progressReadAt[b] ?? 0) - (progressReadAt[a] ?? 0));
}
