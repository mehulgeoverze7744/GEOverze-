import { createFileRoute } from "@tanstack/react-router";

import { LeaderboardPage } from "@/features/leaderboard";

export const Route = createFileRoute("/leaderboard")({
  head: () => ({
    meta: [
      { title: "Leaderboard — GVRZE" },
      {
        name: "description",
        content:
          "Seasonal rankings, streaks and accuracy standings across the GVRZE player base.",
      },
      { property: "og:title", content: "Leaderboard — GVRZE" },
      {
        property: "og:description",
        content: "Seasonal rankings, streaks and accuracy standings in GVRZE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/leaderboard" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/leaderboard" }],
  }),
  component: LeaderboardPage,
});
