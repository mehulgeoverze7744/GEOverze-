import { createFileRoute } from "@tanstack/react-router";

import { LibraryBookmarksScreen } from "@/features/library";

export const Route = createFileRoute("/geolibrary/bookmarks")({
  head: () => ({
    meta: [
      { title: "Saved reading — GEOlibrary" },
      {
        name: "description",
        content:
          "Every GEOlibrary entry you bookmarked, in one place — filter by category and pick up where you stopped reading.",
      },
      { property: "og:title", content: "Saved reading — GEOlibrary" },
      {
        property: "og:description",
        content: "Your bookmarked GEOlibrary entries and unfinished reading.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/geolibrary/bookmarks" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/geolibrary/bookmarks" }],
  }),
  component: LibraryBookmarksScreen,
});
