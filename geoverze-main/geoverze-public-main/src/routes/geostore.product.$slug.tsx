import { createFileRoute } from "@tanstack/react-router";

import { ProductScreen } from "@/features/store/components/CatalogueScreens";

export const Route = createFileRoute("/geostore/product/$slug")({
  head: () => ({
    meta: [
      { title: "Product — GEOstore | GEOverze" },
      { name: "description", content: "Product details, variants and pricing in the GEOstore." },
      { property: "og:title", content: "Product — GEOstore | GEOverze" },
      {
        property: "og:description",
        content: "Product details, variants and pricing in the GEOstore.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductScreen,
});
