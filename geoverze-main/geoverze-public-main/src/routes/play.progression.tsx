import { createFileRoute } from "@tanstack/react-router";

import { ProgressionHub } from "@/features/progression";

export const Route = createFileRoute("/play/progression")({
  head: () => ({
    meta: [
      { title: "Progression — GEOverze" },
      {
        name: "description",
        content:
          "Track your level, XP, credits, streak and challenges across the GEOverze universe.",
      },
      { property: "og:title", content: "Progression — GEOverze" },
      {
        property: "og:description",
        content:
          "Track your level, XP, credits, streak and challenges across the GEOverze universe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProgressionHub,
});
