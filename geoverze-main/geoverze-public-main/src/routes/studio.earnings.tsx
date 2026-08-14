import { createFileRoute } from "@tanstack/react-router";

import { EarningsScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/earnings")({
  head: () => ({
    meta: [
      { title: "Earnings — GEOverze Creator Studio" },
      {
        name: "description",
        content:
          "Royalties, bundle sales, credit bonuses and payout history for your GEOverze creator account.",
      },
      { property: "og:title", content: "Earnings — GEOverze Creator Studio" },
      {
        property: "og:description",
        content:
          "Royalties, bundle sales, credit bonuses and payout history for your GEOverze creator account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EarningsScreen,
});
