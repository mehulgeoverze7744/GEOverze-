import { Link } from "@tanstack/react-router";
import { ArrowRight, Coins, Flame, Gift, Lock } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedSection,
  ComingSoon,
  GeoButton,
  SectionContainer,
  SectionHeading,
} from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { useProgressionStore } from "@/stores/progressionStore";
import { ChallengeCard } from "../components/ChallengeCard";
import { CreditBalanceSummary } from "../components/CreditBalanceSummary";
import { CreditRulesCard } from "../components/CreditRulesCard";
import { MonthlyProgressCard } from "../components/MonthlyProgressCard";
import { PlayerSummaryCard } from "../components/PlayerSummaryCard";
import { ProgressionNav } from "../components/ProgressionNav";
import { StreakCalendar } from "../components/StreakCalendar";
import { DAILY_CHALLENGES } from "../data/challenges";
import { XP_RULES } from "../data/xpRules";
import { useCreditHistory } from "../hooks/useCreditHistory";
import { isDailyChallengesAvailable } from "../lib/availability";

const SHORTCUTS = [
  {
    to: "/quiz-history-and-rewards" as const,
    search: { tab: "rewards" as const },
    label: "Reward catalogue",
    icon: Gift,
  },
  { to: "/play/streak" as const, label: "Streak tracker", icon: Flame },
  { to: "/play/credit-history" as const, label: "Credit history", icon: Coins },
];

/** /play/progression — the progression command centre. */
export function ProgressionHub() {
  const player = useProgressionStore((s) => s.player);
  const { monthlyEarned } = useCreditHistory();
  const dailyLocked = !isDailyChallengesAvailable();

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Progression</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Every round moves you forward
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            XP, credits, streaks and challenges in one place. XP and credits sync from your account
            when signed in. Daily and weekly challenges stay locked until those modules open.
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
                  key={item.label}
                  to={item.to}
                  {...("search" in item && item.search !== undefined
                    ? { search: item.search }
                    : {})}
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
        <AnimatedSection>
          <SectionHeading as="h2" eyebrow="Credits" title="The official credit rules" />
          <div className="mt-6 max-w-3xl">
            <CreditRulesCard />
          </div>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Today"
            title="Daily challenges"
            description="Reset every midnight. Progress is illustrative."
            action={
              dailyLocked ? (
                <span
                  aria-disabled="true"
                  className="inline-flex items-center gap-1.5 text-[0.62rem] uppercase tracking-[0.18em] text-bronze/70"
                >
                  <Lock className="h-3 w-3" strokeWidth={2} aria-hidden />
                  Coming soon
                </span>
              ) : (
                <GeoButton asChild variant="ghost">
                  <Link to="/play/daily-challenges">View all</Link>
                </GeoButton>
              )
            }
          />
        </AnimatedSection>
        {dailyLocked ? (
          <ComingSoon
            label="Coming soon"
            title="Daily challenges are locked"
            description="Illustrative objectives stay hidden until midnight resets go live."
          />
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DAILY_CHALLENGES.slice(0, 3).map((challenge, index) => (
              <AnimatedSection key={challenge.id} delay={index * 60}>
                <ChallengeCard challenge={challenge} />
              </AnimatedSection>
            ))}
          </div>
        )}
      </SectionContainer>
    </PageShell>
  );
}
