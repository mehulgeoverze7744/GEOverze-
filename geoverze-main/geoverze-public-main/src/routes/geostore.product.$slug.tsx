import { createFileRoute } from "@tanstack/react-router";

import { ProductScreen } from "@/features/store/components/CatalogueScreens";

export const Route = createFileRoute("/geostore/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product — Gstore | GVRZE" },
      { name: "description", content: "Product details, variants and pricing in the Gstore." },
      { property: "og:title", content: "Product — Gstore | GVRZE" },
      {
        property: "og:description",
        content: "Product details, variants and pricing in the Gstore.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductScreen,
});
