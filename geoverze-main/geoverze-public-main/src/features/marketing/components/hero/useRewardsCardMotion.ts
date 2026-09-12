import { useEffect, type RefObject } from "react";

import { useReducedMotion } from "@/hooks/useReducedMotion";

const REST_ROT_X = -2.5;
const REST_ROT_Y = 3.5;
const MAX_TILT_X = 5;
const MAX_TILT_Y = 6;
const LERP = 0.085;
const FLOAT_AMPLITUDE = 5;
const FLOAT_SPEED = 0.42;

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

function scrollExitT(progress: number) {
  return clamp01((progress - 0.08) / 0.28);
}

/**
 * Imperative rAF loop for premium 3D card motion: cursor tilt, float, scroll exit.
 * Reads scroll progress from a ref — no React re-renders while scrolling.
 */
export function useRewardsCardMotion(
  stageRef: RefObject<HTMLElement | null>,
  shadowRef: RefObject<HTMLElement | null>,
  glowRef: RefObject<HTMLElement | null>,
  scrollProgressRef?: RefObject<number>,
) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const coarsePointer = window.matchMedia("(hover: none) and (pointer: coarse)").matches;
    const tiltEnabled = !reducedMotion && !coarsePointer;

    const target = { rotX: REST_ROT_X, rotY: REST_ROT_Y };
    const current = { rotX: REST_ROT_X, rotY: REST_ROT_Y };
    let raf = 0;
    const startTime = performance.now();

    const onPointerMove = (event: PointerEvent) => {
      if (!tiltEnabled) return;
      const rect = stage.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return;

      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;

      target.rotY = REST_ROT_Y + nx * MAX_TILT_Y;
      target.rotX = REST_ROT_X + -ny * MAX_TILT_X;
    };

    const onPointerLeave = () => {
      target.rotX = REST_ROT_X;
      target.rotY = REST_ROT_Y;
    };

    stage.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerleave", onPointerLeave);

    const tick = () => {
      raf = requestAnimationFrame(tick);

      current.rotX += (target.rotX - current.rotX) * LERP;
      current.rotY += (target.rotY - current.rotY) * LERP;

      const elapsed = (performance.now() - startTime) / 1000;
      const floatY = reducedMotion ? 0 : Math.sin(elapsed * FLOAT_SPEED) * FLOAT_AMPLITUDE;

      const rawProgress = scrollProgressRef?.current ?? 0;
      const exit = reducedMotion ? 0 : scrollExitT(rawProgress);
      const exitX = exit * 100;
      const exitY = exit * -80;
      const exitScale = 1 - exit * 0.06;
      const exitOpacity = 1 - exit;

      const tiltMag =
        Math.abs(current.rotX - REST_ROT_X) + Math.abs(current.rotY - REST_ROT_Y);

      stage.style.transform = [
        `translate3d(${exitX.toFixed(2)}px, ${(floatY + exitY).toFixed(2)}px, 0)`,
        `scale(${exitScale.toFixed(4)})`,
        `rotateX(${current.rotX.toFixed(3)}deg)`,
        `rotateY(${current.rotY.toFixed(3)}deg)`,
      ].join(" ");
      stage.style.opacity = String(exitOpacity);
      stage.style.pointerEvents = exitOpacity < 0.12 ? "none" : "auto";

      const shadow = shadowRef.current;
      if (shadow) {
        const lift = Math.max(0, -current.rotX - REST_ROT_X) * 1.6;
        shadow.style.opacity = String((0.32 + tiltMag * 0.018) * exitOpacity);
        shadow.style.transform = [
          `translate3d(${(exitX * 0.35).toFixed(2)}px, ${(28 + lift + floatY * 0.25 + exitY * 0.4).toFixed(2)}px, -48px)`,
          `scale(${(0.94 + lift * 0.004).toFixed(4)})`,
        ].join(" ");
      }

      const glow = glowRef.current;
      if (glow) {
        glow.style.opacity = String((0.42 + tiltMag * 0.02) * exitOpacity);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      stage.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [reducedMotion, scrollProgressRef, stageRef, shadowRef, glowRef]);
}
