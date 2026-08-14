import { Coins, Swords, Target, Zap } from "lucide-react";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterChips } from "@/components/shared/FilterChips";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { StatGrid } from "@/components/shared/StatGrid";
import { Link } from "@tanstack/react-router";

import {
  MODE_FILTERS,
  QUIZ_RUNS,
  RANGE_FILTERS,
  RESULT_FILTERS,
  SORT_OPTIONS,
} from "../data/history";
import { DEFAULT_FILTERS, filterRuns, summarise, type HistoryFilters } from "../lib/filter";
import { QuizRunRow } from "./QuizRunRow";

/**
 * Filterable record of every quiz played.
 *
 * Rows are placeholder data until the quiz engine persists sessions; the
 * filtering and summary maths are real and bind unchanged to a backend list.
 */
export function QuizHistoryPage() {
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const runs = useMemo(() => filterRuns(QUIZ_RUNS, filters), [filters]);
  const summary = useMemo(() => summarise(runs), [runs]);

  const patch = <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <PageShell>
      <PageHeader
        eyebrow="Quiz history"
        title="Every expedition, on the record"
        description="Mode, score, duration, result and credits for each run. Figures are placeholder data until the quiz engine starts writing sessions."
      />

      <SectionContainer>
        <StatGrid
          stats={[
            { id: "runs", label: "Runs shown", value: summary.runs, icon: Zap },
            { id: "wins", label: "Wins", value: summary.wins, icon: Swords },
            {
              id: "accuracy",
              label: "Accuracy",
              value: summary.accuracy,
              suffix: "%",
              icon: Target,
            },
            { id: "credits", label: "Credits earned", value: summary.credits, icon: Coins },
          ]}
        />
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <GlassCard className="p-6 sm:p-7">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
              <FilterChips
                label="Mode"
                options={MODE_FILTERS}
                value={filters.mode}
                onChange={(id) => patch("mode", id)}
              />
              <FilterChips
                label="Result"
                options={RESULT_FILTERS}
                value={filters.result}
                onChange={(id) => patch("result", id)}
              />
              <FilterChips
                label="Timeframe"
                options={RANGE_FILTERS}
                value={filters.range}
                onChange={(id) => patch("range", id)}
              />
              <FilterChips
                label="Sort"
                options={SORT_OPTIONS}
                value={filters.sort}
                onChange={(id) => patch("sort", id)}
              />
            </div>
            <p className="mt-6 text-xs text-foreground/50" aria-live="polite">
              {runs.length} {runs.length === 1 ? "run" : "runs"} match your filters.
            </p>
          </GlassCard>
        </AnimatedSection>

        <div className="mt-6">
          {runs.length === 0 ? (
            <AnimatedSection>
              <EmptyState
                icon={Target}
                title="No runs match those filters"
                description="Try widening the timeframe or clearing the mode and result filters."
                action={
                  <GeoButton variant="primary" onClick={() => setFilters(DEFAULT_FILTERS)}>
                    Reset filters
                  </GeoButton>
                }
              />
            </AnimatedSection>
          ) : (
            <AnimatedSection>
              <GlassCard className="overflow-hidden">
                <div className="hidden grid-cols-[2.2fr_1fr_0.8fr_1.2fr_0.9fr_0.9fr_0.7fr] gap-4 border-b border-bronze/12 px-6 py-4 text-[0.58rem] uppercase tracking-[0.24em] text-foreground/50 lg:grid">
                  <span>Quiz</span>
                  <span>Mode</span>
                  <span>Score</span>
                  <span>Date</span>
                  <span>Time</span>
                  <span>Result</span>
                  <span className="text-right">Credits</span>
                </div>
                <ul className="divide-y divide-bronze/8">
                  {runs.map((run) => (
                    <QuizRunRow key={run.id} run={run} />
                  ))}
                </ul>
              </GlassCard>
            </AnimatedSection>
          )}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <GeoButton asChild variant="primary">
            <Link to="/play">Play another</Link>
          </GeoButton>
          <GeoButton asChild variant="secondary">
            <Link to="/progress">View progress</Link>
          </GeoButton>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
