import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Award,
  Coins,
  CreditCard,
  Flag,
  Gift,
  LifeBuoy,
  ListChecks,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";

import { ChartCard, PageHeader, SectionHeader, StatCard, Widget } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboard } from "@/features/dashboard/hooks";
import { moneyMinor, num } from "@/lib/format";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — GVRZE Admin" },
      {
        name: "description",
        content:
          "Live operational overview of GVRZE: users, creators, content, commerce, moderation and platform health.",
      },
    ],
  }),
  component: DashboardPage,
});

function seriesFrom(
  points: Array<{ count?: number; minor?: number }>,
  key: "count" | "minor",
): number[] {
  return points.map((point) => Number(point[key] ?? 0));
}

function DashboardPage() {
  const { metrics, growth, loading, error, refetch } = useDashboard();
  const state = loading ? "loading" : error ? "error" : "ready";
  const revenueMinor =
    (metrics?.gstore_revenue_minor_30d ?? 0) + (metrics?.billing_revenue_minor_30d ?? 0);

  return (
    <>
      <PageHeader
        title="Operations Dashboard"
        description="Live counters from the shared GEOverze database. Metric definitions are listed on each card."
        breadcrumbs={null}
        actions={
          <>
            <Badge variant="outline" className="text-[11px]">
              Live
            </Badge>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={loading ? "size-4 animate-spin" : "size-4"} aria-hidden="true" />
              Refresh
            </Button>
          </>
        }
      />

      {error ? (
        <p className="mb-4 text-sm text-destructive">{error}</p>
      ) : null}

      <section aria-label="Key metrics">
        <SectionHeader
          title="Key metrics"
          description="DAU/MAU = distinct quiz_attempts in the last 1/30 days. Revenue = paid Gstore + succeeded billing in 30 days."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard label="Total Users" value={num(metrics?.total_users ?? 0)} hint="profiles" icon={Users} state={state} />
          <StatCard label="Active Users" value={num(metrics?.active_users ?? 0)} hint="status = active" icon={UserCheck} state={state} />
          <StatCard label="Daily active" value={num(metrics?.dau ?? 0)} hint="quiz attempts 24h" icon={UserCheck} state={state} />
          <StatCard label="Monthly active" value={num(metrics?.mau ?? 0)} hint="quiz attempts 30d" icon={Users} state={state} />
          <StatCard
            label="Creators"
            value={num(metrics?.creators ?? 0)}
            hint={`${num(metrics?.unverified_library_creators ?? 0)} unverified library personas`}
            icon={UserCog}
            state={state}
          />
          <StatCard
            label="Published Quizzes"
            value={num(metrics?.published_quizzes ?? 0)}
            hint={`${num(metrics?.total_quizzes ?? 0)} total`}
            icon={ListChecks}
            state={state}
          />
          <StatCard label="Question bank" value={num(metrics?.question_bank ?? 0)} hint="quiz_questions" icon={ListChecks} state={state} />
          <StatCard
            label="GEOlibrary"
            value={num(metrics?.published_library_resources ?? 0)}
            hint={`${num(metrics?.library_resources ?? 0)} including drafts`}
            icon={Flag}
            state={state}
          />
          <StatCard
            label="Store orders"
            value={num((metrics?.gstore_orders_30d ?? 0) + (metrics?.credit_orders ?? 0))}
            hint={`${num(metrics?.gstore_orders_30d ?? 0)} Gstore 30d · ${num(metrics?.credit_orders ?? 0)} credit orders`}
            icon={ShoppingBag}
            state={state}
          />
          <StatCard
            label="Revenue (30d)"
            value={moneyMinor(revenueMinor, "INR")}
            hint="Gstore paid + billing succeeded"
            icon={TrendingUp}
            state={state}
          />
        </div>
      </section>

      <section aria-label="Community and economy">
        <SectionHeader title="Community & economy" description="Credits, subscriptions, reports and tickets." />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Active Subscribers"
            value={num(metrics?.active_subscriptions ?? 0)}
            icon={CreditCard}
            hint="active + trialing"
            state={state}
          />
          <StatCard label="Credits Issued" value={num(metrics?.credits_issued ?? 0)} icon={Coins} hint="ledger amount > 0" state={state} />
          <StatCard label="Credits Redeemed" value={num(metrics?.credits_redeemed ?? 0)} icon={Gift} hint="ledger amount < 0" state={state} />
          <StatCard label="Pending Reports" value={num(metrics?.open_reports ?? 0)} icon={Flag} hint="open + pending" state={state} />
          <StatCard label="Support Tickets" value={num(metrics?.open_tickets ?? 0)} icon={LifeBuoy} hint="open + pending" state={state} />
        </div>
      </section>

      <section aria-label="Trends" className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="User growth"
          description="New profiles per week (last 12 weeks)."
          state={state}
          className="lg:col-span-2"
          series={seriesFrom(growth?.users_by_week ?? [], "count")}
        />
        <ChartCard
          title="Gstore revenue"
          description="Paid Gstore payments per week."
          state={state}
          series={seriesFrom(growth?.gstore_revenue_by_week ?? [], "minor")}
        />
      </section>

      <section aria-label="Workload" className="grid gap-4 lg:grid-cols-3">
        <Widget title="Queues" description="Work waiting on an operator." state={state}>
          <ul className="divide-y divide-border text-sm">
            {[
              { label: "Unverified library creators", value: metrics?.unverified_library_creators ?? 0, url: "/library/creators" as const },
              { label: "Moderation queue", value: metrics?.open_reports ?? 0, url: "/moderation" as const },
              { label: "Open reports", value: metrics?.open_reports ?? 0, url: "/reports" as const },
              { label: "Support tickets", value: metrics?.open_tickets ?? 0, url: "/support" as const },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-2 py-2">
                <Link to={row.url} className="truncate text-foreground hover:text-primary">
                  {row.label}
                </Link>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">{num(row.value)}</span>
              </li>
            ))}
          </ul>
        </Widget>

        <ChartCard
          title="Engagement"
          description="Quiz attempts per day (last 14 days)."
          state={state}
          className="lg:col-span-2"
          series={seriesFrom(growth?.attempts_by_day ?? [], "count")}
        />
      </section>

      <section aria-label="Catalogue" className="grid gap-4 lg:grid-cols-3">
        <Widget title="Catalogue" description="Live inventory counts." state={state}>
          <ul className="divide-y divide-border text-sm">
            <li className="flex justify-between py-2">
              <span>Credit-store products</span>
              <span className="font-mono">{num(metrics?.store_products ?? 0)}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Reward claims / entitlements</span>
              <span className="font-mono">{num(metrics?.reward_claims ?? 0)}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Billing payments</span>
              <span className="font-mono">{num(metrics?.billing_payments ?? 0)}</span>
            </li>
            <li className="flex justify-between py-2">
              <span>Gstore payments</span>
              <span className="font-mono">{num(metrics?.gstore_payments ?? 0)}</span>
            </li>
          </ul>
        </Widget>
        <Widget title="Quiz activity" description="Attempts in the last 7 days." state={state} className="lg:col-span-2">
          <div className="flex items-center gap-3">
            <Award className="size-5 text-primary" aria-hidden="true" />
            <p className="text-sm text-foreground">
              {num(metrics?.quiz_attempts_7d ?? 0)} graded quiz attempts this week.
            </p>
          </div>
        </Widget>
      </section>
    </>
  );
}
