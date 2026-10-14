import { createFileRoute } from "@tanstack/react-router";

import { EventsScreen } from "@/features/community";

const title = "Community events — GVRZE";
const description =
  "Live quiz rounds, cartography workshops, tournaments and explorer meetups happening across GVRZE.";

export const Route = createFileRoute("/community/events")({
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
  component: EventsScreen,
});
