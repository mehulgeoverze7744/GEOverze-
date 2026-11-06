import { createFileRoute } from "@tanstack/react-router";

import { PaymentResultScreen } from "@/features/pricing";

export const Route = createFileRoute("/pricing/payment-result")({
  head: () => ({
    meta: [
      { title: "Payment — GVRZE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentResultScreen,
});
