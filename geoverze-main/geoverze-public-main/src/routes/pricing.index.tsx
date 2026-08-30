import { createFileRoute } from "@tanstack/react-router";

import { PricingPage } from "@/features/pricing";

export const Route = createFileRoute("/pricing/")({
  head: () => ({
    meta: [
      { title: "Membership & Pricing — GEOverze" },
      {
        name: "description",
        content:
          "Choose your journey through GEOverze: Explorer, Basic, Pro and Advance memberships for every kind of explorer.",
      },
      { property: "og:title", content: "Membership & Pricing — GEOverze" },
      {
        property: "og:description",
        content:
          "Explorer, Basic, Pro and Advance memberships for the GEOverze geography universe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/pricing" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/pricing" }],
  }),
  component: PricingPage,
});
