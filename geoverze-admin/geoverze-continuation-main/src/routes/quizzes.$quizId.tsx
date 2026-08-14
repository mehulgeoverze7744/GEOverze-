import { useMemo, useState } from "react";
import { Link, createFileRoute, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Copy, Eye, Star, Trash2, Upload } from "lucide-react";

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
import { getQuizById, getQuizQuestions, quizRecords } from "@/features/quizzes/data";
import { QuizBuilder } from "@/features/quizzes/quiz-builder";
import { useQuizActions } from "@/features/quizzes/use-quiz-actions";
import { formatDate, formatDateTime } from "@/features/users/format";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";

export const Route = createFileRoute("/quizzes/$quizId")({
  loader: ({ params }) => {
    const quiz = getQuizById(params.quizId);
    if (!quiz) throw notFound();
    return { quizId: quiz.id, title: quiz.title };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Quiz not found — GEOverze Admin" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const title = `${loaderData.title} — Quiz Details | GEOverze Admin`;
    const description = `Questions, analytics, versions and moderation history for ${loaderData.title}.`;
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
  const actions = useQuizActions(quizRecords);
  const [previewOpen, setPreviewOpen] = useState(false);

  const quiz = actions.quizzes.find((entry) => entry.id === quizId);
  const questions = useMemo(() => (quiz ? getQuizQuestions(quiz) : []), [quiz]);

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
            <Button size="sm" variant="outline" onClick={() => actions.duplicate(quiz)}>
              <Copy className="size-4" aria-hidden="true" />
              Duplicate
            </Button>
            {quiz.status === "published" ? (
              <Button size="sm" variant="outline" onClick={() => actions.unpublish([quiz.id])}>
                Unpublish
              </Button>
            ) : (
              <Button size="sm" onClick={() => actions.publish([quiz.id])}>
                <Upload className="size-4" aria-hidden="true" />
                Publish
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="text-destructive"
              onClick={() => actions.requestDelete([quiz.id])}
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
                <InspectorField
                  label="Creator"
                  value={
                    <Link
                      to="/creators/$creatorId"
                      params={{ creatorId: quiz.creatorId }}
                      className="text-primary hover:underline"
                    >
                      {quiz.creator}
                    </Link>
                  }
                />
                <InspectorField label="Language" value={quiz.language} />
                <InspectorField label="Thumbnail" value={quiz.thumbnailLabel || "—"} />
                <InspectorField label="Created" value={formatDate(quiz.createdAt)} />
                <InspectorField label="Last updated" value={formatDateTime(quiz.updatedAt)} />
              </div>
            </section>
            <section className="rounded-lg border border-border bg-card p-4">
              <SectionHeader title="Settings" description="Scoring and play rules." />
              <div className="mt-2">
                <InspectorField label="Visibility" value={quiz.visibility} />
                <InspectorField
                  label="Time limit"
                  value={quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : "No limit"}
                />
                <InspectorField label="Passing score" value={`${quiz.passingScore}%`} />
                <InspectorField label="Instructions" value={quiz.instructions} />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="questions" className="mt-4">
            <section className="rounded-lg border border-border bg-card">
              <SectionHeader
                title={`Question set (${questions.length})`}
                description="Play order as configured in the builder."
                className="border-b border-border px-4 py-3"
              />
              {questions.length === 0 ? (
                <EmptyState title="No questions attached" />
              ) : (
                <ol className="divide-y divide-border">
                  {questions.map((question, index) => (
                    <li
                      key={`${question.id}-${index}`}
                      className="flex items-start gap-3 px-4 py-3"
                    >
                      <span className="w-6 shrink-0 text-xs text-muted-foreground tabular">
                        {index + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-foreground">{question.prompt}</p>
                        <p className="text-xs text-muted-foreground">
                          {question.type} · {question.region} · used {num(question.usageCount)}×
                        </p>
                      </div>
                      <DifficultyBadge level={question.difficulty} />
                      <StatusBadge status={question.status} />
                    </li>
                  ))}
                </ol>
              )}
            </section>
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
              onCancel={() => navigate({ to: "/quizzes" })}
              onSave={actions.save}
            />
          </TabsContent>

          <TabsContent value="versions" className="mt-4">
            <section className="rounded-lg border border-border bg-card">
              <SectionHeader
                title="Version history"
                description="Every published revision of this quiz."
                className="border-b border-border px-4 py-3"
              />
              <ul className="divide-y divide-border">
                {quiz.versions.map((version) => (
                  <li key={version.id} className="flex items-start gap-3 px-4 py-3">
                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                      {version.version}
                    </Badge>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground">{version.summary}</p>
                      <p className="text-xs text-muted-foreground">
                        {version.author} · {formatDate(version.at)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={actions.placeholder("Version restore needs the backend.")}
                    >
                      Restore
                    </Button>
                  </li>
                ))}
              </ul>
            </section>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <ActivityTimeline
              title="Moderation & edit history"
              events={quiz.activity.map((entry) => ({
                ...entry,
                time: formatDateTime(entry.time),
              }))}
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

      {actions.confirm && (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && actions.setConfirm(null)}
          title={actions.confirm.title}
          description={actions.confirm.description}
          confirmLabel={actions.confirm.confirmLabel}
          destructive={actions.confirm.destructive}
          onConfirm={() => {
            actions.confirm?.onConfirm();
            actions.setConfirm(null);
            if (actions.confirm?.destructive) navigate({ to: "/quizzes" });
          }}
        />
      )}
    </>
  );
}
