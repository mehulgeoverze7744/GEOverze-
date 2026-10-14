import { createFileRoute } from "@tanstack/react-router";

import { PvpCreateScreen } from "@/features/pvp";

const t = "Create PvP Room — GVRZE";
const d = "Choose a published quiz and create a private GVRZE PvP room.";

export const Route = createFileRoute("/play/pvp/create")({
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
  component: PvpCreateScreen,
});
