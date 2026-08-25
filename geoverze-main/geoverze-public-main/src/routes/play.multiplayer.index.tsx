import { createFileRoute } from "@tanstack/react-router";

import { MultiplayerHubScreen } from "@/features/multiplayer";

const t = "Multiplayer — GEOverze";
const d = "Create or join a private GEOverze multiplayer room with a six-character room code.";

export const Route = createFileRoute("/play/multiplayer/")({
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
  component: MultiplayerHubScreen,
});
