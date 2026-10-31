import { useEffect } from "react";

/**
 * Swaps the shared universe plate for the icy geographical background while
 * Community is mounted, then restores the previous layer exactly.
 */
export function CommunityPageBackground() {
  useEffect(() => {
    const layer = document.querySelector<HTMLElement>(
      "#geoverze-universe-background > div:first-child",
    );
    if (!layer) return;

    const prev = {
      backgroundImage: layer.style.backgroundImage,
      backgroundSize: layer.style.backgroundSize,
      backgroundPosition: layer.style.backgroundPosition,
      backgroundRepeat: layer.style.backgroundRepeat,
      filter: layer.style.filter,
      transform: layer.style.transform,
      willChange: layer.style.willChange,
    };

    layer.style.backgroundImage = "url(/assets/community/community-geo-bg.jpg)";
    layer.style.backgroundSize = "cover";
    layer.style.backgroundPosition = "center center";
    layer.style.backgroundRepeat = "no-repeat";
    layer.style.filter = "none";
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
  }, []);

  return null;
}
