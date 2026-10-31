import { useEffect } from "react";

type PlayBackgroundPreset = "doodle" | "geo";

const PRESETS: Record<
  PlayBackgroundPreset,
  {
    image: string;
    size: string;
    position: string;
    repeat: string;
    filter: string;
  }
> = {
  doodle: {
    image: "url(/assets/play/lets-play-bg.jpg)",
    size: "cover",
    position: "center 30%",
    repeat: "no-repeat",
    filter: "brightness(0.58) saturate(0.82) contrast(1.08)",
  },
  geo: {
    image: "url(/assets/play/lets-play-geo-bg.jpg)",
    size: "cover",
    position: "center center",
    repeat: "no-repeat",
    filter: "none",
  },
};

/**
 * Swaps the global starfield for a Let's Play background while this
 * component is mounted, then restores the original image on unmount.
 *
 * Works by directly mutating the style of the inner layer element — no
 * <style> tags, no race conditions, instant cleanup.
 */
export function PlayPageBackground({ preset = "doodle" }: { preset?: PlayBackgroundPreset }) {
  useEffect(() => {
    const layer = document.querySelector<HTMLElement>(
      "#geoverze-universe-background > div:first-child",
    );
    if (!layer) return;

    const look = PRESETS[preset];

    // Stash whatever the element currently has so we can restore it exactly.
    const prev = {
      backgroundImage: layer.style.backgroundImage,
      backgroundSize: layer.style.backgroundSize,
      backgroundPosition: layer.style.backgroundPosition,
      backgroundRepeat: layer.style.backgroundRepeat,
      filter: layer.style.filter,
      transform: layer.style.transform,
      willChange: layer.style.willChange,
    };

    layer.style.backgroundImage = look.image;
    layer.style.backgroundSize = look.size;
    layer.style.backgroundPosition = look.position;
    layer.style.backgroundRepeat = look.repeat;
    layer.style.filter = look.filter;
    layer.style.transform = "none";
    layer.style.willChange = "auto";

    return () => {
      layer.style.backgroundImage = prev.backgroundImage;
      layer.style.backgroundSize = prev.backgroundSize;
      layer.style.backgroundPosition = prev.backgroundPosition;
      layer.style.backgroundRepeat = prev.backgroundRepeat;
      layer.style.filter = prev.filter;
      layer.style.transform = prev.transform;
      layer.style.willChange = prev.willChange;
    };
  }, [preset]);

  return null;
}
