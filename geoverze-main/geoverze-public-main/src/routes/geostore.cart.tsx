import { createFileRoute } from "@tanstack/react-router";

import { CartScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/cart")({
  head: () => ({
    meta: [
      { title: "Cart — GEOstore | GEOverze" },
      { name: "description", content: "Review the items in your GEOstore cart." },
      { property: "og:title", content: "Cart — GEOstore | GEOverze" },
      { property: "og:description", content: "Review the items in your GEOstore cart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartScreen,
});
