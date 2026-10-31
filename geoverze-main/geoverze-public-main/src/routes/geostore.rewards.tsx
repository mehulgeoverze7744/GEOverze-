import { createFileRoute } from "@tanstack/react-router";

import { RewardsScreen } from "@/features/store/components/StoreFlowScreens";

export const Route = createFileRoute("/geostore/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — Gstore | GVRZE" },
      { name: "description", content: "Redeem earned GVRZE credits for rewards." },
      { property: "og:title", content: "Rewards — Gstore | GVRZE" },
      { property: "og:description", content: "Redeem earned GVRZE credits for rewards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RewardsScreen,
});
