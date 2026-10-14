import { Lock } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  ComingSoon,
  EmptyState,
  PageHeader,
  SectionContainer,
  StatCard,
  AnimatedSection,
} from "@/components/shared";
import { leaderboardStats } from "../data/standings";
import { isLeaderboardAvailable } from "../lib/availability";

/** Leaderboard module landing page. */
export function LeaderboardPage() {
  if (!isLeaderboardAvailable()) {
    return (
      <PageShell>
        <PageHeader
          eyebrow={
            <span className="inline-flex items-center gap-2">
              <Lock className="h-3.5 w-3.5 text-bronze" strokeWidth={2} aria-hidden />
              Leaderboard
              <span className="text-[0.58rem] uppercase tracking-[0.16em] text-bronze/70">
                Coming soon
              </span>
            </span>
          }
          title="Standings, seasons and streaks"
          description="Rankings will be computed from live results once competitive standings go live — accuracy, speed and consistency each carry weight."
          breadcrumb={[{ label: "Home", to: "/" }, { label: "Leaderboard" }]}
        />
        <ComingSoon
          label="Coming soon"
          title="The global board is locked"
          description="Season standings, player ranks and accuracy tables stay hidden until the leaderboard is active. Existing ranking logic remains in place for when this module opens."
          highlights={[
            {
              title: "Live ranks",
              description: "Accuracy, speed and consistency each carry weight.",
            },
            {
              title: "Season resets",
              description: "Tiers and archives activate with competitive play.",
            },
            {
              title: "Your place",
              description: "Personal standing appears here once results are live.",
            },
          ]}
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHeader
        eyebrow="Leaderboard"
        title="Standings, seasons and streaks"
        description="Rankings will be computed from live results once the quiz engine ships — accuracy, speed and consistency each carry weight."
        breadcrumb={[{ label: "Home", to: "/" }, { label: "Leaderboard" }]}
      />

      <section className="pb-[var(--space-section-sm)]">
        <SectionContainer size="wide">
          <div className="grid gap-5 sm:grid-cols-3">
            {leaderboardStats.map((stat, i) => (
              <AnimatedSection key={stat.label} delay={i * 90}>
                <StatCard value={stat.value} label={stat.label} hint={stat.hint} />
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection className="mt-10">
            <EmptyState
              icon={Lock}
              title="No standings yet"
              description="The first season begins when live rounds go online. Rankings will populate automatically from played results."
            />
          </AnimatedSection>
        </SectionContainer>
      </section>

      <ComingSoon
        title="Ranking is wired to the quiz engine"
        description="Season resets, tiers and historical archives depend on match results, so the leaderboard activates alongside gameplay."
      />
    </PageShell>
  );
}
