import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Award, CircleDollarSign, Gift, Plus, Sparkles, Timer } from "lucide-react";
import { toast } from "sonner";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildClaimColumns, buildRewardColumns } from "@/features/rewards/columns";
import { claimTrend, rewardClaims, rewards, summarizeRewards } from "@/features/rewards/data";
import { filterRewards } from "@/features/rewards/filtering";
import { RewardEditor, createDraftReward } from "@/features/rewards/reward-editor";
import {
  eligibilityRules,
  emptyRewardFilters,
  rewardStatuses,
  rewardTypes,
  type Reward,
} from "@/features/rewards/types";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";

export const Route = createFileRoute("/rewards")({
  head: () => ({
    meta: [
      { title: "Reward Management — GEOverze Admin" },
      {
        name: "description",
        content:
          "Manage the GEOverze reward catalogue: credits, digital goods, store items, achievements and events.",
      },
      { property: "og:title", content: "Reward Management — GEOverze Admin" },
      {
        property: "og:description",
        content: "Reward catalogue, eligibility rules and claim history.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: RewardsPage,
});

const filterDefs: FilterDefinition[] = [
  {
    id: "type",
    label: "Type",
    multiple: false,
    options: rewardTypes.map((value) => ({ value, label: value })),
  },
  {
    id: "status",
    label: "Status",
    multiple: false,
    options: rewardStatuses.map((value) => ({ value, label: value })),
  },
  {
    id: "eligibility",
    label: "Eligibility",
    multiple: false,
    options: eligibilityRules.map((value) => ({ value, label: value })),
  },
];

function RewardsPage() {
  const [catalogue, setCatalogue] = useState<Reward[]>(rewards);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [active, setActive] = useState<Reward | null>(null);
  const [creating, setCreating] = useState(false);

  const filters = useMemo(
    () => ({
      type: filterValues["type"]?.[0] ?? emptyRewardFilters.type,
      status: filterValues["status"]?.[0] ?? emptyRewardFilters.status,
      eligibility: filterValues["eligibility"]?.[0] ?? emptyRewardFilters.eligibility,
    }),
    [filterValues],
  );

  const rows = useMemo(() => filterRewards(catalogue, query, filters), [catalogue, query, filters]);
  const columns = useMemo(() => buildRewardColumns(query), [query]);
  const claimColumns = useMemo(() => buildClaimColumns(), []);
  const summary = useMemo(() => summarizeRewards(catalogue), [catalogue]);

  const current = active ? (catalogue.find((item) => item.id === active.id) ?? active) : null;

  const setStatus = (ids: string[], status: Reward["status"]) => {
    setCatalogue((prev) =>
      prev.map((reward) => (ids.includes(reward.id) ? { ...reward, status } : reward)),
    );
    toast.success(`${ids.length} reward${ids.length === 1 ? "" : "s"} marked ${status}.`);
    setSelectedIds([]);
  };

  const saveReward = (reward: Reward) => {
    setCatalogue((prev) => {
      const exists = prev.some((item) => item.id === reward.id);
      return exists
        ? prev.map((item) => (item.id === reward.id ? reward : item))
        : [reward, ...prev];
    });
    toast.success(`Saved “${reward.name}”.`);
    setActive(null);
    setCreating(false);
  };

  return (
    <>
      <PageHeader
        title="Reward Management"
        description="Credits, digital goods, store rewards, achievements and special events."
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New reward
          </Button>
        }
      />

      <PageBody>
        <StatGrid columns={5} label="Reward statistics">
          <StatCard label="Rewards" value={num(summary.total)} icon={Gift} />
          <StatCard
            label="Active"
            value={num(summary.active)}
            icon={Sparkles}
            hint="Claimable now"
          />
          <StatCard label="Claims" value={num(summary.claims)} icon={Award} hint="Lifetime" />
          <StatCard
            label="Credits spent"
            value={num(summary.creditsSpent)}
            icon={CircleDollarSign}
          />
          <StatCard
            label="Expiring soon"
            value={num(summary.expiringSoon)}
            icon={Timer}
            hint="Within 45 days"
          />
        </StatGrid>

        <Tabs defaultValue="catalogue">
          <TabsList>
            <TabsTrigger value="catalogue">Catalogue</TabsTrigger>
            <TabsTrigger value="claims">Claim history</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="catalogue" className="mt-4 space-y-4">
            <ActionToolbar
              selectedCount={selectedIds.length}
              onClearSelection={() => setSelectedIds([])}
              bulkActions={[
                { label: "Activate", onSelect: () => setStatus(selectedIds, "active") },
                {
                  label: "Pause",
                  variant: "outline",
                  onSelect: () => setStatus(selectedIds, "paused"),
                },
                {
                  label: "Archive",
                  variant: "outline",
                  onSelect: () => setStatus(selectedIds, "archived"),
                },
              ]}
            >
              <SearchBar
                compact
                value={query}
                onChange={setQuery}
                label="Search rewards"
                placeholder="Search reward name or ID…"
              />
            </ActionToolbar>

            <FilterBar filters={filterDefs} value={filterValues} onChange={setFilterValues} />

            <p className="text-xs text-muted-foreground" aria-live="polite">
              {num(rows.length)} of {num(catalogue.length)} rewards
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
              emptyTitle="No rewards match your filters"
              emptyDescription="Adjust the search or reset the filters."
              renderMobileCard={(item) => (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.type} · {num(item.creditsRequired)} credits · {item.status}
                  </p>
                </div>
              )}
            />
          </TabsContent>

          <TabsContent value="claims" className="mt-4">
            <DataTable
              data={rewardClaims}
              columns={claimColumns}
              getRowId={(item) => item.id}
              hideBulkBar
              pageSize={25}
              emptyTitle="No claims recorded"
            />
          </TabsContent>

          <TabsContent value="trends" className="mt-4">
            <ChartCard
              title="Reward claims"
              description="Claims per month across the catalogue"
              series={claimTrend}
              labels={catalogMonths}
            />
          </TabsContent>
        </Tabs>
      </PageBody>

      <SideDrawer
        open={Boolean(current)}
        onOpenChange={(open) => !open && setActive(null)}
        title={current?.name ?? "Reward"}
        description={current?.description}
      >
        {current && (
          <RewardEditor reward={current} onSave={saveReward} onCancel={() => setActive(null)} />
        )}
      </SideDrawer>

      <SideDrawer
        open={creating}
        onOpenChange={setCreating}
        title="New reward"
        description="Define eligibility, credit cost and availability."
      >
        <RewardEditor
          reward={createDraftReward()}
          onSave={saveReward}
          onCancel={() => setCreating(false)}
        />
      </SideDrawer>
    </>
  );
}
