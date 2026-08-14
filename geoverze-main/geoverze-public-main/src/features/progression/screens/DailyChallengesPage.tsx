import { Link } from "@tanstack/react-router";
import { CalendarDays } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { useMidnightCountdown } from "@/features/play/lib/useMidnightCountdown";
import { ChallengeCard } from "../components/ChallengeCard";
import { ProgressBarFill } from "../components/ProgressBarFill";
import { ProgressionNav } from "../components/ProgressionNav";
import { DAILY_CHALLENGES } from "../data/challenges";

/** /play/daily-challenges */
export function DailyChallengesPage() {
  const countdown = useMidnightCountdown();
  const completed = DAILY_CHALLENGES.filter((c) => c.progress >= c.target).length;
  const pct = Math.round((completed / DAILY_CHALLENGES.length) * 100);

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Daily challenges</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Five objectives, one day
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Everything resets at midnight. Progress shown is placeholder data.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <GameCard interactive={false} raised>
            <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div>
                <p className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-bronze/90">
                  <CalendarDays className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
                  Today
                </p>
                <p className="mt-4 text-xl font-semibold text-foreground">
                  {completed} of {DAILY_CHALLENGES.length} complete
                </p>
                <p className="mt-2 text-xs text-foreground/50">
                  Resets in {countdown.hours}:{countdown.minutes}:{countdown.seconds}
                </p>
                <ProgressBarFill
                  className="mt-4 sm:max-w-sm"
                  size="lg"
                  value={pct}
                  label="Daily challenge completion"
                />
              </div>
              <GeoButton asChild variant="solid">
                <Link to="/play">Start a quiz</Link>
              </GeoButton>
            </div>
          </GameCard>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <AnimatedSection>
          <SectionHeading eyebrow="Objectives" title="Today's set" />
        </AnimatedSection>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {DAILY_CHALLENGES.map((challenge, index) => (
            <AnimatedSection key={challenge.id} delay={index * 50}>
              <ChallengeCard challenge={challenge} />
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>
    </PageShell>
  );
}
