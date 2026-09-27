import { useEffect } from "react";

import everyPointWorldMapBg from "@/assets/geostore/every-point-hoodie-world-map-bg.jpg";

/**
 * Shared dark world-map for every `/geostore/product/*` page.
 * Hides the global starfield while a product page is mounted.
 */
export function GeostoreProductPageBackground() {
  useEffect(() => {
    const sky = document.getElementById("geoverze-universe-background");
    if (!sky) return;
    const previousVisibility = sky.style.visibility;
    sky.style.visibility = "hidden";
    return () => {
      sky.style.visibility = previousVisibility;
    };
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${everyPointWorldMapBg})` }}
    />
  );
}
