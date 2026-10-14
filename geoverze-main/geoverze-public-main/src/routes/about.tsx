import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/features/marketing";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — GVRZE" },
      {
        name: "description",
        content:
          "GVRZE is a cinematic geography platform built to make learning the planet feel like exploring it.",
      },
      { property: "og:title", content: "About — GVRZE" },
      {
        property: "og:description",
        content: "Why GVRZE exists and the principles behind its design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/about" }],
  }),
  component: AboutPage,
});
