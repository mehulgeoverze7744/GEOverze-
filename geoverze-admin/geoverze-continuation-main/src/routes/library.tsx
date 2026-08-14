import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/library")({
  head: () => ({
    meta: [
      { title: "GEOlibrary — GEOverze Admin" },
      {
        name: "description",
        content: "Editorial workflow for GEOlibrary articles and explainers.",
      },
      { property: "og:title", content: "GEOlibrary — GEOverze Admin" },
      {
        property: "og:description",
        content: "Editorial workflow for GEOlibrary articles and explainers.",
      },
    ],
  }),
  component: () => <Outlet />,
});
