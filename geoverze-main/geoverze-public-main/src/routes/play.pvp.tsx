import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/play/pvp")({
  component: () => <Outlet />,
});
