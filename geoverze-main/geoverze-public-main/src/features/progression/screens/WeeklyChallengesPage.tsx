import { CalendarRange } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, SectionContainer, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { ChallengeCard } from "../components/ChallengeCard";
import { ProgressBarFill } from "../components/ProgressBarFill";
import { ProgressionNav } from "../components/ProgressionNav";
import { WEEKLY_CHALLENGES } from "../data/challenges";

/** /play/weekly-challenges */
export function WeeklyChallengesPage() {
  const completed = WEEKLY_CHALLENGES.filter((c) => c.progress >= c.target).length;
  const pct = Math.round((completed / WEEKLY_CHALLENGES.length) * 100);

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Weekly challenges</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Bigger goals, bigger rewards
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Weekly objectives run Monday to Sunday and pay significantly more XP than dailies.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <GameCard interactive={false} raised>
            <div className="p-6 sm:p-8">
              <p className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-bronze/90">
                <CalendarRange className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
                This week
              </p>
              <p className="mt-4 text-xl font-semibold text-foreground">
                {completed} of {WEEKLY_CHALLENGES.length} objectives complete
              </p>
              <p className="mt-2 text-xs text-foreground/50">
                4 days remaining before the weekly reset (placeholder)
              </p>
              <ProgressBarFill
                className="mt-4 sm:max-w-sm"
                size="lg"
                value={pct}
                label="Weekly challenge completion"
              />
            </div>
          </GameCard>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <AnimatedSection>
          <SectionHeading eyebrow="Objectives" title="This week's set" />
        </AnimatedSection>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {WEEKLY_CHALLENGES.map((challenge, index) => (
            <AnimatedSection key={challenge.id} delay={index * 60}>
              <ChallengeCard challenge={challenge} />
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
