import { createFileRoute } from "@tanstack/react-router";

import { PvpHubScreen } from "@/features/pvp";

const t = "PvP — GVRZE";
const d = "Create or join a private GVRZE PvP room with a six-character room code.";

export const Route = createFileRoute("/play/pvp/")({
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
  component: PvpHubScreen,
});
