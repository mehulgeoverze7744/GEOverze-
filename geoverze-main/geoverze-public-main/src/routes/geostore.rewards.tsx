import { createFileRoute } from "@tanstack/react-router";

import { RewardsScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — GEOstore | GEOverze" },
      { name: "description", content: "Redeem earned GEOverze credits for rewards." },
      { property: "og:title", content: "Rewards — GEOstore | GEOverze" },
      { property: "og:description", content: "Redeem earned GEOverze credits for rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RewardsScreen,
});
