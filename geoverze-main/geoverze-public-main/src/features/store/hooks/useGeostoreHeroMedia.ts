import { useEffect, useRef } from "react";

/** Vite public asset — file must live at public/geostore-hero.mp4 */
export const GEOSTORE_HERO_VIDEO_SRC = "/geostore-hero.mp4";

const EDGE_SECONDS = 0.04;

/**
 * Ping-pong the muted visual video (forward → reverse → forward)
 * while original audio plays independently, always forward, never reversed.
 */
export function useGeostoreHeroMedia() {
  const visualRef = useRef<HTMLVideoElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const visual = visualRef.current;
    if (!visual) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let direction: "forward" | "reverse" = "forward";
    let raf = 0;
    let lastTick = 0;
    let inView = true;
    let disposed = false;
    let audioUnlocked = false;
    let seeking = false;

    const audio = new Audio(GEOSTORE_HERO_VIDEO_SRC);
    audio.loop = true;
    audio.preload = "auto";
    audio.playsInline = true;

    const cancelReverse = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const playForward = () => {
      if (disposed || !inView || reducedMotion) return;
      direction = "forward";
      cancelReverse();
      visual.muted = true;
      visual.playbackRate = 1;
      void visual.play().catch(() => undefined);
    };

    const reverseTick = (now: number) => {
      if (disposed || direction !== "reverse" || !inView || seeking) return;
      const dt = lastTick ? Math.min(0.05, (now - lastTick) / 1000) : 1 / 30;
      lastTick = now;
      const next = visual.currentTime - dt;
      if (next <= EDGE_SECONDS) {
        visual.currentTime = 0;
        playForward();
        return;
      }
      seeking = true;
      const onSeeked = () => {
        seeking = false;
        if (disposed || direction !== "reverse") return;
        raf = requestAnimationFrame(reverseTick);
      };
      visual.addEventListener("seeked", onSeeked, { once: true });
      visual.currentTime = next;
    };

    const startReverse = () => {
      if (disposed || direction === "reverse" || !inView || reducedMotion) return;
      direction = "reverse";
      visual.pause();
      lastTick = 0;
      cancelReverse();
      raf = requestAnimationFrame(reverseTick);
    };

    const onTimeUpdate = () => {
      if (direction !== "forward" || !visual.duration) return;
      if (visual.currentTime >= visual.duration - EDGE_SECONDS) {
        startReverse();
      }
    };

    const onEnded = () => {
      if (direction === "forward") startReverse();
    };

    const onError = () => {
      const err = visual.error;
      console.error("[GEOstore hero] video failed to load", GEOSTORE_HERO_VIDEO_SRC, {
        code: err?.code,
        message: err?.message,
      });
    };

    const tryStartAudio = () => {
      if (disposed || reducedMotion || !inView) return;
      void audio.play().then(
        () => {
          audioUnlocked = true;
        },
        () => {
          audioUnlocked = false;
        },
      );
    };

    const unlockAudio = () => {
      if (disposed || audioUnlocked) return;
      tryStartAudio();
    };

    const onVisibility = () => {
      if (document.hidden || !inView) {
        visual.pause();
        cancelReverse();
        audio.pause();
        return;
      }
      playForward();
      if (audioUnlocked) void audio.play().catch(() => undefined);
    };

    visual.muted = true;
    visual.defaultMuted = true;
    visual.playsInline = true;
    visual.loop = false;
    visual.preload = "auto";

    const applyAspect = () => {
      if (!visual.videoWidth || !visual.videoHeight) return;
      const host = heroRef.current;
      if (!host) return;
      host.style.setProperty(
        "--geostore-hero-aspect",
        `${visual.videoWidth} / ${visual.videoHeight}`,
      );
      host.style.setProperty(
        "--geostore-hero-h-over-w",
        String(visual.videoHeight / visual.videoWidth),
      );
    };

    visual.addEventListener("loadedmetadata", applyAspect);
    if (visual.readyState >= 1) applyAspect();
    visual.addEventListener("timeupdate", onTimeUpdate);
    visual.addEventListener("ended", onEnded);
    visual.addEventListener("error", onError);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio);

    const io = new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        if (!inView) {
          visual.pause();
          cancelReverse();
          audio.pause();
          return;
        }
        if (reducedMotion) {
          visual.pause();
          return;
        }
        playForward();
        if (audioUnlocked) void audio.play().catch(() => undefined);
      },
      { threshold: 0.08 },
    );

    const hero = heroRef.current;
    if (hero) io.observe(hero);
    else io.observe(visual);

    if (!reducedMotion) {
      void visual.play().catch(() => undefined);
      tryStartAudio();
    }

    return () => {
      disposed = true;
      cancelReverse();
      io.disconnect();
      visual.removeEventListener("loadedmetadata", applyAspect);
      visual.removeEventListener("timeupdate", onTimeUpdate);
      visual.removeEventListener("ended", onEnded);
      visual.removeEventListener("error", onError);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      visual.pause();
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
    };
  }, []);

  return { visualRef, heroRef };
}
