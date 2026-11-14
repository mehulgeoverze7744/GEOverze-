import { createFileRoute } from "@tanstack/react-router";

import { CollectionsScreen } from "@/features/library";

export const Route = createFileRoute("/geolibrary/collections/")({
  head: () => ({
    meta: [
      { title: "Collections — GVRZE Library" },
      {
        name: "description",
        content:
          "Curated GVRZE Library shelves: Countries of Europe, World Capitals, Great Rivers, Mountain Ranges, UNESCO Heritage, Geography Basics and more.",
      },
      { property: "og:title", content: "Collections — GVRZE Library" },
      {
        property: "og:description",
        content: "Curated reading shelves across countries, capitals, rivers and heritage.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://gvrze.com/geolibrary/collections" },
    ],
    links: [{ rel: "canonical", href: "https://gvrze.com/geolibrary/collections" }],
  }),
  component: CollectionsScreen,
});
