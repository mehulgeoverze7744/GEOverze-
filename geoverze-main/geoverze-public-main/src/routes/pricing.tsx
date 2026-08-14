import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/pricing")({
  component: () => <Outlet />,
});
