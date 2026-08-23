import { createFileRoute } from "@tanstack/react-router";

import { PvpRoomScreen } from "@/features/pvp";

const t = "PvP Room — GEOverze";
const d = "Private GEOverze PvP room with lobby, ready states, and synchronized match start.";

export const Route = createFileRoute("/play/pvp/room")({
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
  component: PvpRoomScreen,
});
