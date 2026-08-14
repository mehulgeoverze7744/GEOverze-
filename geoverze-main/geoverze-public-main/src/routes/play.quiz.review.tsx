import { createFileRoute } from "@tanstack/react-router";

import { QuizReviewScreen } from "@/features/quiz";

export const Route = createFileRoute("/play/quiz/review")({
  validateSearch: (search: Record<string, unknown>) => ({
    quiz: typeof search["quiz"] === "string" ? (search["quiz"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Quiz Review — GEOverze" },
      {
        name: "description",
        content:
          "Go through every question from your GEOverze run: your answer, the correct answer and the explanation.",
      },
      { property: "og:title", content: "Quiz Review — GEOverze" },
      {
        property: "og:description",
        content: "Every question from your run with answers and explanations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: QuizReviewScreen,
});
