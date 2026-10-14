import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "GVRZE Library — GVRZE Admin" },
      {
        name: "description",
        content: "Editorial workflow for GVRZE Library articles and explainers.",
      },
      { property: "og:title", content: "GVRZE Library — GVRZE Admin" },
      {
        property: "og:description",
        content: "Editorial workflow for GVRZE Library articles and explainers.",
      },
    ],
  }),
  component: () => <Outlet />,
});
