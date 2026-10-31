import type { ReactNode } from "react";
import { Clock, Crosshair, Flame, Globe2, ListChecks, Target, Zap } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import { cn } from "@/lib/utils";

import { useExplorerAnalytics } from "../lib/explorerAnalytics";
import "../styles/explorer-analytics.css";

function AnalyticsCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return <div className={cn("explorer-analytics-card rounded-2xl p-5 sm:p-6", className)}>{children}</div>;
}

function PanelHeading({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <h3 className="explorer-analytics-panel-title text-[0.62rem] font-semibold uppercase tracking-[0.26em]">
        {title}
      </h3>
      {subtitle ? <p className="explorer-analytics-panel-sub mt-1.5 text-xs">{subtitle}</p> : null}
    </div>
  );
}

function HeroMetric({
  label,
  value,
  suffix = "",
  decimals = 0,
  icon: Icon,
  detail,
}: {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  detail?: string;
}) {
  return (
    <div className="explorer-analytics-hero-metric rounded-xl px-4 py-5 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <p className="explorer-analytics-hero-label text-[0.58rem] font-semibold uppercase tracking-[0.24em]">
          {label}
        </p>
        <Icon
          className="explorer-analytics-hero-icon h-3.5 w-3.5 shrink-0"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>
      <p className="explorer-analytics-hero-value mt-3 text-[clamp(1.35rem,2.4vw,1.85rem)] font-light leading-none">
        {detail ? (
          <>
            <AnimatedCounter value={value} decimals={decimals} />
            <span className="explorer-analytics-hero-suffix text-[0.72em]">{suffix}</span>
          </>
        ) : (
          <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
        )}
      </p>
      {detail ? <p className="explorer-analytics-hero-detail mt-2 text-xs">{detail}</p> : null}
    </div>
  );
}

function GameModeBars({
  modes,
  winRate,
}: {
  modes: { id: string; label: string; wins: number }[];
  winRate: number;
}) {
  const max = Math.max(...modes.map((m) => m.wins), 1);

  return (
    <div className="mt-6 space-y-4">
      {modes.map((mode) => {
        const pct = Math.round((mode.wins / max) * 100);
        return (
          <div key={mode.id}>
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <span className="explorer-analytics-mode-label text-sm">{mode.label}</span>
              <span className="explorer-analytics-mode-meta text-xs tabular-nums">{mode.wins} wins</span>
            </div>
            <ProgressBarFill
              className="explorer-analytics-progress"
              value={pct}
              label={`${mode.label} wins`}
              valueText={`${mode.wins} wins`}
              size="sm"
            />
          </div>
        );
      })}
      <p className="explorer-analytics-winrate pt-2 text-xs">
        Overall win rate{" "}
        <span className="explorer-analytics-winrate-value tabular-nums">{winRate.toFixed(1)}%</span> across
        duels and multiplayer.
      </p>
    </div>
  );
}

/** Premium explorer analytics for the profile page. */
export function ExplorerAnalytics() {
  const data = useExplorerAnalytics();

  return (
    <section className="explorer-analytics" aria-labelledby="explorer-analytics-heading">
      <AnimatedSection>
        <div className="mb-8">
          <p className="explorer-analytics-label">Explorer analytics</p>
          <h2
            id="explorer-analytics-heading"
            className="explorer-analytics-heading mt-2 text-[clamp(1.35rem,2.8vw,1.75rem)] font-light tracking-tight"
          >
            Your journey across the world, measured.
          </h2>
        </div>
      </AnimatedSection>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AnimatedSection delay={0}>
          <HeroMetric label="Total quizzes" value={data.hero.totalQuizzes} icon={Zap} />
        </AnimatedSection>
        <AnimatedSection delay={40}>
          <HeroMetric
            label="Accuracy"
            value={data.hero.accuracy}
            suffix="%"
            decimals={1}
            icon={Target}
          />
        </AnimatedSection>
        <AnimatedSection delay={80}>
          <HeroMetric
            label="Countries explored"
            value={data.hero.countriesExplored}
            icon={Globe2}
            detail={`of ${data.hero.countriesTotal}`}
          />
        </AnimatedSection>
        <AnimatedSection delay={120}>
          <HeroMetric
            label="Current streak"
            value={data.hero.currentStreak}
            suffix=" days"
            icon={Flame}
          />
        </AnimatedSection>
      </div>

      <AnimatedSection delay={100} className="mt-4">
        <AnalyticsCard>
          <PanelHeading title="Game mode performance" subtitle="Wins across expedition formats." />
          <div className="mt-2 grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(220px,1fr)] lg:items-end">
            <GameModeBars modes={data.gameModes} winRate={data.winRate} />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div className="explorer-analytics-inner rounded-xl px-4 py-4">
                <div className="explorer-analytics-inner-label flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em]">
                  <ListChecks className="explorer-analytics-inner-icon h-3.5 w-3.5" strokeWidth={1.5} />
                  Questions answered
                </div>
                <p className="explorer-analytics-inner-value mt-2 text-lg font-light">
                  <AnimatedCounter value={data.supporting.questionsAnswered} />
                </p>
              </div>
              <div className="explorer-analytics-inner rounded-xl px-4 py-4">
                <div className="explorer-analytics-inner-label flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em]">
                  <Crosshair className="explorer-analytics-inner-icon h-3.5 w-3.5" strokeWidth={1.5} />
                  Average score
                </div>
                <p className="explorer-analytics-inner-value mt-2 text-lg font-light">
                  <AnimatedCounter
                    value={data.supporting.averageScore}
                    decimals={1}
                    suffix="%"
                  />
                </p>
              </div>
              <div className="explorer-analytics-inner rounded-xl px-4 py-4 sm:col-span-2 lg:col-span-1">
                <div className="explorer-analytics-inner-label flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em]">
                  <Clock className="explorer-analytics-inner-icon h-3.5 w-3.5" strokeWidth={1.5} />
                  Learning time
                </div>
                <p className="explorer-analytics-inner-value mt-2 text-lg font-light">
                  <AnimatedCounter
                    value={data.supporting.hoursLearned}
                    decimals={data.supporting.hoursDecimals}
                    suffix="h"
                  />
                </p>
              </div>
            </div>
          </div>
        </AnalyticsCard>
      </AnimatedSection>
    </section>
  );
}
