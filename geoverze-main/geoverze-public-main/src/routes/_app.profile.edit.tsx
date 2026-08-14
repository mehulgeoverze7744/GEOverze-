import { createFileRoute } from "@tanstack/react-router";

import { ProfileEditPage } from "@/features/profile";

export const Route = createFileRoute("/_app/profile/edit")({
  head: () => ({
    meta: [
      { title: "Edit profile — GEOverze" },
      {
        name: "description",
        content:
          "Update your GEOverze explorer identity: display name, username, country, avatar and interests.",
      },
      { property: "og:title", content: "Edit profile — GEOverze" },
      {
        property: "og:description",
        content: "Update your explorer identity, avatar and interests in GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ProfileEditPage,
});
