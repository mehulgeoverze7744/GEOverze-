import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/quizzes")({
  head: () => ({
    meta: [
      { title: "Quiz Management — GVRZE Admin" },
      { name: "description", content: "Moderate, publish and audit quizzes across the catalogue." },
      { property: "og:title", content: "Quiz Management — GVRZE Admin" },
      {
        property: "og:description",
        content: "Moderate, publish and audit quizzes across the catalogue.",
      },
    ],
  }),
  component: () => <Outlet />,
});
