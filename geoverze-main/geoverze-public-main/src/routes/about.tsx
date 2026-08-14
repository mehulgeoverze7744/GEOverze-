import { createFileRoute } from "@tanstack/react-router";

import { AboutPage } from "@/features/marketing";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — GEOverze" },
      {
        name: "description",
        content:
          "GEOverze is a cinematic geography platform built to make learning the planet feel like exploring it.",
      },
      { property: "og:title", content: "About — GEOverze" },
      {
        property: "og:description",
        content: "Why GEOverze exists and the principles behind its design.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/about" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/about" }],
  }),
  component: AboutPage,
});
