import { createFileRoute } from "@tanstack/react-router";

import { LobbyScreen } from "@/features/matchmaking";

const t = "Game Lobby — GEOverze";
const d =
  "The GEOverze pre-game room: confirm the set, review the rules and ready up for the round.";

export const Route = createFileRoute("/play/lobby")({
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
  component: LobbyScreen,
});
