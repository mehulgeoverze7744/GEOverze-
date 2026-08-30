import { createFileRoute } from "@tanstack/react-router";

import { ComparePlansScreen } from "@/features/pricing";

export const Route = createFileRoute("/pricing/compare")({
  head: () => ({
    meta: [
      { title: "Compare Plans — GEOverze Membership" },
      {
        name: "description",
        content:
          "A full feature comparison of GEOverze Explorer, Basic, Pro and Advance memberships — play limits, library access, rewards and Creator Studio.",
      },
      { property: "og:title", content: "Compare Plans — GEOverze Membership" },
      {
        property: "og:description",
        content: "Every GEOverze membership capability, side by side.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/pricing/compare" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/pricing/compare" }],
  }),
  component: ComparePlansScreen,
});
