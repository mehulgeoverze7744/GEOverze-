import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  GROWTH_NOTES,
  RANGES,
  TOP_CONTENT,
  TRAFFIC_SOURCES,
  metricsFor,
  type RangeId,
} from "../data/analytics";
import { MetricTile } from "../components/MetricTile";
import { BarSeries, ShareBars } from "../components/Sparkline";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel, StudioPanelHeader } from "../components/StudioPanel";
import { formatNumber, formatPercent, metricValue } from "../lib/format";

/** Performance dashboard. All series are placeholders. */
export function AnalyticsScreen() {
  const [range, setRange] = useState<RangeId>("30d");
  const metrics = metricsFor(range);
  const primary = metrics[0];

  return (
    <StudioShell>
      <StudioHeader
        eyebrow="Grow"
        title="Analytics"
        description="How your quizzes and articles perform across Let's Play, GEOlibrary and Community."
        actions={
          <div className="flex items-center rounded-lg border border-bronze/15 p-0.5">
            {RANGES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                aria-pressed={range === r.id}
                className={cn(
                  "rounded-md px-3 py-1.5 text-[0.72rem] transition-colors",
                  range === r.id
                    ? "bg-bronze/15 text-bronze-glow"
                    : "text-foreground/50 hover:text-foreground/80",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        }
      />

      <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-3">
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
            title={primary ? primary.label : "Activity"}
            hint={`Distribution across the selected ${RANGES.find((r) => r.id === range)?.label}`}
          />
          {primary ? <BarSeries points={primary.series} /> : null}
        </StudioPanel>

        <StudioPanel>
          <StudioPanelHeader title="Traffic sources" hint="Share of total plays" />
          <ShareBars points={TRAFFIC_SOURCES} />
        </StudioPanel>
      </div>

      <div className="mt-4 grid gap-4 [&>*]:min-w-0 lg:grid-cols-3">
        <StudioPanel className="lg:col-span-2" padded={false}>
          <div className="px-5 pt-5">
            <StudioPanelHeader title="Content performance" hint="Ranked by reach" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[38rem] text-left text-[0.82rem]">
              <thead>
                <tr className="border-y border-bronze/12 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
                  <th scope="col" className="px-5 py-3 font-medium">
                    Title
                  </th>
                  <th scope="col" className="px-3 py-3 font-medium">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">
                    Reach
                  </th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">
                    Completion
                  </th>
                  <th scope="col" className="px-3 py-3 text-right font-medium">
                    Avg. score
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium">
                    Trend
                  </th>
                </tr>
              </thead>
              <tbody>
                {TOP_CONTENT.map((row) => (
                  <tr key={row.id} className="border-b border-bronze/[0.07] last:border-0">
                    <td className="px-5 py-3 text-foreground/85">{row.title}</td>
                    <td className="px-3 py-3 text-foreground/50">{row.type}</td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground/70">
                      {formatNumber(row.plays)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground/70">
                      {formatPercent(row.completion)}
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums text-foreground/70">
                      {row.score === 0 ? "—" : formatPercent(row.score)}
                    </td>
                    <td
                      className={
                        row.trend >= 0
                          ? "px-5 py-3 text-right tabular-nums text-[oklch(0.86_0.12_150)]"
                          : "px-5 py-3 text-right tabular-nums text-[oklch(0.84_0.15_25)]"
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

        <StudioPanel>
          <StudioPanelHeader title="What moved" hint="Notable changes this period" />
          <ul className="space-y-4">
            {GROWTH_NOTES.map((note) => (
              <li key={note.id}>
                <div className="flex items-start justify-between gap-3">
                  <p className="text-[0.82rem] leading-snug text-foreground/80">{note.label}</p>
                  <span
                    className={cn(
                      "shrink-0 text-[0.75rem] tabular-nums",
                      note.delta >= 0
                        ? "text-[oklch(0.86_0.12_150)]"
                        : "text-[oklch(0.84_0.15_25)]",
                    )}
                  >
                    {note.delta >= 0 ? "+" : ""}
                    {note.delta.toFixed(1)}%
                  </span>
                </div>
                <p className="mt-1 text-[0.72rem] text-foreground/50">{note.detail}</p>
              </li>
            ))}
          </ul>
        </StudioPanel>
      </div>
    </StudioShell>
  );
}
