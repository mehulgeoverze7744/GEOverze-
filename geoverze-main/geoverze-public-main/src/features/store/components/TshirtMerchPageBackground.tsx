import { useEffect } from "react";

import bornToRoamMapBg from "@/assets/geostore/born-to-roam-world-map-bg.jpg";

/**
 * Full-page charcoal world-map used on listed T-shirt merch PDPs.
 * Hides the global starfield for this route only.
 */
export function TshirtMerchPageBackground() {
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
      style={{ backgroundImage: `url(${bornToRoamMapBg})` }}
    />
  );
}
