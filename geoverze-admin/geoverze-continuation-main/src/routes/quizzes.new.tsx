import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { useQuizMutations } from "@/features/quizzes/hooks/useQuizMutations";
import { QuizBuilder, createBlankQuiz } from "@/features/quizzes/quiz-builder";

export const Route = createFileRoute("/quizzes/new")({
  head: () => ({
    meta: [
      { title: "Create Quiz — GEOverze Admin" },
      {
        name: "description",
        content:
          "Build a new GEOverze quiz: details, question selection, scoring settings and preview.",
      },
      { property: "og:title", content: "Create Quiz — GEOverze Admin" },
      {
        property: "og:description",
        content: "Step-by-step builder for new GEOverze quizzes.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: NewQuizPage,
});

function NewQuizPage() {
  const navigate = useNavigate();
  const { create } = useQuizMutations();

  return (
    <>
      <PageHeader
        title="Create quiz"
        description="Four steps: details, settings and review. Questions are added after creation."
        actions={
          <Button size="sm" variant="outline" asChild>
            <Link to="/quizzes">
              <ArrowLeft className="size-4" aria-hidden="true" />
              Back to catalogue
            </Link>
          </Button>
        }
      />
      <PageBody>
        <QuizBuilder
          initial={createBlankQuiz()}
          submitLabel="Create quiz"
          saving={create.isPending}
          onCancel={() => navigate({ to: "/quizzes" })}
          onSave={(quiz) => {
            create.mutate(quiz, {
              onSuccess: (created) => {
                navigate({ to: "/quizzes/$quizId", params: { quizId: created.id } });
              },
            });
          }}
        />
      </PageBody>
    </>
  );
}
