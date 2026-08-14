import { createFileRoute } from "@tanstack/react-router";

import { MediaScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/media")({
  head: () => ({
    meta: [
      { title: "Media Library — GEOverze Creator Studio" },
      {
        name: "description",
        content:
          "Images, quiz assets and documents you can attach to any GEOverze quiz question or article block.",
      },
      { property: "og:title", content: "Media Library — GEOverze Creator Studio" },
      {
        property: "og:description",
        content:
          "Images, quiz assets and documents you can attach to any GEOverze quiz question or article block.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MediaScreen,
});
