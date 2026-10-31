import { createFileRoute } from "@tanstack/react-router";

import { CreditHistoryPage } from "@/features/progression";

export const Route = createFileRoute("/play/credit-history")({
  head: () => ({
    meta: [
      { title: "Credit History — GVRZE" },
      {
        name: "description",
        content:
          "Your full credit ledger and how XP is earned — wallet balance, gameplay earns, Gstore spending, and the XP award table.",
      },
      { property: "og:title", content: "Credit History — GVRZE" },
      {
        property: "og:description",
        content:
          "Your full credit ledger and how XP is earned — wallet balance, gameplay earns, Gstore spending, and the XP award table.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreditHistoryPage,
});
