import { useMemo, useState } from "react";
import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { Archive, Download, Plus, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { EmptyState } from "@/components/shared/empty-state";
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
  summarizeQuizzes,
} from "@/features/quizzes/data";
import { filterQuizzes } from "@/features/quizzes/filtering";
import { useQuizMutations } from "@/features/quizzes/hooks/useQuizMutations";
import { useQuizzes } from "@/features/quizzes/hooks/useQuizzes";
import { QuizFilters } from "@/features/quizzes/quiz-filters";
import { QuizStats } from "@/features/quizzes/quiz-stats";
import { emptyQuizFilters, type QuizFilterState } from "@/features/quizzes/types";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";
import { notReadyNow } from "@/lib/placeholder";

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
  const [deleteIds, setDeleteIds] = useState<string[] | null>(null);

  const { quizzes, loading, error, refetch } = useQuizzes();
  const mutations = useQuizMutations();

  const rows = useMemo(
    () => filterQuizzes(quizzes, query, filters),
    [quizzes, query, filters],
  );
  const columns = useMemo(() => buildQuizColumns(query), [query]);
  const summary = useMemo(() => summarizeQuizzes(quizzes), [quizzes]);
  const plays = useMemo(() => quizPlaysSeries(quizzes), [quizzes]);
  const categories = useMemo(() => quizCategorySeries(quizzes), [quizzes]);
  const difficulty = useMemo(() => quizDifficultySeries(quizzes), [quizzes]);

  const bulkPublish = () => {
    selectedIds.forEach((id) => mutations.publish.mutate(id));
    setSelectedIds([]);
  };

  const bulkUnpublish = () => {
    selectedIds.forEach((id) => mutations.unpublish.mutate(id));
    setSelectedIds([]);
  };

  const bulkArchive = () => {
    selectedIds.forEach((id) => mutations.unpublish.mutate(id));
    toast.info("Quizzes archived (unpublished).");
    setSelectedIds([]);
  };

  if (error) {
    return (
      <PageBody>
        <EmptyState
          title="Could not load quizzes"
          description={error}
          action={
            <Button size="sm" variant="outline" className="mt-2" onClick={() => void refetch()}>
              Try again
            </Button>
          }
        />
      </PageBody>
    );
  }

  return (
    <>
      <PageHeader
        title="Quiz Management"
        description="The full GEOverze quiz catalogue — publishing, visibility and performance."
        actions={
          <>
            <Button size="sm" variant="outline" onClick={() => notReadyNow("Export queued.")}>
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
            { label: "Publish selected", onSelect: bulkPublish },
            { label: "Unpublish selected", onSelect: bulkUnpublish },
            {
              label: "Archive selected",
              icon: <Archive className="size-4" aria-hidden="true" />,
              onSelect: bulkArchive,
            },
            {
              label: "Delete selected",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () => setDeleteIds([...selectedIds]),
            },
          ]}
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
            label="Search quizzes"
            placeholder="Search title, creator, category or tag…"
          />
        </ActionToolbar>

        <QuizFilters value={filters} onChange={setFilters} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(quizzes.length)} quizzes
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
            { label: "Publish", onSelect: (quiz) => mutations.publish.mutate(quiz.id) },
            { label: "Unpublish", onSelect: (quiz) => mutations.unpublish.mutate(quiz.id) },
            {
              label: "Duplicate",
              onSelect: (quiz) =>
                mutations.duplicate.mutate(quiz.id, {
                  onSuccess: (newId) =>
                    navigate({ to: "/quizzes/$quizId", params: { quizId: newId } }),
                }),
            },
            {
              label: "Archive",
              onSelect: (quiz) => {
                mutations.unpublish.mutate(quiz.id);
                toast.info("Quiz archived (unpublished).");
              },
            },
            {
              label: "Delete",
              destructive: true,
              onSelect: (quiz) => setDeleteIds([quiz.id]),
            },
          ]}
        />
      </PageBody>

      {deleteIds && (
        <ConfirmDialog
          open
          onOpenChange={(next) => !next && setDeleteIds(null)}
          title={deleteIds.length === 1 ? "Delete this quiz?" : `Delete ${deleteIds.length} quizzes?`}
          description="Quizzes with play history cannot be deleted — unpublish them instead. This action is permanent for quizzes without attempts."
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            deleteIds.forEach((id) => mutations.remove.mutate(id));
            setDeleteIds(null);
            setSelectedIds([]);
          }}
        />
      )}
    </>
  );
}
