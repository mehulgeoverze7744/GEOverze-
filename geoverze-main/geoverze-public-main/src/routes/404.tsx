import { createFileRoute } from "@tanstack/react-router";

import { NotFoundPage } from "@/features/errors";

export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: "Page Not Found — GEOverze" },
      {
        name: "description",
        content: "This GEOverze coordinate doesn't exist. Head back to charted territory.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Page Not Found — GEOverze" },
      { property: "og:description", content: "This GEOverze coordinate doesn't exist." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/404" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/404" }],
  }),
  component: NotFoundPage,
});
