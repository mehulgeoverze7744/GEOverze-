import { createFileRoute } from "@tanstack/react-router";

import { NotificationsScreen } from "@/features/community";

const title = "Community notifications — GEOverze";
const description =
  "Replies, mentions, likes, friend requests and challenge invites from the GEOverze community.";

export const Route = createFileRoute("/community/notifications")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NotificationsScreen,
});
