import { createFileRoute } from "@tanstack/react-router";

import { HistoryPage } from "@/features/history";

const t = "Match History — GEOverze";
const d =
  "Every completed GEOverze run with score, accuracy, timing and rewards, filterable by mode.";

export const Route = createFileRoute("/play/history/")({
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
  component: HistoryPage,
});
