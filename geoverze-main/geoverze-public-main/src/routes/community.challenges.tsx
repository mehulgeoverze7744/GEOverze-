import { createFileRoute } from "@tanstack/react-router";

import { ChallengesScreen } from "@/features/community";

const title = "Community challenges — GEOverze";
const description =
  "Country, flag and capital challenges the whole GEOverze community plays together, plus tournament formats in design.";

export const Route = createFileRoute("/community/challenges")({
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
  component: ChallengesScreen,
});
