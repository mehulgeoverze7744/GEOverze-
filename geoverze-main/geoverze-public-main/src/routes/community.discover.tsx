import { createFileRoute } from "@tanstack/react-router";

import { CommunitySearchScreen } from "@/features/community";

const title = "Discover explorers — GEOverze Community";
const description =
  "Search GEOverze for explorers, creators, discussions, topics and community challenges.";

export const Route = createFileRoute("/community/discover")({
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
  component: CommunitySearchScreen,
});
