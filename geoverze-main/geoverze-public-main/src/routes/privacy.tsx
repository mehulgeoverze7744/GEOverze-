import { createFileRoute, redirect } from "@tanstack/react-router";

/** Older URL. The current policy lives at /privacy-policy. */
export const Route = createFileRoute("/privacy")({
  beforeLoad: () => {
    throw redirect({ to: "/privacy-policy", replace: true });
  },
});
