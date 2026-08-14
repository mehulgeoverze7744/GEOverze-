import { createFileRoute } from "@tanstack/react-router";

import { DashboardPage } from "@/features/dashboard";

export const Route = createFileRoute("/_app/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — GEOverze" },
      {
        name: "description",
        content:
          "Your GEOverze command centre: streaks, progress, recommended expeditions and everything you saved.",
      },
      { property: "og:title", content: "Dashboard — GEOverze" },
      {
        property: "og:description",
        content: "Streaks, progress and recommended expeditions across GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/dashboard" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/dashboard" }],
  }),
  component: DashboardPage,
});
