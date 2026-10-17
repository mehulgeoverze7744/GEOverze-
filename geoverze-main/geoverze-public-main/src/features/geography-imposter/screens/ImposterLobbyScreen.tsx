import { ArrowLeft, Check, Copy, Loader2, Play, Users, Wifi, WifiOff } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import { ParticipantAvatar } from "@/features/matchmaking/components/RoomPlayerAvatar";
import { SessionHero } from "@/features/play/components/SessionHero";
import { thumbnailForGameType } from "@/features/play/data/sessionArtwork";
import { selectUser, useAuthStore } from "@/stores/authStore";
import type { ImpRoomState } from "../types";

const STATUS_LABEL: Record<string, string> = {
  waiting: "Waiting for players",
  ready: "All players ready",
  playing: "Game in progress",
};

type ImposterLobbyScreenProps = {
  code: string | undefined;
  state: ImpRoomState | null;
  loading: boolean;
  error: string | null;
  readyPending: boolean;
  startPending: boolean;
  toggleReady: (ready: boolean) => Promise<void>;
  startGame: () => Promise<void>;
};

export function ImposterLobbyScreen({
  code,
  state,
  loading,
  error,
  readyPending,
  startPending,
  toggleReady,
  startGame,
}: ImposterLobbyScreenProps) {
  const user = useAuthStore(selectUser);
  const [copied, setCopied] = useState(false);

  const you = useMemo(
    () => state?.participants.find((p) => p.user_id === user?.id) ?? null,
    [state?.participants, user?.id],
  );

  const isHost = you?.is_host ?? false;
  const isReady = you?.is_ready ?? false;
  const eligible = useMemo(
    () => (state?.participants ?? []).filter((p) => !p.is_excluded),
    [state?.participants],
  );
  const notReady = useMemo(() => eligible.filter((p) => !p.is_ready), [eligible]);
  const playersNeeded = Math.max(0, 3 - eligible.length);
  const canStart = isHost && playersNeeded === 0 && notReady.length === 0;

  const copyCode = () => {
    if (!code) return;
    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2_000);
    });
  };

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-7 w-7 animate-spin text-bronze" aria-hidden />
        </div>
      </PageShell>
    );
  }

  if (error || !state) {
    return (
      <PageShell>
        <SectionContainer size="narrow" className="pt-[calc(var(--nav-height)+2rem)] text-center">
          <p className="text-foreground/60">{error ?? "Room not found"}</p>
          <Link to="/play/imposter" className="mt-4 inline-block text-bronze hover:underline">
            ← Back
          </Link>
        </SectionContainer>
      </PageShell>
    );
  }

  const { room, participants } = state;

  return (
    <PageShell>
      <SectionContainer
        size="narrow"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <Link
            to="/play/imposter"
            className="inline-flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-bronze hover:text-bronze-glow"
          >
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            Leave
          </Link>

          <div className="mt-5 overflow-hidden rounded-2xl border border-bronze/15">
            <SessionHero
              thumbnail={thumbnailForGameType("geography-imposter")}
              className="h-36 sm:h-44"
            />
          </div>

          <div className="mt-5 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <MetaChip tone="bronze">{STATUS_LABEL[room.status] ?? room.status}</MetaChip>
              <h1 className="mt-3 text-[1.5rem] font-semibold tracking-tight text-foreground">
                GEOsus
              </h1>
              <p className="mt-1 text-[0.82rem] text-foreground/50 capitalize">
                {room.difficulty} · {room.category?.replace(/_/g, " ") ?? "Mixed"}
              </p>
            </div>

            {/* Room code */}
            <button
              type="button"
              onClick={copyCode}
              className="flex items-center gap-2 rounded-xl border border-foreground/15 bg-foreground/[0.04] px-4 py-2.5 transition-colors hover:border-bronze/30"
            >
              <span className="font-mono text-lg font-bold tracking-[0.2em] text-foreground">
                {code ?? "––––––"}
              </span>
              {copied ? (
                <Check className="h-4 w-4 text-emerald-400" strokeWidth={2} aria-hidden />
              ) : (
                <Copy className="h-4 w-4 text-foreground/40" strokeWidth={1.7} aria-hidden />
              )}
            </button>
          </div>
        </AnimatedSection>

        {/* Player list */}
        <AnimatedSection className="mt-8">
          <h2 className="mb-3 flex items-center gap-2 text-[0.82rem] font-semibold uppercase tracking-[0.14em] text-foreground/50">
            <Users className="h-3.5 w-3.5" aria-hidden />
            Players · {participants.length} / {room.max_players}
          </h2>

          <div className="space-y-2">
            {participants.map((p) => {
              const isOnline = new Date(p.last_seen_at).getTime() > Date.now() - 30_000;
              return (
                <div
                  key={p.user_id}
                  className="flex items-center gap-3 rounded-xl border border-foreground/8 bg-foreground/[0.03] px-4 py-3"
                >
                  <ParticipantAvatar
                    participant={p}
                    you={p.user_id === user?.id}
                    selfAvatar={{ avatarId: user?.avatarId, avatarUrl: user?.avatarUrl }}
                    size={32}
                    alt=""
                  />
                  <span className="flex-1 text-[0.88rem] font-medium text-foreground">
                    {p.display_name}
                    {p.is_host && (
                      <span className="ml-2 text-[0.65rem] font-semibold uppercase text-bronze">
                        host
                      </span>
                    )}
                    {p.user_id === user?.id && (
                      <span className="ml-1 text-[0.65rem] text-foreground/35">(you)</span>
                    )}
                  </span>
                  {isOnline ? (
                    <Wifi className="h-3.5 w-3.5 text-emerald-400" strokeWidth={1.7} aria-hidden />
                  ) : (
                    <WifiOff
                      className="h-3.5 w-3.5 text-foreground/30"
                      strokeWidth={1.7}
                      aria-hidden
                    />
                  )}
                  <span
                    className={
                      p.is_ready
                        ? "flex items-center gap-1 text-[0.72rem] font-semibold text-emerald-400"
                        : "text-[0.72rem] text-foreground/35"
                    }
                    aria-label={p.is_ready ? "Ready" : "Not ready"}
                  >
                    {p.is_ready ? (
                      <>
                        <Check className="h-3.5 w-3.5" strokeWidth={2.5} aria-hidden />
                        Ready
                      </>
                    ) : (
                      "Not ready"
                    )}
                  </span>
                </div>
              );
            })}

            {/* Empty slots */}
            {Array.from({ length: Math.max(0, room.max_players - participants.length) }).map(
              (_, i) => (
                <div
                  key={`empty-${i}`}
                  className="flex items-center gap-3 rounded-xl border border-dashed border-foreground/8 px-4 py-3 opacity-40"
                >
                  <div className="h-8 w-8 rounded-full bg-foreground/5" />
                  <span className="text-[0.82rem] text-foreground/30">Empty slot</span>
                </div>
              ),
            )}
          </div>
        </AnimatedSection>

        {/* Actions */}
        <AnimatedSection className="mt-6 flex flex-col gap-3 sm:flex-row">
          {you ? (
            <GeoButton
              variant={isReady ? "dark" : "solid"}
              size="lg"
              className="flex-1"
              disabled={readyPending || room.status === "cancelled"}
              onClick={() => void toggleReady(!isReady)}
            >
              {readyPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : isReady ? (
                "Not Ready"
              ) : (
                "Ready"
              )}
            </GeoButton>
          ) : null}

          {isHost ? (
            <GeoButton
              variant="solid"
              size="lg"
              className="flex-1"
              disabled={!canStart || startPending}
              onClick={() => void startGame()}
            >
              {startPending ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <>
                  <Play className="h-4 w-4" strokeWidth={1.9} aria-hidden />
                  Start Game
                </>
              )}
            </GeoButton>
          ) : null}
        </AnimatedSection>

        {isHost && !canStart ? (
          <p className="mt-3 text-center text-[0.75rem] text-foreground/40">
            {playersNeeded > 0
              ? `Need at least 3 players (${playersNeeded} more)`
              : notReady.length === 1
                ? `Waiting for ${notReady[0]?.display_name ?? "a player"} to ready up`
                : `Waiting for ${notReady.map((p) => p.display_name).join(", ")} to ready up`}
          </p>
        ) : null}
      </SectionContainer>
    </PageShell>
  );
}
