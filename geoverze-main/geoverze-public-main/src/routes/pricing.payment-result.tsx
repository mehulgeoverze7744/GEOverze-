import { createFileRoute } from "@tanstack/react-router";

import { PaymentResultScreen } from "@/features/pricing";

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export type PaymentResultSearch = {
  status?: string;
  plan?: string;
  cycle?: string;
  payment_id?: string;
  subscription_id?: string;
  reason?: string;
};

export const Route = createFileRoute("/pricing/payment-result")({
  validateSearch: (search: Record<string, unknown>): PaymentResultSearch => {
    const next: PaymentResultSearch = {};
    const status = asString(search["status"]);
    const plan = asString(search["plan"]);
    const cycle = asString(search["cycle"]);
    const paymentId = asString(search["payment_id"]);
    const subscriptionId = asString(search["subscription_id"]);
    const reason = asString(search["reason"]);
    if (status) next.status = status;
    if (plan) next.plan = plan;
    if (cycle) next.cycle = cycle;
    if (paymentId) next.payment_id = paymentId;
    if (subscriptionId) next.subscription_id = subscriptionId;
    if (reason) next.reason = reason;
    return next;
  },
  head: () => ({
    meta: [
      { title: "Payment — GVRZE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: PaymentResultScreen,
});
