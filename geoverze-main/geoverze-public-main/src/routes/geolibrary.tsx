import { Outlet, createFileRoute } from "@tanstack/react-router";

/**
 * GVRZE Library layout. Page content lives in the leaf routes.
 */
export const Route = createFileRoute("/geolibrary")({
  component: () => <Outlet />,
});
