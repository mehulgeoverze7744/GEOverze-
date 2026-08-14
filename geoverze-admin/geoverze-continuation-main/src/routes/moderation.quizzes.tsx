import { createFileRoute } from "@tanstack/react-router";

import { ModerationQueue } from "@/features/moderation/moderation-queue";

export const Route = createFileRoute("/moderation/quizzes")({
  head: () => ({
    meta: [
      { title: "Quiz Reports — GEOverze Moderation" },
      {
        name: "description",
        content: "Review flagged quizzes, disputed answer keys and copyrighted map imagery.",
      },
      { property: "og:title", content: "Quiz Reports — GEOverze Moderation" },
      { property: "og:description", content: "Flagged quizzes and content integrity reviews." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuizReportsPage,
});

function QuizReportsPage() {
  return (
    <ModerationQueue
      surface="Quiz"
      title="Quiz Reports"
      description="Content integrity reports raised against published quizzes."
    />
  );
}
