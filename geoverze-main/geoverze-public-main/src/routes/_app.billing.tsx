import { createFileRoute } from "@tanstack/react-router";

import { SubscriptionScreen } from "@/features/pricing";

export const Route = createFileRoute("/_app/billing")({
  head: () => ({
    meta: [
      { title: "Billing & Membership — GVRZE" },
      {
        name: "description",
        content:
          "Review your GVRZE membership, renewal date, monthly credit grant, invoices and payment methods.",
      },
      { property: "og:title", content: "Billing & Membership — GVRZE" },
      {
        property: "og:description",
        content: "Manage your GVRZE subscription, invoices and payment methods.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/billing" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/billing" }],
  }),
  component: SubscriptionScreen,
});
