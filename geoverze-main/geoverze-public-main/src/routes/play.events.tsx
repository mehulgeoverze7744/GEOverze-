import { createFileRoute } from "@tanstack/react-router";

import { EventsPage } from "@/features/events";

const t = "Special Events — GEOverze";
const d =
  "Seasonal expeditions, limited-time trails and community events across the GEOverze quiz platform.";

export const Route = createFileRoute("/play/events")({
  head: () => ({
    meta: [
      { title: t },
      { name: "description", content: d },
      { property: "og:title", content: t },
      { property: "og:description", content: d },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EventsPage,
});
