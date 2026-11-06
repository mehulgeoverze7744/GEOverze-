import { createFileRoute } from "@tanstack/react-router";

import { GstoreOrdersScreen } from "@/features/store/screens/GstoreOrdersScreen";

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
  component: GstoreOrdersScreen,
});
