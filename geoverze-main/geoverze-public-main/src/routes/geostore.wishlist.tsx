import { createFileRoute } from "@tanstack/react-router";

import { WishlistScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/wishlist")({
  head: () => ({
    meta: [
      { title: "Wishlist — Gstore | GVRZE" },
      { name: "description", content: "Items you have saved in the Gstore." },
      { property: "og:title", content: "Wishlist — Gstore | GVRZE" },
      { property: "og:description", content: "Items you have saved in the Gstore." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WishlistScreen,
});
