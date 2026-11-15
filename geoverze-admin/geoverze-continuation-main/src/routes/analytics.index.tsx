import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  BookOpen,
  Coins,
  CreditCard,
  Download,
  ListChecks,
  ShieldAlert,
  ShoppingBag,
  UserCog,
  Users,
} from "lucide-react";

import { ChartCard, PageBody, PageHeader, StatCard, StatGrid } from "@/components/shared";
import { SectionHeader } from "@/components/shared/section-header";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboard } from "@/features/dashboard/hooks";
import { fetchQuizzes } from "@/features/quizzes/data/fetchQuizzes";
import { fetchUsers } from "@/features/users/api";
import { analyticsWindows, type ReportRow } from "@/features/ops/types";
import { ReportTable } from "@/features/ops/report-table";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";
import { downloadCsv } from "@/lib/admin/csv";
import { moneyMinor, num } from "@/lib/format";

export const Route = createFileRoute("/analytics/")({
  head: () => ({
    meta: [
      { title: "Executive Overview — GVRZE Analytics" },
      {
        name: "description",
        content: "Cross-module KPIs for users, creators, content, commerce and the credit economy.",
      },
      { property: "og:title", content: "Executive Overview — GVRZE Analytics" },
      {
        property: "og:description",
        content: "Cross-module KPIs across users, content, commerce and moderation.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AnalyticsOverviewPage,
});

function normalize(values: number[]) {
  const max = Math.max(1, ...values);
  return values.map((value) => Math.round((value / max) * 100));
}

function AnalyticsOverviewPage() {
  const [window, setWindow] = useState("90d");
  const dash = useDashboard();
  const users = useAdminQuery(adminKeys.users, fetchUsers);
  const quizzes = useAdminQuery(["admin", "quizzes"], fetchQuizzes);
  const metrics = dash.metrics;

  const countries = useMemo<ReportRow[]>(() => {
    const counts = new Map<string, number>();
    for (const user of users.data ?? []) {
      const country = user.country || "—";
      counts.set(country, (counts.get(country) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([label, primary], index) => ({
        id: label,
        label,
        primary,
        secondary: 0,
        change: 0,
        meta: index === 0 ? "top" : "",
      }));
  }, [users.data]);

  const categories = useMemo<ReportRow[]>(() => {
    const counts = new Map<string, { plays: number; count: number }>();
    for (const quiz of quizzes.data ?? []) {
      const current = counts.get(quiz.category) ?? { plays: 0, count: 0 };
      current.plays += quiz.plays;
      current.count += 1;
      counts.set(quiz.category, current);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1].plays - a[1].plays)
      .slice(0, 12)
      .map(([label, value]) => ({
        id: label,
        label,
        primary: value.plays,
        secondary: value.count,
        change: 0,
        meta: "",
      }));
  }, [quizzes.data]);

  const take = window === "7d" ? 7 : window === "30d" ? 5 : window === "90d" ? 12 : 24;
  const userPoints = (dash.growth?.users_by_week ?? []).slice(-take);
  const attemptPoints = (dash.growth?.attempts_by_day ?? []).slice(-take);
  const revenuePoints = (dash.growth?.gstore_revenue_by_week ?? []).slice(-take);
  const userSeries = normalize(userPoints.map((row) => row.count));
  const attemptSeries = normalize(attemptPoints.map((row) => row.count));
  const revenueSeries = normalize(revenuePoints.map((row) => row.minor));
  const userLabels = userPoints.map((row) => row.week.slice(5, 10));
  const attemptLabels = attemptPoints.map((row) => row.day.slice(5, 10));
  const revenueLabels = revenuePoints.map((row) => row.week.slice(5, 10));

  return (
    <>
      <PageHeader
        title="Executive Overview"
        description="One board-level view of platform health across every GVRZE module."
        actions={
          <div className="flex items-center gap-2">
            <Select value={window} onValueChange={setWindow}>
              <SelectTrigger className="h-8 w-40" aria-label="Reporting window">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {analyticsWindows.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (!metrics) return;
                downloadCsv(
                  "geoverze-analytics.csv",
                  ["metric", "value"],
                  Object.entries(metrics),
                );
              }}
            >
              <Download className="size-4" aria-hidden="true" />
              Export
            </Button>
          </div>
        }
      />

      <PageBody gap="lg">
        <section className="space-y-3">
          <SectionHeader
            title="Platform KPIs"
            description="Headline numbers for the selected reporting window."
          />
          <StatGrid columns={5} label="Platform KPIs">
            <StatCard
              label="Total users"
              value={num(metrics?.total_users ?? 0)}
              icon={Users}
              hint={`${num(metrics?.dau ?? 0)} active today`}
            />
            <StatCard
              label="Creators"
              value={num(metrics?.creators ?? 0)}
              icon={UserCog}
              hint={`${num(metrics?.library_creators ?? 0)} library creators`}
            />
            <StatCard
              label="Published quizzes"
              value={num(metrics?.published_quizzes ?? 0)}
              icon={ListChecks}
              hint={`${num(metrics?.question_bank ?? 0)} questions`}
            />
            <StatCard
              label="Library resources"
              value={num(metrics?.published_library_resources ?? 0)}
              icon={BookOpen}
              hint={`${num(metrics?.library_resources ?? 0)} total`}
            />
            <StatCard
              label="Store revenue (30d)"
              value={moneyMinor(metrics?.gstore_revenue_minor_30d ?? 0)}
              icon={ShoppingBag}
              hint={`${num(metrics?.gstore_orders_30d ?? 0)} orders`}
            />
          </StatGrid>
          <StatGrid columns={5} label="Economy KPIs">
            <StatCard
              label="Billing revenue (30d)"
              value={moneyMinor(metrics?.billing_revenue_minor_30d ?? 0)}
              icon={CreditCard}
              hint={`${num(metrics?.active_subscriptions ?? 0)} subscribers`}
            />
            <StatCard
              label="Active subscriptions"
              value={num(metrics?.active_subscriptions ?? 0)}
              icon={CreditCard}
            />
            <StatCard
              label="Credits issued"
              value={num(metrics?.credits_issued ?? 0)}
              icon={Coins}
              hint={`${num(metrics?.credits_redeemed ?? 0)} redeemed`}
            />
            <StatCard
              label="Open cases"
              value={num(metrics?.open_reports ?? 0)}
              icon={ShieldAlert}
              hint={`${num(metrics?.open_tickets ?? 0)} tickets`}
            />
            <StatCard
              label="Quiz attempts (7d)"
              value={num(metrics?.quiz_attempts_7d ?? 0)}
              icon={Activity}
              hint={`${num(metrics?.mau ?? 0)} MAU`}
            />
          </StatGrid>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="User growth"
            description="New accounts by week."
            series={userSeries}
            labels={userLabels}
            footnote="Live counts from profiles.created_at"
          />
          <ChartCard
            title="Revenue trend"
            description="Gstore revenue by week."
            series={revenueSeries}
            labels={revenueLabels}
            footnote="Live Gstore paid totals"
          />
          <ChartCard
            title="Quiz activity"
            description="Quiz attempts by day."
            series={attemptSeries}
            labels={attemptLabels}
            footnote="Live quiz_attempts"
          />
          <ChartCard
            title="Monthly active users"
            description="Current MAU snapshot. Cohort retention is not stored in the database."
            series={[metrics?.mau ?? 0]}
            labels={["MAU"]}
            footnote="No retention-cohort table exists — showing the live MAU metric only."
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ReportTable
            title="Top countries"
            description="Sessions by country for the selected window."
            rows={countries}
            primaryLabel="users"
            secondaryLabel="n/a"
          />
          <ReportTable
            title="Top quiz categories"
            description="Plays by category for the selected window."
            rows={categories}
            primaryLabel="plays"
            secondaryLabel="completions"
          />
        </section>
      </PageBody>
    </>
  );
}
