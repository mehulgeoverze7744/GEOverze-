import { useEffect } from "react";

/**
 * Light plate for leftover `/geostore/product/*` catalogue PDPs.
 * Hides the global starfield while a product page is mounted.
 * Fashion storefront PDPs use #gvrze-storefront instead and never mount this.
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
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #ffffff 0%, #f5f6f8 46%, #eef1f4 100%)",
      }}
    />
  );
}
