import { Link } from "@tanstack/react-router";
import { Compass, Globe2, Layers, Zap } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ProgressBarFill } from "@/features/progression/components/ProgressBarFill";
import { XpProgressBar } from "@/features/progression/components/XpProgressBar";
import { nextLevel } from "@/features/progression/lib/progress";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";

import { THEME_TRACKS } from "../data/mastery";
import { ContinentMasteryList } from "./ContinentMasteryList";
import { StreakPanel } from "./StreakPanel";
import { WorldProgressPanel } from "./WorldProgressPanel";

/**
 * Country mastery, world completion, themed tracks, XP and streak in one view.
 * Numbers are placeholder data shared with the progression store.
 */
export function ProgressPage() {
  const player = useProgressionStore(selectPlayer);
  const next = nextLevel(player.level);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Progress"
        title="How much of the planet you know"
        description="Mastery by continent, world completion, themed tracks and your experience curve. Illustrative figures until the quiz engine reports per-country telemetry."
      />

      <SectionContainer>
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <GlassCard className="h-full p-7 sm:p-8">
              <SectionHeading as="h2" eyebrow="World progress" title="Planet coverage" />
              <div className="mt-8">
                <WorldProgressPanel />
              </div>
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <GlassCard className="h-full p-7 sm:p-8">
              <SectionHeading as="h2" eyebrow="Experience" title="Level and XP" />
              <div className="mt-8">
                <XpProgressBar
                  xpIntoLevel={player.xpIntoLevel}
                  xpForLevel={player.xpForLevel}
                  nextLevelLabel={next ? `Level ${next.level} · ${next.title}` : undefined}
                />
                <p className="mt-7 text-xs text-foreground/50">
                  Level {player.level} · {player.levelTitle} · {player.xp.toLocaleString()} XP
                  lifetime
                </p>
                <div className="mt-7">
                  <GeoButton asChild variant="secondary">
                    <Link to="/play/level-system">See the level ladder</Link>
                  </GeoButton>
                </div>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Country mastery"
            title="Continent by continent"
            description="A continent counts as mastered when every country in it has been answered correctly across all question types."
          />
        </AnimatedSection>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <AnimatedSection className="lg:col-span-2">
            <GlassCard className="h-full p-7 sm:p-8">
              <h3 className="flex items-center gap-2.5 text-[0.68rem] uppercase tracking-[0.26em] text-foreground/50">
                <Globe2
                  className="h-3.5 w-3.5 text-bronze/90"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Mastery by continent
              </h3>
              <div className="mt-8">
                <ContinentMasteryList />
              </div>
            </GlassCard>
          </AnimatedSection>

          <div className="space-y-4">
            <AnimatedSection delay={80}>
              <GlassCard className="p-7">
                <h3 className="flex items-center gap-2.5 text-[0.68rem] uppercase tracking-[0.26em] text-foreground/50">
                  <Layers
                    className="h-3.5 w-3.5 text-bronze/90"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Themed tracks
                </h3>
                <ul className="mt-7 space-y-5">
                  {THEME_TRACKS.map((track) => (
                    <li key={track.id}>
                      <div className="flex items-baseline justify-between gap-4 text-xs">
                        <span className="text-foreground/70">{track.label}</span>
                        <span className="text-foreground/50">{track.detail}</span>
                      </div>
                      <ProgressBarFill
                        className="mt-2.5"
                        size="sm"
                        value={track.value}
                        label={`${track.label} progress`}
                        valueText={track.detail}
                      />
                    </li>
                  ))}
                </ul>
              </GlassCard>
            </AnimatedSection>

            <AnimatedSection delay={140}>
              <GlassCard className="p-7">
                <h3 className="flex items-center gap-2.5 text-[0.68rem] uppercase tracking-[0.26em] text-foreground/50">
                  <Compass
                    className="h-3.5 w-3.5 text-bronze/90"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Streak
                </h3>
                <div className="mt-7">
                  <StreakPanel />
                </div>
              </GlassCard>
            </AnimatedSection>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <GeoButton asChild variant="primary">
            <Link to="/play">
              <Zap className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
              Close a gap
            </Link>
          </GeoButton>
          <GeoButton asChild variant="secondary">
            <Link to="/quiz-history">Quiz history</Link>
          </GeoButton>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
