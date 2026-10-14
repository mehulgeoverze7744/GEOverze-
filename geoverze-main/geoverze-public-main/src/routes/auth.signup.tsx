import { createFileRoute } from "@tanstack/react-router";

import { SignupPage } from "@/features/auth/pages/SignupPage";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create Your Account — GVRZE" },
      {
        name: "description",
        content:
          "Create a free GVRZE account to play geography expeditions, track mastery and compete worldwide.",
      },
      { property: "og:title", content: "Create Your Account — GVRZE" },
      {
        property: "og:description",
        content: "Join GVRZE and start exploring Earth through play.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/auth/signup" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/auth/signup" }],
  }),
  component: SignupPage,
});
