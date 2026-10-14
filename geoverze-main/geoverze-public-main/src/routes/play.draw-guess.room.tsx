import { createFileRoute } from "@tanstack/react-router";

import { DrawGuessRoomScreen } from "@/features/draw-guess";

const t = "Draw & Guess Room — GVRZE";
const d = "Live GVRZE Draw & Guess room lobby and match.";

export const Route = createFileRoute("/play/draw-guess/room")({
  validateSearch: (search: Record<string, unknown>) => ({
    room: typeof search['room'] === "string" ? search['room'] : undefined,
    code: typeof search['code'] === "string" ? search['code'] : undefined,
  }),
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
  component: DrawGuessRoomScreen,
});
