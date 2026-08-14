import { createFileRoute } from "@tanstack/react-router";

import { TopicsScreen } from "@/features/community";

const title = "Community topics — GEOverze";
const description =
  "Browse the geography topics driving conversation: rivers, borders, capitals, flags, volcanoes and cartography.";

export const Route = createFileRoute("/community/topics")({
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
  component: TopicsScreen,
});
