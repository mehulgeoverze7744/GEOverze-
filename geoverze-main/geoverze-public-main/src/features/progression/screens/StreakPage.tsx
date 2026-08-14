import { Link } from "@tanstack/react-router";
import { Flame, Trophy } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import {
  AnimatedCounter,
  AnimatedSection,
  GeoButton,
  SectionContainer,
  SectionHeading,
} from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { ProgressBarFill } from "../components/ProgressBarFill";
import { ProgressionNav } from "../components/ProgressionNav";
import { StreakCalendar } from "../components/StreakCalendar";
import { STREAK_DATA, STREAK_MESSAGES } from "../data/streak";

/** /play/streak */
export function StreakPage() {
  const goalPct = Math.min(
    100,
    Math.round(
      (STREAK_DATA.week.filter((day) => day.state === "done").length / STREAK_DATA.weeklyGoal) *
        100,
    ),
  );
  const bestPct = Math.min(100, Math.round((STREAK_DATA.current / STREAK_DATA.longest) * 100));

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Streak</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Keep the fire alive
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            One quiz a day keeps your streak and your daily XP bonus running.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-3">
          <AnimatedSection className="lg:col-span-2">
            <GameCard interactive={false} raised className="h-full">
              <div className="flex h-full flex-col justify-between gap-8 p-6 sm:p-8">
                <div className="flex items-center gap-5">
                  <span
                    className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-bronze text-background shadow-[var(--glow-bronze)]"
                    aria-hidden="true"
                  >
                    <Flame className="h-7 w-7" strokeWidth={1.9} />
                  </span>
                  <div>
                    <p className="text-[clamp(2rem,4vw,2.8rem)] font-semibold leading-none text-foreground">
                      <AnimatedCounter value={STREAK_DATA.current} suffix=" days" />
                    </p>
                    <p className="mt-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
                      Current streak
                    </p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-foreground/50">
                    <span className="inline-flex items-center gap-2">
                      <Trophy
                        className="h-3.5 w-3.5 text-bronze/90"
                        strokeWidth={2}
                        aria-hidden="true"
                      />
                      Personal best {STREAK_DATA.longest} days
                    </span>
                    <span>{bestPct}%</span>
                  </div>
                  <ProgressBarFill
                    className="mt-2"
                    size="lg"
                    tone="flame"
                    value={bestPct}
                    label="Progress toward your personal best streak"
                  />
                </div>

                <GeoButton asChild variant="solid" className="self-start">
                  <Link to="/play">Play today's quiz</Link>
                </GeoButton>
              </div>
            </GameCard>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <StreakCalendar />
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Weekly goal"
            title={`${goalPct}% of your ${STREAK_DATA.weeklyGoal}-day goal`}
            description="Streak bonuses scale with consistency, not intensity."
          />
        </AnimatedSection>
        <ul className="mt-8 grid gap-3 sm:grid-cols-3">
          {STREAK_MESSAGES.map((message) => (
            <li key={message}>
              <GameCard interactive={false} className="h-full p-5">
                <p className="text-sm leading-relaxed text-foreground/70">{message}</p>
              </GameCard>
            </li>
          ))}
        </ul>
      </SectionContainer>
    </PageShell>
  );
}
