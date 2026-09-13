/** Slugs eligible for the Continue Reading rail. */
export function isContinueReadingSlug(
  slug: string,
  progress: Readonly<Record<string, number>>,
  completed: readonly string[],
  dismissed: readonly string[],
): boolean {
  if (completed.includes(slug)) return false;
  if (dismissed.includes(slug)) return false;
  if (!(slug in progress)) return false;
  return (progress[slug] ?? 0) < 100;
}
