import { createFileRoute } from "@tanstack/react-router";

import { QuizPlayScreen } from "@/features/quiz";

export const Route = createFileRoute("/play/quiz/multiplayer")({
  validateSearch: (search: Record<string, unknown>) => ({
    quiz: typeof search["quiz"] === "string" ? (search["quiz"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Multiplayer Quiz — GVRZE" },
      {
        name: "description",
        content:
          "Group geography rounds in GVRZE. The question engine is live; rooms and live scoreboards are in development.",
      },
      { property: "og:title", content: "Multiplayer Quiz — GVRZE" },
      {
        property: "og:description",
        content: "Group geography rounds inside the GVRZE universe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <QuizPlayScreen mode="multiplayer" from="/play/quiz/multiplayer" />,
});
