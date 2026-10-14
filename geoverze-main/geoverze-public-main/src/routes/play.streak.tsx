import { createFileRoute } from "@tanstack/react-router";

import { StreakPage } from "@/features/progression";

export const Route = createFileRoute("/play/streak")({
  head: () => ({
    meta: [
      { title: "Streak — GVRZE" },
      {
        name: "description",
        content: "Keep your daily GVRZE streak alive and grow your XP bonus.",
      },
      { property: "og:title", content: "Streak — GVRZE" },
      {
        property: "og:description",
        content: "Keep your daily GVRZE streak alive and grow your XP bonus.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StreakPage,
});
