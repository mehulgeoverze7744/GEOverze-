import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { QUIZ_RUNS } from "@/features/history/data/history";
import { DEFAULT_FILTERS, filterRuns, type HistoryFilters } from "@/features/history/lib/filter";

import { AchievementGrid } from "./AchievementGrid";
import { HistoryRewardsTabs, type HistoryRewardsTab } from "./HistoryRewardsTabs";
import { QuizHistoryFilters } from "./QuizHistoryFilters";
import { QuizHistoryList } from "./QuizHistoryList";
import { RewardSummary } from "./RewardSummary";
import { StatsSummary } from "./StatsSummary";
import "../styles/history-rewards.css";

const routeApi = getRouteApi("/_app/quiz-history-and-rewards");

/** Unified quiz history, achievements and rewards experience. */
export function QuizHistoryAndRewardsPage() {
  const { tab } = routeApi.useSearch();
  const navigate = useNavigate({ from: "/quiz-history-and-rewards" });
  const [filters, setFilters] = useState<HistoryFilters>(DEFAULT_FILTERS);
  const [search, setSearch] = useState("");

  const runs = useMemo(() => {
    const filtered = filterRuns(QUIZ_RUNS, filters);
    const query = search.trim().toLowerCase();
    if (!query) return filtered;
    return filtered.filter((run) => run.title.toLowerCase().includes(query));
  }, [filters, search]);

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
