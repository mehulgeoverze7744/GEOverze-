import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { RefreshCw } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable } from "@/components/shared/data-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buildBankQuestionColumns } from "@/features/questions/bank-columns";
import { filterBankQuestions } from "@/features/questions/bank-filtering";
import { BankQuestionFilters } from "@/features/questions/bank-question-filters";
import { BankQuestionStats } from "@/features/questions/bank-question-stats";
import { summarizeBankQuestions, toBankChartSeries } from "@/features/questions/bank-stats";
import { DuplicateToQuizDialog } from "@/features/questions/duplicate-to-quiz-dialog";
import { QuizPlayerPreview } from "@/features/questions/question-preview";
import { useQuestionBank } from "@/features/questions/hooks/useQuestionBank";
import {
  emptyBankQuestionFilters,
  type BankQuestionFilterState,
  type BankQuestionRecord,
} from "@/features/questions/types";
import { num } from "@/lib/format";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Question Bank — GEOverze Admin" },
      {
        name: "description",
        content:
          "Browse every quiz-scoped question in GEOverze. Edit questions from the parent quiz detail page.",
      },
      { property: "og:title", content: "Question Bank — GEOverze Admin" },
      {
        property: "og:description",
        content: "Read-only index of all quiz questions across the GEOverze catalogue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuestionBankPage,
});

function QuestionBankPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<BankQuestionFilterState>(emptyBankQuestionFilters);
  const [previewing, setPreviewing] = useState<BankQuestionRecord | null>(null);
  const [duplicating, setDuplicating] = useState<BankQuestionRecord | null>(null);

  const { questions, loading, error, refetch } = useQuestionBank();

  const quizOptions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const question of questions) {
      byId.set(question.quizId, question.quizTitle);
    }
    return [...byId.entries()]
      .map(([id, title]) => ({ id, title }))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [questions]);

  const rows = useMemo(
    () => filterBankQuestions(questions, query, filters),
    [questions, query, filters],
  );
  const columns = useMemo(() => buildBankQuestionColumns(query), [query]);
  const summary = useMemo(() => summarizeBankQuestions(questions), [questions]);
  const typeChart = useMemo(() => toBankChartSeries(summary.typeCounts), [summary]);

  const openInQuiz = (question: BankQuestionRecord) => {
    void navigate({
      to: "/quizzes/$quizId",
      params: { quizId: question.quizId },
    });
  };

  if (error) {
    return (
      <>
        <PageHeader
          title="Question Bank"
          description="Read-only index of every quiz-scoped question. Edit from the parent quiz detail page."
        />
        <PageBody>
          <EmptyState
            title="Could not load questions"
            description={error}
            action={
              <Button size="sm" variant="outline" className="mt-2" onClick={() => void refetch()}>
                Try again
              </Button>
            }
          />
        </PageBody>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title="Question Bank"
        description="Read-only index of every quiz-scoped question. To create or edit, open the parent quiz's Questions panel."
      />

      <PageBody>
        <BankQuestionStats summary={summary} state={loading ? "loading" : "ready"} />

        <ChartCard
          title="Questions by type"
          description="Distribution across supported question formats"
          series={typeChart.series}
          labels={typeChart.labels}
          state={loading ? "loading" : "ready"}
          footnote="Counts from loaded quiz questions. Bar heights are normalized to the highest type."
        />

        <ActionToolbar
          selectedCount={0}
          onClearSelection={() => undefined}
          bulkActions={[]}
          actions={[
            {
              label: "Refresh",
              icon: <RefreshCw className="size-4" aria-hidden="true" />,
              onSelect: () => void refetch(),
            },
          ]}
        >
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search questions"
            placeholder="Search prompt, explanation or quiz title…"
          />
        </ActionToolbar>

        <BankQuestionFilters value={filters} onChange={setFilters} quizzes={quizOptions} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(questions.length)} questions
          {query && <> matching “{query}”</>}
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(question) => question.id}
          highlight={query}
          hideToolbar
          hideBulkBar
          loading={loading}
          pageSize={25}
          onRowClick={(question) => setPreviewing(question)}
          emptyTitle={questions.length === 0 ? "No questions yet" : "No questions match your search"}
          emptyDescription={
            questions.length === 0
              ? "Create questions from a quiz detail page under the Questions tab."
              : "Try another search term or clear the filters."
          }
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setFilters(emptyBankQuestionFilters);
              }}
            >
              Clear search and filters
            </Button>
          }
          renderMobileCard={(question) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{question.prompt}</p>
              <p className="text-xs text-muted-foreground">
                {question.type} · {question.quizTitle} · #{question.position}
              </p>
              <StatusBadge status={question.quizPublished ? "published" : "draft"} />
            </div>
          )}
          rowActions={[
            { label: "Preview", onSelect: (question) => setPreviewing(question) },
            { label: "Open in quiz", onSelect: openInQuiz },
            { label: "Duplicate to quiz", onSelect: (question) => setDuplicating(question) },
          ]}
        />

        <p className="text-xs text-muted-foreground">
          Quiz status reflects whether the parent quiz is published — not an independent question
          lifecycle. Duplicate to quiz creates a new copy in the target quiz; the source row is never
          changed.
        </p>
      </PageBody>

      <DuplicateToQuizDialog
        open={duplicating !== null}
        onOpenChange={(next) => !next && setDuplicating(null)}
        source={duplicating}
        onOpenInQuiz={(quizId) => {
          void navigate({
            to: "/quizzes/$quizId",
            params: { quizId },
          });
        }}
      />

      <SideDrawer
        open={previewing !== null}
        onOpenChange={(next) => !next && setPreviewing(null)}
        title="Question preview"
        description={
          previewing
            ? `${previewing.quizTitle} · position ${previewing.position}`
            : "Exactly how players see this question."
        }
        width="sm:max-w-lg"
      >
        {previewing && (
          <QuizPlayerPreview
            questions={[previewing]}
            heading={previewing.quizTitle}
          />
        )}
      </SideDrawer>
    </>
  );
}
