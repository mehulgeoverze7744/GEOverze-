import { createFileRoute } from "@tanstack/react-router";

import { QuizListScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/quizzes/")({
  head: () => ({
    meta: [
      { title: "Quizzes — GVRZE Creator Studio" },
      {
        name: "description",
        content:
          "Build, review and manage every geography quiz set you publish into GVRZE Let's Play.",
      },
      { property: "og:title", content: "Quizzes — GVRZE Creator Studio" },
      {
        property: "og:description",
        content:
          "Build, review and manage every geography quiz set you publish into GVRZE Let's Play.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizListScreen,
});
