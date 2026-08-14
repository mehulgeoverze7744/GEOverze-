import { Boxes, DollarSign, PackageX, Receipt, Star } from "lucide-react";

import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import type { WidgetState } from "@/components/shared/widget";
import type { StoreStatsSummary } from "@/features/store/data";
import { money, num } from "@/lib/format";

export function StoreStats({
  summary,
  state = "ready",
}: {
  summary: StoreStatsSummary;
  state?: WidgetState | undefined;
}) {
  return (
    <StatGrid columns={5} label="GEOstore statistics">
      <StatCard
        label="Products"
        value={num(summary.totalProducts)}
        icon={Boxes}
        hint={`${num(summary.published)} published`}
        state={state}
      />
      <StatCard
        label="Out of stock"
        value={num(summary.outOfStock)}
        icon={PackageX}
        hint="Needs restocking"
        state={state}
      />
      <StatCard
        label="Featured"
        value={num(summary.featured)}
        icon={Star}
        hint="Shown on the store home"
        state={state}
      />
      <StatCard
        label="Orders"
        value={num(summary.orders)}
        icon={Receipt}
        hint={`${num(summary.refunded)} refunded`}
        state={state}
      />
      <StatCard
        label="Revenue"
        value={money(summary.revenue)}
        icon={DollarSign}
        hint={`${money(summary.averageOrder)} average order`}
        state={state}
      />
    </StatGrid>
  );
}
