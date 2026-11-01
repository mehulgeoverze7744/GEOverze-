import { Outlet, createFileRoute } from "@tanstack/react-router";

import { LibraryGeoPageBackground } from "@/features/library/components/LibraryGeoPageBackground";
import "@/features/library/styles/library-chrome.css";
import "@/features/library/styles/library-geo-page-bg.css";

/**
 * GVRZE Library layout. Page content lives in the leaf routes.
 * Chrome CSS is imported here so every /geolibrary* route gets the same
 * Play-matched header and light footer without touching other pages.
 */
function LibraryLayout() {
  return (
    <div id="gvrze-library-page">
      <LibraryGeoPageBackground />
      <Outlet />
    </div>
  );
}

export const Route = createFileRoute("/geolibrary")({
  component: LibraryLayout,
});
