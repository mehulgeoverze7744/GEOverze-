import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Check, CreditCard, TrendingUp, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { PageBody } from "@/components/shared/page-body";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { StatGrid } from "@/components/shared/stat-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  subscribers,
  subscriptionPlans,
  summarizeSubscriptions,
} from "@/features/subscriptions/data";
import { money, num } from "@/lib/format";

export const Route = createFileRoute("/subscriptions/")({
  head: () => ({
    meta: [
      { title: "Subscription Plans — GEOverze Admin" },
      {
        name: "description",
        content: "Compare Basic, Pro and Advanced plan pricing, entitlements and revenue mix.",
      },
      { property: "og:title", content: "Subscription Plans — GEOverze Admin" },
      { property: "og:description", content: "Plan pricing, entitlements and revenue mix." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SubscriptionPlansPage,
});

function SubscriptionPlansPage() {
  const [cycle, setCycle] = useState<"Monthly" | "Annual">("Monthly");
  const summary = useMemo(() => summarizeSubscriptions(subscribers), []);

  return (
    <>
      <PageHeader
        title="Subscription Plans"
        description="Pricing tiers, included entitlements and their revenue contribution."
        actions={
          <div className="flex rounded-md border border-border p-0.5">
            {(["Monthly", "Annual"] as const).map((option) => (
              <Button
                key={option}
                size="sm"
                variant={cycle === option ? "secondary" : "ghost"}
                onClick={() => setCycle(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        }
      />

      <PageBody>
        <StatGrid columns={4} label="Subscription statistics">
          <StatCard
            label="Active subscribers"
            value={num(summary.activeSubscribers)}
            icon={UsersRound}
          />
          <StatCard label="MRR" value={money(summary.mrr)} icon={CreditCard} delta={4.8} />
          <StatCard label="ARR" value={money(summary.arr)} icon={TrendingUp} />
          <StatCard label="Churn rate" value={`${summary.churnRate}%`} hint="cancelled / total" />
        </StatGrid>

        <div className="grid gap-4 lg:grid-cols-3">
          {subscriptionPlans.map((plan) => (
            <article
              key={plan.id}
              className={`flex flex-col gap-4 rounded-lg border bg-card p-5 ${
                plan.popular ? "border-primary/60" : "border-border"
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-semibold text-foreground">{plan.tier}</h2>
                  {plan.popular && <Badge variant="secondary">Most popular</Badge>}
                </div>
                <p className="text-xs text-muted-foreground">{plan.tagline}</p>
              </div>

              <p className="text-2xl font-semibold text-foreground tabular">
                {money(cycle === "Monthly" ? plan.monthlyPrice : plan.annualPrice)}
                <span className="ml-1 text-xs font-normal text-muted-foreground">
                  /{cycle === "Monthly" ? "month" : "year"}
                </span>
              </p>

              <ul className="space-y-1.5 text-sm">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <Check className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden="true" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <dl className="grid grid-cols-3 gap-2 border-t border-border pt-3 text-xs">
                <div>
                  <dt className="text-muted-foreground">Seats</dt>
                  <dd className="font-medium text-foreground tabular">{num(plan.includedSeats)}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Credits</dt>
                  <dd className="font-medium text-foreground tabular">
                    {num(plan.monthlyCredits)}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">MRR</dt>
                  <dd className="font-medium text-foreground tabular">{money(plan.mrr)}</dd>
                </div>
              </dl>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {num(plan.subscribers)} subscribers
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => toast.success(`${plan.tier} plan pricing saved.`)}
                >
                  Edit plan
                </Button>
              </div>
            </article>
          ))}
        </div>
      </PageBody>
    </>
  );
}
