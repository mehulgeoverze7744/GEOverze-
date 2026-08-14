import { createFileRoute } from "@tanstack/react-router";

import { DailyChallengesPage } from "@/features/progression";

export const Route = createFileRoute("/play/daily-challenges")({
  head: () => ({
    meta: [
      { title: "Daily Challenges — GEOverze" },
      {
        name: "description",
        content: "Five daily geography objectives that reset at midnight, each paying XP.",
      },
      { property: "og:title", content: "Daily Challenges — GEOverze" },
      {
        property: "og:description",
        content: "Five daily geography objectives that reset at midnight, each paying XP.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DailyChallengesPage,
});
