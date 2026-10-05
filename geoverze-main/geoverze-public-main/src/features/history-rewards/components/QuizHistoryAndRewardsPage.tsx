import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";
import type { DashboardQuizAttempt } from "@/features/dashboard/data/fetchDashboardQuizAttempts";
import { QUIZ_HISTORY_LIMIT } from "@/features/dashboard/data/fetchDashboardQuizAttempts";
import { useDashboardQuizAttempts } from "@/features/dashboard/hooks/useDashboardQuizAttempts";
import { type QuizMode, type QuizRun } from "@/features/history/data/history";
import { DEFAULT_FILTERS, filterRuns, type HistoryFilters } from "@/features/history/lib/filter";

import { AchievementGrid } from "./AchievementGrid";
import { HistoryRewardsTabs, type HistoryRewardsTab } from "./HistoryRewardsTabs";
import { QuizHistoryFilters } from "./QuizHistoryFilters";
import { QuizHistoryList } from "./QuizHistoryList";
import { RewardSummary } from "./RewardSummary";
import { StatsSummary } from "./StatsSummary";
import "../styles/history-rewards.css";

const routeApi = getRouteApi("/_app/quiz-history-and-rewards");

function toHistoryMode(mode: string): QuizMode {
  const normalized = mode.toLowerCase();
  if (normalized === "pvp") return "pvp";
  if (normalized === "multiplayer") return "multiplayer";
  if (normalized === "daily") return "daily";
  return "solo";
}

function toHistoryRun(attempt: DashboardQuizAttempt): QuizRun {
  return {
    id: attempt.id,
    title: attempt.title,
    mode: toHistoryMode(attempt.mode),
    score: attempt.score,
    total: attempt.total,
    playedAt: attempt.completedAt,
    duration: Math.max(0, Math.round(attempt.durationMs / 1000)),
    result: "complete",
    credits: attempt.creditsEarned,
  };
}

/** Unified quiz history, achievements and rewards experience. */
export function QuizHistoryAndRewardsPage() {
  const { tab: rawTab } = routeApi.useSearch();
  const tab: HistoryRewardsTab =
    rawTab === "achievements" || rawTab === "rewards" ? rawTab : "history";
  const navigate = useNavigate({ from: "/quiz-history-and-rewards" });
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");
  const { attempts, loading } = useDashboardQuizAttempts(QUIZ_HISTORY_LIMIT);

  const runs = useMemo(() => {
    const history = attempts.map(toHistoryRun);
    const filtered = filterRuns(history, filters);
    const query = search.trim().toLowerCase();
    if (!query) return filtered;
    return filtered.filter((run) => run.title.toLowerCase().includes(query));
  }, [attempts, filters, search]);

  const setTab = (next: HistoryRewardsTab) => {
    void navigate({ search: { tab: next }, replace: true });
  };

  const patch = <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) =>
    setFilters((prev) => ({ ...prev, [key]: value }));

  return (
    <PageShell>
      <SectionContainer size="default" className="hr-page max-w-[78rem]">
        <header className="hr-header">
          <AnimatedSection>
            <p className="hr-eyebrow">Quiz history &amp; rewards</p>
            <h1 className="hr-title">Your journey, recorded.</h1>
            <p className="hr-description">
              Every expedition, milestone and reward in one place.
            </p>
          </AnimatedSection>
        </header>

        <StatsSummary />

        <HistoryRewardsTabs active={tab} onChange={setTab} />

        <div
          role="tabpanel"
          id={`hr-panel-${tab}`}
          aria-labelledby={`hr-tab-${tab}`}
        >
          {tab === "history" ? (
            <AnimatedSection>
              {loading ? (
                <p className="text-sm text-foreground/45">Loading your quiz history…</p>
              ) : (
                <>
                  <QuizHistoryFilters
                    filters={filters}
                    onChange={patch}
                    search={search}
                    onSearchChange={setSearch}
                    resultCount={runs.length}
                  />
                  <QuizHistoryList
                    runs={runs}
                    onResetFilters={() => {
                      setFilters(DEFAULT_FILTERS);
                      setSearch("");
                    }}
                  />
                </>
              )}
            </AnimatedSection>
          ) : null}

          {tab === "achievements" ? (
            <AnimatedSection>
              <AchievementGrid />
            </AnimatedSection>
          ) : null}

          {tab === "rewards" ? (
            <AnimatedSection>
              <RewardSummary />
            </AnimatedSection>
          ) : null}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
