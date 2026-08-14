import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, SectionContainer } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";
import { LeaderboardRow } from "../components/LeaderboardRow";
import { ProgressionNav } from "../components/ProgressionNav";
import { LEADERBOARD_TABS, standingsFor, type LeaderboardScope } from "../data/standings";

/** /play/leaderboard — competitive standings with scope tabs. */
export function PlayLeaderboardPage() {
  const [scope, setScope] = useState<LeaderboardScope>("global");
  const rows = standingsFor(scope);

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Leaderboard</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Where you stand
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Placeholder standings across every scope. Live ranking arrives with the multiplayer
            service.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <div
            role="tablist"
            aria-label="Leaderboard scope"
            className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
          >
            {LEADERBOARD_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={scope === tab.id}
                onClick={() => setScope(tab.id)}
                className={cn(
                  "shrink-0 rounded-full border px-4 py-2 text-xs font-semibold transition-colors motion-snap",
                  scope === tab.id
                    ? "border-bronze/55 bg-bronze/15 text-bronze-glow"
                    : "border-bronze/15 bg-[oklch(0.185_0.008_62)] text-foreground/55 hover:text-foreground",
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-6">
          <GameCard interactive={false} raised>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left">
                <caption className="sr-only">{scope} leaderboard standings</caption>
                <thead>
                  <tr className="border-b border-bronze/15">
                    {["Rank", "Player", "Level", "XP", "Streak", "Accuracy"].map((head) => (
                      <th
                        key={head}
                        scope="col"
                        className="px-4 py-3 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-foreground/50"
                      >
                        {head}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <LeaderboardRow key={`${scope}-${row.username}`} row={row} />
                  ))}
                </tbody>
              </table>
            </div>
          </GameCard>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
