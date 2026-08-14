import { Trophy } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  ComingSoon,
  EmptyState,
  PageHeader,
  SectionContainer,
  StatCard,
} from "@/components/shared";
import { leaderboardStats } from "../data/standings";

/** Leaderboard module landing page. */
export function LeaderboardPage() {
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
              icon={Trophy}
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
