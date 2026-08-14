import { createFileRoute } from "@tanstack/react-router";

import { ModerationQueue } from "@/features/moderation/moderation-queue";

export const Route = createFileRoute("/moderation/creators")({
  head: () => ({
    meta: [
      { title: "Creator Reports — GEOverze Moderation" },
      {
        name: "description",
        content: "Investigate creator conduct, payout fraud signals and verification disputes.",
      },
      { property: "og:title", content: "Creator Reports — GEOverze Moderation" },
      { property: "og:description", content: "Creator conduct and verification investigations." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreatorReportsPage,
});

function CreatorReportsPage() {
  return (
    <ModerationQueue
      surface="Creator"
      title="Creator Reports"
      description="Conduct, originality and payout integrity reports raised against creators."
    />
  );
}
