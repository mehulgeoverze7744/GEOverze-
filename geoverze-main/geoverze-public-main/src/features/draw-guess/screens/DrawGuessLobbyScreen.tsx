import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Check, Copy, HelpCircle, Play, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { ParticipantAvatar } from "@/features/matchmaking/components/RoomPlayerAvatar";
import { selectUser, useAuthStore } from "@/stores/authStore";
import { leaveDrawRoom } from "../data/drawRoomApi";
import type { DrawRoomState } from "../types";
import { cn } from "@/lib/utils";

type DrawGuessLobbyScreenProps = {
  roomId: string | undefined;
  code: string | undefined;
  state: DrawRoomState | null;
  loading: boolean;
  error: string | null;
  readyPending: boolean;
  startPending: boolean;
  toggleReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<void>;
};

export function DrawGuessLobbyScreen({
  roomId,
  code,
  state,
  loading,
  error,
  readyPending,
  startPending,
  toggleReady,
  startGame,
}: DrawGuessLobbyScreenProps) {
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const [copied, setCopied] = useState(false);

  const you = useMemo(
    () => state?.participants.find((p) => p.user_id === user?.id) ?? null,
    [state?.participants, user?.id],
  );

  const isHost = you?.is_host ?? false;
  const allReady = state?.room.status === "ready";

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
      await leaveDrawRoom(roomId);
      void navigate({ to: "/play/draw-guess" });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not leave room");
    }
  };

  if (loading) {
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

  if (error || !state) {
    return (
      <PageShell>
        <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
          <div className="game-surface rounded-2xl p-7 text-center">
            <h1 className="text-xl font-semibold text-foreground">Room unavailable</h1>
            <p className="mt-2 text-[0.9rem] text-foreground/60">
              {error ?? "This room could not be loaded."}
            </p>
            <GeoButton variant="solid" size="md" className="mt-6" asChild>
              <Link to="/play/draw-guess">Back to Draw &amp; Guess</Link>
            </GeoButton>
          </div>
        </SectionContainer>
      </PageShell>
    );
  }

  const { room, participants } = state;

  const settingsSummary = [
    `${room.rounds} ${room.rounds === 1 ? "round" : "rounds"}`,
    `${room.difficulty}`,
    `${room.turn_seconds}s turns`,
    room.categories.length > 0
      ? `${room.categories.length} categor${room.categories.length > 1 ? "ies" : "y"}`
      : "mixed categories",
  ].join(" · ");

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/draw-guess"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Draw &amp; Guess hub
          </Link>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <MetaChip tone="bronze">Draw &amp; Guess lobby</MetaChip>
              <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-semibold tracking-tight text-foreground">
                Room {room.room_code}
              </h1>
              <p className="mt-2 text-[0.85rem] text-foreground/55">{settingsSummary}</p>
            </div>

            <div className="game-surface rounded-2xl px-5 py-4 text-center">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
                Room code
              </p>
              <p className="mt-2 text-[1.5rem] font-semibold tracking-[0.28em] text-foreground">
                {room.room_code}
              </p>
              <GeoButton variant="ghost" size="sm" className="mt-3" onClick={() => void copyCode()}>
                <Copy className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
                {copied ? "Copied" : "Copy code"}
              </GeoButton>
            </div>
          </div>
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          <h2 className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Players ({participants.length}/{room.max_players})
          </h2>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {participants.map((p) => {
              const isYou = p.user_id === user?.id;
              return (
                <div
                  key={p.user_id}
                  className="game-surface flex items-center gap-3 overflow-hidden rounded-2xl p-4"
                >
                  <ParticipantAvatar
                    participant={p}
                    you={isYou}
                    selfAvatar={{ avatarId: user?.avatarId, avatarUrl: user?.avatarUrl }}
                    size={40}
                    alt=""
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[0.86rem] font-semibold text-foreground">
                      {p.display_name || p.username}
                      {isYou ? (
                        <span className="ml-1 text-[0.65rem] font-normal text-foreground/40">
                          (you)
                        </span>
                      ) : null}
                      {p.is_host ? (
                        <span className="ml-1 text-[0.65rem] font-normal text-bronze">host</span>
                      ) : null}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg border px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.1em]",
                      p.is_ready
                        ? "border-bronze/40 bg-bronze/15 text-bronze-glow"
                        : "border-bronze/15 text-foreground/40",
                    )}
                    aria-label={p.is_ready ? "Ready" : "Not ready"}
                  >
                    {p.is_ready ? (
                      <Check className="h-3 w-3" strokeWidth={2.5} aria-hidden />
                    ) : (
                      <HelpCircle className="h-3 w-3" strokeWidth={2} aria-hidden />
                    )}
                    {p.is_ready ? "Ready" : "Waiting"}
                  </span>
                </div>
              );
            })}

            {Array.from({ length: Math.max(0, room.max_players - participants.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="rounded-2xl border border-dashed border-bronze/20 px-4 py-5 text-center text-[0.75rem] text-foreground/35"
                >
                  Open seat
                </div>
              ),
            )}
          </div>

          <div className="mt-6 rounded-2xl border border-bronze/20 bg-bronze/5 px-5 py-4 text-[0.82rem] leading-relaxed text-foreground/60">
            {allReady
              ? isHost
                ? "Everyone is ready. Start the game when you are set!"
                : "Everyone is ready. Waiting for the host to start."
              : "Mark yourself ready once everyone has joined. The host can start once all players are ready."}
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            {you && allReady && isHost ? (
              <GeoButton
                variant="solid"
                size="lg"
                disabled={startPending}
                onClick={() => void startGame()}
              >
                <Play className="h-4 w-4" strokeWidth={2.4} aria-hidden />
                Start game
              </GeoButton>
            ) : null}

            {you ? (
              <GeoButton
                variant={allReady && isHost ? "dark" : "solid"}
                size="lg"
                disabled={readyPending || room.status === "cancelled"}
                onClick={() => void toggleReady(!you.is_ready)}
              >
                {you.is_ready ? "Mark not ready" : "Mark ready"}
              </GeoButton>
            ) : null}

            <GeoButton variant="ghost" size="md" onClick={() => void leaveRoom()}>
              Leave room
            </GeoButton>
          </div>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
