import { createFileRoute } from "@tanstack/react-router";

import { QuizLobbyScreen } from "@/features/quiz";

export const Route = createFileRoute("/play/quiz/")({
  validateSearch: (search: Record<string, unknown>) => ({
    quiz: typeof search["quiz"] === "string" ? (search["quiz"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Quiz Lobby — GVRZE" },
      {
        name: "description",
        content:
          "Review the set, tune your settings and start a GVRZE geography quiz across flags, capitals, maps and landmarks.",
      },
      { property: "og:title", content: "Quiz Lobby — GVRZE" },
      {
        property: "og:description",
        content: "Review the set, tune your settings and start a GVRZE geography quiz.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizLobbyScreen,
});
