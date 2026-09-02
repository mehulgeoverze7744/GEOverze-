import { createFileRoute } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";

import { LibraryBrowse } from "@/features/library";

const searchSchema = z.object({
  q: fallback(z.string(), "").default(""),
  continent: fallback(z.string(), "all").default("all"),
  difficulty: fallback(z.string(), "all").default("all"),
  time: fallback(z.string(), "all").default("all"),
  category: fallback(z.string(), "all").default("all"),
  sort: fallback(z.string(), "popular").default("popular"),
  saved: fallback(z.boolean(), false).default(false),
  page: fallback(z.coerce.number().int().min(1), 1).default(1),
  pageSize: fallback(z.coerce.number().int().min(1).max(48), 12).default(12),
  view: fallback(z.string(), "grid").default("grid"),
});

export const Route = createFileRoute("/geolibrary/browse")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Browse the GEOlibrary — GEOverze" },
      {
        name: "description",
        content:
          "Search and filter every GEOlibrary entry by continent, category, difficulty and reading time — countries, capitals, rivers, landmarks and more.",
      },
      { property: "og:title", content: "Browse the GEOlibrary — GEOverze" },
      {
        property: "og:description",
        content: "Search and filter every library entry by continent, category and reading time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/geolibrary/browse" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/geolibrary/browse" }],
  }),
  component: LibraryBrowse,
});
