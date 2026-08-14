import { createFileRoute } from "@tanstack/react-router";

import { ModesPage } from "@/features/play";

const title = "Game Modes — Let's Play — GEOverze";
const description =
  "Solo runs, PvP duels, multiplayer rooms, practice and daily challenges — every way to play geography in GEOverze.";

export const Route = createFileRoute("/play/modes")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ModesPage,
});
