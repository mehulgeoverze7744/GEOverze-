import { Outlet, createFileRoute } from "@tanstack/react-router";

/**
 * GEOlibrary layout. Page content lives in the leaf routes.
 */
export const Route = createFileRoute("/geolibrary")({
  component: () => <Outlet />,
});
