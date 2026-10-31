import { Outlet, createFileRoute } from "@tanstack/react-router";

import "@/features/library/styles/library-chrome.css";

/**
 * GVRZE Library layout. Page content lives in the leaf routes.
 * Chrome CSS is imported here so every /geolibrary* route gets the same
 * Play-matched header and light footer without touching other pages.
 */
export const Route = createFileRoute("/geolibrary")({
  component: () => <Outlet />,
});
