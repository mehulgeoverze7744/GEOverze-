import { createFileRoute } from "@tanstack/react-router";

import { SupportPage } from "@/features/support";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Support — GEOverze" },
      {
        name: "description",
        content:
          "GEOverze help centre: getting started, Let's Play, GEOlibrary, GEOstore, accounts and billing answers.",
      },
      { property: "og:title", content: "Support — GEOverze" },
      {
        property: "og:description",
        content: "Answers, guides and a direct line to the team building GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/support" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/support" }],
  }),
  component: SupportPage,
});
