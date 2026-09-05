import { useEffect, useLayoutEffect } from "react";

import type { RefObject } from "react";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export type RosterCardMotion = {
  rotate: number;
  driftX: number;
  translateZ: number;
};

/** Per-card scroll parallax for the gold Why Upgrade roster. */
export const UPGRADE_ROSTER_MOTION: RosterCardMotion[] = [
  { rotate: -1.5, driftX: -14, translateZ: 4 },
  { rotate: 1.2, driftX: 12, translateZ: 12 },
  { rotate: -0.8, driftX: -22, translateZ: 18 },
  { rotate: -1.3, driftX: 10, translateZ: 10 },
  { rotate: 1.4, driftX: -16, translateZ: 6 },
];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

/** Scroll-driven parallax for asymmetric upgrade roster slots. */
export function useUpgradeRosterParallax(
  sectionRef: RefObject<HTMLElement | null>,
  cardRefs: RefObject<(HTMLElement | null)[]>,
) {
  useIsomorphicLayoutEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const motionScale = mobile ? 0.4 : 1;
    const rotateScale = mobile ? 0.35 : 1;

    const applyStatic = () => {
      UPGRADE_ROSTER_MOTION.forEach((motion, index) => {
        const node = cardRefs.current?.[index];
        if (!node) return;
        node.style.transform = `translate3d(0, 0, ${motion.translateZ}px) rotate(${motion.rotate * rotateScale}deg)`;
      });
    };

    if (reduced) {
      applyStatic();
      return;
    }

    let raf = 0;

    const update = () => {
      raf = 0;
      const rect = section.getBoundingClientRect();
      const viewportH = window.innerHeight;
      const centerOffset = rect.top + rect.height * 0.5 - viewportH * 0.5;
      const progress = clamp(centerOffset / (viewportH + rect.height * 0.45), -1, 1);

      UPGRADE_ROSTER_MOTION.forEach((motion, index) => {
        const node = cardRefs.current?.[index];
        if (!node) return;

        const x = motion.driftX * progress * motionScale;
        node.style.transform = [
          `translate3d(${x.toFixed(2)}px, 0, ${motion.translateZ}px)`,
          `rotate(${(motion.rotate * rotateScale).toFixed(3)}deg)`,
        ].join(" ");
      });
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [sectionRef, cardRefs]);
}
