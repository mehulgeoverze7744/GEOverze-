import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  Award,
  BadgeCheck,
  Coins,
  CreditCard,
  Flag,
  Gift,
  LifeBuoy,
  ListChecks,
  RefreshCw,
  ServerCog,
  ShieldAlert,
  ShoppingBag,
  TrendingUp,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import { useState } from "react";

import {
  ActivityCard,
  ChartCard,
  PageHeader,
  SectionHeader,
  StatCard,
  Widget,
} from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { summarizeCases, moderationCases } from "@/features/moderation/data";
import { creditTransactions, summarizeCredits } from "@/features/credits/data";
import { topRewards } from "@/features/rewards/data";
import { subscribers, summarizeSubscriptions } from "@/features/subscriptions/data";
import { money, num } from "@/lib/format";
import { recentActivity } from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Operations Dashboard — GEOverze Admin" },
      {
        name: "description",
        content:
          "Real-time operational overview of GEOverze: users, creators, content, commerce, moderation and platform health.",
      },
      { property: "og:title", content: "Operations Dashboard — GEOverze Admin" },
      {
        property: "og:description",
        content:
          "Monitor users, creators, quizzes, orders, revenue, support and platform health from one console.",
      },
    ],
  }),
  component: DashboardPage,
});

const primaryStats = [
  { label: "Total Users", value: "2,481,930", delta: 4.2, hint: "vs last month", icon: Users },
  { label: "Active Users", value: "184,204", delta: 2.1, hint: "daily active", icon: UserCheck },
  {
    label: "Creator Applications",
    value: "87",
    delta: 9.1,
    hint: "awaiting review",
    icon: UserCog,
  },
  {
    label: "Published Quizzes",
    value: "48,219",
    delta: 3.6,
    hint: "vs last month",
    icon: ListChecks,
  },
  { label: "Pending Reviews", value: "428", delta: 12.4, hint: "moderation queue", icon: Flag },
  { label: "Store Orders", value: "18,663", delta: -1.8, hint: "last 30 days", icon: ShoppingBag },
  { label: "Revenue", value: "$1,284,510", delta: 7.3, hint: "last 30 days", icon: TrendingUp },
  { label: "Subscriptions", value: "26,402", delta: 5.4, hint: "active plans", icon: CreditCard },
  { label: "Support Tickets", value: "196", delta: -6.2, hint: "open, SLA 24h", icon: LifeBuoy },
];

const healthServices = [
  { name: "API Gateway", status: "Operational", uptime: 99.98, tone: "success" as const },
  { name: "Quiz Engine", status: "Degraded", uptime: 97.4, tone: "warning" as const },
  { name: "Payments", status: "Operational", uptime: 99.99, tone: "success" as const },
  { name: "Media CDN", status: "Operational", uptime: 99.91, tone: "success" as const },
];

function DashboardPage() {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = () => {
    setRefreshing(true);
    window.setTimeout(() => setRefreshing(false), 900);
  };

  const state = refreshing ? "loading" : "ready";

  const subscriptionSummary = summarizeSubscriptions(subscribers);
  const creditSummary = summarizeCredits(creditTransactions);
  const caseSummary = summarizeCases(moderationCases);
  const rewardClaimTotal = topRewards.reduce((sum, reward) => sum + reward.claims, 0);
  const mostReported = [...moderationCases]
    .sort((a, b) => b.reportCount - a.reportCount)
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Operations Dashboard"
        description="Platform-wide health, growth and workload at a glance."
        breadcrumbs={null}
        actions={
          <>
            <Badge variant="outline" className="text-[11px]">
              Last 30 days
            </Badge>
            <Button variant="outline" size="sm" onClick={refresh} disabled={refreshing}>
              <RefreshCw
                className={refreshing ? "size-4 animate-spin" : "size-4"}
                aria-hidden="true"
              />
              Refresh
            </Button>
          </>
        }
      />

      <section aria-label="Key metrics">
        <SectionHeader title="Key metrics" description="Core counters across the platform." />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {primaryStats.map((stat) => (
            <StatCard key={stat.label} {...stat} state={state} />
          ))}
        </div>
      </section>

      <section aria-label="Community and economy">
        <SectionHeader
          title="Community & economy"
          description="Moderation load, credit flow and subscription revenue."
        />
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Active Subscribers"
            value={num(subscriptionSummary.activeSubscribers)}
            icon={CreditCard}
            hint={`${money(subscriptionSummary.mrr)} MRR`}
            state={state}
          />
          <StatCard
            label="Credits Issued"
            value={num(creditSummary.issued)}
            icon={Coins}
            hint="lifetime"
            state={state}
          />
          <StatCard
            label="Credits Redeemed"
            value={num(creditSummary.redeemed)}
            icon={Gift}
            hint="lifetime"
            state={state}
          />
          <StatCard
            label="Pending Reports"
            value={num(caseSummary.open)}
            icon={ShieldAlert}
            hint={`${num(caseSummary.escalated)} escalated`}
            state={state}
          />
          <StatCard
            label="Reward Claims"
            value={num(rewardClaimTotal)}
            icon={Award}
            hint="across catalogue"
            state={state}
          />
        </div>
      </section>

      <section aria-label="Rewards and moderation" className="grid gap-4 lg:grid-cols-2">
        <Widget
          title="Top rewards"
          description="Most claimed rewards in the catalogue."
          state={state}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/rewards">View rewards</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border text-sm">
            {topRewards.map((reward) => (
              <li key={reward.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0 truncate text-foreground">{reward.name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{reward.type}</span>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {num(reward.claims)}
                </span>
              </li>
            ))}
          </ul>
        </Widget>

        <Widget
          title="Most reported content"
          description="Open cases with the highest report volume."
          state={state}
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/moderation">Open queue</Link>
            </Button>
          }
        >
          <ul className="divide-y divide-border text-sm">
            {mostReported.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-2 py-2">
                <span className="min-w-0 truncate text-foreground">{item.title}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{item.surface}</span>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {num(item.reportCount)}
                </span>
              </li>
            ))}
          </ul>
        </Widget>
      </section>

      <section aria-label="Trends" className="grid gap-4 lg:grid-cols-3">
        <ChartCard
          title="User growth"
          description="New and returning accounts per week."
          state={state}
          className="lg:col-span-2"
          series={[32, 44, 40, 55, 51, 63, 60, 71, 68, 79, 84, 92]}
        />
        <ChartCard
          title="Revenue"
          description="Gross revenue across store and subscriptions."
          state={state}
          series={[48, 52, 47, 60, 58, 66, 71, 69, 78, 82, 88, 94]}
        />
      </section>

      <section aria-label="Operations" className="grid gap-4 lg:grid-cols-3">
        <ActivityCard
          events={recentActivity}
          title="Recent activity"
          description="Latest administrative actions recorded in the audit trail."
          state={state}
          className="lg:col-span-2"
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/audit-logs">View audit logs</Link>
            </Button>
          }
        />

        <Widget
          title="Platform health"
          description="Service availability over the last 24 hours."
          state={state}
          action={<ServerCog className="size-4 text-muted-foreground" aria-hidden="true" />}
        >
          <ul className="space-y-3">
            {healthServices.map((service) => (
              <li key={service.name} className="space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm text-foreground">{service.name}</span>
                  <span
                    className={
                      service.tone === "success"
                        ? "flex items-center gap-1 text-xs text-success"
                        : "flex items-center gap-1 text-xs text-warning"
                    }
                  >
                    {service.tone === "success" ? (
                      <BadgeCheck className="size-3.5" aria-hidden="true" />
                    ) : (
                      <AlertTriangle className="size-3.5" aria-hidden="true" />
                    )}
                    {service.status}
                  </span>
                </div>
                <Progress value={service.uptime} aria-label={`${service.name} uptime`} />
                <p className="text-[11px] text-muted-foreground">{service.uptime}% uptime</p>
              </li>
            ))}
          </ul>
        </Widget>
      </section>

      <section aria-label="Widget states" className="grid gap-4 lg:grid-cols-3">
        <Widget
          title="Live sessions"
          description="Streaming counter — connects after backend integration."
          state="loading"
          bodyMinHeight={120}
        />
        <Widget
          title="Scheduled campaigns"
          state="empty"
          bodyMinHeight={120}
          emptyTitle="No campaigns scheduled"
          emptyDescription="Reward campaigns you schedule will be listed here."
        />
        <Widget
          title="Fraud signals"
          state="error"
          bodyMinHeight={120}
          errorTitle="Signal feed unavailable"
          errorDescription="The risk service did not respond in time."
          onRetry={refresh}
        />
      </section>

      <section aria-label="Workload" className="grid gap-4 lg:grid-cols-3">
        <Widget title="Queues" description="Work waiting on an operator." state={state}>
          <ul className="divide-y divide-border text-sm">
            {[
              { label: "Creator applications", value: 87, url: "/creators" as const },
              { label: "Moderation queue", value: 428, url: "/moderation" as const },
              { label: "Open reports", value: 152, url: "/reports" as const },
              { label: "Support tickets", value: 196, url: "/support" as const },
            ].map((row) => (
              <li key={row.label} className="flex items-center justify-between gap-2 py-2">
                <Link to={row.url} className="truncate text-foreground hover:text-primary">
                  {row.label}
                </Link>
                <span className="shrink-0 font-mono text-sm text-muted-foreground">
                  {row.value}
                </span>
              </li>
            ))}
          </ul>
        </Widget>

        <ChartCard
          title="Engagement"
          description="Quiz plays per day."
          state={state}
          className="lg:col-span-2"
          series={[55, 62, 58, 70, 66, 74, 69, 81, 77, 85, 80, 90]}
          action={<Activity className="size-4 text-muted-foreground" aria-hidden="true" />}
        />
      </section>
    </>
  );
}
