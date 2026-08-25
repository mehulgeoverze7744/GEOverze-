import { createFileRoute } from "@tanstack/react-router";

import { MultiplayerRoomScreen } from "@/features/multiplayer";

const t = "Multiplayer Room — GEOverze";
const d = "Private GEOverze multiplayer room with lobby, ready states, and synchronized match start.";

export const Route = createFileRoute("/play/multiplayer/room")({
  validateSearch: (search: Record<string, unknown>) => ({
    room: typeof search["room"] === "string" ? search["room"] : undefined,
    code: typeof search["code"] === "string" ? search["code"] : undefined,
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
  component: MultiplayerRoomScreen,
});
