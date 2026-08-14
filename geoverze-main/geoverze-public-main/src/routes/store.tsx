import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — kept alive so existing links never break. */
export const Route = createFileRoute("/store")({
  beforeLoad: () => {
    throw redirect({ to: "/geostore", replace: true });
  },
});
