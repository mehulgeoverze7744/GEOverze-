import { useNavigate, useSearch } from "@tanstack/react-router";
import { Radar, X } from "lucide-react";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { GAME_MODES } from "@/features/play/data/gameModes";
import { useMatchStore } from "@/stores/matchStore";
import { PlayerSlot } from "../components/PlayerSlot";
import { RadarPulse } from "../components/RadarPulse";
import { SEARCH_MESSAGES, YOU } from "../data/players";

const ROOM_SIZE: Record<string, number> = { pvp: 1, multiplayer: 3 };

/** /play/matchmaking — cosmetic searching state that hands off to the lobby. */
export function MatchmakingScreen() {
  const { mode, quiz } = useSearch({ from: "/play/matchmaking" });
  const navigate = useNavigate();
  const beginSearch = useMatchStore((s) => s.beginSearch);
  const resolveMatch = useMatchStore((s) => s.resolveMatch);
  const reset = useMatchStore((s) => s.reset);

  const [messageIndex, setMessageIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const resolvedMode = mode ?? "pvp";
  const modeMeta = GAME_MODES.find((m) => m.id === resolvedMode);

  useEffect(() => {
    beginSearch(resolvedMode, quiz ?? null);
    const tick = window.setInterval(() => setElapsed((n) => n + 1), 1000);
    const rotate = window.setInterval(
      () => setMessageIndex((i) => (i + 1) % SEARCH_MESSAGES.length),
      1800,
    );
    const found = window.setTimeout(() => {
      resolveMatch(ROOM_SIZE[resolvedMode] ?? 1);
      navigate({ to: "/play/lobby", search: { mode: resolvedMode, quiz } });
    }, 5200);
    return () => {
      window.clearInterval(tick);
      window.clearInterval(rotate);
      window.clearTimeout(found);
    };
  }, [beginSearch, resolveMatch, navigate, resolvedMode, quiz]);

  const cancel = () => {
    reset();
    navigate({ to: "/play/modes" });
  };

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]">
        <AnimatedSection className="mx-auto max-w-3xl text-center">
          <MetaChip tone="bronze">
            <Radar className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            {modeMeta?.title ?? "PvP"} matchmaking
          </MetaChip>
          <h1 className="mt-5 text-[clamp(1.8rem,4vw,2.8rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
            Finding your match
          </h1>
          <p aria-live="polite" className="mt-4 text-[0.9rem] text-foreground/60">
            {SEARCH_MESSAGES[messageIndex]}
          </p>

          <div className="mt-9 flex justify-center">
            <RadarPulse />
          </div>

          <p className="mt-6 text-[0.75rem] tabular-nums text-foreground/50">
            Searching for {elapsed}s · estimated wait under 30s
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <PlayerSlot player={YOU} ready />
            <div className="game-surface grid place-items-center rounded-2xl p-8">
              <div className="text-center">
                <span className="mx-auto block h-12 w-12 animate-pulse rounded-full border border-bronze/40 motion-reduce:animate-none" />
                <p className="mt-4 text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
                  Opponent
                </p>
                <p className="mt-2 text-[0.78rem] text-foreground/50">Revealing shortly…</p>
              </div>
            </div>
          </div>

          <GeoButton variant="dark" size="lg" className="mt-9" onClick={cancel}>
            <X className="h-4 w-4" strokeWidth={2.2} aria-hidden />
            Cancel search
          </GeoButton>
          <p className="mt-4 text-[0.72rem] text-foreground/50">
            Matchmaking is a visual placeholder — no live players are queued yet.
          </p>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
