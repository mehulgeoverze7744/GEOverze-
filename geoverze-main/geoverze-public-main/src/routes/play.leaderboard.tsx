import { createFileRoute } from "@tanstack/react-router";

import { PlayLeaderboardPage } from "@/features/progression";

export const Route = createFileRoute("/play/leaderboard")({
  head: () => ({
    meta: [
      { title: "Play Leaderboard — GEOverze" },
      {
        name: "description",
        content: "Global, friends, country, weekly and monthly GEOverze standings.",
      },
      { property: "og:title", content: "Play Leaderboard — GEOverze" },
      {
        property: "og:description",
        content: "Global, friends, country, weekly and monthly GEOverze standings.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlayLeaderboardPage,
});
