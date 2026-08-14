import { createFileRoute } from "@tanstack/react-router";

import { AchievementsPage } from "@/features/profile";

export const Route = createFileRoute("/_app/achievements")({
  head: () => ({
    meta: [
      { title: "Achievements — GEOverze" },
      {
        name: "description",
        content:
          "Every GEOverze badge: what you have unlocked, what is in progress and what the planet still hides.",
      },
      { property: "og:title", content: "Achievements — GEOverze" },
      {
        property: "og:description",
        content: "Unlocked, in-progress and locked GEOverze explorer badges.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/achievements" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/achievements" }],
  }),
  component: AchievementsPage,
});
