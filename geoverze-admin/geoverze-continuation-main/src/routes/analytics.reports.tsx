import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { ChartCard, PageBody, PageHeader, StatCard, StatGrid } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { emptyBiFilters } from "@/features/ops/types";
import { ReportTable } from "@/features/ops/report-table";
import { fetchMappedCreators } from "@/features/creators/live";
import { fetchQuizzes } from "@/features/quizzes/data/fetchQuizzes";
import { fetchUsers } from "@/features/users/api";
import { useDashboard } from "@/features/dashboard/hooks";
import { adminKeys } from "@/lib/admin/keys";
import { useAdminQuery } from "@/lib/admin/hooks";
import { downloadCsv } from "@/lib/admin/csv";
import { quizCategories } from "@/lib/catalog";
import { moneyMinor, num } from "@/lib/format";

export const Route = createFileRoute("/analytics/reports")({
  head: () => ({
    meta: [
      { title: "Business Intelligence — GVRZE Analytics" },
      {
        name: "description",
        content: "Custom reporting across usage, geography, creator performance and monetization.",
      },
      { property: "og:title", content: "Business Intelligence — GVRZE Analytics" },
      {
        property: "og:description",
        content: "Usage, geography, creator performance and monetization reporting.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BusinessIntelligencePage,
});

function BusinessIntelligencePage() {
  const [filters, setFilters] = useState<Record<string, string[]>>({
    window: [emptyBiFilters.window],
  });
  const dash = useDashboard();
  const creators = useAdminQuery(adminKeys.creators, fetchMappedCreators);
  const quizzes = useAdminQuery(["admin", "quizzes"], fetchQuizzes);
  const users = useAdminQuery(adminKeys.users, fetchUsers);
  const categoryFilter = filters["category"]?.[0];

  const creatorRows = useMemo(
    () =>
      [...(creators.data ?? [])]
        .sort((a, b) => b.publishedQuizzes - a.publishedQuizzes)
        .slice(0, 10)
        .map((creator) => ({
          id: creator.id,
          label: creator.displayName,
          primary: creator.publishedQuizzes,
          secondary: Math.round(creator.rating * 100),
          change: 0,
          meta: creator.tier,
        })),
    [creators.data],
  );

  const quizRows = useMemo(
    () =>
      [...(quizzes.data ?? [])]
        .filter((quiz) => !categoryFilter || categoryFilter === "all" || quiz.category === categoryFilter)
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 10)
        .map((quiz) => ({
          id: quiz.id,
          label: quiz.title,
          primary: quiz.plays,
          secondary: quiz.questionCount,
          change: 0,
          meta: quiz.category,
        })),
    [categoryFilter, quizzes.data],
  );

  const countryRows = useMemo(
    () => {
      const counts = new Map<string, number>();
      for (const user of users.data ?? []) {
        counts.set(user.country || "—", (counts.get(user.country || "—") ?? 0) + 1);
      }
      return [...counts.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([label, primary]) => ({
          id: label,
          label,
          primary,
          secondary: 0,
          change: 0,
          meta: "",
        }));
    },
    [users.data],
  );

  const quizSummaryPlays = (quizzes.data ?? []).reduce((sum, quiz) => sum + quiz.plays, 0);
  const quizSummaryCount = quizzes.data?.length ?? 0;

  const definitions: FilterDefinition[] = [
    {
      id: "window",
      label: "Window",
      options: [
        { value: "7d", label: "Last 7 days" },
        { value: "30d", label: "Last 30 days" },
        { value: "90d", label: "Last 90 days" },
        { value: "12m", label: "Last 12 months" },
      ],
    },
    {
      id: "category",
      label: "Category",
      options: quizCategories.map((category) => ({ value: category, label: category })),
    },
  ];

  return (
    <>
      <PageHeader
        title="Business Intelligence"
        description="Slice platform performance by geography, category, creator and plan."
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              downloadCsv(
                "geoverze-bi-quizzes.csv",
                ["quiz", "plays", "questions", "category"],
                quizRows.map((row) => [row.label, row.primary, row.secondary, row.meta]),
              )
            }
          >
            <Download className="size-4" aria-hidden="true" />
            Schedule report
          </Button>
        }
      />

      <PageBody gap="lg">
        <FilterBar filters={definitions} value={filters} onChange={setFilters} />

        <StatGrid columns={4} label="Reporting KPIs">
          <StatCard label="Quiz plays" value={num(quizSummaryPlays)} />
          <StatCard label="Published quizzes" value={num(dash.metrics?.published_quizzes ?? quizSummaryCount)} />
          <StatCard label="Active subscriptions" value={num(dash.metrics?.active_subscriptions ?? 0)} />
          <StatCard label="Store revenue (30d)" value={moneyMinor(dash.metrics?.gstore_revenue_minor_30d ?? 0)} />
        </StatGrid>

        <Tabs defaultValue="usage">
          <TabsList className="flex-wrap">
            <TabsTrigger value="usage">Usage</TabsTrigger>
            <TabsTrigger value="geography">Geography</TabsTrigger>
            <TabsTrigger value="creators">Creators</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
          </TabsList>

          <TabsContent value="usage" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard
                title="Quiz attempts"
                series={(dash.growth?.attempts_by_day ?? []).map((row) => row.count)}
                labels={(dash.growth?.attempts_by_day ?? []).map((row) => row.day.slice(5, 10))}
                footnote="Live quiz_attempts by day"
              />
              <ChartCard
                title="New users"
                series={(dash.growth?.users_by_week ?? []).map((row) => row.count)}
                labels={(dash.growth?.users_by_week ?? []).map((row) => row.week.slice(5, 10))}
                footnote="Live profiles.created_at by week. No cohort-retention table exists."
              />
            </div>
            <ReportTable
              title="Quiz categories"
              rows={quizRows}
              primaryLabel="plays"
              secondaryLabel="questions"
            />
          </TabsContent>

          <TabsContent value="geography" className="mt-4 space-y-4">
            <ReportTable
              title="Countries"
              rows={countryRows}
              primaryLabel="users"
              secondaryLabel="n/a"
              limit={10}
            />
          </TabsContent>

          <TabsContent value="creators" className="mt-4 space-y-4">
            <ReportTable
              title="Creator performance"
              description="Ranked by published quizzes; secondary shows rating x100."
              rows={creatorRows}
              primaryLabel="quizzes"
              secondaryLabel="rating pts"
              limit={10}
            />
          </TabsContent>

          <TabsContent value="content" className="mt-4 space-y-4">
            <ReportTable
              title="Top quizzes"
              rows={quizRows}
              primaryLabel="plays"
              secondaryLabel="questions"
              limit={10}
            />
          </TabsContent>

          <TabsContent value="revenue" className="mt-4 space-y-4">
            <ChartCard
              title="Gstore revenue"
              series={(dash.growth?.gstore_revenue_by_week ?? []).map((row) => row.minor)}
              labels={(dash.growth?.gstore_revenue_by_week ?? []).map((row) => row.week.slice(5, 10))}
              footnote="Live Gstore paid totals by week"
            />
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
