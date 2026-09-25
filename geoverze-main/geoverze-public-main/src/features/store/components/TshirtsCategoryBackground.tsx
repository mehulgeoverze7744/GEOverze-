import { useEffect } from "react";

import tshirtsCategoryBg from "@/assets/geostore/tshirts-category-bg.jpg";

/**
 * Full-page dark concrete texture for the T-shirts category listing only.
 * Hides the global starfield while this shelf is mounted.
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
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}
