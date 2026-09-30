import { useEffect } from "react";

/**
 * Swaps the global starfield for the Let's Play doodle pattern while this
 * component is mounted, then restores the original image on unmount.
 *
 * Works by directly mutating the style of the inner layer element — no
 * <style> tags, no race conditions, instant cleanup.
 */
export function PlayPageBackground() {
  useEffect(() => {
    const layer = document.querySelector<HTMLElement>(
      "#geoverze-universe-background > div:first-child",
    );
    if (!layer) return;

    // Stash whatever the element currently has so we can restore it exactly.
    const prev = {
      backgroundImage: layer.style.backgroundImage,
      backgroundSize: layer.style.backgroundSize,
      backgroundPosition: layer.style.backgroundPosition,
      filter: layer.style.filter,
      transform: layer.style.transform,
      willChange: layer.style.willChange,
    };

    layer.style.backgroundImage = "url(/assets/play/lets-play-bg.jpg)";
    layer.style.backgroundSize = "cover";
    layer.style.backgroundPosition = "center 30%";
    layer.style.filter = "brightness(0.58) saturate(0.82) contrast(1.08)";
    layer.style.transform = "none";
    layer.style.willChange = "auto";

    return () => {
      layer.style.backgroundImage = prev.backgroundImage;
      layer.style.backgroundSize = prev.backgroundSize;
      layer.style.backgroundPosition = prev.backgroundPosition;
      layer.style.filter = prev.filter;
      layer.style.transform = prev.transform;
      layer.style.willChange = prev.willChange;
    };
  }, []);

  return null;
}
