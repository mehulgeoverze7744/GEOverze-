import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, RefreshCw, Truck, Undo2, XCircle } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildOrderColumns } from "@/features/store/columns";
import {
  orderStatusSeries,
  redemptionItems,
  storeCoupons,
  storeOrders,
  storeProducts,
} from "@/features/store/data";
import { filterOrders } from "@/features/store/filtering";
import { OrderFilters } from "@/features/store/store-filters";
import { emptyOrderFilters, type OrderFilterState, type StoreOrder } from "@/features/store/types";
import { useStoreActions } from "@/features/store/use-store-actions";
import { formatDate } from "@/features/users/format";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/store/orders")({
  head: () => ({
    meta: [
      { title: "GEOstore Orders — GEOverze Admin" },
      {
        name: "description",
        content: "Track GEOstore orders, fulfilment timelines, refunds and cancellations.",
      },
      { property: "og:title", content: "GEOstore Orders — GEOverze Admin" },
      {
        property: "og:description",
        content: "Order management with full fulfilment timelines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoreOrdersPage,
});

function StoreOrdersPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<OrderFilterState>(emptyOrderFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<StoreOrder | null>(null);

  const actions = useStoreActions(storeProducts, storeOrders, storeCoupons, redemptionItems);

  const rows = useMemo(
    () => filterOrders(actions.orders, query, filters),
    [actions.orders, query, filters],
  );
  const columns = useMemo(() => buildOrderColumns(query), [query]);
  const statusChart = useMemo(() => orderStatusSeries(actions.orders), [actions.orders]);

  const revenue = actions.orders
    .filter((order) => order.status === "paid" || order.status === "shipped")
    .reduce((sum, order) => sum + order.total, 0);
  const pending = actions.orders.filter((order) => order.status === "pending").length;
  const shipped = actions.orders.filter((order) => order.status === "shipped").length;
  const refunded = actions.orders.filter((order) => order.status === "refunded").length;

  const current = active ? (actions.orders.find((o) => o.id === active.id) ?? active) : null;

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <>
      <PageHeader
        title="Order Management"
        description="Every GEOstore order with payment, fulfilment and refund history."
        actions={
          <Button
            size="sm"
            variant="outline"
            onClick={actions.placeholder("Export queued — backend integration pending.")}
          >
            <Download className="size-4" aria-hidden="true" />
            Export
          </Button>
        }
      />

      <PageBody>
        <StatGrid columns={4} label="Order statistics">
          <StatCard label="Orders" value={num(actions.orders.length)} />
          <StatCard label="Revenue" value={money(revenue)} hint={`${num(shipped)} shipped`} />
          <StatCard label="Pending" value={num(pending)} hint="Awaiting payment" />
          <StatCard label="Refunded" value={num(refunded)} />
        </StatGrid>

        <ChartCard
          title="Orders by status"
          series={statusChart.series}
          labels={statusChart.labels}
          state={loading ? "loading" : "ready"}
        />

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            {
              label: "Mark as shipped",
              icon: <Truck className="size-4" aria-hidden="true" />,
              onSelect: () => actions.setOrderStatus(selectedIds, "shipped"),
            },
            {
              label: "Refund selected",
              variant: "destructive",
              icon: <Undo2 className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestRefund(selectedIds),
            },
            {
              label: "Cancel selected",
              variant: "destructive",
              icon: <XCircle className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestCancel(selectedIds),
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
            label="Search orders"
            placeholder="Search order ID, customer, email or channel…"
          />
        </ActionToolbar>

        <OrderFilters value={filters} onChange={setFilters} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(actions.orders.length)} orders
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
          loading={loading}
          pageSize={25}
          onRowClick={(item) => setActive(item)}
          emptyTitle="No orders match your search"
          emptyDescription="Try another search term or clear the filters."
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setFilters(emptyOrderFilters);
              }}
            >
              Clear search and filters
            </Button>
          }
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.id}</p>
              <p className="text-xs text-muted-foreground">
                {item.customer} · {money(item.total)} · {item.status}
              </p>
            </div>
          )}
        />
      </PageBody>

      <SideDrawer
        open={Boolean(current)}
        onOpenChange={(open) => !open && setActive(null)}
        title={current ? `Order ${current.id}` : "Order"}
        description={current?.customer}
      >
        {current && (
          <Tabs defaultValue="summary">
            <TabsList>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
            </TabsList>

            <TabsContent value="summary" className="mt-4">
              <div>
                <InspectorField label="Status" value={<StatusBadge status={current.status} />} />
                <InspectorField label="Customer" value={current.customer} />
                <InspectorField label="Email" value={current.email} />
                <InspectorField label="Channel" value={current.channel} />
                <InspectorField label="Shipping address" value={current.shippingAddress} />
                <InspectorField label="Subtotal" value={money(current.subtotal)} />
                <InspectorField label="Shipping" value={money(current.shipping)} />
                <InspectorField label="Discount" value={money(current.discount)} />
                <InspectorField label="Coupon" value={current.couponCode ?? "—"} />
                <InspectorField label="Total" value={money(current.total)} />
                <InspectorField label="Placed" value={formatDate(current.placedAt)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => actions.setOrderStatus([current.id], "shipped")}
                  disabled={current.status === "shipped"}
                >
                  <Truck className="size-4" aria-hidden="true" />
                  Mark shipped
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => actions.requestRefund([current.id])}
                >
                  <Undo2 className="size-4" aria-hidden="true" />
                  Refund
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => actions.requestCancel([current.id])}
                >
                  <XCircle className="size-4" aria-hidden="true" />
                  Cancel
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="items" className="mt-4">
              <ul className="divide-y divide-border rounded-lg border border-border">
                {current.lines.map((line) => (
                  <li key={line.id} className="flex items-center gap-2 p-3 text-sm">
                    <span className="min-w-0 flex-1 truncate">{line.name}</span>
                    <span className="text-xs text-muted-foreground">x{line.quantity}</span>
                    <span className="text-xs text-muted-foreground tabular">
                      {money(line.unitPrice * line.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <ActivityTimeline
                events={current.timeline.map((event) => ({
                  id: event.id,
                  actor: event.actor,
                  action: event.action,
                  target: event.target,
                  time: formatDate(event.time),
                }))}
              />
            </TabsContent>
          </Tabs>
        )}
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
            setSelectedIds([]);
          }}
        />
      )}
    </>
  );
}
