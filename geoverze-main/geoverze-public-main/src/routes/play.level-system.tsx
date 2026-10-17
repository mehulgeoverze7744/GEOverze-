import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/play/level-system")({
  beforeLoad: () => {
    throw redirect({ to: "/play/credit-history" });
  },
  component: () => null,
});
