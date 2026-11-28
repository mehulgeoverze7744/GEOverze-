import { createFileRoute } from "@tanstack/react-router";

import { GstoreOrderDetailScreen } from "@/features/store/screens/GstoreOrderDetailScreen";

type OrderDetailSearch = {
  guest_token?: string;
};

export const Route = createFileRoute("/geostore/order/$orderId")({
  validateSearch: (search: Record<string, unknown>): OrderDetailSearch => ({
    guest_token:
      typeof search.guest_token === "string" && search.guest_token.trim()
        ? search.guest_token.trim()
        : undefined,
  }),
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
