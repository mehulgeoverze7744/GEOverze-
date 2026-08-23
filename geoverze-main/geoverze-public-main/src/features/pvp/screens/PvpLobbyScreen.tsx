import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Clock, Copy, HelpCircle, Play, ShieldCheck, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { DifficultyBadge, MetaChip } from "@/features/play/components/Badges";
import { CoverArt } from "@/features/play/components/CoverArt";
import { LOBBY_RULES } from "@/features/matchmaking/data/players";
import { PlayerSlot, ReservedSlot } from "@/features/matchmaking/components/PlayerSlot";
import { useQuizSet } from "@/features/quiz";
import { selectUser, useAuthStore } from "@/stores/authStore";
import { leavePvpRoom } from "../data/pvpRoomApi";
import type { PvpRoomState } from "../types";
import { toMatchPlayer } from "../lib/participantMapper";

const STATUS_LABEL: Record<string, string> = {
  waiting: "Waiting for players",
  ready: "All players ready",
  playing: "Match in progress",
  completed: "Completed",
  cancelled: "Cancelled",
};

type PvpLobbyScreenProps = {
  roomId: string | undefined;
  code: string | undefined;
  state: PvpRoomState | null;
  loading: boolean;
  error: string | null;
  readyPending: boolean;
  startPending: boolean;
  toggleReady: (ready: boolean) => Promise<void>;
  startMatch: () => Promise<void>;
};

/** Private PvP waiting lobby with live roster sync. */
export function PvpLobbyScreen({
  roomId,
  code,
  state,
  loading,
  error,
  readyPending,
  startPending,
  toggleReady,
  startMatch,
}: PvpLobbyScreenProps) {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const { set, loading: setLoading } = useQuizSet(state?.room.quiz_id);
  const [copied, setCopied] = useState(false);

  const you = useMemo(
    () => state?.participants.find((p) => p.user_id === user?.id) ?? null,
    [state?.participants, user?.id],
  );

  const isHost = you?.is_host ?? false;

  const seats = useMemo(
    () =>
      state?.participants.map((participant) =>
        toMatchPlayer(participant, participant.user_id === user?.id),
      ) ?? [],
    [state?.participants, user?.id],
  );

  const openSlotCount = Math.max(0, (state?.room.max_players ?? 2) - seats.length);

  const copyCode = async () => {
    const shareCode = state?.room.room_code ?? code ?? "";
    if (!shareCode) return;
    try {
      await navigator.clipboard.writeText(shareCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy room code");
    }
  };

  const leaveRoom = async () => {
    if (!roomId) return;
    try {
      await leavePvpRoom(roomId);
      navigate({ to: "/play/pvp" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not leave room");
    }
  };

  if (loading || setLoading) {
    return (
      <PageShell>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent text-bronze"
            aria-label="Loading room…"
          />
        </div>
      </PageShell>
    );
  }

  if (error || !state || !set) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
          <div className="game-surface rounded-2xl p-7 text-center">
            <h1 className="text-xl font-semibold text-foreground">Room unavailable</h1>
            <p className="mt-2 text-[0.9rem] text-foreground/60">
              {error ?? "This room could not be loaded."}
            </p>
            <GeoButton variant="solid" size="md" className="mt-6" asChild>
              <Link to="/play/pvp">Back to PvP</Link>
            </GeoButton>
          </div>
        </SectionContainer>
      </PageShell>
    );
  }

  const roomStatus = state.room.status;
  const allReady = roomStatus === "ready";

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/pvp"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            PvP hub
          </Link>
          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <MetaChip tone="bronze">Private PvP lobby</MetaChip>
              <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-semibold tracking-tight text-foreground">
                Room {state.room.room_code}
              </h1>
              <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-foreground/60">
                {STATUS_LABEL[roomStatus] ?? roomStatus}. Share the code with your opponent, then
                both players mark ready.
              </p>
            </div>
            <div className="game-surface rounded-2xl px-5 py-4 text-center">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
                Room code
              </p>
              <p className="mt-2 text-[1.5rem] font-semibold tracking-[0.28em] text-foreground">
                {state.room.room_code}
              </p>
              <GeoButton variant="ghost" size="sm" className="mt-3" onClick={() => void copyCode()}>
                <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                {copied ? "Copied" : "Copy code"}
              </GeoButton>
            </div>
          </div>
        </AnimatedSection>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
          <AnimatedSection>
            <h2 className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
              <Users className="h-3.5 w-3.5" aria-hidden />
              Players ({seats.length}/{state.room.max_players})
            </h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              {seats.map((player) => (
                <PlayerSlot
                  key={player.id}
                  player={player}
                  ready={Boolean(state.participants.find((p) => p.user_id === player.id)?.is_ready)}
                  {...(player.you
                    ? { onToggleReady: () => void toggleReady(!you?.is_ready) }
                    : {})}
                />
              ))}
              {openSlotCount > 0 ? (
                <ReservedSlot
                  label="Open seat"
                  note="Waiting for an opponent to join with the room code."
                />
              ) : null}
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
                <p className="mt-5 rounded-xl border border-bronze/20 bg-bronze/5 px-4 py-3 text-[0.78rem] leading-relaxed text-foreground/60">
                  {allReady
                    ? isHost
                      ? "Both players are ready. Start the match when you are set."
                      : "Both players are ready. Waiting for the host to start the match."
                    : "Mark yourself ready once your opponent has joined."}
                </p>
                {you && allReady && isHost ? (
                  <GeoButton
                    variant="solid"
                    size="lg"
                    className="mt-6 w-full"
                    disabled={startPending}
                    onClick={() => void startMatch()}
                  >
                    <Play className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                    Start match
                  </GeoButton>
                ) : null}
                {you ? (
                  <GeoButton
                    variant={allReady && isHost ? "dark" : "solid"}
                    size="lg"
                    className="mt-3 w-full"
                    disabled={readyPending || roomStatus === "cancelled" || allReady}
                    onClick={() => void toggleReady(!you.is_ready)}
                  >
                    {you.is_ready ? "Mark not ready" : "Mark ready"}
                  </GeoButton>
                ) : null}
                <GeoButton
                  variant="ghost"
                  size="md"
                  className="mt-3 w-full"
                  onClick={() => void leaveRoom()}
                >
                  Leave room
                </GeoButton>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
