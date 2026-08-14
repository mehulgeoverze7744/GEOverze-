import { useMemo, useState } from "react";
import { Ban, Check, ShieldAlert, TriangleAlert, X } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { CaseDrawer } from "@/features/moderation/case-drawer";
import { buildCaseColumns } from "@/features/moderation/columns";
import { moderationCases, summarizeCases } from "@/features/moderation/data";
import { filterCases } from "@/features/moderation/filtering";
import { ModerationStats } from "@/features/moderation/moderation-stats";
import { useModerationActions } from "@/features/moderation/use-moderation-actions";
import {
  caseReasons,
  casePriorities,
  caseStatuses,
  emptyCaseFilters,
  type CaseFilterState,
  type ModerationCase,
  type ModerationSurface,
} from "@/features/moderation/types";
import { num } from "@/lib/format";

const filterDefs: FilterDefinition[] = [
  {
    id: "priority",
    label: "Priority",
    multiple: false,
    options: casePriorities.map((value) => ({ value, label: value })),
  },
  {
    id: "status",
    label: "Status",
    multiple: false,
    options: caseStatuses.map((value) => ({ value, label: value })),
  },
  {
    id: "reason",
    label: "Reason",
    multiple: false,
    options: caseReasons.map((value) => ({ value, label: value })),
  },
  {
    id: "window",
    label: "Reported",
    multiple: false,
    options: [
      { value: "7", label: "Last 7 days" },
      { value: "30", label: "Last 30 days" },
      { value: "90", label: "Last 90 days" },
    ],
  },
];

function toFilterState(value: Record<string, string[]>): CaseFilterState {
  return {
    priority: value["priority"]?.[0] ?? emptyCaseFilters.priority,
    status: value["status"]?.[0] ?? emptyCaseFilters.status,
    reason: value["reason"]?.[0] ?? emptyCaseFilters.reason,
    window: value["window"]?.[0] ?? emptyCaseFilters.window,
  };
}

export function ModerationQueue({
  surface,
  title,
  description,
}: {
  surface: ModerationSurface;
  title: string;
  description: string;
}) {
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
  const filters = useMemo(() => toFilterState(filterValues), [filterValues]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [active, setActive] = useState<ModerationCase | null>(null);

  const actions = useModerationActions(moderationCases);

  const scoped = useMemo(
    () => actions.cases.filter((item) => item.surface === surface),
    [actions.cases, surface],
  );
  const rows = useMemo(() => filterCases(scoped, query, filters), [scoped, query, filters]);
  const columns = useMemo(() => buildCaseColumns(query), [query]);
  const summary = useMemo(() => summarizeCases(scoped), [scoped]);

  const current = active ? (scoped.find((item) => item.id === active.id) ?? active) : null;

  return (
    <>
      <PageHeader title={title} description={description} />

      <PageBody>
        <ModerationStats summary={summary} />

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            {
              label: "Approve",
              icon: <Check className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestAction(selectedIds, "Approve"),
            },
            {
              label: "Reject",
              variant: "outline",
              icon: <X className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestAction(selectedIds, "Reject"),
            },
            {
              label: "Warn",
              variant: "outline",
              icon: <TriangleAlert className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestAction(selectedIds, "Warn"),
            },
            {
              label: "Escalate",
              variant: "outline",
              icon: <ShieldAlert className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestAction(selectedIds, "Escalate"),
            },
            {
              label: "Ban",
              variant: "destructive",
              icon: <Ban className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestAction(selectedIds, "Ban"),
            },
          ]}
        >
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search cases"
            placeholder="Search case, reporter, reported user…"
          />
        </ActionToolbar>

        <FilterBar filters={filterDefs} value={filterValues} onChange={setFilterValues} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(scoped.length)} cases
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(item) => item.id}
          highlight={query}
          hideToolbar
          hideBulkBar
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          pageSize={25}
          onRowClick={(item) => setActive(item)}
          emptyTitle="No cases in this queue"
          emptyDescription="Adjust the search or filters to see more reports."
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.title}</p>
              <p className="text-xs text-muted-foreground">
                {item.reason} · {item.priority} · {item.status}
              </p>
            </div>
          )}
        />
      </PageBody>

      <CaseDrawer
        open={current !== null}
        onOpenChange={(open) => !open && setActive(null)}
        record={current}
        onAction={(ids, action, note) => actions.requestAction(ids, action, note)}
      />

      <ConfirmDialog
        open={actions.confirm !== null}
        onOpenChange={(open) => !open && actions.setConfirm(null)}
        title={actions.confirm?.title ?? ""}
        description={actions.confirm?.description}
        confirmLabel={actions.confirm?.confirmLabel}
        destructive={actions.confirm?.destructive}
        onConfirm={() => {
          actions.confirm?.onConfirm();
          actions.setConfirm(null);
        }}
      />
    </>
  );
}
