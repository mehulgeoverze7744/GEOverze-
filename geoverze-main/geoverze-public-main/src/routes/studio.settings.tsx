import { createFileRoute } from "@tanstack/react-router";

import { StudioSettingsScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/settings")({
  head: () => ({
    meta: [
      { title: "Studio Settings — GVRZE Creator Studio" },
      {
        name: "description",
        content:
          "Manage your GVRZE creator profile, verification, payout details and notification preferences.",
      },
      { property: "og:title", content: "Studio Settings — GVRZE Creator Studio" },
      {
        property: "og:description",
        content:
          "Manage your GVRZE creator profile, verification, payout details and notification preferences.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StudioSettingsScreen,
});
