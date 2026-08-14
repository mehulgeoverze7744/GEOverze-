import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/play/quiz")({
  component: () => <Outlet />,
});
