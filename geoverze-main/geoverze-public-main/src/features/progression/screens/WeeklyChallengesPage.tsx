import { CalendarRange, Lock } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, ComingSoon, SectionContainer, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { ChallengeCard } from "../components/ChallengeCard";
import { ProgressBarFill } from "../components/ProgressBarFill";
import { ProgressionNav } from "../components/ProgressionNav";
import { WEEKLY_CHALLENGES } from "../data/challenges";
import { isWeeklyChallengesAvailable } from "../lib/availability";

/** /play/weekly-challenges */
export function WeeklyChallengesPage() {
  const completed = WEEKLY_CHALLENGES.filter((c) => c.progress >= c.target).length;
  const pct = Math.round((completed / WEEKLY_CHALLENGES.length) * 100);
  const locked = !isWeeklyChallengesAvailable();

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow inline-flex items-center gap-2">
            {locked ? (
              <Lock className="h-3.5 w-3.5 text-bronze" strokeWidth={2} aria-hidden />
            ) : null}
            Weekly challenges
            {locked ? (
              <span className="text-[0.58rem] uppercase tracking-[0.16em] text-bronze/70">
                Coming soon
              </span>
            ) : null}
          </p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Bigger goals, bigger rewards
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            {locked
              ? "Weekly expeditions stay hidden until this module opens. Objective sets and bonus XP remain in place for launch."
              : "Weekly objectives run Monday to Sunday and pay significantly more XP than dailies."}
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      {locked ? (
        <ComingSoon
          label="Coming soon"
          title="Weekly challenges are locked"
          description="Placeholder objectives, remaining-day counts and rewards stay hidden until weekly play is live. Progression, rewards and credit history remain available from the links above."
        />
      ) : (
        <>
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
        </>
      )}
    </PageShell>
  );
}
