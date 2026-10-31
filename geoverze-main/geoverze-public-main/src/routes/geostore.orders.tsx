import { createFileRoute } from "@tanstack/react-router";

import { OrdersScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/orders")({
  head: () => ({
    meta: [
      { title: "Orders — Gstore | GVRZE" },
      { name: "description", content: "Your Gstore order and redemption history." },
      { property: "og:title", content: "Orders — Gstore | GVRZE" },
      { property: "og:description", content: "Your Gstore order and redemption history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersScreen,
});
