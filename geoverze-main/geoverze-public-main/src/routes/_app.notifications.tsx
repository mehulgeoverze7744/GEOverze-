import { createFileRoute } from "@tanstack/react-router";

import { NotificationsPage } from "@/features/profile";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — GVRZE" },
      {
        name: "description",
        content:
          "Achievements, new quizzes, community activity and system notices from across GVRZE.",
      },
      { property: "og:title", content: "Notifications — GVRZE" },
      {
        property: "og:description",
        content: "Achievements, new quizzes and system notices from GVRZE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NotificationsPage,
});
