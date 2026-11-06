import { createFileRoute } from "@tanstack/react-router";

import { GstoreOrderConfirmation } from "@/features/store/screens/GstoreOrderConfirmation";

export const Route = createFileRoute("/geostore/order-confirmation")({
  head: () => ({
    meta: [
      { title: "Order Confirmed — Gstore | GVRZE" },
      { name: "description", content: "Your Gstore order has been confirmed." },
      { property: "og:title", content: "Order Confirmed — Gstore | GVRZE" },
      { property: "og:description", content: "Your Gstore order has been confirmed." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: GstoreOrderConfirmation,
});
