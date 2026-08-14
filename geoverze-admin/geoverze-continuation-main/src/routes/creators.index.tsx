import { useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BadgeCheck, Ban, Download, RefreshCw } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { Button } from "@/components/ui/button";
import { buildCreatorColumns } from "@/features/creators/columns";
import {
  creatorGrowthSeries,
  creatorRecords,
  creatorTierSeries,
  monthLabels,
  summarizeCreators,
} from "@/features/creators/data";
import {
  CreatorDetailDrawer,
  type CreatorDrawerTab,
} from "@/features/creators/creator-detail-drawer";
import { CreatorFilters } from "@/features/creators/creator-filters";
import { CreatorStats } from "@/features/creators/creator-stats";
import { filterCreators } from "@/features/creators/filtering";
import {
  emptyCreatorFilters,
  type CreatorFilterState,
  type CreatorRecord,
} from "@/features/creators/types";
import { useCreatorActions } from "@/features/creators/use-creator-actions";
import { num } from "@/lib/format";

export const Route = createFileRoute("/creators/")({
  head: () => ({
    meta: [
      { title: "Creator Directory — GEOverze Admin" },
      {
        name: "description",
        content:
          "Search, verify and analyse GEOverze creators: tiers, verification state, quiz ownership and revenue.",
      },
      { property: "og:title", content: "Creator Directory — GEOverze Admin" },
      {
        property: "og:description",
        content: "Operations workspace for the GEOverze creator program.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CreatorDirectoryPage,
});

function CreatorDirectoryPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<CreatorFilterState>(emptyCreatorFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<CreatorRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<CreatorDrawerTab>("overview");

  const actions = useCreatorActions(creatorRecords);
  const rows = useMemo(
    () => filterCreators(actions.creators, query, filters),
    [actions.creators, query, filters],
  );
  const columns = useMemo(() => buildCreatorColumns(query), [query]);
  const summary = useMemo(() => summarizeCreators(actions.creators), [actions.creators]);
  const growth = useMemo(() => creatorGrowthSeries(actions.creators), [actions.creators]);
  const tiers = useMemo(() => creatorTierSeries(actions.creators), [actions.creators]);

  const open = (creator: CreatorRecord, tab: CreatorDrawerTab = "overview") => {
    setActive(creator);
    setDrawerTab(tab);
    setDrawerOpen(true);
  };

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  const resetAll = () => {
    setQuery("");
    setFilters(emptyCreatorFilters);
  };

  return (
    <>
      <PageHeader
        title="Creator Management"
        description="Applications, verification, tiers and performance for the GEOverze creator program."
        actions={
          <Button
            size="sm"
            onClick={actions.placeholder("Export queued — backend integration pending.")}
          >
            <Download className="size-4" aria-hidden="true" />
            Export creators
          </Button>
        }
      />

      <PageBody>
        <CreatorStats summary={summary} state={loading ? "loading" : "ready"} />

        <div className="grid gap-3 lg:grid-cols-2">
          <ChartCard
            title="Creator growth"
            description="New creator signups over the last 12 months"
            series={growth}
            labels={monthLabels}
            state={loading ? "loading" : "ready"}
          />
          <ChartCard
            title="Tier distribution"
            description="Creators per program tier"
            series={tiers.series}
            labels={tiers.labels}
            state={loading ? "loading" : "ready"}
          />
        </div>

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            {
              label: "Verify selected",
              icon: <BadgeCheck className="size-4" aria-hidden="true" />,
              onSelect: () => actions.bulkVerify(selectedIds),
            },
            {
              label: "Suspend selected",
              variant: "destructive",
              icon: <Ban className="size-4" aria-hidden="true" />,
              onSelect: () => actions.bulkSuspend(selectedIds),
            },
            {
              label: "Export selection",
              icon: <Download className="size-4" aria-hidden="true" />,
              onSelect: actions.placeholder(
                `Exporting ${selectedIds.length} creators (placeholder).`,
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
            label="Search creators"
            placeholder="Search name, username, email or country…"
          />
        </ActionToolbar>

        <CreatorFilters value={filters} onChange={setFilters} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(actions.creators.length)} creators
          {query && <> matching “{query}”</>}
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(c) => c.id}
          highlight={query}
          hideBulkBar
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          loading={loading}
          pageSize={25}
          searchPlaceholder="Filter within results…"
          onRowClick={(creator) => open(creator)}
          emptyTitle="No creators match your search"
          emptyDescription="Try a different search term or clear the advanced filters."
          emptyAction={
            <Button size="sm" variant="outline" className="mt-2" onClick={resetAll}>
              Clear search and filters
            </Button>
          }
          renderMobileCard={(creator) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{creator.displayName}</p>
              <p className="text-xs text-muted-foreground">
                @{creator.username} · {creator.tier} · {creator.verification}
              </p>
              <p className="text-xs tabular text-muted-foreground">
                {num(creator.totalQuizzes)} quizzes · {num(creator.totalPlays)} plays
              </p>
            </div>
          )}
          rowActions={[
            { label: "Quick view", onSelect: (creator) => open(creator) },
            {
              label: "Open profile",
              onSelect: (creator) =>
                navigate({ to: "/creators/$creatorId", params: { creatorId: creator.id } }),
            },
            { label: "Verification history", onSelect: (creator) => open(creator, "verification") },
            { label: "Quizzes", onSelect: (creator) => open(creator, "quizzes") },
            { label: "Verify", onSelect: (creator) => actions.requestVerify(creator) },
            { label: "Reject", onSelect: (creator) => actions.requestReject(creator) },
            {
              label: "Suspend",
              destructive: true,
              onSelect: (creator) => actions.requestSuspend(creator),
            },
          ]}
        />
      </PageBody>

      <CreatorDetailDrawer
        creator={active}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        tab={drawerTab}
        onTabChange={setDrawerTab}
        onVerify={actions.requestVerify}
        onSuspend={actions.requestSuspend}
      />

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
