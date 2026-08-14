import { createFileRoute } from "@tanstack/react-router";

import { QuizBuilderScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/quizzes/new")({
  head: () => ({
    meta: [
      { title: "New Quiz — GEOverze Creator Studio" },
      {
        name: "description",
        content:
          "Start a new geography quiz set: pick a category, set the rules and write your first questions.",
      },
      { property: "og:title", content: "New Quiz — GEOverze Creator Studio" },
      {
        property: "og:description",
        content: "Start a new geography quiz set in the GEOverze Creator Studio.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NewQuizRoute,
});

function NewQuizRoute() {
  return <QuizBuilderScreen quizId="new" />;
}
