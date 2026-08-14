import { createFileRoute } from "@tanstack/react-router";

import { AgeVerificationPage } from "@/features/auth/pages/AgeVerificationPage";

export const Route = createFileRoute("/auth/age-verification")({
  head: () => ({
    meta: [
      { title: "Age Verification — GEOverze" },
      {
        name: "description",
        content:
          "Confirm your age to unlock the right GEOverze experience — educational play is open to every learner.",
      },
      { property: "og:title", content: "Age Verification — GEOverze" },
      {
        property: "og:description",
        content: "Confirm your age to unlock the right GEOverze experience.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/auth/age-verification" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/auth/age-verification" }],
  }),
  component: AgeVerificationPage,
});
