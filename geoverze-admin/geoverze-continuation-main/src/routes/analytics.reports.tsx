import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";

import { ChartCard, PageBody, PageHeader, StatCard, StatGrid } from "@/components/shared";
import { Button } from "@/components/ui/button";
import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { biReports, growthSeries } from "@/features/ops/data";
import { emptyBiFilters } from "@/features/ops/types";
import { ReportTable } from "@/features/ops/report-table";
import { creatorRecords } from "@/features/creators/data";
import { quizRecords, summarizeQuizzes } from "@/features/quizzes/data";
import { subscribers, summarizeSubscriptions } from "@/features/subscriptions/data";
import { catalogMonths, quizCategories, regions } from "@/lib/catalog";
import { money, num } from "@/lib/format";
import { notReadyNow } from "@/lib/placeholder";

export const Route = createFileRoute("/analytics/reports")({
  head: () => ({
    meta: [
      { title: "Business Intelligence — GEOverze Analytics" },
      {
        name: "description",
        content: "Custom reporting across usage, geography, creator performance and monetization.",
      },
      { property: "og:title", content: "Business Intelligence — GEOverze Analytics" },
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

  const creatorRows = useMemo(
    () =>
      [...creatorRecords]
        .sort((a, b) => b.publishedQuizzes - a.publishedQuizzes)
        .slice(0, 10)
        .map((creator) => ({
          id: creator.id,
          label: creator.displayName,
          primary: creator.publishedQuizzes,
          secondary: Math.round(creator.rating * 100),
          change: Math.round((creator.rating - 4) * 100) / 10,
          meta: creator.tier,
        })),
    [],
  );

  const quizRows = useMemo(
    () =>
      [...quizRecords]
        .sort((a, b) => b.plays - a.plays)
        .slice(0, 10)
        .map((quiz) => ({
          id: quiz.id,
          label: quiz.title,
          primary: quiz.plays,
          secondary: quiz.questionCount,
          change: Math.round((quiz.rating - 4) * 100) / 10,
          meta: quiz.category,
        })),
    [],
  );

  const quizSummary = useMemo(() => summarizeQuizzes(quizRecords), []);
  const subSummary = useMemo(() => summarizeSubscriptions(subscribers), []);

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
      id: "region",
      label: "Region",
      options: regions.map((region) => ({ value: region, label: region })),
    },
    {
      id: "category",
      label: "Category",
      options: quizCategories.map((category) => ({ value: category, label: category })),
    },
    {
      id: "subscription",
      label: "Plan",
      options: [
        { value: "Basic", label: "Basic" },
        { value: "Pro", label: "Pro" },
        { value: "Institution", label: "Institution" },
      ],
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
            onClick={() => notReadyNow("Scheduled reports arrive with the backend.")}
          >
            <Download className="size-4" aria-hidden="true" />
            Schedule report
          </Button>
        }
      />

      <PageBody gap="lg">
        <FilterBar filters={definitions} value={filters} onChange={setFilters} />

        <StatGrid columns={4} label="Reporting KPIs">
          <StatCard label="Quiz plays" value={num(quizSummary.total * 412)} delta={5.2} />
          <StatCard label="Completion rate" value="68.4%" delta={1.7} />
          <StatCard label="Avg. session" value="12m 40s" delta={2.4} />
          <StatCard label="ARPU" value={money(Math.round(subSummary.mrr / 100))} delta={3.3} />
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
                title="Daily active users"
                series={growthSeries.activity}
                labels={catalogMonths}
              />
              <ChartCard
                title="Retention by cohort month"
                series={growthSeries.retention}
                labels={catalogMonths}
              />
            </div>
            <ReportTable
              title="Quiz categories"
              rows={biReports.categories}
              primaryLabel="plays"
              secondaryLabel="completions"
            />
          </TabsContent>

          <TabsContent value="geography" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <ReportTable
                title="Countries"
                rows={biReports.countries}
                primaryLabel="sessions"
                secondaryLabel="new users"
                limit={10}
              />
              <ReportTable
                title="Regions"
                rows={biReports.regions}
                primaryLabel="sessions"
                secondaryLabel="new users"
              />
            </div>
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
            <ChartCard
              title="Creator growth"
              series={growthSeries.creators}
              labels={catalogMonths}
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
            <div className="grid gap-4 lg:grid-cols-2">
              <ReportTable
                title="GEOlibrary categories"
                rows={biReports.libraryCategories}
                primaryLabel="views"
                secondaryLabel="bookmarks"
              />
              <ChartCard
                title="Content publishing"
                series={growthSeries.quizzes}
                labels={catalogMonths}
              />
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="mt-4 space-y-4">
            <div className="grid gap-4 lg:grid-cols-2">
              <ChartCard title="Revenue" series={growthSeries.revenue} labels={catalogMonths} />
              <ReportTable
                title="Store categories"
                rows={biReports.storeCategories}
                primaryLabel="revenue"
                secondaryLabel="orders"
              />
            </div>
          </TabsContent>
        </Tabs>
      </PageBody>
    </>
  );
}
