import { createFileRoute } from "@tanstack/react-router";

import { OffersScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/offers")({
  head: () => ({
    meta: [
      { title: "Bundles & deals — GEOstore | GEOverze" },
      { name: "description", content: "Curated GEOstore bundles and running deals." },
      { property: "og:title", content: "Bundles & deals — GEOstore | GEOverze" },
      { property: "og:description", content: "Curated GEOstore bundles and running deals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersScreen,
});
