import { Link } from "@tanstack/react-router";
import { Flame, Trophy } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedCounter, AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { ProgressBarFill } from "../components/ProgressBarFill";
import { ProgressionNav } from "../components/ProgressionNav";
import { StreakCalendar } from "../components/StreakCalendar";
import { useStreakStats } from "../hooks/useStreakStats";
import { dayCountLabel } from "../lib/streakStats";

/** /play/streak */
export function StreakPage() {
  const { stats, loading, error } = useStreakStats();
  const bestPct =
    stats.longest > 0 ? Math.min(100, Math.round((stats.current / stats.longest) * 100)) : 0;

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Streak</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Keep the fire alive
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            One completed quiz a day keeps your streak and your daily XP bonus running.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        {error ? (
          <p className="mb-4 text-sm text-foreground/55">Could not load your streak right now.</p>
        ) : null}
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
                      {loading ? (
                        <span className="text-foreground/35">—</span>
                      ) : (
                        <AnimatedCounter
                          value={stats.current}
                          suffix={stats.current === 1 ? " day" : " days"}
                        />
                      )}
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
                      {loading ? "Personal best" : `Personal best ${dayCountLabel(stats.longest)}`}
                    </span>
                    <span>{loading ? "—" : `${bestPct}%`}</span>
                  </div>
                  <ProgressBarFill
                    className="mt-2"
                    size="lg"
                    tone="flame"
                    value={loading ? 0 : bestPct}
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
            <StreakCalendar
              week={stats.week}
              weeklyGoal={stats.weeklyGoal}
              daysThisWeek={stats.daysThisWeek}
              weekPercent={stats.weekPercent}
              loading={loading}
            />
          </AnimatedSection>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
