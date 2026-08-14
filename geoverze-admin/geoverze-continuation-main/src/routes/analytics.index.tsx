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
import { creatorRecords, summarizeCreators } from "@/features/creators/data";
import { creditTransactions, summarizeCredits } from "@/features/credits/data";
import { libraryResources, summarizeLibrary } from "@/features/library/data";
import { moderationCases, summarizeCases } from "@/features/moderation/data";
import { quizRecords, summarizeQuizzes } from "@/features/quizzes/data";
import { storeOrders, storeProducts, summarizeStore } from "@/features/store/data";
import { subscribers, summarizeSubscriptions } from "@/features/subscriptions/data";
import { userStats } from "@/features/users/data";
import { analyticsWindows, type ReportRow } from "@/features/ops/types";
import { biReports, growthSeries } from "@/features/ops/data";
import { ReportTable } from "@/features/ops/report-table";
import { catalogMonths } from "@/lib/catalog";
import { money, num } from "@/lib/format";
import { notReadyNow } from "@/lib/placeholder";

export const Route = createFileRoute("/analytics/")({
  head: () => ({
    meta: [
      { title: "Executive Overview — GEOverze Analytics" },
      {
        name: "description",
        content: "Cross-module KPIs for users, creators, content, commerce and the credit economy.",
      },
      { property: "og:title", content: "Executive Overview — GEOverze Analytics" },
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

function scaleRows(rows: ReportRow[], factor: number): ReportRow[] {
  return rows.map((row) => ({
    ...row,
    primary: Math.round(row.primary * factor),
    secondary: Math.round(row.secondary * factor),
  }));
}

function AnalyticsOverviewPage() {
  const [window, setWindow] = useState("90d");

  const summaries = useMemo(
    () => ({
      creators: summarizeCreators(creatorRecords),
      quizzes: summarizeQuizzes(quizRecords),
      library: summarizeLibrary(libraryResources),
      store: summarizeStore(storeProducts, storeOrders),
      subscriptions: summarizeSubscriptions(subscribers),
      credits: summarizeCredits(creditTransactions),
      moderation: summarizeCases(moderationCases),
    }),
    [],
  );

  const factor = window === "7d" ? 0.08 : window === "30d" ? 0.33 : window === "90d" ? 1 : 3.9;

  const countries = useMemo(() => scaleRows(biReports.countries, factor), [factor]);
  const categories = useMemo(() => scaleRows(biReports.categories, factor), [factor]);

  return (
    <>
      <PageHeader
        title="Executive Overview"
        description="One board-level view of platform health across every GEOverze module."
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
              onClick={() => notReadyNow("Export runs server-side once the backend is connected.")}
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
              value={num(userStats.total)}
              delta={6.2}
              icon={Users}
              hint={`${num(userStats.activeToday)} active today`}
            />
            <StatCard
              label="Active creators"
              value={num(summaries.creators.active)}
              delta={summaries.creators.monthlyGrowth}
              icon={UserCog}
              hint={`${num(summaries.creators.verified)} verified`}
            />
            <StatCard
              label="Published quizzes"
              value={num(summaries.quizzes.published)}
              delta={4.8}
              icon={ListChecks}
              hint={`${num(summaries.quizzes.totalQuestions)} questions`}
            />
            <StatCard
              label="Library views"
              value={num(summaries.library.views)}
              delta={3.1}
              icon={BookOpen}
              hint={`${num(summaries.library.published)} published`}
            />
            <StatCard
              label="Store revenue"
              value={money(summaries.store.revenue)}
              delta={7.4}
              icon={ShoppingBag}
              hint={`${num(summaries.store.orders)} orders`}
            />
          </StatGrid>
          <StatGrid columns={5} label="Economy KPIs">
            <StatCard
              label="MRR"
              value={money(summaries.subscriptions.mrr)}
              delta={5.6}
              icon={CreditCard}
              hint={`${num(summaries.subscriptions.activeSubscribers)} subscribers`}
            />
            <StatCard
              label="ARR"
              value={money(summaries.subscriptions.arr)}
              delta={5.6}
              icon={CreditCard}
            />
            <StatCard
              label="Credits outstanding"
              value={num(summaries.credits.outstanding)}
              delta={-2.3}
              icon={Coins}
              hint={`${num(summaries.credits.issued)} issued`}
            />
            <StatCard
              label="Open cases"
              value={num(summaries.moderation.open)}
              delta={-4.9}
              icon={ShieldAlert}
              hint={`${num(summaries.moderation.escalated)} escalated`}
            />
            <StatCard
              label="Churn rate"
              value={`${summaries.subscriptions.churnRate}%`}
              delta={-0.8}
              icon={Activity}
              hint="rolling 12 months"
            />
          </StatGrid>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ChartCard
            title="User growth"
            description="New and returning accounts per month."
            series={growthSeries.users}
            labels={catalogMonths}
          />
          <ChartCard
            title="Revenue trend"
            description="Store and subscription revenue combined."
            series={growthSeries.revenue}
            labels={catalogMonths}
          />
          <ChartCard
            title="Quiz activity"
            description="Plays and completions across all categories."
            series={growthSeries.activity}
            labels={catalogMonths}
          />
          <ChartCard
            title="Retention curve"
            description="Share of a cohort still active after N months."
            series={growthSeries.retention}
            labels={catalogMonths}
          />
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <ReportTable
            title="Top countries"
            description="Sessions by country for the selected window."
            rows={countries}
            primaryLabel="sessions"
            secondaryLabel="new users"
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
