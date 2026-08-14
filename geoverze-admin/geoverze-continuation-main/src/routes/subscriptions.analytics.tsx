import { useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";

import { ChartCard } from "@/components/shared/chart-card";
import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import {
  mrrTrend,
  subscribers,
  subscriptionPlans,
  summarizeSubscriptions,
} from "@/features/subscriptions/data";
import { catalogMonths } from "@/lib/catalog";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/subscriptions/analytics")({
  head: () => ({
    meta: [
      { title: "Subscription Analytics — GEOverze Admin" },
      {
        name: "description",
        content: "MRR growth, plan mix, seat expansion and churn across GEOverze subscriptions.",
      },
      { property: "og:title", content: "Subscription Analytics — GEOverze Admin" },
      { property: "og:description", content: "MRR growth, plan mix and churn analytics." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionAnalyticsPage,
});

function SubscriptionAnalyticsPage() {
  const summary = useMemo(() => summarizeSubscriptions(subscribers), []);
  const maxPlanMrr = Math.max(...subscriptionPlans.map((plan) => plan.mrr), 1);

  return (
    <>
      <PageHeader
        title="Subscription Analytics"
        description="Recurring revenue, plan mix and retention signals."
      />

      <PageBody>
        <StatGrid columns={4} label="Subscription analytics">
          <StatCard label="MRR" value={money(summary.mrr)} delta={4.8} />
          <StatCard label="ARR" value={money(summary.arr)} delta={5.2} />
          <StatCard label="Paid seats" value={num(summary.seats)} delta={2.9} />
          <StatCard label="Churn rate" value={`${summary.churnRate}%`} delta={-0.4} />
        </StatGrid>

        <ChartCard
          title="MRR growth"
          description="Monthly recurring revenue over the last 12 months"
          series={mrrTrend}
          labels={catalogMonths}
        />

        <section
          aria-labelledby="plan-mix"
          className="space-y-3 rounded-lg border border-border bg-card p-4"
        >
          <h2 id="plan-mix" className="text-sm font-semibold text-foreground">
            Revenue by plan
          </h2>
          <ul className="space-y-2">
            {subscriptionPlans.map((plan) => (
              <li key={plan.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">
                    {plan.tier}
                    <span className="ml-2 text-xs text-muted-foreground">
                      {num(plan.subscribers)} subscribers
                    </span>
                  </span>
                  <span className="text-muted-foreground tabular">{money(plan.mrr)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary/60"
                    style={{ width: `${Math.round((plan.mrr / maxPlanMrr) * 100)}%` }}
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
