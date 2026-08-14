import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Archive, Download, Plus, RefreshCw, Trash2 } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buildQuizColumns } from "@/features/quizzes/columns";
import {
  quizCategorySeries,
  quizDifficultySeries,
  quizPlaysSeries,
  quizRecords,
  summarizeQuizzes,
} from "@/features/quizzes/data";
import { filterQuizzes } from "@/features/quizzes/filtering";
import { QuizFilters } from "@/features/quizzes/quiz-filters";
import { QuizStats } from "@/features/quizzes/quiz-stats";
import { emptyQuizFilters, type QuizFilterState } from "@/features/quizzes/types";
import { useQuizActions } from "@/features/quizzes/use-quiz-actions";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";

export const Route = createFileRoute("/quizzes/")({
  head: () => ({
    meta: [
      { title: "Quiz Catalogue — GEOverze Admin" },
      {
        name: "description",
        content:
          "Browse, filter and moderate every GEOverze quiz: status, visibility, plays and ratings.",
      },
      { property: "og:title", content: "Quiz Catalogue — GEOverze Admin" },
      {
        property: "og:description",
        content: "Publish, archive and audit quizzes across the GEOverze catalogue.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuizDirectoryPage,
});

function QuizDirectoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<QuizFilterState>(emptyQuizFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const actions = useQuizActions(quizRecords);
  const rows = useMemo(
    () => filterQuizzes(actions.quizzes, query, filters),
    [actions.quizzes, query, filters],
  );
  const columns = useMemo(() => buildQuizColumns(query), [query]);
  const summary = useMemo(() => summarizeQuizzes(actions.quizzes), [actions.quizzes]);
  const plays = useMemo(() => quizPlaysSeries(actions.quizzes), [actions.quizzes]);
  const categories = useMemo(() => quizCategorySeries(actions.quizzes), [actions.quizzes]);
  const difficulty = useMemo(() => quizDifficultySeries(actions.quizzes), [actions.quizzes]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <>
      <PageHeader
        title="Quiz Management"
        description="The full GEOverze quiz catalogue — publishing, visibility and performance."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={actions.placeholder("Export queued — backend integration pending.")}
            >
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>
            <Button size="sm" asChild>
              <Link to="/quizzes/new">
                <Plus className="size-4" aria-hidden="true" />
                New quiz
              </Link>
            </Button>
          </>
        }
      />

      <PageBody>
        <QuizStats summary={summary} state={loading ? "loading" : "ready"} />

        <div className="grid gap-3 lg:grid-cols-3">
          <ChartCard
            title="Plays over time"
            description="Rolling 12 months across the catalogue"
            series={plays}
            labels={catalogMonths}
            state={loading ? "loading" : "ready"}
          />
          <ChartCard
            title="Quizzes by category"
            series={categories.series}
            labels={categories.labels}
            state={loading ? "loading" : "ready"}
          />
          <ChartCard
            title="Difficulty distribution"
            series={difficulty.series}
            labels={difficulty.labels}
            state={loading ? "loading" : "ready"}
          />
        </div>

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            { label: "Publish selected", onSelect: () => actions.publish(selectedIds) },
            { label: "Unpublish selected", onSelect: () => actions.unpublish(selectedIds) },
            {
              label: "Archive selected",
              icon: <Archive className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestArchive(selectedIds),
            },
            {
              label: "Delete selected",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestDelete(selectedIds),
            },
          ]}
          actions={[
            {
              label: "Refresh",
              icon: <RefreshCw className="size-4" aria-hidden="true" />,
              onSelect: refresh,
            },
          ]}
        >
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search quizzes"
            placeholder="Search title, creator, category or tag…"
          />
        </ActionToolbar>

        <QuizFilters value={filters} onChange={setFilters} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(actions.quizzes.length)} quizzes
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(quiz) => quiz.id}
          highlight={query}
          hideToolbar
          hideBulkBar
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          loading={loading}
          pageSize={25}
          onRowClick={(quiz) => navigate({ to: "/quizzes/$quizId", params: { quizId: quiz.id } })}
          emptyTitle="No quizzes match your search"
          emptyDescription="Try another search term or clear the filters."
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setFilters(emptyQuizFilters);
              }}
            >
              Clear search and filters
            </Button>
          }
          renderMobileCard={(quiz) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{quiz.title}</p>
              <p className="text-xs text-muted-foreground">
                {quiz.creator} · {quiz.questionCount} questions · {num(quiz.plays)} plays
              </p>
              <div className="flex items-center gap-2">
                <DifficultyBadge level={quiz.difficulty} />
                <StatusBadge status={quiz.status} />
              </div>
            </div>
          )}
          rowActions={[
            {
              label: "Open",
              onSelect: (quiz) => navigate({ to: "/quizzes/$quizId", params: { quizId: quiz.id } }),
            },
            { label: "Publish", onSelect: (quiz) => actions.publish([quiz.id]) },
            { label: "Unpublish", onSelect: (quiz) => actions.unpublish([quiz.id]) },
            { label: "Duplicate", onSelect: (quiz) => actions.duplicate(quiz) },
            { label: "Archive", onSelect: (quiz) => actions.requestArchive([quiz.id]) },
            {
              label: "Delete",
              destructive: true,
              onSelect: (quiz) => actions.requestDelete([quiz.id]),
            },
          ]}
        />
      </PageBody>

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
          }}
        />
      )}
    </>
  );
}
