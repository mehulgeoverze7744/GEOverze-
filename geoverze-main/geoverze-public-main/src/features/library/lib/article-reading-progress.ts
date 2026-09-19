/** Minimum scroll progress before an article appears in Continue Reading. */
export const CONTINUE_READING_MIN_PERCENT = 3;

/** Auto-complete when scroll progress reaches this threshold. */
export const READING_COMPLETE_THRESHOLD = 95;

/** Debounced persistence interval while actively reading (ms). */
export const READING_PROGRESS_PERSIST_MS = 1_500;

export function clampReadingPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Scroll-based progress for the article body element only (excludes nav, related reading, footer).
 */
export function measureArticleReadPercent(contentEl: HTMLElement): number {
  const contentHeight = contentEl.offsetHeight;
  if (contentHeight <= 0) return 0;

  const rect = contentEl.getBoundingClientRect();
  const contentTop = rect.top + window.scrollY;
  const viewportBottom = window.scrollY + window.innerHeight;
  const scrolled = Math.max(0, viewportBottom - contentTop);
  return clampReadingPercent((scrolled / contentHeight) * 100);
}

/** Scroll position that approximates a stored progress percentage. */
export function scrollTargetForArticleProgress(contentEl: HTMLElement, percent: number): number {
  const contentHeight = contentEl.offsetHeight;
  if (contentHeight <= 0) return window.scrollY;

  const rect = contentEl.getBoundingClientRect();
  const contentTop = rect.top + window.scrollY;
  const targetScrolled = (clampReadingPercent(percent) / 100) * contentHeight;
  const viewportBottom = contentTop + targetScrolled;
  const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  return Math.min(maxScroll, Math.max(0, viewportBottom - window.innerHeight));
}
