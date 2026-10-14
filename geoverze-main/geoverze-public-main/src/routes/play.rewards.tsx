import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy Let's Play catalogue — rewards live on the profile tab. */
export const Route = createFileRoute("/play/rewards")({
  beforeLoad: () => {
    throw redirect({
      to: "/quiz-history-and-rewards",
      search: { tab: "rewards" },
      replace: true,
    });
  },
});
