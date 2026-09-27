import { useEffect } from "react";

import tshirtsCategoryBg from "@/assets/geostore/tshirts-category-bg.jpg";

/**
 * Full-page dark cloth world-map texture for selected GEOstore category listings.
 * Hides the global starfield while the shelf is mounted.
 */
export function TshirtsCategoryBackground() {
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
      style={{ backgroundImage: `url(${tshirtsCategoryBg})` }}
    >
      <div className="absolute inset-0 bg-black/10" />
    </div>
  );
}
