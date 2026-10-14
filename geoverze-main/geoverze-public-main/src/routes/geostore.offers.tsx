import { createFileRoute } from "@tanstack/react-router";

import { OffersScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/offers")({
  head: () => ({
    meta: [
      { title: "Bundles & deals — GVRZE Store | GVRZE" },
      { name: "description", content: "Curated GVRZE Store bundles and running deals." },
      { property: "og:title", content: "Bundles & deals — GVRZE Store | GVRZE" },
      { property: "og:description", content: "Curated GVRZE Store bundles and running deals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OffersScreen,
});
