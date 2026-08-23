import { createFileRoute } from "@tanstack/react-router";

import { PvpJoinScreen } from "@/features/pvp";

const t = "Join PvP Room — GEOverze";
const d = "Enter a private GEOverze PvP room code to join your opponent.";

export const Route = createFileRoute("/play/pvp/join")({
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
  component: PvpJoinScreen,
});
