import { createFileRoute } from "@tanstack/react-router";

import { FriendsScreen } from "@/features/community";

const title = "Friends — GEOverze Community";
const description =
  "Manage friend requests, see the explorers you play with, and revisit recent head-to-head matches.";

export const Route = createFileRoute("/community/friends")({
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
  component: FriendsScreen,
});
