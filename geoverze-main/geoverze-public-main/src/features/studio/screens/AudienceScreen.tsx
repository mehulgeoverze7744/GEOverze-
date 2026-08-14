import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  AUDIENCE_SUMMARY,
  ENGAGEMENT_METRICS,
  FOLLOWERS,
  RECENT_SUBSCRIBERS,
  TOP_FANS,
} from "../data/audience";
import { MetricTile } from "../components/MetricTile";
import { StudioHeader, StudioShell } from "../components/StudioShell";
import { StudioPanel, StudioPanelHeader } from "../components/StudioPanel";
import { formatNumber, formatPercent, formatRelative } from "../lib/format";

const TIERS = ["all", "Explorer", "Navigator", "Cartographer"] as const;

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("");
}

/** Audience view: who follows you and how deeply they engage. */
export function AudienceScreen() {
  const [tier, setTier] = useState<(typeof TIERS)[number]>("all");
  const followers = FOLLOWERS.filter((f) => tier === "all" || f.tier === tier);

  return (
    <StudioShell
      context={
        <div className="space-y-4">
          <StudioPanel>
            <StudioPanelHeader title="Top supporters" hint="Most active followers" />
            <ul className="space-y-3">
              {TOP_FANS.map((fan) => (
                <li key={fan.id} className="flex items-center gap-3">
                  <span
                    aria-hidden
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-bronze/25 bg-bronze/10 text-[0.68rem] font-semibold text-bronze-glow"
                  >
                    {initials(fan.name)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[0.8rem] text-foreground/85">{fan.name}</p>
                    <p className="text-[0.7rem] text-foreground/50">
                      {fan.quizzesPlayed} plays · {fan.articlesRead} reads
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </StudioPanel>

          <StudioPanel>
            <StudioPanelHeader title="Newest followers" />
            <ul className="space-y-2.5">
              {RECENT_SUBSCRIBERS.map((f) => (
                <li key={f.id} className="flex items-baseline justify-between gap-3 text-[0.78rem]">
                  <span className="truncate text-foreground/75">@{f.handle}</span>
                  <span className="shrink-0 text-foreground/50">
                    {formatRelative(f.followedAt)}
                  </span>
                </li>
              ))}
            </ul>
          </StudioPanel>
        </div>
      }
    >
      <StudioHeader
        eyebrow="Grow"
        title="Audience"
        description="The explorers following your work, and how they move through it."
      />

      <div className="grid gap-4 [&>*]:min-w-0 sm:grid-cols-2 xl:grid-cols-4">
        <MetricTile
          label="Followers"
          value={formatNumber(AUDIENCE_SUMMARY.followers)}
          deltaPercent={6.9}
        />
        <MetricTile
          label="New this month"
          value={`+${formatNumber(AUDIENCE_SUMMARY.newThisMonth)}`}
          deltaPercent={11.4}
        />
        <MetricTile
          label="Active readers"
          value={formatNumber(AUDIENCE_SUMMARY.activeReaders)}
          hint="Opened something in the last 30 days"
        />
        <MetricTile
          label="Repeat play rate"
          value={formatPercent(AUDIENCE_SUMMARY.repeatPlayRate)}
          deltaPercent={2.2}
        />
      </div>

      <div className="mt-4 grid gap-4 [&>*]:min-w-0 lg:grid-cols-4">
        {ENGAGEMENT_METRICS.map((m) => (
          <StudioPanel key={m.id}>
            <p className="text-[0.72rem] uppercase tracking-[0.16em] text-foreground/50">
              {m.label}
            </p>
            <p className="mt-2.5 text-[1.35rem] font-semibold leading-none text-foreground">
              {m.value}
            </p>
            <p className="mt-2 text-[0.75rem] text-foreground/50">{m.hint}</p>
          </StudioPanel>
        ))}
      </div>

      <StudioPanel className="mt-4" padded={false}>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 pt-5">
          <StudioPanelHeader
            title="Followers"
            hint={`${followers.length} shown`}
            className="mb-0"
          />
          <div className="flex flex-wrap gap-1.5">
            {TIERS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTier(t)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-[0.72rem] transition-colors",
                  tier === t
                    ? "border-bronze/60 bg-bronze/12 text-bronze-glow"
                    : "border-bronze/12 text-foreground/50 hover:border-bronze/30 hover:text-foreground/80",
                )}
              >
                {t === "all" ? "All tiers" : t}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[38rem] text-left text-[0.82rem]">
            <thead>
              <tr className="border-y border-bronze/12 text-[0.68rem] uppercase tracking-[0.16em] text-foreground/50">
                <th scope="col" className="px-5 py-3 font-medium">
                  Explorer
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Tier
                </th>
                <th scope="col" className="px-3 py-3 font-medium">
                  Country
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium">
                  Plays
                </th>
                <th scope="col" className="px-3 py-3 text-right font-medium">
                  Reads
                </th>
                <th scope="col" className="px-5 py-3 text-right font-medium">
                  Followed
                </th>
              </tr>
            </thead>
            <tbody>
              {followers.map((f) => (
                <tr key={f.id} className="border-b border-bronze/[0.07] last:border-0">
                  <td className="px-5 py-3">
                    <p className="text-foreground/85">{f.name}</p>
                    <p className="text-[0.7rem] text-foreground/50">@{f.handle}</p>
                  </td>
                  <td className="px-3 py-3 text-foreground/55">{f.tier}</td>
                  <td className="px-3 py-3 text-foreground/55">{f.country}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground/70">
                    {f.quizzesPlayed}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums text-foreground/70">
                    {f.articlesRead}
                  </td>
                  <td className="px-5 py-3 text-right text-foreground/50">
                    {formatRelative(f.followedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </StudioPanel>
    </StudioShell>
  );
}
