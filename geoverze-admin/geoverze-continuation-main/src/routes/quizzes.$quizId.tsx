import { useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Eye, Loader2, Star, Trash2, Upload } from "lucide-react";

import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { InspectorField } from "@/components/shared/inspector-panel";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SectionHeader } from "@/components/shared/section-header";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QuizPlayerPreview } from "@/features/questions/question-preview";
import { QuizBuilder } from "@/features/quizzes/quiz-builder";
import { useQuizDetail } from "@/features/quizzes/hooks/useQuizDetail";
import { useQuizMutations } from "@/features/quizzes/hooks/useQuizMutations";
import { QuizQuestionsPanel } from "@/features/quizzes/quiz-questions-panel";
import { formatDate, formatDateTime } from "@/features/users/format";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";

export const Route = createFileRoute("/quizzes/$quizId")({
  head: ({ params }) => {
    const title = `${params.quizId} — Quiz Details | GEOverze Admin`;
    const description = `Questions, analytics, versions and moderation history for ${params.quizId}.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  notFoundComponent: QuizNotFound,
  component: QuizDetailPage,
});

function QuizNotFound() {
  return (
    <div className="py-10">
      <EmptyState
        title="Quiz not found"
        description="This quiz ID does not exist in the catalogue."
        action={
          <Button size="sm" variant="outline" className="mt-2" asChild>
            <Link to="/quizzes">Back to catalogue</Link>
          </Button>
        }
      />
    </div>
  );
}

function QuizDetailPage() {
  const { quizId } = Route.useParams();
  const navigate = useNavigate();
  const { quiz, questions, loading, error } = useQuizDetail(quizId);
  const mutations = useQuizMutations();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  if (loading) {
    return (
      <PageBody>
        <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          Loading quiz…
        </div>
      </PageBody>
    );
  }

  if (error) {
    return (
      <PageBody>
        <EmptyState
          title="Could not load quiz"
          description={error}
          action={
            <Button size="sm" variant="outline" className="mt-2" asChild>
              <Link to="/quizzes">Back to catalogue</Link>
            </Button>
          }
        />
      </PageBody>
    );
  }

  if (!quiz) return <QuizNotFound />;

  const maxPlays = Math.max(1, ...quiz.playsSeries);
  const playsSeries = quiz.playsSeries.map((value) => Math.round((value / maxPlays) * 100));
  const mixEntries = Object.entries(quiz.difficultyMix);
  const maxMix = Math.max(1, ...mixEntries.map(([, count]) => count));

  return (
    <>
      <PageHeader
        title={quiz.title}
        description={quiz.description}
        actions={
          <>
            <Button size="sm" variant="outline" asChild>
              <Link to="/quizzes">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Catalogue
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setPreviewOpen(true)}>
              <Eye className="size-4" aria-hidden="true" />
              Preview
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={mutations.duplicate.isPending}
              onClick={() =>
                mutations.duplicate.mutate(quiz.id, {
                  onSuccess: (newId) =>
                    navigate({ to: "/quizzes/$quizId", params: { quizId: newId } }),
                })
              }
            >
              <Copy className="size-4" aria-hidden="true" />
              Duplicate
            </Button>
            {quiz.status === "published" ? (
              <Button
                size="sm"
                variant="outline"
                disabled={mutations.unpublish.isPending}
                onClick={() => mutations.unpublish.mutate(quiz.id)}
              >
                Unpublish
              </Button>
            ) : (
              <Button
                size="sm"
                disabled={mutations.publish.isPending}
                onClick={() => mutations.publish.mutate(quiz.id)}
              >
                <Upload className="size-4" aria-hidden="true" />
                Publish
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Delete
            </Button>
          </>
        }
      />

      <PageBody>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={quiz.status} />
          <DifficultyBadge level={quiz.difficulty} />
          <Badge variant="outline" className="font-normal">
            {quiz.visibility}
          </Badge>
          <Badge variant="secondary" className="font-normal">
            {quiz.category}
          </Badge>
          {quiz.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="font-normal">
              {tag}
            </Badge>
          ))}
        </div>

        <StatGrid columns={5} label="Quiz performance">
          <StatCard label="Plays" value={num(quiz.plays)} hint="Lifetime" />
          <StatCard label="Completion" value={`${quiz.completionRate}%`} />
          <StatCard label="Average score" value={`${quiz.averageScore}%`} />
          <StatCard
            label="Rating"
            value={quiz.rating.toFixed(1)}
            icon={Star}
            hint={`${num(quiz.ratingCount)} ratings`}
          />
          <StatCard
            label="Questions"
            value={num(quiz.questionCount)}
            hint={`${quiz.durationMinutes} min estimated`}
          />
        </StatGrid>

        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="questions">Questions</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 grid gap-3 lg:grid-cols-2">
            <section className="rounded-lg border border-border bg-card p-4">
              <SectionHeader title="Metadata" description="Catalogue and ownership details." />
              <div className="mt-2">
                <InspectorField
                  label="Quiz ID"
                  value={<code className="font-mono text-xs">{quiz.id}</code>}
                />
                <InspectorField label="Creator" value={quiz.creator} />
                <InspectorField label="Language" value={quiz.language} />
                <InspectorField label="Art / thumbnail" value={quiz.thumbnailLabel || "—"} />
                <InspectorField label="Reward XP" value={num(quiz.rewardXp)} />
                <InspectorField label="Reward credits" value={num(quiz.rewardCredits)} />
                <InspectorField label="Created" value={formatDate(quiz.createdAt)} />
                <InspectorField label="Last updated" value={formatDateTime(quiz.updatedAt)} />
              </div>
            </section>
            <section className="rounded-lg border border-border bg-card p-4">
              <SectionHeader title="Settings" description="Scoring and play rules." />
              <div className="mt-2">
                <InspectorField label="Visibility" value={`${quiz.visibility} (UI only)`} />
                <InspectorField
                  label="Time limit"
                  value={
                    quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min (UI only)` : "No limit"
                  }
                />
                <InspectorField
                  label="Passing score"
                  value={quiz.passingScore ? `${quiz.passingScore}% (UI only)` : "—"}
                />
                <InspectorField
                  label="Instructions"
                  value={quiz.instructions ? `${quiz.instructions} (UI only)` : "—"}
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            <QuizQuestionsPanel quizId={quiz.id} questions={questions} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 grid gap-3 lg:grid-cols-2">
            <ChartCard
              title="Plays over time"
              description="Rolling 12 months"
              series={playsSeries}
              labels={catalogMonths}
            />
            <ChartCard
              title="Difficulty mix"
              description="Questions per difficulty level"
              series={mixEntries.map(([, count]) => Math.round((count / maxMix) * 100))}
              labels={mixEntries.map(([level, count]) => `${level} (${count})`)}
            />
          </TabsContent>

          <TabsContent value="edit" className="mt-4">
            <QuizBuilder
              initial={quiz}
              submitLabel="Save changes"
              saving={mutations.update.isPending}
              onCancel={() => navigate({ to: "/quizzes" })}
              onSave={(draft) => mutations.update.mutate({ ...draft, id: quiz.id })}
            />
          </TabsContent>

          <TabsContent value="versions" className="mt-4">
            <section className="rounded-lg border border-border bg-card">
              <SectionHeader
                title="Version history"
                description="Every published revision of this quiz."
                className="border-b border-border px-4 py-3"
              />
              <EmptyState
                title="No version history"
                description="Version tracking is not stored in the database yet."
              />
            </section>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <EmptyState
              title="No activity recorded"
              description="Moderation and edit history is not stored in the database yet."
            />
          </TabsContent>
        </Tabs>
      </PageBody>

      <SideDrawer
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        title="Quiz preview"
        description="Exactly how players experience this quiz."
        width="sm:max-w-lg"
      >
        <QuizPlayerPreview questions={questions} heading={quiz.title} />
      </SideDrawer>

      {deleteOpen && (
        <ConfirmDialog
          open
          onOpenChange={setDeleteOpen}
          title="Delete this quiz?"
          description="Quizzes with play history cannot be deleted. Unpublish instead. This is permanent for quizzes without attempts."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            mutations.remove.mutate(quiz.id, {
              onSuccess: () => navigate({ to: "/quizzes" }),
            });
            setDeleteOpen(false);
          }}
        />
      )}
    </>
  );
}
