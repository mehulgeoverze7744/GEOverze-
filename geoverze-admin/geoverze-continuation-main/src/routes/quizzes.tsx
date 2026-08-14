import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quizzes")({
  head: () => ({
    meta: [
      { title: "Quiz Management — GEOverze Admin" },
      { name: "description", content: "Moderate, publish and audit quizzes across the catalogue." },
      { property: "og:title", content: "Quiz Management — GEOverze Admin" },
      {
        property: "og:description",
        content: "Moderate, publish and audit quizzes across the catalogue.",
      },
    ],
  }),
  component: () => <Outlet />,
});
