import { createFileRoute } from "@tanstack/react-router";

import { OverviewScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/")({
  head: () => ({
    meta: [
      { title: "Creator Studio — GVRZE" },
      {
        name: "description",
        content:
          "Your GVRZE Creator Studio workspace: drafts in flight, content performance, audience growth and earnings at a glance.",
      },
      { property: "og:title", content: "Creator Studio — GVRZE" },
      {
        property: "og:description",
        content:
          "Your GVRZE Creator Studio workspace: drafts in flight, content performance, audience growth and earnings at a glance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: OverviewScreen,
});
