import { createFileRoute } from "@tanstack/react-router";

import { DrawGuessCreateScreen } from "@/features/draw-guess";

const t = "Create Draw & Guess Room — GVRZE";
const d = "Configure a private GVRZE Draw & Guess room with your preferred categories and rounds.";

export const Route = createFileRoute("/play/draw-guess/create")({
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
  component: DrawGuessCreateScreen,
});
