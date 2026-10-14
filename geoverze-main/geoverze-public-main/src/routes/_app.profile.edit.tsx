import { createFileRoute } from "@tanstack/react-router";

import { ProfileEditPage } from "@/features/profile";

export const Route = createFileRoute("/_app/profile/edit")({
  head: () => ({
    meta: [
      { title: "Edit profile — GVRZE" },
      {
        name: "description",
        content:
          "Update your GVRZE explorer identity: display name, username, country, avatar and interests.",
      },
      { property: "og:title", content: "Edit profile — GVRZE" },
      {
        property: "og:description",
        content: "Update your explorer identity, avatar and interests in GVRZE.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfileEditPage,
});
