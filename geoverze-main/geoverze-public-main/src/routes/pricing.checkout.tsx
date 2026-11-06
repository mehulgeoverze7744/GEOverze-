import { createFileRoute } from "@tanstack/react-router";

import { CheckoutScreen } from "@/features/pricing";

export const Route = createFileRoute("/pricing/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — GVRZE Membership" },
      {
        name: "description",
        content: "Complete your GVRZE membership purchase securely via Razorpay.",
      },
      { property: "og:title", content: "Checkout — GVRZE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: CheckoutScreen,
});
