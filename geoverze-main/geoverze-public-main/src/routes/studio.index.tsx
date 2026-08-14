import { createFileRoute } from "@tanstack/react-router";

import { OverviewScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/")({
  head: () => ({
    meta: [
      { title: "Creator Studio — GEOverze" },
      {
        name: "description",
        content:
          "Your GEOverze Creator Studio workspace: drafts in flight, content performance, audience growth and earnings at a glance.",
      },
      { property: "og:title", content: "Creator Studio — GEOverze" },
      {
        property: "og:description",
        content:
          "Your GEOverze Creator Studio workspace: drafts in flight, content performance, audience growth and earnings at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewScreen,
});
