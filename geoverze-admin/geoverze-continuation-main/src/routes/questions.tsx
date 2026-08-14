import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, Download, Plus, RefreshCw, Trash2, Upload } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { DifficultyBadge } from "@/components/shared/difficulty-badge";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buildQuestionColumns } from "@/features/questions/columns";
import { questionRecords, summarizeQuestions, toChartSeries } from "@/features/questions/data";
import { filterQuestions } from "@/features/questions/filtering";
import { QuestionEditor } from "@/features/questions/question-editor";
import { QuestionFilters } from "@/features/questions/question-filters";
import { QuestionStats } from "@/features/questions/question-stats";
import { QuizPlayerPreview } from "@/features/questions/question-preview";
import {
  emptyQuestionFilters,
  type QuestionFilterState,
  type QuestionRecord,
} from "@/features/questions/types";
import { useQuestionActions } from "@/features/questions/use-question-actions";
import { validateQuestion } from "@/features/questions/validation";
import { num } from "@/lib/format";

export const Route = createFileRoute("/questions")({
  head: () => ({
    meta: [
      { title: "Question Bank — GEOverze Admin" },
      {
        name: "description",
        content:
          "Curate the reusable GEOverze question bank: types, difficulty, regions, media and validation.",
      },
      { property: "og:title", content: "Question Bank — GEOverze Admin" },
      {
        property: "og:description",
        content: "Create, validate and reuse questions across every GEOverze quiz.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QuestionBankPage,
});

function QuestionBankPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<QuestionFilterState>(emptyQuestionFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<QuestionRecord | null>(null);
  const [previewing, setPreviewing] = useState<QuestionRecord | null>(null);

  const actions = useQuestionActions(questionRecords);
  const rows = useMemo(
    () => filterQuestions(actions.questions, query, filters),
    [actions.questions, query, filters],
  );
  const columns = useMemo(() => buildQuestionColumns(query), [query]);
  const summary = useMemo(() => summarizeQuestions(actions.questions), [actions.questions]);
  const invalidCount = useMemo(
    () => actions.questions.filter((question) => validateQuestion(question).length > 0).length,
    [actions.questions],
  );
  const typeChart = useMemo(() => toChartSeries(summary.typeCounts), [summary]);
  const difficultyChart = useMemo(() => toChartSeries(summary.difficultyCounts), [summary]);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const openEditor = (question: QuestionRecord | null) => {
    setEditing(question);
    setEditorOpen(true);
  };

  return (
    <>
      <PageHeader
        title="Question Bank"
        description="Reusable, validated questions available to every quiz in the catalogue."
        actions={
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={actions.placeholder("Import runs once the backend is connected.")}
            >
              <Upload className="size-4" aria-hidden="true" />
              Import
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={actions.placeholder("Export queued — backend integration pending.")}
            >
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>
            <Button size="sm" onClick={() => openEditor(null)}>
              <Plus className="size-4" aria-hidden="true" />
              New question
            </Button>
          </>
        }
      />

      <PageBody>
        <QuestionStats
          summary={summary}
          invalidCount={invalidCount}
          state={loading ? "loading" : "ready"}
        />

        <div className="grid gap-3 lg:grid-cols-2">
          <ChartCard
            title="Questions by type"
            description="Distribution across supported question formats"
            series={typeChart.series}
            labels={typeChart.labels}
            state={loading ? "loading" : "ready"}
          />
          <ChartCard
            title="Questions by difficulty"
            description="Balance of the bank across difficulty levels"
            series={difficultyChart.series}
            labels={difficultyChart.labels}
            state={loading ? "loading" : "ready"}
          />
        </div>

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            { label: "Publish selected", onSelect: () => actions.publish(selectedIds) },
            {
              label: "Archive selected",
              icon: <Archive className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestArchive(selectedIds),
            },
            { label: "Restore selected", onSelect: () => actions.restore(selectedIds) },
            {
              label: "Delete selected",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestDelete(selectedIds, "question"),
            },
            {
              label: "Export selection",
              icon: <Download className="size-4" aria-hidden="true" />,
              onSelect: actions.placeholder(
                `Exporting ${selectedIds.length} questions (placeholder).`,
              ),
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
            label="Search questions"
            placeholder="Search prompt, topic, country or tag…"
          />
        </ActionToolbar>

        <QuestionFilters value={filters} onChange={setFilters} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(actions.questions.length)} questions
          {query && <> matching “{query}”</>}
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(q) => q.id}
          highlight={query}
          hideBulkBar
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          loading={loading}
          pageSize={25}
          onRowClick={(question) => openEditor(question)}
          emptyTitle="No questions match your search"
          emptyDescription="Try another search term or clear the filters."
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setFilters(emptyQuestionFilters);
              }}
            >
              Clear search and filters
            </Button>
          }
          renderMobileCard={(question) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{question.prompt}</p>
              <p className="text-xs text-muted-foreground">
                {question.type} · {question.region}
              </p>
              <div className="flex items-center gap-2">
                <DifficultyBadge level={question.difficulty} />
                <StatusBadge status={question.status} />
              </div>
            </div>
          )}
          rowActions={[
            { label: "Edit", onSelect: (question) => openEditor(question) },
            { label: "Preview", onSelect: (question) => setPreviewing(question) },
            { label: "Duplicate", onSelect: (question) => actions.duplicate(question) },
            { label: "Publish", onSelect: (question) => actions.publish([question.id]) },
            { label: "Archive", onSelect: (question) => actions.requestArchive([question.id]) },
            { label: "Restore", onSelect: (question) => actions.restore([question.id]) },
            {
              label: "Delete",
              destructive: true,
              onSelect: (question) => actions.requestDelete([question.id], "this question"),
            },
          ]}
        />
      </PageBody>

      <QuestionEditor
        open={editorOpen}
        onOpenChange={setEditorOpen}
        question={editing}
        onSave={actions.save}
      />

      <SideDrawer
        open={previewing !== null}
        onOpenChange={(next) => !next && setPreviewing(null)}
        title="Question preview"
        description="Exactly how players see this question."
        width="sm:max-w-lg"
      >
        {previewing && <QuizPlayerPreview questions={[previewing]} heading={previewing.topic} />}
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
          }}
        />
      )}
    </>
  );
}
