import { createFileRoute, redirect } from "@tanstack/react-router";

/** Bundles & Deals has been retired — keep the URL alive so old links land on the store. */
export const Route = createFileRoute("/geostore/offers")({
  beforeLoad: () => {
    throw redirect({ to: "/geostore", replace: true });
  },
});
