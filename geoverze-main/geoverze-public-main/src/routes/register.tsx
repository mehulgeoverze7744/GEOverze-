import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — kept alive so existing links never break. */
export const Route = createFileRoute("/register")({
  beforeLoad: () => {
    throw redirect({ to: "/auth/signup", replace: true });
  },
});
