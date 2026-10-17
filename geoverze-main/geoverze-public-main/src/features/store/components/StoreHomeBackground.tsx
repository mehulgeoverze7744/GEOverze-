import { useEffect } from "react";

import storeStoneBg from "@/assets/geostore/tshirts-category-bg.jpg";

/**
 * Page-level dark stone backdrop for the GVRZE Store home.
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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${storeStoneBg})` }}
    >
      <div className="absolute inset-0 bg-[oklch(0.06_0.008_60/0.28)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_18%,oklch(0.55_0.08_70/0.08),transparent_55%)]" />
    </div>
  );
}
