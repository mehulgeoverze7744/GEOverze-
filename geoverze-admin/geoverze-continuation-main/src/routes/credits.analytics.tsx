import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ChartCard } from "@/components/shared/chart-card";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import {
  creditIssuanceTrend,
  creditRedemptionTrend,
  creditTransactions,
  summarizeCredits,
} from "@/features/credits/data";
import { catalogMonths } from "@/lib/catalog";
import { num } from "@/lib/format";

export const Route = createFileRoute("/credits/analytics")({
  head: () => ({
    meta: [
      { title: "Credit Analytics — GEOverze Admin" },
      {
        name: "description",
        content: "Issuance, redemption and outstanding-liability trends for the GEOcredit economy.",
      },
      { property: "og:title", content: "Credit Analytics — GEOverze Admin" },
      { property: "og:description", content: "GEOcredit economy trends and top earning reasons." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreditAnalyticsPage,
});

function CreditAnalyticsPage() {
  const summary = useMemo(() => summarizeCredits(creditTransactions), []);

  const byReason = useMemo(() => {
    const totals = new Map<string, number>();
    for (const item of creditTransactions) {
      totals.set(item.reason, (totals.get(item.reason) ?? 0) + item.amount);
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, []);

  const maxReason = byReason[0]?.[1] ?? 1;

  return (
    <>
      <PageHeader
        title="Credit Analytics"
        description="How GEOcredits flow through the platform each month."
      />

      <PageBody>
        <StatGrid columns={4} label="Credit analytics">
          <StatCard label="Issued" value={num(summary.issued)} delta={4.1} hint="lifetime" />
          <StatCard label="Redeemed" value={num(summary.redeemed)} delta={5.4} hint="lifetime" />
          <StatCard
            label="Outstanding"
            value={num(summary.outstanding)}
            delta={-1.6}
            hint="liability"
          />
          <StatCard
            label="Redemption rate"
            value={`${Math.round((summary.redeemed / Math.max(1, summary.issued)) * 100)}%`}
            hint="redeemed / issued"
          />
        </StatGrid>

        <div className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="Credits issued"
            description="Monthly issuance volume"
            series={creditIssuanceTrend}
            labels={catalogMonths}
          />
          <ChartCard
            title="Credits redeemed"
            description="Monthly redemption volume"
            series={creditRedemptionTrend}
            labels={catalogMonths}
          />
        </div>

        <section
          aria-labelledby="reason-breakdown"
          className="space-y-3 rounded-lg border border-border bg-card p-4"
        >
          <h2 id="reason-breakdown" className="text-sm font-semibold text-foreground">
            Top credit reasons
          </h2>
          <ul className="space-y-2">
            {byReason.map(([reason, total]) => (
              <li key={reason} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{reason}</span>
                  <span className="text-muted-foreground tabular">{num(total)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${Math.round((total / maxReason) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </PageBody>
    </>
  );
}
