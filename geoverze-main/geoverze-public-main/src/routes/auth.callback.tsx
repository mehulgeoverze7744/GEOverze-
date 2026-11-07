import { createFileRoute } from "@tanstack/react-router";

import { AuthCallbackPage } from "@/features/auth/pages/AuthCallbackPage";

export const Route = createFileRoute("/auth/callback")({
  head: () => ({
    meta: [
      { title: "Signing in — GVRZE" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AuthCallbackPage,
});
