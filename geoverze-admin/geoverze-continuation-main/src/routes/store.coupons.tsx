import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Power, Trash2 } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { Button } from "@/components/ui/button";
import { buildCouponColumns } from "@/features/store/columns";
import { CouponEditor, createDraftCoupon } from "@/features/store/coupon-editor";
import { redemptionItems, storeCoupons, storeOrders, storeProducts } from "@/features/store/data";
import { filterCoupons } from "@/features/store/filtering";
import type { Coupon } from "@/features/store/types";
import { useStoreActions } from "@/features/store/use-store-actions";
import { num } from "@/lib/format";

export const Route = createFileRoute("/store/coupons")({
  head: () => ({
    meta: [
      { title: "GEOstore Coupons — GEOverze Admin" },
      {
        name: "description",
        content: "Create and manage GEOstore discount codes, credit rewards and usage limits.",
      },
      { property: "og:title", content: "GEOstore Coupons — GEOverze Admin" },
      { property: "og:description", content: "Discount codes and promotional controls." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoreCouponsPage,
});

function StoreCouponsPage() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [active, setActive] = useState<Coupon | null>(null);
  const [creating, setCreating] = useState(false);

  const actions = useStoreActions(storeProducts, storeOrders, storeCoupons, redemptionItems);

  const rows = useMemo(
    () => filterCoupons(actions.coupons, query, status),
    [actions.coupons, query, status],
  );
  const columns = useMemo(() => buildCouponColumns(query), [query]);
  const activeCount = actions.coupons.filter((coupon) => coupon.active).length;
  const redeemed = actions.coupons.reduce((sum, coupon) => sum + coupon.used, 0);

  const current = active ? (actions.coupons.find((c) => c.id === active.id) ?? active) : null;

  return (
    <>
      <PageHeader
        title="Coupons & Discounts"
        description="Storewide promotions, flat discounts and GEOcredit rewards."
        actions={
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="size-4" aria-hidden="true" />
            New coupon
          </Button>
        }
      />

      <PageBody>
        <StatGrid columns={3} label="Coupon statistics">
          <StatCard label="Coupons" value={num(actions.coupons.length)} />
          <StatCard label="Active" value={num(activeCount)} hint="Usable at checkout" />
          <StatCard label="Total redemptions" value={num(redeemed)} />
        </StatGrid>

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            {
              label: "Delete selected",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestDeleteCoupons(selectedIds),
            },
          ]}
          actions={[
            {
              label: status === "active" ? "Show all" : "Show active only",
              onSelect: () => setStatus(status === "active" ? "all" : "active"),
            },
          ]}
        >
          <SearchBar
            compact
            value={query}
            onChange={setQuery}
            label="Search coupons"
            placeholder="Search code, type or description…"
          />
        </ActionToolbar>

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(actions.coupons.length)} coupons
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
          emptyTitle="No coupons match your search"
          emptyDescription="Try another search term or reset the status filter."
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.code}</p>
              <p className="text-xs text-muted-foreground">
                {item.type} · {item.active ? "active" : "inactive"}
              </p>
            </div>
          )}
        />
      </PageBody>

      <SideDrawer
        open={Boolean(current)}
        onOpenChange={(open) => !open && setActive(null)}
        title={current?.code ?? "Coupon"}
        description={current?.description}
      >
        {current && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => actions.toggleCoupon(current.id)}>
                <Power className="size-4" aria-hidden="true" />
                {current.active ? "Deactivate" : "Activate"}
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => actions.requestDeleteCoupons([current.id])}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Delete
              </Button>
            </div>
            <CouponEditor
              coupon={current}
              onSave={(next) => {
                actions.saveCoupon(next);
                setActive(null);
              }}
              onCancel={() => setActive(null)}
            />
          </div>
        )}
      </SideDrawer>

      <SideDrawer
        open={creating}
        onOpenChange={setCreating}
        title="New coupon"
        description="Create a discount code or credit reward."
      >
        <CouponEditor
          coupon={createDraftCoupon()}
          onSave={(next) => {
            actions.saveCoupon(next);
            setCreating(false);
          }}
          onCancel={() => setCreating(false)}
        />
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
            setActive(null);
          }}
        />
      )}
    </>
  );
}
