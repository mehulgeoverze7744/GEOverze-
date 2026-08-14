import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, Power } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { DataTable } from "@/components/shared/data-table";
import { InspectorField } from "@/components/shared/inspector-panel";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { buildRedemptionColumns } from "@/features/store/columns";
import { redemptionItems, storeCoupons, storeOrders, storeProducts } from "@/features/store/data";
import { filterRedemptions } from "@/features/store/filtering";
import type { RedemptionItem } from "@/features/store/types";
import { useStoreActions } from "@/features/store/use-store-actions";
import { formatDate } from "@/features/users/format";
import { num } from "@/lib/format";

export const Route = createFileRoute("/store/redemptions")({
  head: () => ({
    meta: [
      { title: "Credit Redemptions — GEOverze Admin" },
      {
        name: "description",
        content: "Manage GEOcredit redemption rewards, availability and approval queue.",
      },
      { property: "og:title", content: "Credit Redemptions — GEOverze Admin" },
      { property: "og:description", content: "GEOcredit reward catalogue and approvals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoreRedemptionsPage,
});

function StoreRedemptionsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [active, setActive] = useState<RedemptionItem | null>(null);

  const actions = useStoreActions(storeProducts, storeOrders, storeCoupons, redemptionItems);

  const rows = useMemo(
    () => filterRedemptions(actions.redemptions, query, status),
    [actions.redemptions, query, status],
  );
  const columns = useMemo(() => buildRedemptionColumns(query), [query]);

  const availableCount = actions.redemptions.filter((item) => item.available).length;
  const pendingCount = actions.redemptions.filter((item) => item.status === "pending").length;
  const totalRedeemed = actions.redemptions.reduce((sum, item) => sum + item.redemptions, 0);
  const creditsSpent = actions.redemptions.reduce(
    (sum, item) => sum + item.redemptions * item.creditsRequired,
    0,
  );

  const current = active ? (actions.redemptions.find((r) => r.id === active.id) ?? active) : null;

  return (
    <>
      <PageHeader
        title="Credit Redemptions"
        description="Rewards learners can unlock with GEOcredits earned across quizzes."
      />

      <PageBody>
        <StatGrid columns={4} label="Redemption statistics">
          <StatCard label="Reward items" value={num(actions.redemptions.length)} />
          <StatCard
            label="Available"
            value={num(availableCount)}
            hint={`${num(pendingCount)} pending`}
          />
          <StatCard label="Redeemed" value={num(totalRedeemed)} />
          <StatCard label="Credits spent" value={num(creditsSpent)} />
        </StatGrid>

        <ActionToolbar
          actions={[
            {
              label: status === "pending" ? "Show all" : "Show pending only",
              onSelect: () => setStatus(status === "pending" ? "all" : "pending"),
            },
          ]}
        >
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search redemptions"
            placeholder="Search reward or category…"
          />
        </ActionToolbar>

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(actions.redemptions.length)} rewards
        </p>

        <DataTable
          data={rows}
          columns={columns}
          getRowId={(item) => item.id}
          highlight={query}
          hideToolbar
          hideBulkBar
          pageSize={25}
          onRowClick={(item) => setActive(item)}
          emptyTitle="No rewards match your search"
          emptyDescription="Try another search term or reset the status filter."
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {num(item.creditsRequired)} credits · {item.status}
              </p>
            </div>
          )}
        />
      </PageBody>

      <SideDrawer
        open={Boolean(current)}
        onOpenChange={(open) => !open && setActive(null)}
        title={current?.name ?? "Reward"}
        description={current?.category}
      >
        {current && (
          <div className="space-y-4">
            <div>
              <InspectorField label="Reward ID" value={current.id} />
              <InspectorField label="Credits required" value={num(current.creditsRequired)} />
              <InspectorField label="Stock" value={num(current.stock)} />
              <InspectorField label="Status" value={<StatusBadge status={current.status} />} />
              <InspectorField label="Redemptions" value={num(current.redemptions)} />
              <InspectorField label="Last redeemed" value={formatDate(current.lastRedeemedAt)} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => actions.approveRedemption(current.id)}>
                <Check className="size-4" aria-hidden="true" />
                Approve redemption
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => actions.toggleRedemption(current.id)}
              >
                <Power className="size-4" aria-hidden="true" />
                {current.available ? "Make unavailable" : "Make available"}
              </Button>
            </div>
          </div>
        )}
      </SideDrawer>
    </>
  );
}
