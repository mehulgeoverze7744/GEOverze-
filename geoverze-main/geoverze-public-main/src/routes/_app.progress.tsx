import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — personal progress analytics live on Profile. */
export const Route = createFileRoute("/_app/progress")({
  beforeLoad: () => {
    throw redirect({ to: "/profile", replace: true });
  },
});
