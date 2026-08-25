import { createFileRoute } from "@tanstack/react-router";

import { MultiplayerCreateScreen } from "@/features/multiplayer";

const t = "Create Multiplayer Room — GEOverze";
const d = "Pick a quiz and room size, then share your private multiplayer room code.";

export const Route = createFileRoute("/play/multiplayer/create")({
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
  component: MultiplayerCreateScreen,
});
