import { createFileRoute } from "@tanstack/react-router";

import { CreatorsScreen } from "@/features/library";

export const Route = createFileRoute("/geolibrary/creators/")({
  head: () => ({
    meta: [
      { title: "Creators — GEOlibrary" },
      {
        name: "description",
        content:
          "Meet the cartographers, writers and researchers behind GEOlibrary entries, and follow the ones whose work you want more of.",
      },
      { property: "og:title", content: "Creators — GEOlibrary" },
      {
        property: "og:description",
        content: "The writers and cartographers behind GEOlibrary entries.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/geolibrary/creators" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/geolibrary/creators" }],
  }),
  component: CreatorsScreen,
});
