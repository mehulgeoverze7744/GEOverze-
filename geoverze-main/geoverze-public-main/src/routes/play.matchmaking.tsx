import { createFileRoute } from "@tanstack/react-router";

import { MatchmakingScreen } from "@/features/matchmaking";

const t = "Matchmaking — GEOverze";
const d = "Finding an opponent matched to your level and accuracy before a GEOverze duel begins.";

export const Route = createFileRoute("/play/matchmaking")({
  validateSearch: (search: Record<string, unknown>) => ({
    mode: typeof search["mode"] === "string" ? (search["mode"] as string) : undefined,
    quiz: typeof search["quiz"] === "string" ? (search["quiz"] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: t },
      { name: "description", content: d },
      { property: "og:title", content: t },
      { property: "og:description", content: d },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MatchmakingScreen,
});
