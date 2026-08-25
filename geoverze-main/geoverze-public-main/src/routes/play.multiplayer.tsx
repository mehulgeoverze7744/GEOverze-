import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/play/multiplayer")({
  component: () => <Outlet />,
});
