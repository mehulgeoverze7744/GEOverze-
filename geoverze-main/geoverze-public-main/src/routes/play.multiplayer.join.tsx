import { createFileRoute } from "@tanstack/react-router";

import { MultiplayerJoinScreen } from "@/features/multiplayer";

const t = "Join Multiplayer Room — GEOverze";
const d = "Enter a six-character code to join a private GEOverze multiplayer room.";

export const Route = createFileRoute("/play/multiplayer/join")({
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
  component: MultiplayerJoinScreen,
});
