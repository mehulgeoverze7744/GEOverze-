import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL — quiz history now lives on the unified page. */
export const Route = createFileRoute("/_app/quiz-history")({
  beforeLoad: () => {
    throw redirect({ to: "/quiz-history-and-rewards", search: { tab: "history" }, replace: true });
  },
});
