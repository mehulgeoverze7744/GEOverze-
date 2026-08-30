import { Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Flame, Gift, Trophy } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { ChallengeCard } from "../components/ChallengeCard";
import { CreditBalanceSummary } from "../components/CreditBalanceSummary";
import { CreditRulesCard } from "../components/CreditRulesCard";
import { LevelLadder } from "../components/LevelLadder";
import { MonthlyProgressCard } from "../components/MonthlyProgressCard";
import { PlayerSummaryCard } from "../components/PlayerSummaryCard";
import { ProgressionNav } from "../components/ProgressionNav";
import { StreakCalendar } from "../components/StreakCalendar";
import { DAILY_CHALLENGES } from "../data/challenges";
import { XP_RULES } from "../data/xpRules";
import { useCreditHistory } from "../hooks/useCreditHistory";
import { useProgressionStore } from "@/stores/progressionStore";

const SHORTCUTS = [
  { to: "/play/rewards", label: "Reward catalogue", icon: Gift } as const,
  { to: "/play/level-system", label: "Level system", icon: Trophy } as const,
  { to: "/play/streak", label: "Streak tracker", icon: Flame } as const,
  { to: "/play/credit-history", label: "Credit history", icon: Coins } as const,
];

/** /play/progression — the progression command centre. */
export function ProgressionHub() {
  const player = useProgressionStore((s) => s.player);
  const { monthlyEarned } = useCreditHistory();

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Progression</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Every round moves you forward
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Levels, XP, credits, streaks and challenges in one place. XP and credits sync from your
            account when signed in; daily and weekly challenges are still illustrative.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <PlayerSummaryCard player={player} />
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection className="grid gap-4">
            <CreditBalanceSummary />
            <MonthlyProgressCard monthlyEarned={monthlyEarned} />
          </AnimatedSection>
          <AnimatedSection delay={80} className="grid gap-4">
            <StreakCalendar />
            <div className="grid grid-cols-2 gap-3">
              {SHORTCUTS.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="game-surface game-lift flex items-center justify-between gap-3 rounded-2xl p-4 text-sm font-medium text-foreground/80"
                >
                  <span className="inline-flex items-center gap-2">
                    <item.icon
                      className="h-4 w-4 text-bronze/90"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {item.label}
                  </span>
                  <ArrowRight
                    className="h-3.5 w-3.5 text-bronze/90"
                    strokeWidth={2}
                    aria-hidden="true"
                  />
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Experience"
            title="How XP is earned"
            description="The full earning table, exactly as the engine will award it."
          />
        </AnimatedSection>
        <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {XP_RULES.map((rule, index) => (
            <AnimatedSection key={rule.id} delay={index * 40}>
              <GameCard interactive={false} className="h-full p-5">
                <rule.icon
                  className="h-4 w-4 text-bronze/90"
                  strokeWidth={1.9}
                  aria-hidden="true"
                />
                <p className="mt-4 text-sm font-semibold text-foreground">{rule.label}</p>
                <p className="mt-1 text-base font-semibold text-bronze-glow">{rule.amount}</p>
                <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                  {rule.description}
                </p>
              </GameCard>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <SectionHeading as="h2" eyebrow="Credits" title="The official credit rules" />
            <div className="mt-6">
              <CreditRulesCard />
            </div>
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <SectionHeading
              as="h2"
              eyebrow="Levels"
              title="Your ladder"
              action={
                <GeoButton asChild variant="ghost">
                  <Link to="/play/level-system">All levels</Link>
                </GeoButton>
              }
            />
            <div className="mt-6">
              <LevelLadder currentLevel={player.level} />
            </div>
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Today"
            title="Daily challenges"
            description="Reset every midnight. Progress is illustrative."
            action={
              <GeoButton asChild variant="ghost">
                <Link to="/play/daily-challenges">View all</Link>
              </GeoButton>
            }
          />
        </AnimatedSection>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DAILY_CHALLENGES.slice(0, 3).map((challenge, index) => (
            <AnimatedSection key={challenge.id} delay={index * 60}>
              <ChallengeCard challenge={challenge} />
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
