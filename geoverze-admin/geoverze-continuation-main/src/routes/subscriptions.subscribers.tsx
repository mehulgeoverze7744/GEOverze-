import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { InspectorField } from "@/components/shared/inspector-panel";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/features/users/format";
import { buildSubscriberColumns } from "@/features/subscriptions/columns";
import { subscribers } from "@/features/subscriptions/data";
import { filterSubscribers } from "@/features/subscriptions/filtering";
import {
  billingCycles,
  emptySubscriberFilters,
  planTiers,
  subscriberStatuses,
  type Subscriber,
} from "@/features/subscriptions/types";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/subscriptions/subscribers")({
  head: () => ({
    meta: [
      { title: "Subscribers — GEOverze Admin" },
      {
        name: "description",
        content: "Every GEOverze subscription account with seats, MRR and billing history.",
      },
      { property: "og:title", content: "Subscribers — GEOverze Admin" },
      { property: "og:description", content: "Subscriber directory with seats, MRR and invoices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscribersPage,
});

const filterDefs: FilterDefinition[] = [
  {
    id: "tier",
    label: "Plan",
    multiple: false,
    options: planTiers.map((value) => ({ value, label: value })),
  },
  {
    id: "status",
    label: "Status",
    multiple: false,
    options: subscriberStatuses.map((value) => ({ value, label: value })),
  },
  {
    id: "cycle",
    label: "Cycle",
    multiple: false,
    options: billingCycles.map((value) => ({ value, label: value })),
  },
];

function SubscribersPage() {
  const [directory, setDirectory] = useState<Subscriber[]>(subscribers);
  const [query, setQuery] = useState("");
  const [filterValues, setFilterValues] = useState<Record<string, string[]>>({});
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [active, setActive] = useState<Subscriber | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<string[] | null>(null);

  const filters = useMemo(
    () => ({
      tier: filterValues["tier"]?.[0] ?? emptySubscriberFilters.tier,
      status: filterValues["status"]?.[0] ?? emptySubscriberFilters.status,
      cycle: filterValues["cycle"]?.[0] ?? emptySubscriberFilters.cycle,
    }),
    [filterValues],
  );

  const rows = useMemo(
    () => filterSubscribers(directory, query, filters),
    [directory, query, filters],
  );
  const columns = useMemo(() => buildSubscriberColumns(query), [query]);
  const current = active ? (directory.find((item) => item.id === active.id) ?? active) : null;

  const cancelSubscriptions = (ids: string[]) => {
    setDirectory((prev) =>
      prev.map((sub) => (ids.includes(sub.id) ? { ...sub, status: "cancelled" as const } : sub)),
    );
    toast.success(`Cancelled ${ids.length} subscription${ids.length === 1 ? "" : "s"}.`);
    setSelectedIds([]);
  };

  return (
    <>
      <PageHeader
        title="Subscribers"
        description="Accounts, seats, recurring revenue and billing history."
      />

      <PageBody>
        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            {
              label: "Cancel subscription",
              variant: "destructive",
              onSelect: () => setConfirmCancel(selectedIds),
            },
          ]}
        >
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search subscribers"
            placeholder="Search account, contact or subscription ID…"
          />
        </ActionToolbar>

        <FilterBar filters={filterDefs} value={filterValues} onChange={setFilterValues} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(directory.length)} subscribers
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
          emptyTitle="No subscribers match your filters"
          emptyDescription="Adjust the search or reset the filters."
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.account}</p>
              <p className="text-xs text-muted-foreground">
                {item.tier} · {money(item.mrr)} MRR · {item.status}
              </p>
            </div>
          )}
        />
      </PageBody>

      <SideDrawer
        open={Boolean(current)}
        onOpenChange={(open) => !open && setActive(null)}
        title={current?.account ?? "Subscriber"}
        description={current?.contact}
      >
        {current && (
          <div className="space-y-5">
            <div>
              <InspectorField
                label="Subscription ID"
                value={<code className="font-mono text-xs">{current.id}</code>}
              />
              <InspectorField label="Plan" value={`${current.tier} · ${current.cycle}`} />
              <InspectorField label="Status" value={<StatusBadge status={current.status} />} />
              <InspectorField label="Seats" value={num(current.seats)} />
              <InspectorField label="MRR" value={money(current.mrr)} />
              <InspectorField label="Lifetime value" value={money(current.lifetimeValue)} />
              <InspectorField label="Started" value={formatDate(current.startedAt)} />
              <InspectorField label="Renews" value={formatDate(current.renewsAt)} />
            </div>

            <section className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">Billing history</h3>
              <ul className="divide-y divide-border rounded-md border border-border">
                {current.invoices.map((invoice) => (
                  <li
                    key={invoice.id}
                    className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
                  >
                    <span className="font-mono text-xs text-muted-foreground">{invoice.id}</span>
                    <span className="tabular">{money(invoice.amount)}</span>
                    <StatusBadge status={invoice.status} />
                    <span className="text-xs text-muted-foreground">
                      {formatDate(invoice.issuedAt)}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        )}
      </SideDrawer>

      <ConfirmDialog
        open={confirmCancel !== null}
        onOpenChange={(open) => !open && setConfirmCancel(null)}
        title="Cancel selected subscriptions?"
        description="Accounts keep access until the end of their current billing period."
        confirmLabel="Cancel subscriptions"
        destructive
        onConfirm={() => {
          if (confirmCancel) cancelSubscriptions(confirmCancel);
          setConfirmCancel(null);
        }}
      />
    </>
  );
}
