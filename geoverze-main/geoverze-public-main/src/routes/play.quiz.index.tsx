import { createFileRoute } from "@tanstack/react-router";

import { QuizLobbyScreen } from "@/features/quiz";

export const Route = createFileRoute("/play/quiz/")({
  validateSearch: (search: Record<string, unknown>) => ({
    quiz: typeof search["quiz"] === "string" ? (search["quiz"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Quiz Lobby — GEOverze" },
      {
        name: "description",
        content:
          "Review the set, tune your settings and start a GEOverze geography quiz across flags, capitals, maps and landmarks.",
      },
      { property: "og:title", content: "Quiz Lobby — GEOverze" },
      {
        property: "og:description",
        content: "Review the set, tune your settings and start a GEOverze geography quiz.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizLobbyScreen,
});
