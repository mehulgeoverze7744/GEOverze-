import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — achievements now live on the unified page. */
export const Route = createFileRoute("/_app/achievements")({
  beforeLoad: () => {
    throw redirect({
      to: "/quiz-history-and-rewards",
      search: { tab: "achievements" },
      replace: true,
    });
  },
});
