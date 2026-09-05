import { Lock } from "lucide-react";
import { useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GlassCard } from "@/components/shared/GlassCard";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { SectionContainer } from "@/components/shared/SectionContainer";
import {
  ACHIEVEMENT_FILTERS,
  ACHIEVEMENTS,
  type Achievement,
  type AchievementFilterId,
} from "@/features/profile/data/achievements";
import { RewardsCategoryShelf } from "@/features/store/components/RewardsCategoryShelf";
import { cn } from "@/lib/utils";

const TIER_LABEL: Record<Achievement["tier"], string> = {
  bronze: "Bronze tier",
  silver: "Silver tier",
  gold: "Gold tier",
};

function AchievementCard({ achievement }: { achievement: Achievement }) {
  const locked = achievement.status === "locked";
  return (
    <GlassCard
      className={cn(
        "flex h-full flex-col p-6 transition-opacity motion-base",
        locked && "opacity-55",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <span
          className={cn(
            "inline-flex h-12 w-12 items-center justify-center rounded-2xl border",
            achievement.status === "unlocked"
              ? "border-bronze/45 bg-bronze/12 text-bronze shadow-[var(--glow-bronze)]"
              : "border-bronze/15 bg-charcoal/50 text-foreground/50",
          )}
          aria-hidden="true"
        >
          {locked ? (
            <Lock className="h-4 w-4" strokeWidth={1.5} />
          ) : (
            <achievement.icon className="h-5 w-5" strokeWidth={1.3} />
          )}
        </span>
        {achievement.status === "unlocked" ? (
          <span className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
            {achievement.earnedOn ?? "Unlocked"}
          </span>
        ) : (
          <ProgressRing
            value={achievement.progress}
            size={44}
            thickness={3}
            label={`${achievement.name} progress`}
          >
            <span className="text-[0.6rem] text-foreground/55">{achievement.progress}%</span>
          </ProgressRing>
        )}
      </div>

      <h3 className="mt-6 text-sm text-foreground/85">{achievement.name}</h3>
      <p className="mt-2 flex-1 text-xs leading-relaxed text-foreground/50">
        {achievement.description}
      </p>
      <div className="mt-5 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.2em]">
        <span className="text-foreground/50">{achievement.detail}</span>
        <span className="text-bronze/90">{TIER_LABEL[achievement.tier]}</span>
      </div>
    </GlassCard>
  );
}

/** Badge gallery with unlocked / in-progress / locked filtering. */
export function AchievementsPage() {
  const [filter, setFilter] = useState<AchievementFilterId>("all");
  const unlocked = ACHIEVEMENTS.filter((item) => item.status === "unlocked").length;
  const completion = Math.round((unlocked / ACHIEVEMENTS.length) * 100);
  const visible =
    filter === "all" ? ACHIEVEMENTS : ACHIEVEMENTS.filter((item) => item.status === filter);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Achievements and Rewards"
        title="Achievements and Rewards"
        description="Eight milestones mark the journey from first quiz to full planetary mastery. Claim profile rewards with credits below — progress shown here is illustrative until the quiz engine ships."
      />
      <SectionContainer>
        <AnimatedSection>
          <h2 className="text-lg font-light tracking-tight text-foreground">Badges of the explorer</h2>
          <GlassCard
            strong
            className="mt-6 flex flex-col items-center gap-7 p-7 sm:flex-row sm:gap-10 sm:p-9"
          >
            <ProgressRing value={completion} label="Badge completion" size={120}>
              <span className="text-2xl font-light text-gradient-bronze">{completion}%</span>
              <span className="text-[0.55rem] uppercase tracking-[0.24em] text-foreground/50">
                complete
              </span>
            </ProgressRing>
            <div className="text-center sm:text-left">
              <p className="text-lg font-light text-foreground/85">
                {unlocked} of {ACHIEVEMENTS.length} badges unlocked
              </p>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-foreground/50">
                Badges unlock automatically as you play. Nothing here can be bought — the map is the
                only currency.
              </p>
            </div>
          </GlassCard>
        </AnimatedSection>

        <div className="mt-9 flex flex-wrap gap-2.5" role="group" aria-label="Filter achievements">
          {ACHIEVEMENT_FILTERS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFilter(option.id)}
              aria-pressed={filter === option.id}
              className={cn(
                "rounded-full border px-4 py-2 text-xs transition-colors motion-fast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45",
                filter === option.id
                  ? "border-bronze/55 bg-bronze/12 text-foreground"
                  : "border-bronze/15 text-foreground/50 hover:border-bronze/35 hover:text-foreground/80",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((achievement, index) => (
            <AnimatedSection key={achievement.id} delay={index * 50}>
              <AchievementCard achievement={achievement} />
            </AnimatedSection>
          ))}
        </div>

        <RewardsCategoryShelf className="mt-[var(--space-section-sm)]" />
      </SectionContainer>
    </PageShell>
  );
}
