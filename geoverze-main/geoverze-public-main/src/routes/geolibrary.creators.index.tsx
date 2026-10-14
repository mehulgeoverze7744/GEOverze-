import { createFileRoute } from "@tanstack/react-router";

import { CreatorsScreen } from "@/features/library";

export const Route = createFileRoute("/geolibrary/creators/")({
  head: () => ({
    meta: [
      { title: "Creators — GVRZE Library" },
      {
        name: "description",
        content:
          "Meet the cartographers, writers and researchers behind GVRZE Library entries, and follow the ones whose work you want more of.",
      },
      { property: "og:title", content: "Creators — GVRZE Library" },
      {
        property: "og:description",
        content: "The writers and cartographers behind GVRZE Library entries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/geolibrary/creators" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/geolibrary/creators" }],
  }),
  component: CreatorsScreen,
});
