import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, SectionContainer, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { MetaChip } from "@/features/play/components/Badges";
import { MonthlyProgressCard } from "../components/MonthlyProgressCard";
import { ProgressBarFill } from "../components/ProgressBarFill";
import { ProgressionNav } from "../components/ProgressionNav";
import { RewardCard } from "../components/RewardCard";
import { REWARD_SECTIONS, SEASON } from "../data/rewards";
import { useProgressionStore } from "@/stores/progressionStore";

/** /play/rewards */
export function RewardsPage() {
  const player = useProgressionStore((s) => s.player);

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Rewards</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            The GEOverze reward catalogue
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Credits, XP, achievements, merchandise, seasonal drops, mystery crates and platform
            rewards. Spending flows are not built yet.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <MonthlyProgressCard credits={player.credits} />
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <GameCard interactive={false} raised className="h-full">
              <div className="flex h-full flex-col p-6 sm:p-7">
                <MetaChip tone="bronze">
                  <SEASON.icon className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
                  Season
                </MetaChip>
                <p className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
                  {SEASON.name}
                </p>
                <p className="mt-2 text-[0.85rem] leading-relaxed text-foreground/60">
                  {SEASON.description}
                </p>
                <div className="mt-auto pt-8">
                  <div className="flex items-center justify-between text-xs text-foreground/50">
                    <span>Season track</span>
                    <span>{SEASON.progress}%</span>
                  </div>
                  <ProgressBarFill
                    className="mt-2"
                    size="lg"
                    value={SEASON.progress}
                    label="Season track progress"
                  />
                  <p className="mt-3 text-xs text-foreground/50">
                    {SEASON.daysLeft} days until the season reset (placeholder)
                  </p>
                </div>
              </div>
            </GameCard>
          </AnimatedSection>
        </div>
      </SectionContainer>

      {REWARD_SECTIONS.map((section) => (
        <SectionContainer key={section.id} className="mt-[var(--space-section)]">
          <AnimatedSection>
            <SectionHeading
              as="h2"
              eyebrow={section.title}
              title={section.title}
              description={section.description}
            />
          </AnimatedSection>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {section.rewards.map((reward, index) => (
              <AnimatedSection key={reward.id} delay={index * 60}>
                <RewardCard reward={reward} />
              </AnimatedSection>
            ))}
          </div>
        </SectionContainer>
      ))}
    </PageShell>
  );
}
