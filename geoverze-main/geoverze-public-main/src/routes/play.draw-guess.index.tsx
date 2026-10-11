import { createFileRoute } from "@tanstack/react-router";

import { DrawGuessHubScreen } from "@/features/draw-guess";

const t = "Draw & Guess — GEOverze";
const d = "Draw geography clues and guess with friends in a private GEOverze Draw & Guess room.";

export const Route = createFileRoute("/play/draw-guess/")({
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
  component: DrawGuessHubScreen,
});
