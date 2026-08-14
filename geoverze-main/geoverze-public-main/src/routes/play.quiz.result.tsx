import { createFileRoute } from "@tanstack/react-router";

import { QuizResultScreen } from "@/features/quiz";

export const Route = createFileRoute("/play/quiz/result")({
  validateSearch: (search: Record<string, unknown>) => ({
    quiz: typeof search["quiz"] === "string" ? (search["quiz"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Quiz Result — GEOverze" },
      {
        name: "description",
        content:
          "Your GEOverze quiz summary: score, accuracy, streaks, time and rewards, with a full answer review.",
      },
      { property: "og:title", content: "Quiz Result — GEOverze" },
      {
        property: "og:description",
        content: "Score, accuracy, streaks and rewards from your GEOverze quiz run.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuizResultScreen,
});
