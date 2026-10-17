import { createFileRoute, redirect } from "@tanstack/react-router";

/** Progression content now lives on Credit History. */
export const Route = createFileRoute("/play/progression")({
  beforeLoad: () => {
    throw redirect({
      to: "/play/credit-history",
      replace: true,
    });
  },
});
