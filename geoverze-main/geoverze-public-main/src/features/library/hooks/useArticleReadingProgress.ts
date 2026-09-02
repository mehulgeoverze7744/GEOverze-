import { useEffect, useRef } from "react";

import { useLibraryStore } from "@/stores/libraryStore";

const MIN_PERCENT_DELTA = 5;
const MIN_SYNC_INTERVAL_MS = 2_000;
const COMPLETE_THRESHOLD = 92;

/** Scroll-based reading progress with throttled store/server sync. */
export function useArticleReadingProgress(slug: string, enabled: boolean) {
  const setProgress = useLibraryStore((s) => s.setProgress);
  const markComplete = useLibraryStore((s) => s.markComplete);
  const storedProgress = useLibraryStore((s) => s.progress[slug] ?? 0);
  const isCompleted = useLibraryStore((s) => s.completed.includes(slug));

  const contentRef = useRef<HTMLElement | null>(null);
  const lastReported = useRef(Math.max(0, Math.min(100, storedProgress)));
  const lastWriteAt = useRef(0);
  const rafId = useRef<number | null>(null);

  useEffect(() => {
    lastReported.current = Math.max(lastReported.current, storedProgress);
  }, [storedProgress]);

  useEffect(() => {
    if (!enabled || isCompleted) return;

    const measure = () => {
      const el = contentRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const contentHeight = el.offsetHeight;
      if (contentHeight <= 0) return;

      const viewportBottom = window.scrollY + window.innerHeight;
      const contentTop = rect.top + window.scrollY;
      const scrolled = Math.max(0, viewportBottom - contentTop);
      const percent = Math.min(100, Math.round((scrolled / contentHeight) * 100));

      if (percent <= lastReported.current) return;

      const now = Date.now();
      const delta = percent - lastReported.current;
      if (delta < MIN_PERCENT_DELTA && now - lastWriteAt.current < MIN_SYNC_INTERVAL_MS) {
        return;
      }

      lastReported.current = percent;
      lastWriteAt.current = now;

      if (percent >= COMPLETE_THRESHOLD) {
        markComplete(slug);
      } else {
        setProgress(slug, percent);
      }
    };

    const onScroll = () => {
      if (rafId.current != null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        measure();
      });
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled, isCompleted, markComplete, setProgress, slug]);

  return { contentRef, storedProgress, isCompleted };
}
