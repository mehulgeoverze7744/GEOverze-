import { createFileRoute } from "@tanstack/react-router";

import { QuizPlayScreen } from "@/features/quiz";

export const Route = createFileRoute("/play/quiz/solo")({
  validateSearch: (search: Record<string, unknown>) => ({
    quiz: typeof search["quiz"] === "string" ? (search["quiz"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Solo Quiz — GEOverze" },
      {
        name: "description",
        content:
          "Play a timed solo geography round in GEOverze with instant feedback, explanations and keyboard shortcuts.",
      },
      { property: "og:title", content: "Solo Quiz — GEOverze" },
      {
        property: "og:description",
        content: "Play a timed solo geography round with instant feedback and explanations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <QuizPlayScreen mode="solo" from="/play/quiz/solo" />,
});
