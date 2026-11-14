import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/features/profile";

export const Route = createFileRoute("/_app/profile/")({
  head: () => ({
    meta: [
      { title: "Profile — GVRZE" },
      {
        name: "description",
        content:
          "Your GVRZE profile: progress, achievements, credits and collected atlases in one place.",
      },
      { property: "og:title", content: "Profile — GVRZE" },
      {
        property: "og:description",
        content: "Progress, achievements, credits and collected atlases in GVRZE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://gvrze.com/profile" },
    ],
    links: [{ rel: "canonical", href: "https://gvrze.com/profile" }],
  }),
  component: ProfilePage,
});
