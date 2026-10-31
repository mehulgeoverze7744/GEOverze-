import { createFileRoute } from "@tanstack/react-router";

import { CartScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/cart")({
  head: () => ({
    meta: [
      { title: "Cart — Gstore | GVRZE" },
      { name: "description", content: "Review the items in your Gstore cart." },
      { property: "og:title", content: "Cart — Gstore | GVRZE" },
      { property: "og:description", content: "Review the items in your Gstore cart." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CartScreen,
});
