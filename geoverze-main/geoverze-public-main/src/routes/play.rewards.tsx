import { createFileRoute } from "@tanstack/react-router";

import { RewardsPage } from "@/features/progression";

export const Route = createFileRoute("/play/rewards")({
  head: () => ({
    meta: [
      { title: "Rewards — GEOverze" },
      {
        name: "description",
        content:
          "The full GEOverze reward catalogue: credits, XP, achievements, merch, seasonal drops and platform rewards.",
      },
      { property: "og:title", content: "Rewards — GEOverze" },
      {
        property: "og:description",
        content:
          "The full GEOverze reward catalogue: credits, XP, achievements, merch, seasonal drops and platform rewards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RewardsPage,
});
