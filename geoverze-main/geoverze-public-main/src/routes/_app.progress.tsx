import { createFileRoute } from "@tanstack/react-router";

import { SkeletonPage } from "@/components/shared/SkeletonPage";
import { ProgressPage } from "@/features/progress";

export const Route = createFileRoute("/_app/progress")({
  head: () => ({
    meta: [
      { title: "Progress — GEOverze" },
      {
        name: "description",
        content:
          "Country mastery by continent, world completion, themed tracks, XP and streak progress in GEOverze.",
      },
      { property: "og:title", content: "Progress — GEOverze" },
      {
        property: "og:description",
        content: "Country mastery, world completion, themed tracks and your experience curve.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  pendingComponent: () => <SkeletonPage stats={3} cards={4} />,
  component: ProgressPage,
});
