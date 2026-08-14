import { useNavigate } from "@tanstack/react-router";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, SectionContainer, SectionHeading } from "@/components/shared";
import { FUTURE_MODES, GAME_MODES, type GameMode } from "../data/gameModes";
import { ModeCard } from "../components/ModeCard";

/** /play/modes — the full game-mode gallery, including locked future modes. */
export function ModesPage() {
  const navigate = useNavigate();

  const select = (mode: GameMode) => {
    if (mode.id === "pvp" || mode.id === "multiplayer") {
      navigate({ to: "/play/matchmaking", search: { mode: mode.id, quiz: undefined } });
      return;
    }
    navigate({ to: "/play/lobby", search: { mode: mode.id, quiz: undefined } });
  };

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <p className="eyebrow">Game modes</p>
          <h1 className="mt-4 text-[clamp(2rem,4.4vw,3.2rem)] font-semibold leading-[1.05] tracking-tight text-foreground">
            Choose how you play
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-foreground/60 md:text-base">
            One question engine, six kinds of pressure. Every mode feeds the same XP, streak and
            ranking.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {GAME_MODES.filter((m) => !m.comingSoon).map((mode) => (
              <ModeCard key={mode.id} mode={mode} onSelect={select} />
            ))}
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-16">
          <SectionHeading
            eyebrow="On the roadmap"
            title="Modes in development"
            description="Designed, not shipped. These stay locked until the competitive service is live — no placeholder standings behind them."
          />
          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...GAME_MODES.filter((m) => m.comingSoon), ...FUTURE_MODES].map((mode) => (
              <ModeCard key={mode.id} mode={mode} onSelect={select} />
            ))}
          </div>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
