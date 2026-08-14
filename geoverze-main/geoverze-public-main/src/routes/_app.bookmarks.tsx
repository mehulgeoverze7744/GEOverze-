import { createFileRoute } from "@tanstack/react-router";

import { BookmarksPage } from "@/features/profile";

export const Route = createFileRoute("/_app/bookmarks")({
  head: () => ({
    meta: [
      { title: "Bookmarks — GEOverze" },
      {
        name: "description",
        content:
          "Saved articles, quizzes, maps and learning paths — your personal GEOverze collection.",
      },
      { property: "og:title", content: "Bookmarks — GEOverze" },
      {
        property: "og:description",
        content: "Saved articles, quizzes, maps and learning paths in GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/bookmarks" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/bookmarks" }],
  }),
  component: BookmarksPage,
});
