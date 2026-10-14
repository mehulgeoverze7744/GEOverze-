import { createFileRoute } from "@tanstack/react-router";

import { PricingPage } from "@/features/pricing";

export const Route = createFileRoute("/pricing/")({
  head: () => ({
    meta: [
      { title: "Membership & Pricing — GVRZE" },
      {
        name: "description",
        content:
          "Choose your journey through GVRZE: Explorer, Basic, Pro and Advance memberships for every kind of explorer.",
      },
      { property: "og:title", content: "Membership & Pricing — GVRZE" },
      {
        property: "og:description",
        content:
          "Explorer, Basic, Pro and Advance memberships for the GVRZE geography universe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/pricing" }],
  }),
  component: PricingPage,
});
