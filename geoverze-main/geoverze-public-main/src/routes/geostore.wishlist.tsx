import { createFileRoute } from "@tanstack/react-router";

import { WishlistScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — GVRZE Store | GVRZE" },
      { name: "description", content: "Items you have saved in the GVRZE Store." },
      { property: "og:title", content: "Wishlist — GVRZE Store | GVRZE" },
      { property: "og:description", content: "Items you have saved in the GVRZE Store." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WishlistScreen,
});
