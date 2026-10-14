import { createFileRoute } from "@tanstack/react-router";

import { ImposterHubScreen } from "@/features/geography-imposter";

const t = "Geography Imposter — GVRZE";
const d = "Social deduction geography game. Spot the imposter before they escape!";

export const Route = createFileRoute("/play/imposter/")({
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
  component: ImposterHubScreen,
});
