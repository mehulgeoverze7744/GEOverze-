import { createFileRoute } from "@tanstack/react-router";

import { MembersScreen } from "@/features/community";

const title = "Explorers — GEOverze Community";
const description =
  "Meet the explorers, navigators, cartographers and creators building the GEOverze community.";

export const Route = createFileRoute("/community/members")({
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
  component: MembersScreen,
});
