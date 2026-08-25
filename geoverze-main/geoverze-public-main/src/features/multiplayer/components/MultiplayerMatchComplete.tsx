import { Link } from "@tanstack/react-router";
import { Trophy, Users } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import type { QuizSet } from "@/features/quiz/data/types";
import type { MultiplayerParticipant, MultiplayerRoom } from "../types";

type MultiplayerMatchCompleteProps = {
  set: QuizSet;
  room: MultiplayerRoom;
  participants: MultiplayerParticipant[];
  youUserId: string | undefined;
  roomCode: string | undefined;
  rewardsSettled: boolean;
};

function formatOrdinal(rank: number): string {
  const mod100 = rank % 100;
  if (mod100 >= 11 && mod100 <= 13) return `${rank}th`;
  switch (rank % 10) {
    case 1:
      return `${rank}st`;
    case 2:
      return `${rank}nd`;
    case 3:
      return `${rank}rd`;
    default:
      return `${rank}th`;
  }
}

function formatRankLabel(rank: number | null): string {
  if (rank == null) return "—";
  return formatOrdinal(rank);
}

function creditLabel(credits: number | null | undefined): string | null {
  if (credits == null || credits <= 0) return null;
  return `+${credits} credits`;
}

/** Final ranked results after server-authoritative multiplayer completion. */
export function MultiplayerMatchComplete({
  set,
  room,
  participants,
  youUserId,
  roomCode,
  rewardsSettled,
}: MultiplayerMatchCompleteProps) {
  const you = participants.find((p) => p.user_id === youUserId) ?? null;
  const youRank = you?.finish_rank ?? null;
  const isFirstPlace = youRank === 1;

  const headline =
    youRank != null ? `${formatRankLabel(youRank)} place` : "Match complete";

  const youCreditLabel = rewardsSettled ? creditLabel(you?.credits_earned) : null;

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <MetaChip tone="bronze">
            <Users className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            Match complete
          </MetaChip>
          <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-semibold tracking-tight text-foreground">
            {set.title}
          </h1>
          <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-foreground/60">
            Room {room.room_code ?? roomCode} — server-graded final standings.
          </p>
        </AnimatedSection>

        <AnimatedSection className="mt-10">
          <div className="game-surface rounded-2xl p-6 text-center sm:p-8">
            <span
              className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${
                isFirstPlace
                  ? "border-[oklch(0.72_0.13_150/0.5)] bg-[oklch(0.72_0.13_150/0.12)] text-[oklch(0.78_0.12_150)]"
                  : "border-bronze/30 bg-bronze/10 text-bronze-glow"
              }`}
            >
              <Trophy className="h-7 w-7" strokeWidth={1.8} aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{headline}</h2>
            <p className="mt-2 text-[0.88rem] text-foreground/55">
              Rankings by score, then submission time, for{" "}
              {room.active_player_count ?? participants.length} players.
            </p>
            {!rewardsSettled ? (
              <p className="mt-3 text-[0.82rem] text-foreground/45">Settling rewards…</p>
            ) : null}
            {rewardsSettled && you?.xp_earned != null ? (
              <p className="mt-3 text-[0.85rem] text-foreground/60">+{you.xp_earned} XP</p>
            ) : null}
            {youCreditLabel ? (
              <p className="mt-1 text-[0.85rem] font-medium text-bronze-glow">{youCreditLabel}</p>
            ) : null}
          </div>
        </AnimatedSection>

        <div className="mt-8 space-y-3">
          {participants.map((participant) => {
            const isYou = participant.user_id === youUserId;
            const rankLabel = formatRankLabel(participant.finish_rank);
            const isFirst = participant.finish_rank === 1;
            const participantCreditLabel = rewardsSettled
              ? creditLabel(participant.credits_earned)
              : null;

            return (
              <AnimatedSection key={participant.id}>
                <div
                  className={`game-surface flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between ${
                    isYou ? "ring-1 ring-bronze/40" : ""
                  } ${isFirst ? "ring-1 ring-[oklch(0.72_0.13_150/0.35)]" : ""}`}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <span
                      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border text-sm font-semibold tabular-nums ${
                        isFirst
                          ? "border-[oklch(0.72_0.13_150/0.5)] bg-[oklch(0.72_0.13_150/0.12)] text-[oklch(0.78_0.12_150)]"
                          : "border-foreground/10 bg-foreground/5 text-foreground/70"
                      }`}
                    >
                      {isFirst ? (
                        <Trophy className="h-5 w-5" strokeWidth={1.8} aria-hidden />
                      ) : (
                        rankLabel
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-foreground/50">
                        {rankLabel}
                        {isYou ? " · You" : ""}
                      </p>
                      <p className="mt-1 truncate text-lg font-semibold text-foreground">
                        {participant.display_name || participant.username}
                      </p>
                      {rewardsSettled && participant.xp_earned != null ? (
                        <p className="mt-1 text-[0.78rem] text-foreground/55">
                          +{participant.xp_earned} XP
                          {participantCreditLabel ? ` · ${participantCreditLabel}` : ""}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <dl className="grid shrink-0 grid-cols-3 gap-4 text-[0.82rem] sm:gap-6">
                    <div>
                      <dt className="text-foreground/50">Score</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {participant.score ?? "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-foreground/50">Correct</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {participant.correct ?? 0}/{participant.total ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-foreground/50">Best streak</dt>
                      <dd className="mt-0.5 font-semibold tabular-nums text-foreground">
                        {participant.best_streak ?? 0}
                      </dd>
                    </div>
                  </dl>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <AnimatedSection className="mt-10 flex flex-wrap gap-3">
          <GeoButton variant="solid" size="lg" asChild>
            <Link to="/play/multiplayer">Back to multiplayer hub</Link>
          </GeoButton>
        </AnimatedSection>
      </SectionContainer>
    </PageShell>
  );
}
