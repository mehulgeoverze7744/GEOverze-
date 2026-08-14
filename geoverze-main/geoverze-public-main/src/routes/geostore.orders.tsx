import { createFileRoute } from "@tanstack/react-router";

import { OrdersScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/orders")({
  head: () => ({
    meta: [
      { title: "Orders — GEOstore | GEOverze" },
      { name: "description", content: "Your GEOstore order and redemption history." },
      { property: "og:title", content: "Orders — GEOstore | GEOverze" },
      { property: "og:description", content: "Your GEOstore order and redemption history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersScreen,
});
