import { createFileRoute } from "@tanstack/react-router";

import { GstoreOrderDetailScreen } from "@/features/store/screens/GstoreOrderDetailScreen";

export const Route = createFileRoute("/geostore/order/$orderId")({
  head: () => ({
    meta: [
      { title: "Order Details — Gstore | GVRZE" },
      { name: "description", content: "View your Gstore order details." },
      { property: "og:title", content: "Order Details — Gstore | GVRZE" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GstoreOrderDetailScreen,
});
