import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Archive, Download, Plus, RefreshCw, Star, Trash2 } from "lucide-react";

import { ActionToolbar } from "@/components/shared/action-toolbar";
import { ChartCard } from "@/components/shared/chart-card";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { DataTable } from "@/components/shared/data-table";
import { InspectorField } from "@/components/shared/inspector-panel";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { SearchBar } from "@/components/shared/search-bar";
import { SideDrawer } from "@/components/shared/side-drawer";
import { StatusBadge } from "@/components/shared/status-badge";
import { Widget } from "@/components/shared/widget";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildProductColumns } from "@/features/store/columns";
import {
  redemptionItems,
  storeCategorySeries,
  storeCoupons,
  storeOrders,
  storeProducts,
  storeRevenueSeries,
  summarizeStore,
  topProducts,
} from "@/features/store/data";
import { filterProducts } from "@/features/store/filtering";
import { ProductEditor, createDraftProduct } from "@/features/store/product-editor";
import { ProductFilters } from "@/features/store/store-filters";
import { StoreStats } from "@/features/store/store-stats";
import {
  emptyProductFilters,
  type ProductFilterState,
  type StoreProduct,
} from "@/features/store/types";
import { useStoreActions } from "@/features/store/use-store-actions";
import { formatDate } from "@/features/users/format";
import { catalogMonths } from "@/lib/catalog";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/store/")({
  head: () => ({
    meta: [
      { title: "GEOstore Products — GEOverze Admin" },
      {
        name: "description",
        content:
          "Manage physical and digital GEOstore products, inventory, pricing and merchandising.",
      },
      { property: "og:title", content: "GEOstore Products — GEOverze Admin" },
      {
        property: "og:description",
        content: "Product catalogue, inventory and pricing for the GEOverze store.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: StoreProductsPage,
});

function StoreProductsPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<ProductFilterState>(emptyProductFilters);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<StoreProduct | null>(null);
  const [creating, setCreating] = useState(false);
  const [stockDraft, setStockDraft] = useState(0);

  const actions = useStoreActions(storeProducts, storeOrders, storeCoupons, redemptionItems);

  const rows = useMemo(
    () => filterProducts(actions.products, query, filters),
    [actions.products, query, filters],
  );
  const columns = useMemo(() => buildProductColumns(query), [query]);
  const summary = useMemo(
    () => summarizeStore(actions.products, actions.orders),
    [actions.products, actions.orders],
  );
  const revenue = useMemo(() => storeRevenueSeries(actions.products), [actions.products]);
  const categories = useMemo(() => storeCategorySeries(actions.products), [actions.products]);
  const best = useMemo(() => topProducts(actions.products), [actions.products]);
  const lowStock = useMemo(
    () =>
      actions.products
        .filter((product) => product.stockStatus !== "In stock" && product.type === "Physical")
        .slice(0, 5),
    [actions.products],
  );

  const current = active ? (actions.products.find((p) => p.id === active.id) ?? active) : null;

  const refresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500);
  };

  return (
    <>
      <PageHeader
        title="GEOstore Products"
        description="Physical merchandise, digital downloads, reward items and credit packs."
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
            <Button size="sm" onClick={() => setCreating(true)}>
              <Plus className="size-4" aria-hidden="true" />
              New product
            </Button>
          </>
        }
      />

      <PageBody>
        <StoreStats summary={summary} state={loading ? "loading" : "ready"} />

        <div className="grid gap-3 lg:grid-cols-2">
          <ChartCard
            title="Revenue trend"
            description="Rolling 12 months"
            series={revenue}
            labels={catalogMonths}
            state={loading ? "loading" : "ready"}
          />
          <ChartCard
            title="Products by category"
            series={categories.series}
            labels={categories.labels}
            state={loading ? "loading" : "ready"}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-2">
          <Widget title="Best sellers" description="Highest lifetime revenue">
            <ol className="divide-y divide-border">
              {best.map((product) => (
                <li key={product.id} className="flex items-center gap-2 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{product.name}</span>
                  <span className="text-xs text-muted-foreground tabular">
                    {money(product.revenue)}
                  </span>
                </li>
              ))}
            </ol>
          </Widget>
          <Widget title="Inventory alerts" description="Low or out of stock">
            <ol className="divide-y divide-border">
              {lowStock.length === 0 && (
                <li className="py-2 text-sm text-muted-foreground">Inventory is healthy.</li>
              )}
              {lowStock.map((product) => (
                <li key={product.id} className="flex items-center gap-2 py-2 text-sm">
                  <span className="min-w-0 flex-1 truncate">{product.name}</span>
                  <Badge variant={product.stock === 0 ? "destructive" : "outline"}>
                    {product.stockStatus}
                  </Badge>
                </li>
              ))}
            </ol>
          </Widget>
        </div>

        <ActionToolbar
          selectedCount={selectedIds.length}
          onClearSelection={() => setSelectedIds([])}
          bulkActions={[
            { label: "Publish selected", onSelect: () => actions.publishProducts(selectedIds) },
            { label: "Unpublish selected", onSelect: () => actions.unpublishProducts(selectedIds) },
            {
              label: "Archive selected",
              icon: <Archive className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestArchiveProducts(selectedIds),
            },
            {
              label: "Delete selected",
              variant: "destructive",
              icon: <Trash2 className="size-4" aria-hidden="true" />,
              onSelect: () => actions.requestDeleteProducts(selectedIds),
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
            label="Search products"
            placeholder="Search name, SKU, category or collection…"
          />
        </ActionToolbar>

        <ProductFilters value={filters} onChange={setFilters} />

        <p className="text-xs text-muted-foreground" aria-live="polite">
          {num(rows.length)} of {num(actions.products.length)} products
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
          onRowClick={(item) => {
            setActive(item);
            setStockDraft(item.stock);
          }}
          emptyTitle="No products match your search"
          emptyDescription="Try another search term or clear the filters."
          emptyAction={
            <Button
              size="sm"
              variant="outline"
              className="mt-2"
              onClick={() => {
                setQuery("");
                setFilters(emptyProductFilters);
              }}
            >
              Clear search and filters
            </Button>
          }
          renderMobileCard={(item) => (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">{item.name}</p>
              <p className="text-xs text-muted-foreground">
                {item.type} · {money(item.price)} · {item.stockStatus}
              </p>
            </div>
          )}
        />
      </PageBody>

      <SideDrawer
        open={Boolean(current)}
        onOpenChange={(open) => !open && setActive(null)}
        title={current?.name ?? "Product"}
        description={current?.sku}
      >
        {current && (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="inventory">Inventory</TabsTrigger>
              <TabsTrigger value="edit">Edit</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-4">
              <div>
                <InspectorField label="Type" value={current.type} />
                <InspectorField label="Category" value={current.category} />
                <InspectorField label="Collection" value={current.collection} />
                <InspectorField label="Price" value={money(current.price)} />
                <InspectorField label="Discount" value={`${current.discountPercent}%`} />
                <InspectorField
                  label="Credit price"
                  value={current.creditPrice ? num(current.creditPrice) : "—"}
                />
                <InspectorField label="Status" value={<StatusBadge status={current.status} />} />
                <InspectorField label="Units sold" value={num(current.unitsSold)} />
                <InspectorField label="Revenue" value={money(current.revenue)} />
                <InspectorField label="Updated" value={formatDate(current.updatedAt)} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => actions.toggleFeatured(current.id)}
                >
                  <Star className="size-4" aria-hidden="true" />
                  {current.featured ? "Unfeature" : "Feature"}
                </Button>
                {current.status === "published" ? (
                  <Button size="sm" onClick={() => actions.unpublishProducts([current.id])}>
                    Unpublish
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => actions.publishProducts([current.id])}>
                    Publish
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => actions.requestDeleteProducts([current.id])}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                  Delete
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="inventory" className="mt-4 space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="drawer-stock">Stock on hand</Label>
                <div className="flex gap-2">
                  <Input
                    id="drawer-stock"
                    type="number"
                    min={0}
                    value={stockDraft}
                    onChange={(event) => setStockDraft(Number(event.target.value))}
                  />
                  <Button onClick={() => actions.adjustStock(current.id, stockDraft)}>
                    Update
                  </Button>
                </div>
              </div>
              <ul className="divide-y divide-border rounded-lg border border-border">
                {current.variants.length === 0 && (
                  <li className="p-3 text-sm text-muted-foreground">No variants.</li>
                )}
                {current.variants.map((variant) => (
                  <li key={variant.id} className="flex items-center gap-2 p-3 text-sm">
                    <span className="min-w-0 flex-1 truncate">{variant.name}</span>
                    <span className="text-xs text-muted-foreground">{money(variant.price)}</span>
                    <Badge variant="secondary">{num(variant.stock)} in stock</Badge>
                  </li>
                ))}
              </ul>
            </TabsContent>

            <TabsContent value="edit" className="mt-4">
              <ProductEditor
                product={current}
                onSave={(next) => {
                  actions.saveProduct(next);
                  setActive(null);
                }}
                onCancel={() => setActive(null)}
              />
            </TabsContent>
          </Tabs>
        )}
      </SideDrawer>

      <SideDrawer
        open={creating}
        onOpenChange={setCreating}
        title="New product"
        description="Add a physical, digital or credit-redemption product."
      >
        <ProductEditor
          product={createDraftProduct()}
          submitLabel="Create product"
          onSave={(next) => {
            actions.saveProduct(next);
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
