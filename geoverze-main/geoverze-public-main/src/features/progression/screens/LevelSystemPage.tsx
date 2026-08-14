import { Sparkles } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, SectionContainer, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { LevelBadge } from "../components/LevelBadge";
import { LevelLadder } from "../components/LevelLadder";
import { ProgressionNav } from "../components/ProgressionNav";
import { XpProgressBar } from "../components/XpProgressBar";
import { MILESTONES } from "../data/levels";
import { XP_RULES } from "../data/xpRules";
import { nextLevel } from "../lib/progress";
import { useProgressionStore } from "@/stores/progressionStore";

/** /play/level-system */
export function LevelSystemPage() {
  const player = useProgressionStore((s) => s.player);
  const next = nextLevel(player.level);

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <p className="eyebrow">Level system</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Climb from Navigator to Atlas Keeper
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            Each level unlocks a reward tier. Requirements shown are placeholders for the live
            progression curve.
          </p>
        </AnimatedSection>
        <div className="mt-8">
          <ProgressionNav />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <GameCard interactive={false} raised>
            <div className="flex flex-col gap-7 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
              <LevelBadge level={player.level} title={player.levelTitle} size="lg" />
              <XpProgressBar
                className="lg:max-w-md"
                xpIntoLevel={player.xpIntoLevel}
                xpForLevel={player.xpForLevel}
                nextLevelLabel={next ? `Level ${next.level} · ${next.title}` : undefined}
              />
            </div>
          </GameCard>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section)]">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <AnimatedSection>
              <SectionHeading as="h2" eyebrow="Ladder" title="Levels and rewards" />
            </AnimatedSection>
            <div className="mt-6">
              <LevelLadder currentLevel={player.level} />
            </div>
          </div>

          <div>
            <AnimatedSection>
              <SectionHeading as="h2" eyebrow="Ahead" title="Milestones" />
            </AnimatedSection>
            <ul className="mt-6 grid gap-3">
              {MILESTONES.map((milestone) => (
                <li key={milestone.level}>
                  <GameCard interactive={false} className="p-5">
                    <p className="inline-flex items-center gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-bronze/90">
                      <Sparkles className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
                      Level {milestone.level}
                    </p>
                    <p className="mt-3 text-sm font-semibold text-foreground">{milestone.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/50">
                      {milestone.description}
                    </p>
                  </GameCard>
                </li>
              ))}
            </ul>

            <AnimatedSection className="mt-10">
              <SectionHeading as="h2" eyebrow="Earning" title="XP sources" />
            </AnimatedSection>
            <ul className="mt-6 grid gap-2">
              {XP_RULES.map((rule) => (
                <li
                  key={rule.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-bronze/12 bg-[oklch(0.185_0.008_62)] px-4 py-3"
                >
                  <span className="inline-flex items-center gap-2.5 text-sm text-foreground/75">
                    <rule.icon
                      className="h-3.5 w-3.5 text-bronze/90"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                    {rule.label}
                  </span>
                  <span className="text-xs font-semibold text-bronze-glow">{rule.amount}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
