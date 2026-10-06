import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";

import { SupportPage } from "@/features/support";
import { useAuthStore } from "@/stores/authStore";

export const Route = createFileRoute("/support")({
  head: () => ({
    meta: [
      { title: "Settings/Support — GEOverze" },
      {
        name: "description",
        content:
          "GEOverze help centre: getting started, Let's Play, GEOlibrary, GEOstore, accounts and billing answers.",
      },
      { property: "og:title", content: "Settings/Support — GEOverze" },
      {
        property: "og:description",
        content: "Answers, guides and a direct line to the team building GEOverze.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:url", content: "https://geoverze.com/settings" },
    ],
    links: [{ rel: "canonical", href: "https://geoverze.com/settings" }],
  }),
  component: SupportRoute,
});

function SupportRoute() {
  const status = useAuthStore((s) => s.status);
  const navigate = useNavigate();

  useEffect(() => {
    if (status !== "signed-in") return;
    void navigate({
      to: "/settings",
      search: { section: undefined },
      hash: "support",
      replace: true,
    });
  }, [navigate, status]);

  if (status === "signed-in") return null;

  return <SupportPage />;
}
