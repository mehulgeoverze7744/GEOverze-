import { createFileRoute } from "@tanstack/react-router";

import { LevelSystemPage } from "@/features/progression";

export const Route = createFileRoute("/play/level-system")({
  head: () => ({
    meta: [
      { title: "Level System — GEOverze" },
      {
        name: "description",
        content: "Every GEOverze level, the XP required and the reward unlocked at each tier.",
      },
      { property: "og:title", content: "Level System — GEOverze" },
      {
        property: "og:description",
        content: "Every GEOverze level, the XP required and the reward unlocked at each tier.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LevelSystemPage,
});
