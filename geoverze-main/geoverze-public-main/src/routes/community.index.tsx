import { createFileRoute } from "@tanstack/react-router";

import { CommunityHome } from "@/features/community";

const title = "Community — GEOverze";
const description =
  "Share discoveries, answer geography questions, vote in polls and celebrate streaks with explorers around the world.";

export const Route = createFileRoute("/community/")({
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
  component: CommunityHome,
});
