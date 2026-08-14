import { createFileRoute } from "@tanstack/react-router";

import { AudienceScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/audience")({
  head: () => ({
    meta: [
      { title: "Audience — GEOverze Creator Studio" },
      {
        name: "description",
        content:
          "See who follows your geography content on GEOverze and how deeply they engage with it.",
      },
      { property: "og:title", content: "Audience — GEOverze Creator Studio" },
      {
        property: "og:description",
        content:
          "See who follows your geography content on GEOverze and how deeply they engage with it.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AudienceScreen,
});
