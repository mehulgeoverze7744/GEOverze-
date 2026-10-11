import { createFileRoute } from "@tanstack/react-router";

import { ImposterCreateScreen } from "@/features/geography-imposter";

const t = "Create Room — Geography Imposter · GEOverze";
const d = "Set up a private Geography Imposter room and invite your friends.";

export const Route = createFileRoute("/play/imposter/create")({
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
  component: ImposterCreateScreen,
});
