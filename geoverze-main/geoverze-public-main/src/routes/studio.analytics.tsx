import { createFileRoute } from "@tanstack/react-router";

import { AnalyticsScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/analytics")({
  head: () => ({
    meta: [
      { title: "Analytics — GEOverze Creator Studio" },
      {
        name: "description",
        content:
          "Track plays, completion, reads and follower growth across everything you publish on GEOverze.",
      },
      { property: "og:title", content: "Analytics — GEOverze Creator Studio" },
      {
        property: "og:description",
        content:
          "Track plays, completion, reads and follower growth across everything you publish on GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AnalyticsScreen,
});
