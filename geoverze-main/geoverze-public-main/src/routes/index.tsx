import { createFileRoute } from "@tanstack/react-router";

import { HomePage } from "@/features/marketing";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "GEOverze — Discover Earth Like Never Before" },
      {
        name: "description",
        content:
          "Explore countries, flags, capitals, maps, cultures and landmarks through beautifully designed interactive experiences, quizzes, challenges and a global community.",
      },
      { property: "og:title", content: "GEOverze — Discover Earth Like Never Before" },
      {
        property: "og:description",
        content:
          "An interactive 3D geography universe: explore, learn and compete your way across the planet.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://geoverze.com/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/" }],
  }),
  component: HomePage,
});
