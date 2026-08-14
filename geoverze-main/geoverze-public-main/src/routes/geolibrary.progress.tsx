import { createFileRoute } from "@tanstack/react-router";

import { LibraryProgressScreen } from "@/features/library";

export const Route = createFileRoute("/geolibrary/progress")({
  head: () => ({
    meta: [
      { title: "Learning progress — GEOlibrary" },
      {
        name: "description",
        content:
          "Track your GEOlibrary reading: entries finished, minutes read, reading streak and how far you are through each collection.",
      },
      { property: "og:title", content: "Learning progress — GEOlibrary" },
      {
        property: "og:description",
        content: "Entries finished, minutes read and collection completion.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/geolibrary/progress" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/geolibrary/progress" }],
  }),
  component: LibraryProgressScreen,
});
