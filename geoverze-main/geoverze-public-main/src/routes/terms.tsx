import { createFileRoute, redirect } from "@tanstack/react-router";

/** Older URL. The current terms live at /terms-of-service. */
export const Route = createFileRoute("/terms")({
  beforeLoad: () => {
    throw redirect({ to: "/terms-of-service", replace: true });
  },
});
