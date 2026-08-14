import { createFileRoute } from "@tanstack/react-router";

import { LibraryHome } from "@/features/library";

export const Route = createFileRoute("/geolibrary/")({
  head: () => ({
    meta: [
      { title: "GEOlibrary — Explore the world beyond quizzes" },
      {
        name: "description",
        content:
          "The GEOlibrary is GEOverze's knowledge centre: articles, curated collections and creator writing on countries, capitals, rivers, mountains and heritage.",
      },
      { property: "og:title", content: "GEOlibrary — Explore the world beyond quizzes" },
      {
        property: "og:description",
        content: "Articles, collections and creator writing across the whole planet.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/geolibrary" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/geolibrary" }],
  }),
  component: LibraryHome,
});
