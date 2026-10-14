import { createFileRoute } from "@tanstack/react-router";

import { QuizHistoryAndRewardsPage } from "@/features/history-rewards";

export const Route = createFileRoute("/_app/quiz-history-and-rewards")({
  validateSearch: (search: Record<string, unknown>) => ({
    tab:
      search.tab === "achievements" || search.tab === "rewards"
        ? search.tab
        : "history",
  }),
  head: () => ({
    meta: [
      { title: "Quiz History & Rewards — GVRZE" },
      {
        name: "description",
        content:
          "Your GVRZE expeditions, achievements and rewards — quiz history, badges and credits in one place.",
      },
      { property: "og:title", content: "Quiz History & Rewards — GVRZE" },
      {
        property: "og:description",
        content: "Quiz history, explorer achievements and GVRZE Credits in one unified view.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/quiz-history-and-rewards" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/quiz-history-and-rewards" }],
  }),
  component: QuizHistoryAndRewardsPage,
});
