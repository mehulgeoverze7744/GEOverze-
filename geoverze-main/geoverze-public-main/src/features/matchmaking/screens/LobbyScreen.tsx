import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowLeft, Clock, HelpCircle, Play, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, ProgressRing, SectionContainer } from "@/components/shared";
import { DifficultyBadge, MetaChip } from "@/features/play/components/Badges";
import { CoverArt } from "@/features/play/components/CoverArt";
import { GAME_MODES } from "@/features/play/data/gameModes";
import { resolveQuizSet } from "@/features/quiz";
import { useMatchStore } from "@/stores/matchStore";
import { useQuizStore, type QuizMode } from "@/stores/quizStore";
import { PlayerSlot, ReservedSlot } from "../components/PlayerSlot";
import { LOBBY_RULES, YOU } from "../data/players";

const COUNTDOWN = 10;
const ROOM_SIZE: Record<string, number> = { pvp: 1, multiplayer: 3 };
const RUN_MODE: Record<string, QuizMode> = {
  pvp: "pvp",
  multiplayer: "multiplayer",
  practice: "practice",
};

/** /play/lobby — the pre-game room: roster, rules, ready state and countdown. */
export function LobbyScreen() {
  const { mode, quiz } = useSearch({ from: "/play/lobby" });
  const navigate = useNavigate();
  const resolvedMode = mode ?? "solo";
  const set = resolveQuizSet(quiz ?? resolvedMode);
  const modeMeta = GAME_MODES.find((m) => m.id === resolvedMode);

  const roster = useMatchStore((s) => s.roster);
  const ready = useMatchStore((s) => s.ready);
  const resolveMatch = useMatchStore((s) => s.resolveMatch);
  const toggleReady = useMatchStore((s) => s.toggleReady);
  const startRun = useQuizStore((s) => s.start);

  const [youReady, setYouReady] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN);

  const social = resolvedMode === "pvp" || resolvedMode === "multiplayer";

  useEffect(() => {
    if (social && roster.length === 0) resolveMatch(ROOM_SIZE[resolvedMode] ?? 1);
  }, [social, roster.length, resolveMatch, resolvedMode]);

  const launch = () => {
    startRun(set.id, RUN_MODE[resolvedMode] ?? "solo");
    const target =
      resolvedMode === "pvp"
        ? "/play/quiz/pvp"
        : resolvedMode === "multiplayer"
          ? "/play/quiz/multiplayer"
          : "/play/quiz/solo";
    navigate({ to: target, search: { quiz: set.id } });
  };

  useEffect(() => {
    if (!youReady) {
      setCountdown(COUNTDOWN);
      return;
    }
    const timer = window.setInterval(() => setCountdown((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [youReady]);

  useEffect(() => {
    if (youReady && countdown === 0) launch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youReady, countdown]);

  const seats = [{ ...YOU }, ...roster];

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/modes"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Change mode
          </Link>
          <div className="mt-5 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-5 sm:flex sm:flex-wrap sm:justify-between">
            <div className="min-w-0">
              <MetaChip tone="bronze">{modeMeta?.title ?? "Solo"} lobby</MetaChip>
              <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-semibold leading-[1.08] tracking-tight text-foreground">
                Room ready
              </h1>
              <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-foreground/60">
                Confirm the set, mark yourself ready and the round starts on the countdown.
              </p>
            </div>
            <div className="shrink-0">
              <ProgressRing
                value={((COUNTDOWN - countdown) / COUNTDOWN) * 100}
                size={104}
                label="Countdown"
              >
                <span className="text-[1.3rem] font-semibold tabular-nums text-foreground">
                  {youReady ? countdown : COUNTDOWN}
                </span>
              </ProgressRing>
            </div>
          </div>
        </AnimatedSection>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <AnimatedSection>
            <h2 className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              Players
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {seats.map((player) => (
                <PlayerSlot
                  key={player.id}
                  player={player}
                  ready={player.you ? youReady : Boolean(ready[player.id])}
                  onToggleReady={(id) => {
                    setYouReady((v) => !v);
                    toggleReady(id);
                  }}
                />
              ))}

              <ReservedSlot
                label="GeoDeal seat"
                note="A future co-op slot. Reserved in the layout, inactive until GeoDeal ships."
              />
            </div>

            <section className="game-surface mt-6 rounded-2xl p-5 sm:p-6" aria-label="Room rules">
              <h2 className="flex items-center gap-2 text-[0.95rem] font-semibold tracking-tight text-foreground">
                <ShieldCheck className="h-4 w-4 text-bronze" strokeWidth={1.9} aria-hidden />
                Room rules
              </h2>
              <ul className="mt-4 space-y-2.5">
                {LOBBY_RULES.map((rule) => (
                  <li
                    key={rule}
                    className="flex gap-2.5 text-[0.82rem] leading-relaxed text-foreground/60"
                  >
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bronze"
                      aria-hidden
                    />
                    {rule}
                  </li>
                ))}
              </ul>
            </section>
          </AnimatedSection>

          <AnimatedSection>
            <div className="game-surface overflow-hidden rounded-2xl">
              <CoverArt art={set.art} ratio="wide" className="h-36" />
              <div className="p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <DifficultyBadge level={set.difficulty} />
                  <MetaChip>
                    <HelpCircle className="h-3 w-3" strokeWidth={2.2} aria-hidden />
                    {set.questions.length} questions
                  </MetaChip>
                  <MetaChip>
                    <Clock className="h-3 w-3" strokeWidth={2.2} aria-hidden />~{set.minutes} min
                  </MetaChip>
                </div>
                <h2 className="mt-4 text-lg font-semibold tracking-tight text-foreground">
                  {set.title}
                </h2>
                <p className="mt-2 text-[0.84rem] leading-relaxed text-foreground/55">
                  {set.description}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <MetaChip tone="bronze">+{set.rewards.xp} XP</MetaChip>
                  <MetaChip tone="bronze">+{set.rewards.credits} credits</MetaChip>
                </div>
                <GeoButton variant="solid" size="lg" className="mt-6 w-full" onClick={launch}>
                  <Play className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                  Start now
                </GeoButton>
                <GeoButton asChild variant="ghost" size="md" className="mt-3 w-full">
                  <Link to="/play/quiz" search={{ quiz: set.id }}>
                    Change quiz
                  </Link>
                </GeoButton>
                <p className="mt-4 flex items-center gap-2 text-[0.72rem] text-foreground/50">
                  <Sparkles className="h-3.5 w-3.5 text-bronze" strokeWidth={1.8} aria-hidden />
                  Opponents and ready states are placeholders until the room service is live.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
