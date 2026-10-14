import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "@/features/dashboard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GVRZE" },
      {
        name: "description",
        content:
          "Your GVRZE command centre: streaks, progress, recommended expeditions and everything you saved.",
      },
      { property: "og:title", content: "Dashboard — GVRZE" },
      {
        property: "og:description",
        content: "Streaks, progress and recommended expeditions across GVRZE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/dashboard" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/dashboard" }],
  }),
  component: DashboardPage,
});
