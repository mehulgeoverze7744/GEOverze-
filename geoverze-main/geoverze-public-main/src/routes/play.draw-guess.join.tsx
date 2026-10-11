import { createFileRoute } from "@tanstack/react-router";

import { DrawGuessJoinScreen } from "@/features/draw-guess";

const t = "Join Draw & Guess Room — GEOverze";
const d = "Enter a private GEOverze Draw & Guess room code to join your friends.";

export const Route = createFileRoute("/play/draw-guess/join")({
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
  component: DrawGuessJoinScreen,
});
