import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/creators")({
  head: () => ({
    meta: [
      { title: "Creator Management — GEOverze Admin" },
      {
        name: "description",
        content: "Review creator tiers, applications and payout performance.",
      },
      { property: "og:title", content: "Creator Management — GEOverze Admin" },
      {
        property: "og:description",
        content: "Review creator tiers, applications and payout performance.",
      },
    ],
  }),
  component: () => <Outlet />,
});
