import { createFileRoute } from "@tanstack/react-router";

import { SkeletonPage } from "@/components/shared/SkeletonPage";
import { QuizHistoryPage } from "@/features/history";

export const Route = createFileRoute("/_app/quiz-history")({
  head: () => ({
    meta: [
      { title: "Quiz history — GEOverze" },
      {
        name: "description",
        content:
          "Every GEOverze expedition you have played: mode, score, time, result and credits earned.",
      },
      { property: "og:title", content: "Quiz history — GEOverze" },
      {
        property: "og:description",
        content: "Every expedition you have played, with mode, score, result and credits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  pendingComponent: () => <SkeletonPage stats={4} cards={6} />,
  component: QuizHistoryPage,
});
