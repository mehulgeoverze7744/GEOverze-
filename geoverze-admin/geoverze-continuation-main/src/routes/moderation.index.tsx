import { createFileRoute } from "@tanstack/react-router";

import { ModerationQueue } from "@/features/moderation/moderation-queue";

export const Route = createFileRoute("/moderation/")({
  head: () => ({
    meta: [
      { title: "User Reports — GEOverze Moderation" },
      {
        name: "description",
        content: "Review reports filed against GEOverze player accounts and apply enforcement.",
      },
      { property: "og:title", content: "User Reports — GEOverze Moderation" },
      { property: "og:description", content: "Account-level abuse reports and enforcement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: UserReportsPage,
});

function UserReportsPage() {
  return (
    <ModerationQueue
      surface="User"
      title="User Reports"
      description="Abuse reports filed against player accounts, with full enforcement history."
    />
  );
}
