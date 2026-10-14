import { createFileRoute } from "@tanstack/react-router";

import { OrdersScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/orders")({
  head: () => ({
    meta: [
      { title: "Orders — GVRZE Store | GVRZE" },
      { name: "description", content: "Your GVRZE Store order and redemption history." },
      { property: "og:title", content: "Orders — GVRZE Store | GVRZE" },
      { property: "og:description", content: "Your GVRZE Store order and redemption history." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OrdersScreen,
});
