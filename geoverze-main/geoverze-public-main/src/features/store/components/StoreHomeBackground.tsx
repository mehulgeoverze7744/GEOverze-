import { useEffect } from "react";

import storeStoneBg from "@/assets/geostore/tshirts-category-bg.jpg";

/**
 * Page-level dark stone backdrop for the Gstore home.
 * Reuses the existing store stone texture (not the composite hero merch shot)
 * and hides the global starfield while this route is mounted.
 */
export function StoreHomeBackground() {
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
      className="geostore-page-bg pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{ backgroundImage: `url(${storeStoneBg})` }}
    />
  );
}
