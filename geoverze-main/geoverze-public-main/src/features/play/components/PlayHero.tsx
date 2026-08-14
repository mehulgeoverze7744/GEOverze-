import { Coins, Flame, Shuffle, Sparkles, Star } from "lucide-react";

import { AnimatedCounter, GeoButton, SectionContainer } from "@/components/shared";
import { GameCard } from "./GameCard";

const STATS = [
  { id: "streak", label: "Streak", value: 12, suffix: " days", icon: Flame },
  { id: "xp", label: "XP", value: 8420, icon: Sparkles },
  { id: "credits", label: "Credits", value: 320, icon: Coins },
  { id: "level", label: "Level", value: 14, icon: Star },
] as const;

/** Lobby hero: heading, stat pills and the random-quiz CTA. */
export function PlayHero({ onRandom }: { onRandom: () => void }) {
  return (
    <section className="pt-[calc(var(--nav-height)+2.5rem)] pb-[var(--space-section-sm)]">
      <SectionContainer size="wide">
        <p className="eyebrow">Quiz hub</p>
        <h1 className="mt-3 font-semibold leading-[1] tracking-tight text-foreground text-[clamp(2.4rem,6vw,4.2rem)]">
          Let&apos;s <span className="text-gradient-bronze">Play</span>
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
          Challenge yourself. Explore the world. Become a geography master.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STATS.map((stat) => (
            <GameCard
              key={stat.id}
              raised
              interactive={false}
              className="flex items-center gap-3 rounded-xl px-4 py-3.5"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-bronze/30 bg-bronze/12 text-bronze-glow">
                <stat.icon className="h-4 w-4" strokeWidth={2} />
              </span>
              <span className="min-w-0">
                <span className="block text-[0.62rem] uppercase tracking-[0.18em] text-foreground/50">
                  {stat.label}
                </span>
                <span className="block text-lg font-semibold tracking-tight text-foreground">
                  <AnimatedCounter value={stat.value} />
                  {"suffix" in stat ? (
                    <span className="text-xs font-normal text-foreground/50">{stat.suffix}</span>
                  ) : null}
                </span>
              </span>
            </GameCard>
          ))}
        </div>

        <div className="mt-8">
          <GeoButton variant="solid" size="xl" className="cta-pulse" onClick={onRandom}>
            <Shuffle className="h-4 w-4" strokeWidth={2.4} />
            Play Random Quiz
          </GeoButton>
        </div>
      </SectionContainer>
    </section>
  );
}
