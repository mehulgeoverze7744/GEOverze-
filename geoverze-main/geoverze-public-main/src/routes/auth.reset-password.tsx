import { createFileRoute } from "@tanstack/react-router";

import { ResetPasswordPage } from "@/features/auth/pages/ResetPasswordPage";

export const Route = createFileRoute("/auth/reset-password")({
  head: () => ({
    meta: [
      { title: "Set a New Password — GEOverze" },
      {
        name: "description",
        content: "Choose a new password for your GEOverze account and get back to exploring.",
      },
      { property: "og:title", content: "Set a New Password — GEOverze" },
      {
        property: "og:description",
        content: "Choose a new password for your GEOverze account.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
      { property: "og:url", content: "https://geoverze.com/auth/reset-password" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/auth/reset-password" }],
  }),
  component: ResetPasswordPage,
});
