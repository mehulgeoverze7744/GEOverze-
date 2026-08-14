import { createFileRoute } from "@tanstack/react-router";

import { CommunityFeed } from "@/features/community";

const title = "Community feed — GEOverze";
const description =
  "Every post, question, poll, photo and quiz result from the GEOverze community, filtered how you like it.";

export const Route = createFileRoute("/community/feed")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CommunityFeed,
});
