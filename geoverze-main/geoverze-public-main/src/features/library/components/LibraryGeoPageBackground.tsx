import { useEffect } from "react";

const LIBRARY_GEO_IMAGE = "url(/assets/gvrze-library-page-bg.webp)";

/**
 * Swaps the shared starfield for the 4K icy library map while a Library
 * geo page is mounted, then restores the previous layer exactly.
 */
export function LibraryGeoPageBackground() {
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
      backgroundAttachment: layer.style.backgroundAttachment,
      filter: layer.style.filter,
      transform: layer.style.transform,
      willChange: layer.style.willChange,
    };

    layer.style.backgroundImage = LIBRARY_GEO_IMAGE;
    layer.style.backgroundSize = "cover";
    layer.style.backgroundPosition = "center center";
    layer.style.backgroundRepeat = "no-repeat";
    layer.style.backgroundAttachment = "scroll";
    layer.style.filter = "none";
    layer.style.transform = "none";
    layer.style.willChange = "auto";

    return () => {
      layer.style.backgroundImage = prev.backgroundImage;
      layer.style.backgroundSize = prev.backgroundSize;
      layer.style.backgroundPosition = prev.backgroundPosition;
      layer.style.backgroundRepeat = prev.backgroundRepeat;
      layer.style.backgroundAttachment = prev.backgroundAttachment;
      layer.style.filter = prev.filter;
      layer.style.transform = prev.transform;
      layer.style.willChange = prev.willChange;
    };
  }, []);

  return null;
}
