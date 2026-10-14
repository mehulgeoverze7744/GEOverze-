import { createFileRoute } from "@tanstack/react-router";

import { ProductScreen } from "@/features/store/components/CatalogueScreens";

export const Route = createFileRoute("/geostore/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product — GVRZE Store | GVRZE" },
      { name: "description", content: "Product details, variants and pricing in the GVRZE Store." },
      { property: "og:title", content: "Product — GVRZE Store | GVRZE" },
      {
        property: "og:description",
        content: "Product details, variants and pricing in the GVRZE Store.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductScreen,
});
