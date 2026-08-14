import { useEffect, useLayoutEffect, useRef, type RefObject } from "react";

/**
 * Cleanup must run in the mutation phase: ScrollTrigger's `pin` wraps the
 * section in a pin-spacer, so if React removes the section before GSAP unwraps
 * it, the node's real parent is the spacer and `removeChild` throws.
 * Layout-effect cleanups run during React's deletion traversal; passive ones
 * run too late.
 */
const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Drives a single pinned ScrollTrigger and writes the raw scrub progress
 * (0 -> 1) into a mutable ref. Nothing re-renders: the R3F frame loop and a
 * lightweight rAF loop read the ref directly.
 */
export function useScrollProgress(
  sectionRef: RefObject<HTMLElement | null>,
  onProgress?: (p: number) => void,
) {
  const progress = useRef(0);
  const callback = useRef(onProgress);
  callback.current = onProgress;

  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      progress.current = 1;
      callback.current?.(1);
      return;
    }

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    let raf = 0;

    // ScrollTrigger can fire several times per frame; collapse all DOM writes
    // into a single rAF flush so layers never fight for the same frame.
    const flush = () => {
      raf = 0;
      callback.current?.(progress.current);
    };

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);

      ctx = gsap.context(() => {
        ScrollTrigger.create({
          trigger: section,
          start: "top top",
          end: "+=400%",
          pin: true,
          pinSpacing: true,
          scrub: true,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            progress.current = self.progress;
            if (!raf) raf = requestAnimationFrame(flush);
          },
        });
      }, section);

      ScrollTrigger.refresh();
    })();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [sectionRef]);

  return progress;
}
