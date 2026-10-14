import { createFileRoute } from "@tanstack/react-router";

import { CheckoutScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — GVRZE Store | GVRZE" },
      { name: "description", content: "Complete your GVRZE Store order." },
      { property: "og:title", content: "Checkout — GVRZE Store | GVRZE" },
      { property: "og:description", content: "Complete your GVRZE Store order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutScreen,
});
