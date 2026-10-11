import { createFileRoute } from "@tanstack/react-router";

import { ImposterJoinScreen } from "@/features/geography-imposter";

const t = "Join Room — Geography Imposter · GEOverze";
const d = "Enter a room code to join a live Geography Imposter game.";

export const Route = createFileRoute("/play/imposter/join")({
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
  component: ImposterJoinScreen,
});
