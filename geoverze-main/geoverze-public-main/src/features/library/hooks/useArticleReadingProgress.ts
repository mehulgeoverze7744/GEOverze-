import { useCallback, useEffect, useRef, useState } from "react";

import { useLibraryStore } from "@/stores/libraryStore";

import {
  CONTINUE_READING_MIN_PERCENT,
  measureArticleReadPercent,
  READING_COMPLETE_THRESHOLD,
  READING_PROGRESS_PERSIST_MS,
  scrollTargetForArticleProgress,
} from "../lib/article-reading-progress";

/** Scroll-based reading progress with throttled store/server sync and resume scroll. */
export function useArticleReadingProgress(slug: string, enabled: boolean) {
  const setProgress = useLibraryStore((s) => s.setProgress);
  const markComplete = useLibraryStore((s) => s.markComplete);
  const storedProgress = useLibraryStore((s) => s.progress[slug] ?? 0);
  const isCompleted = useLibraryStore((s) => s.completed.includes(slug));

  const contentRef = useRef<HTMLElement | null>(null);
  const lastPersisted = useRef(Math.max(0, Math.min(100, storedProgress)));
  const lastWriteAt = useRef(0);
  const rafId = useRef<number | null>(null);
  const livePercentRef = useRef(storedProgress);
  const [displayPercent, setDisplayPercent] = useState(storedProgress);
  const restoredRef = useRef(false);

  useEffect(() => {
    lastPersisted.current = Math.max(lastPersisted.current, storedProgress);
    livePercentRef.current = Math.max(livePercentRef.current, storedProgress);
    setDisplayPercent((prev) => Math.max(prev, storedProgress));
  }, [storedProgress]);

  const persistPercent = useCallback(
    (percent: number, force = false) => {
      const next = Math.max(lastPersisted.current, percent);
      if (!force && next <= lastPersisted.current) return;

      lastPersisted.current = next;
      lastWriteAt.current = Date.now();

      if (next >= READING_COMPLETE_THRESHOLD) {
        markComplete(slug);
      } else {
        setProgress(slug, next);
      }
    },
    [markComplete, setProgress, slug],
  );

  const measure = useCallback(() => {
    const el = contentRef.current;
    if (!el) return;

    const percent = measureArticleReadPercent(el);
    if (percent > livePercentRef.current) {
      livePercentRef.current = percent;
      setDisplayPercent(percent);
    }

    const now = Date.now();
    const delta = percent - lastPersisted.current;
    if (delta > 0 && (now - lastWriteAt.current >= READING_PROGRESS_PERSIST_MS || delta >= 5)) {
      persistPercent(percent);
    }
  }, [persistPercent]);

  useEffect(() => {
    if (!enabled || isCompleted) return;

    const onScroll = () => {
      if (rafId.current != null) return;
      rafId.current = window.requestAnimationFrame(() => {
        rafId.current = null;
        measure();
      });
    };

    const flush = () => {
      const el = contentRef.current;
      if (!el) return;
      const percent = measureArticleReadPercent(el);
      livePercentRef.current = Math.max(livePercentRef.current, percent);
      setDisplayPercent(livePercentRef.current);
      persistPercent(livePercentRef.current, true);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flush();
    });
    window.addEventListener("pagehide", flush);

    return () => {
      flush();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("pagehide", flush);
      if (rafId.current != null) {
        window.cancelAnimationFrame(rafId.current);
      }
    };
  }, [enabled, isCompleted, measure, persistPercent]);

  useEffect(() => {
    if (!enabled || isCompleted || restoredRef.current) return;
    if (storedProgress <= CONTINUE_READING_MIN_PERCENT) return;

    const el = contentRef.current;
    if (!el) return;

    let cancelled = false;
    let stableHeight = 0;
    let stableFrames = 0;

    const tryRestore = () => {
      if (cancelled || restoredRef.current) return;
      const height = el.offsetHeight;
      if (height <= 0) return;

      if (height === stableHeight) {
        stableFrames += 1;
      } else {
        stableHeight = height;
        stableFrames = 0;
      }

      if (stableFrames < 2) return;

      restoredRef.current = true;
      const targetY = scrollTargetForArticleProgress(el, storedProgress);
      window.scrollTo({ top: targetY, behavior: "auto" });
      requestAnimationFrame(measure);
    };

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(tryRestore);
    });
    observer.observe(el);
    requestAnimationFrame(tryRestore);

    return () => {
      cancelled = true;
      observer.disconnect();
    };
  }, [enabled, isCompleted, measure, storedProgress]);

  return { contentRef, displayPercent, isCompleted };
}
