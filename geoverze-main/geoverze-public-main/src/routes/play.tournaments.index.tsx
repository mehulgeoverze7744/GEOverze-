import { createFileRoute } from "@tanstack/react-router";

import { TournamentsPage } from "@/features/tournaments";

const t = "Tournaments — GEOverze";
const d =
  "Open brackets, seasonal cups and invitational geography tournaments inside the GEOverze quiz platform.";

export const Route = createFileRoute("/play/tournaments/")({
  head: () => ({
    meta: [
      { title: t },
      { name: "description", content: d },
      { property: "og:title", content: t },
      { property: "og:description", content: d },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TournamentsPage,
});
