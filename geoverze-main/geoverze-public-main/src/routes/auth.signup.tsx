import { createFileRoute } from "@tanstack/react-router";

import { SignupPage } from "@/features/auth/pages/SignupPage";

export const Route = createFileRoute("/auth/signup")({
  head: () => ({
    meta: [
      { title: "Create Your Account — GEOverze" },
      {
        name: "description",
        content:
          "Create a free GEOverze account to play geography expeditions, track mastery and compete worldwide.",
      },
      { property: "og:title", content: "Create Your Account — GEOverze" },
      {
        property: "og:description",
        content: "Join GEOverze and start exploring Earth through play.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/auth/signup" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/auth/signup" }],
  }),
  component: SignupPage,
});
