import type { ReactNode } from "react";
import { Clock, Crosshair, Flame, Globe2, ListChecks, Target, Zap } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import { cn } from "@/lib/utils";

import { useExplorerAnalytics } from "../lib/explorerAnalytics";

function AnalyticsCard({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-bronze/16 bg-charcoal/28 p-5 backdrop-blur-sm sm:p-6",
        className,
      )}
    >
      {children}
    </div>
  );
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
      <h3 className="text-[0.62rem] font-semibold uppercase tracking-[0.26em] text-foreground/55">
        {title}
      </h3>
      {subtitle ? <p className="mt-1.5 text-xs text-foreground/45">{subtitle}</p> : null}
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
    <div className="explorer-analytics-hero-metric rounded-xl border border-bronze/14 bg-charcoal/35 px-4 py-5 sm:px-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[0.58rem] font-semibold uppercase tracking-[0.24em] text-foreground/50">
          {label}
        </p>
        <Icon className="h-3.5 w-3.5 shrink-0 text-bronze/80" strokeWidth={1.5} aria-hidden="true" />
      </div>
      <p className="mt-3 text-[clamp(1.35rem,2.4vw,1.85rem)] font-light leading-none text-gradient-bronze">
        {detail ? (
          <>
            <AnimatedCounter value={value} decimals={decimals} />
            <span className="text-[0.72em] text-foreground/45">{suffix}</span>
          </>
        ) : (
          <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
        )}
      </p>
      {detail ? <p className="mt-2 text-xs text-foreground/45">{detail}</p> : null}
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
              <span className="text-sm text-foreground/80">{mode.label}</span>
              <span className="text-xs tabular-nums text-foreground/50">{mode.wins} wins</span>
            </div>
            <ProgressBarFill
              value={pct}
              label={`${mode.label} wins`}
              valueText={`${mode.wins} wins`}
              size="sm"
            />
          </div>
        );
      })}
      <p className="pt-2 text-xs text-foreground/45">
        Overall win rate{" "}
        <span className="tabular-nums text-bronze/90">{winRate.toFixed(1)}%</span> across duels and
        multiplayer.
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
            className="mt-2 text-[clamp(1.35rem,2.8vw,1.75rem)] font-light tracking-tight text-foreground"
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
              <div className="rounded-xl border border-bronze/12 bg-charcoal/30 px-4 py-4">
                <div className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em] text-foreground/45">
                  <ListChecks className="h-3.5 w-3.5 text-bronze/80" strokeWidth={1.5} />
                  Questions answered
                </div>
                <p className="mt-2 text-lg font-light text-foreground/85">
                  <AnimatedCounter value={data.supporting.questionsAnswered} />
                </p>
              </div>
              <div className="rounded-xl border border-bronze/12 bg-charcoal/30 px-4 py-4">
                <div className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em] text-foreground/45">
                  <Crosshair className="h-3.5 w-3.5 text-bronze/80" strokeWidth={1.5} />
                  Average score
                </div>
                <p className="mt-2 text-lg font-light text-foreground/85">
                  <AnimatedCounter
                    value={data.supporting.averageScore}
                    decimals={1}
                    suffix="%"
                  />
                </p>
              </div>
              <div className="rounded-xl border border-bronze/12 bg-charcoal/30 px-4 py-4 sm:col-span-2 lg:col-span-1">
                <div className="flex items-center gap-2 text-[0.58rem] uppercase tracking-[0.22em] text-foreground/45">
                  <Clock className="h-3.5 w-3.5 text-bronze/80" strokeWidth={1.5} />
                  Learning time
                </div>
                <p className="mt-2 text-lg font-light text-foreground/85">
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
