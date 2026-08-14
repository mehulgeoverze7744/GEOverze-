import { Outlet, createFileRoute } from "@tanstack/react-router";

/**
 * Layout for the profile area (/profile and /profile/edit).
 * Page content lives in the leaf routes.
 */
export const Route = createFileRoute("/_app/profile")({
  component: () => <Outlet />,
});
