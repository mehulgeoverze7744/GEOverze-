import { createFileRoute } from "@tanstack/react-router";

import { CheckoutScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — GEOstore | GEOverze" },
      { name: "description", content: "Complete your GEOstore order." },
      { property: "og:title", content: "Checkout — GEOstore | GEOverze" },
      { property: "og:description", content: "Complete your GEOstore order." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CheckoutScreen,
});
