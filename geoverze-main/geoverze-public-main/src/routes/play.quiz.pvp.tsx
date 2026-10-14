import { createFileRoute } from "@tanstack/react-router";

import { QuizPlayScreen } from "@/features/quiz";

export const Route = createFileRoute("/play/quiz/pvp")({
  validateSearch: (search: Record<string, unknown>) => ({
    quiz: typeof search["quiz"] === "string" ? (search["quiz"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "1v1 Duel — GVRZE" },
      {
        name: "description",
        content:
          "Head-to-head geography duels in GVRZE. Play the full question engine while live matchmaking is in development.",
      },
      { property: "og:title", content: "1v1 Duel — GVRZE" },
      {
        property: "og:description",
        content: "Head-to-head geography duels inside the GVRZE universe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: () => <QuizPlayScreen mode="pvp" from="/play/quiz/pvp" />,
});
