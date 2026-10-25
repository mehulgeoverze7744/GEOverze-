import { createFileRoute } from "@tanstack/react-router";

import { CreatorsScreen } from "@/features/library";

export const Route = createFileRoute("/geolibrary/creators/")({
  head: () => ({
    meta: [
      { title: "Creators — GVRZE Library" },
      {
        name: "description",
        content:
          "GVRZE Studio is the official editorial team behind GVRZE Library, based in Mumbai, India.",
      },
      { property: "og:title", content: "Creators — GVRZE Library" },
      {
        property: "og:description",
        content: "GVRZE Studio, the official creator of GVRZE Library.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/geolibrary/creators" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/geolibrary/creators" }],
  }),
  component: CreatorsScreen,
});
