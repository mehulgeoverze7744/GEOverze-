import { createFileRoute } from "@tanstack/react-router";

import { StoreBrowse } from "@/features/store/components/CatalogueScreens";

export const Route = createFileRoute("/geostore/browse")({
  head: () => ({
    meta: [
      { title: "Browse — Gstore | GVRZE" },
      {
        name: "description",
        content: "Filter the full Gstore catalogue by category, price and credits.",
      },
      { property: "og:title", content: "Browse — Gstore | GVRZE" },
      {
        property: "og:description",
        content: "Filter the full Gstore catalogue by category, price and credits.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StoreBrowse,
});
