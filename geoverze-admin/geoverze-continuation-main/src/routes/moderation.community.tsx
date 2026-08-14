import { createFileRoute } from "@tanstack/react-router";

import { ModerationQueue } from "@/features/moderation/moderation-queue";

export const Route = createFileRoute("/moderation/community")({
  head: () => ({
    meta: [
      { title: "Community Reports — GEOverze Moderation" },
      {
        name: "description",
        content: "Moderate discussion threads, comments and live chat across GEOverze community.",
      },
      { property: "og:title", content: "Community Reports — GEOverze Moderation" },
      { property: "og:description", content: "Threads, comments and live chat moderation." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CommunityReportsPage,
});

function CommunityReportsPage() {
  return (
    <ModerationQueue
      surface="Community"
      title="Community Reports"
      description="Reports raised in discussion threads, comments and live chat."
    />
  );
}
