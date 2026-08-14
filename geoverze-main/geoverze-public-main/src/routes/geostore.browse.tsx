import { createFileRoute } from "@tanstack/react-router";

import { StoreBrowse } from "@/features/store/components/CatalogueScreens";

export const Route = createFileRoute("/geostore/browse")({
  head: () => ({
    meta: [
      { title: "Browse — GEOstore | GEOverze" },
      {
        name: "description",
        content: "Filter the full GEOstore catalogue by category, price and credits.",
      },
      { property: "og:title", content: "Browse — GEOstore | GEOverze" },
      {
        property: "og:description",
        content: "Filter the full GEOstore catalogue by category, price and credits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoreBrowse,
});
