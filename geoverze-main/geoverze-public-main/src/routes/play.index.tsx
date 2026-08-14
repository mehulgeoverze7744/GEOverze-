import { createFileRoute } from "@tanstack/react-router";

import { PlayPage } from "@/features/play";

export const Route = createFileRoute("/play/")({
  head: () => ({
    meta: [
      { title: "Let's Play — GEOverze" },
      {
        name: "description",
        content:
          "Timed geography rounds, live trivia and tournaments inside the GEOverze universe. The play module is in development.",
      },
      { property: "og:title", content: "Let's Play — GEOverze" },
      {
        property: "og:description",
        content:
          "Timed geography rounds, live trivia and tournaments inside the GEOverze universe.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/play" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/play" }],
  }),
  component: PlayPage,
});
