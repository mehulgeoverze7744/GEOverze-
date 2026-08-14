import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — kept alive so existing links never break. */
export const Route = createFileRoute("/forgot-password")({
  beforeLoad: () => {
    throw redirect({ to: "/auth/forgot-password", replace: true });
  },
});
