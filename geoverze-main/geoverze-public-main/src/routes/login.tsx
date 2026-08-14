import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — kept alive so existing links never break. */
export const Route = createFileRoute("/login")({
  beforeLoad: () => {
    throw redirect({ to: "/auth/login", replace: true });
  },
});
