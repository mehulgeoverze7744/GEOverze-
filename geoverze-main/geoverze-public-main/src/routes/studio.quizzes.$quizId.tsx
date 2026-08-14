import { createFileRoute } from "@tanstack/react-router";

import { QuizBuilderScreen } from "@/features/studio";

export const Route = createFileRoute("/studio/quizzes/$quizId")({
  head: () => ({
    meta: [
      { title: "Quiz Builder — GEOverze Creator Studio" },
      {
        name: "description",
        content:
          "Edit questions, options, explanations and rules for one of your GEOverze quiz sets.",
      },
      { property: "og:title", content: "Quiz Builder — GEOverze Creator Studio" },
      {
        property: "og:description",
        content: "Edit questions, options and rules for a GEOverze quiz set.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: QuizBuilderRoute,
});

function QuizBuilderRoute() {
  const { quizId } = Route.useParams();
  return <QuizBuilderScreen quizId={quizId} />;
}
