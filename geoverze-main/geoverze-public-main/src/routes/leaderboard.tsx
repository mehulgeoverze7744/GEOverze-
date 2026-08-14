import { createFileRoute } from "@tanstack/react-router";

import { LeaderboardPage } from "@/features/leaderboard";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — GEOverze" },
      {
        name: "description",
        content:
          "Seasonal rankings, streaks and accuracy standings across the GEOverze player base.",
      },
      { property: "og:title", content: "Leaderboard — GEOverze" },
      {
        property: "og:description",
        content: "Seasonal rankings, streaks and accuracy standings in GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/leaderboard" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/leaderboard" }],
  }),
  component: LeaderboardPage,
});
