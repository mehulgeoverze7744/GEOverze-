import { Star } from "lucide-react";

import type { DataTableColumn } from "@/components/shared/data-table";
import { Highlight } from "@/components/shared/highlight";
import { StatusBadge } from "@/components/shared/status-badge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/features/users/format";
import type { Coupon, RedemptionItem, StoreOrder, StoreProduct } from "@/features/store/types";
import { money, num } from "@/lib/format";

function stockTone(status: StoreProduct["stockStatus"]) {
  if (status === "Out of stock") return "destructive" as const;
  if (status === "Low stock") return "outline" as const;
  return "secondary" as const;
}

export function buildProductColumns(query: string): DataTableColumn<StoreProduct>[] {
  return [
    {
      id: "name",
      header: "Product",
      accessor: (p) => p.name,
      className: "max-w-64",
      cell: (p) => (
        <div className="max-w-64">
          <span className="flex items-center gap-1.5 truncate font-medium text-foreground">
            {p.featured && (
              <Star className="size-3.5 shrink-0 fill-warning text-warning" aria-label="Featured" />
            )}
            <Highlight text={p.name} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">{p.collection}</span>
        </div>
      ),
    },
    {
      id: "sku",
      header: "SKU",
      accessor: (p) => p.sku,
      cell: (p) => (
        <code className="font-mono text-xs">
          <Highlight text={p.sku} query={query} />
        </code>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessor: (p) => p.type,
      cell: (p) => <Badge variant="secondary">{p.type}</Badge>,
    },
    { id: "category", header: "Category", accessor: (p) => p.category },
    {
      id: "price",
      header: "Price",
      accessor: (p) => p.price,
      align: "right",
      cell: (p) => money(p.price),
    },
    {
      id: "discount",
      header: "Discount",
      accessor: (p) => p.discountPercent,
      align: "right",
      defaultHidden: true,
      cell: (p) => `${p.discountPercent}%`,
    },
    {
      id: "credits",
      header: "Credits",
      accessor: (p) => p.creditPrice,
      align: "right",
      defaultHidden: true,
      cell: (p) => (p.creditPrice ? num(p.creditPrice) : "—"),
    },
    {
      id: "stock",
      header: "Stock",
      accessor: (p) => p.stock,
      align: "right",
      cell: (p) => num(p.stock),
    },
    {
      id: "stockStatus",
      header: "Inventory",
      accessor: (p) => p.stockStatus,
      cell: (p) => <Badge variant={stockTone(p.stockStatus)}>{p.stockStatus}</Badge>,
    },
    {
      id: "status",
      header: "Status",
      accessor: (p) => p.status,
      cell: (p) => <StatusBadge status={p.status} />,
    },
    {
      id: "available",
      header: "Available",
      accessor: (p) => (p.available ? "Yes" : "No"),
      defaultHidden: true,
    },
    {
      id: "unitsSold",
      header: "Units sold",
      accessor: (p) => p.unitsSold,
      align: "right",
      cell: (p) => num(p.unitsSold),
    },
    {
      id: "revenue",
      header: "Revenue",
      accessor: (p) => p.revenue,
      align: "right",
      cell: (p) => money(p.revenue),
    },
    {
      id: "updatedAt",
      header: "Updated",
      accessor: (p) => p.updatedAt,
      align: "right",
      cell: (p) => formatDate(p.updatedAt),
    },
  ];
}

export function buildOrderColumns(query: string): DataTableColumn<StoreOrder>[] {
  return [
    {
      id: "id",
      header: "Order",
      accessor: (o) => o.id,
      cell: (o) => (
        <code className="font-mono text-xs font-medium text-foreground">
          <Highlight text={o.id} query={query} />
        </code>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      accessor: (o) => o.customer,
      cell: (o) => (
        <div className="max-w-56">
          <span className="block truncate font-medium text-foreground">
            <Highlight text={o.customer} query={query} />
          </span>
          <span className="block truncate text-xs text-muted-foreground">{o.email}</span>
        </div>
      ),
    },
    { id: "channel", header: "Channel", accessor: (o) => o.channel },
    {
      id: "items",
      header: "Items",
      accessor: (o) => o.lines.reduce((sum, line) => sum + line.quantity, 0),
      align: "right",
    },
    {
      id: "status",
      header: "Status",
      accessor: (o) => o.status,
      cell: (o) => <StatusBadge status={o.status} />,
    },
    {
      id: "coupon",
      header: "Coupon",
      accessor: (o) => o.couponCode ?? "",
      defaultHidden: true,
      cell: (o) => o.couponCode ?? "—",
    },
    {
      id: "total",
      header: "Total",
      accessor: (o) => o.total,
      align: "right",
      cell: (o) => money(o.total),
    },
    {
      id: "placedAt",
      header: "Placed",
      accessor: (o) => o.placedAt,
      align: "right",
      cell: (o) => formatDate(o.placedAt),
    },
  ];
}

export function buildCouponColumns(query: string): DataTableColumn<Coupon>[] {
  return [
    {
      id: "code",
      header: "Code",
      accessor: (c) => c.code,
      cell: (c) => (
        <code className="font-mono text-xs font-medium text-foreground">
          <Highlight text={c.code} query={query} />
        </code>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessor: (c) => c.type,
      cell: (c) => <Badge variant="secondary">{c.type}</Badge>,
    },
    {
      id: "value",
      header: "Value",
      accessor: (c) => c.value,
      align: "right",
      cell: (c) => (c.type === "Percentage" ? `${c.value}%` : money(c.value)),
    },
    {
      id: "usage",
      header: "Usage",
      accessor: (c) => c.used,
      align: "right",
      cell: (c) => `${num(c.used)} / ${num(c.usageLimit)}`,
    },
    {
      id: "active",
      header: "Status",
      accessor: (c) => (c.active ? "active" : "inactive"),
      cell: (c) => <StatusBadge status={c.active ? "active" : "inactive"} />,
    },
    {
      id: "expiresAt",
      header: "Expires",
      accessor: (c) => c.expiresAt,
      align: "right",
      cell: (c) => formatDate(c.expiresAt),
    },
  ];
}

export function buildRedemptionColumns(query: string): DataTableColumn<RedemptionItem>[] {
  return [
    {
      id: "name",
      header: "Reward",
      accessor: (r) => r.name,
      cell: (r) => (
        <span className="font-medium text-foreground">
          <Highlight text={r.name} query={query} />
        </span>
      ),
    },
    { id: "category", header: "Category", accessor: (r) => r.category },
    {
      id: "credits",
      header: "Credits",
      accessor: (r) => r.creditsRequired,
      align: "right",
      cell: (r) => num(r.creditsRequired),
    },
    {
      id: "stock",
      header: "Stock",
      accessor: (r) => r.stock,
      align: "right",
      cell: (r) => num(r.stock),
    },
    {
      id: "status",
      header: "Status",
      accessor: (r) => r.status,
      cell: (r) => <StatusBadge status={r.status} />,
    },
    {
      id: "redemptions",
      header: "Redeemed",
      accessor: (r) => r.redemptions,
      align: "right",
      cell: (r) => num(r.redemptions),
    },
    {
      id: "lastRedeemedAt",
      header: "Last redeemed",
      accessor: (r) => r.lastRedeemedAt,
      align: "right",
      cell: (r) => formatDate(r.lastRedeemedAt),
    },
  ];
}
