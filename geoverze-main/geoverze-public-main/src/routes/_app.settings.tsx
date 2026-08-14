import { createFileRoute } from "@tanstack/react-router";

import { SettingsPage } from "@/features/settings";

export const Route = createFileRoute("/_app/settings")({
  head: () => ({
    meta: [
      { title: "Settings — GEOverze" },
      {
        name: "description",
        content:
          "Tune motion, units, notifications and privacy for your GEOverze account and this device.",
      },
      { property: "og:title", content: "Settings — GEOverze" },
      {
        property: "og:description",
        content: "Presentation, notification and privacy preferences for GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/settings" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/settings" }],
  }),
  component: SettingsPage,
});
