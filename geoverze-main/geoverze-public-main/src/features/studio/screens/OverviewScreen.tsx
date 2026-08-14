import { Link } from "@tanstack/react-router";
import { FileText, ListChecks, Plus, Upload } from "lucide-react";

import { GeoButton } from "@/components/shared/GeoButton";
import { STUDIO_ARTICLES } from "../data/articles";
import { CREATOR } from "../data/creator";
import { STUDIO_QUIZZES } from "../data/quizzes";
import { TOP_CONTENT, TRAFFIC_SOURCES, metricsFor } from "../data/analytics";
import { AUDIENCE_SUMMARY } from "../data/audience";
import { EARNINGS_SUMMARY } from "../data/earnings";
import { CoverThumb } from "../components/CoverThumb";
import { MetricTile } from "../components/MetricTile";
import { ShareBars } from "../components/Sparkline";
import { StatusPill } from "../components/StatusPill";
import { StudioContext } from "../components/StudioContext";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel, StudioPanelHeader } from "../components/StudioPanel";
import {
  formatMoney,
  formatNumber,
  formatPercent,
  formatRelative,
  metricValue,
} from "../lib/format";

/** Studio home: what happened, what needs attention, what to do next. */
export function OverviewScreen() {
  const metrics = metricsFor("30d").slice(0, 4);
  const drafts = [...STUDIO_QUIZZES, ...STUDIO_ARTICLES]
    .filter((c) => c.status === "draft" || c.status === "rejected")
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 4);

  const firstName = CREATOR.name.split(" ")[0];

  return (
    <StudioShell context={<StudioContext />}>
      <StudioHeader
        eyebrow="Workspace"
        title={`Good to see you, ${firstName}`}
        description="Everything you have published, everything in flight, and how it is performing across the GEOverze universe."
        actions={
          <>
            <GeoButton asChild size="sm" variant="secondary">
              <Link to="/studio/articles/new">New article</Link>
            </GeoButton>
            <GeoButton asChild size="sm" variant="primary" className="gap-2">
              <Link to="/studio/quizzes/new">
                <Plus className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
                New quiz
              </Link>
            </GeoButton>
          </>
        }
      />

      <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((m) => (
          <MetricTile
            key={m.id}
            label={m.label}
            value={metricValue(m.value, m.format)}
            deltaPercent={m.deltaPercent}
            series={m.series}
          />
        ))}
      </div>

      <div className="mt-4 grid gap-4 [&>*]:min-w-0 lg:grid-cols-3">
        <StudioPanel className="lg:col-span-2">
          <StudioPanelHeader
            title="Top performing content"
            hint="Last 30 days across quizzes and articles"
            action={
              <Link
                to="/studio/analytics"
                className="text-[0.75rem] text-bronze underline-offset-4 hover:underline"
              >
                Full analytics
              </Link>
            }
          />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-[0.82rem]">
              <thead>
                <tr className="border-b border-bronze/12 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
                  <th scope="col" className="py-2 font-medium">
                    Title
                  </th>
                  <th scope="col" className="py-2 font-medium">
                    Type
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Plays
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Completion
                  </th>
                  <th scope="col" className="py-2 text-right font-medium">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {TOP_CONTENT.map((row) => (
                  <tr key={row.id} className="border-b border-bronze/[0.07] last:border-0">
                    <td className="py-3 pr-4 text-foreground/85">{row.title}</td>
                    <td className="py-3 pr-4 text-foreground/50">{row.type}</td>
                    <td className="py-3 text-right tabular-nums text-foreground/70">
                      {formatNumber(row.plays)}
                    </td>
                    <td className="py-3 text-right tabular-nums text-foreground/70">
                      {formatPercent(row.completion)}
                    </td>
                    <td
                      className={
                        row.trend >= 0
                          ? "py-3 text-right tabular-nums text-[oklch(0.86_0.12_150)]"
                          : "py-3 text-right tabular-nums text-[oklch(0.84_0.15_25)]"
                      }
                    >
                      {row.trend >= 0 ? "+" : ""}
                      {row.trend.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </StudioPanel>

        <div className="space-y-4">
          <StudioPanel>
            <StudioPanelHeader title="Where plays come from" />
            <ShareBars points={TRAFFIC_SOURCES} />
          </StudioPanel>

          <StudioPanel>
            <StudioPanelHeader title="This month" />
            <dl className="space-y-3 text-[0.82rem]">
              <div className="flex items-baseline justify-between">
                <dt className="text-foreground/50">Followers</dt>
                <dd className="tabular-nums text-foreground/85">
                  {formatNumber(AUDIENCE_SUMMARY.followers)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-foreground/50">New followers</dt>
                <dd className="tabular-nums text-foreground/85">
                  +{formatNumber(AUDIENCE_SUMMARY.newThisMonth)}
                </dd>
              </div>
              <div className="flex items-baseline justify-between">
                <dt className="text-foreground/50">Available balance</dt>
                <dd className="tabular-nums text-bronze-glow">
                  {formatMoney(EARNINGS_SUMMARY.availableBalance)}
                </dd>
              </div>
            </dl>
          </StudioPanel>
        </div>
      </div>

      <div className="mt-4 grid gap-4 [&>*]:min-w-0 lg:grid-cols-2">
        <StudioPanel>
          <StudioPanelHeader
            title="Pick up where you left off"
            hint="Drafts and items needing changes"
          />
          <ul className="space-y-3">
            {drafts.map((item) => {
              const isQuiz = "questions" in item;
              return (
                <li key={item.id}>
                  <Link
                    to={isQuiz ? "/studio/quizzes/$quizId" : "/studio/articles/$articleId"}
                    params={isQuiz ? { quizId: item.id } : { articleId: item.id }}
                    className="flex items-center gap-3 rounded-lg border border-transparent p-2 transition-colors hover:border-bronze/20 hover:bg-bronze/[0.05]"
                  >
                    <CoverThumb
                      artKey={isQuiz ? (item as { coverKey: string }).coverKey : item.coverKey}
                      label={item.title}
                      className="h-11 w-16 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[0.85rem] font-medium text-foreground/85">
                        {item.title || "Untitled draft"}
                      </p>
                      <p className="mt-0.5 flex items-center gap-1.5 text-[0.72rem] text-foreground/50">
                        {isQuiz ? (
                          <ListChecks className="h-3 w-3" strokeWidth={2} aria-hidden />
                        ) : (
                          <FileText className="h-3 w-3" strokeWidth={2} aria-hidden />
                        )}
                        {isQuiz ? "Quiz" : "Article"} · edited {formatRelative(item.updatedAt)}
                      </p>
                    </div>
                    <StatusPill status={item.status} />
                  </Link>
                </li>
              );
            })}
          </ul>
        </StudioPanel>

        <StudioPanel>
          <StudioPanelHeader title="Quick actions" hint="The four things creators do most" />
          <div className="grid gap-3 [&>*]:min-w-0 sm:grid-cols-2">
            {[
              { to: "/studio/quizzes/new" as const, label: "Build a quiz", icon: ListChecks },
              { to: "/studio/articles/new" as const, label: "Write an article", icon: FileText },
              { to: "/studio/media" as const, label: "Upload media", icon: Upload },
              { to: "/studio/audience" as const, label: "Review audience", icon: Plus },
            ].map((action) => (
              <Link
                key={action.to}
                to={action.to}
                className="flex items-center gap-3 rounded-lg border border-bronze/12 px-4 py-3.5 text-[0.82rem] text-foreground/75 transition-all motion-fast hover:border-bronze/40 hover:text-bronze-glow"
              >
                <action.icon className="h-4 w-4 text-bronze/90" strokeWidth={1.8} aria-hidden />
                {action.label}
              </Link>
            ))}
          </div>
        </StudioPanel>
      </div>
    </StudioShell>
  );
}
