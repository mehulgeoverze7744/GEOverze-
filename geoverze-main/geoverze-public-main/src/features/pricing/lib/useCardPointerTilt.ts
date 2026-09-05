import { useEffect, type RefObject } from "react";

type TiltLimits = {
  rotateX: number;
  rotateY: number;
};

/** Subtle pointer-follow 3D tilt while hovered — desktop pointer only. */
export function useCardPointerTilt(
  ref: RefObject<HTMLElement | null>,
  limits: TiltLimits = { rotateX: 3, rotateY: 5 },
) {
  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;

    if (reduced || coarse) return;

    const tiltX = mobile ? 1 : limits.rotateX;
    const tiltY = mobile ? 1 : limits.rotateY;

    let raf = 0;
    let active = false;

    const reset = () => {
      node.style.setProperty("--pointer-tilt-x", "0deg");
      node.style.setProperty("--pointer-tilt-y", "0deg");
      node.style.setProperty("--sheen-x", "18%");
      node.style.setProperty("--sheen-y", "0%");
    };

    const onEnter = () => {
      active = true;
    };

    const onLeave = () => {
      active = false;
      reset();
    };

    const onMove = (event: MouseEvent) => {
      if (!active) return;
      if (raf) return;

      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const rect = node.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;

        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;

        node.style.setProperty("--pointer-tilt-y", `${(nx * tiltY * 2).toFixed(3)}deg`);
        node.style.setProperty("--pointer-tilt-x", `${(-ny * tiltX * 2).toFixed(3)}deg`);
        node.style.setProperty("--sheen-x", `${(12 + nx * 28).toFixed(1)}%`);
        node.style.setProperty("--sheen-y", `${(-8 + ny * 16).toFixed(1)}%`);
      });
    };

    reset();
    node.addEventListener("mouseenter", onEnter);
    node.addEventListener("mouseleave", onLeave);
    node.addEventListener("mousemove", onMove);

    return () => {
      node.removeEventListener("mouseenter", onEnter);
      node.removeEventListener("mouseleave", onLeave);
      node.removeEventListener("mousemove", onMove);
      if (raf) window.cancelAnimationFrame(raf);
      reset();
    };
  }, [ref, limits.rotateX, limits.rotateY]);
}
