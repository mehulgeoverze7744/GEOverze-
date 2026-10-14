import { createFileRoute } from "@tanstack/react-router";

import { WeeklyChallengesPage } from "@/features/progression";

export const Route = createFileRoute("/play/weekly-challenges")({
  head: () => ({
    meta: [
      { title: "Weekly Challenges — GVRZE" },
      {
        name: "description",
        content: "Bigger weekly geography objectives with larger XP and credit rewards.",
      },
      { property: "og:title", content: "Weekly Challenges — GVRZE" },
      {
        property: "og:description",
        content: "Bigger weekly geography objectives with larger XP and credit rewards.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: WeeklyChallengesPage,
});
