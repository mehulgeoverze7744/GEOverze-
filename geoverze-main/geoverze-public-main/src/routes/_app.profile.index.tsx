import { createFileRoute } from "@tanstack/react-router";

import { ProfilePage } from "@/features/profile";

export const Route = createFileRoute("/_app/profile/")({
  head: () => ({
    meta: [
      { title: "Profile — GEOverze" },
      {
        name: "description",
        content:
          "Your GEOverze profile: progress, achievements, credits and collected atlases in one place.",
      },
      { property: "og:title", content: "Profile — GEOverze" },
      {
        property: "og:description",
        content: "Progress, achievements, credits and collected atlases in GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/profile" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/profile" }],
  }),
  component: ProfilePage,
});
