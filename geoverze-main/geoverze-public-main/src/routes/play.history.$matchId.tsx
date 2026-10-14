import { createFileRoute } from "@tanstack/react-router";

import { ReplayPage } from "@/features/history";

const t = "Match Replay — GVRZE";
const d = "Replay a GVRZE match question by question with timing, accuracy and rewards.";

export const Route = createFileRoute("/play/history/$matchId")({
  head: () => ({
    meta: [
      { title: t },
      { name: "description", content: d },
      { property: "og:title", content: t },
      { property: "og:description", content: d },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ReplayPage,
});
