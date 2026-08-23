import { Link } from "@tanstack/react-router";
import { Crown, Minus, Swords, Trophy } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedSection, GeoButton, SectionContainer } from "@/components/shared";
import { MetaChip } from "@/features/play/components/Badges";
import type { QuizSet } from "@/features/quiz/data/types";
import type { PvpParticipant, PvpRoom } from "../types";

type PvpMatchResultProps = {
  set: QuizSet;
  room: PvpRoom;
  participants: PvpParticipant[];
  youUserId: string | undefined;
  roomCode: string | undefined;
};

/** Final authoritative duel result after both players submit. */
export function PvpMatchResult({ set, room, participants, youUserId, roomCode }: PvpMatchResultProps) {
  const you = participants.find((p) => p.user_id === youUserId) ?? null;
  const opponent = participants.find((p) => p.user_id !== youUserId) ?? null;

  const isDraw = room.is_draw ?? room.winner_user_id === null;
  const youWon = !isDraw && room.winner_user_id === youUserId;
  const opponentWon = !isDraw && room.winner_user_id === opponent?.user_id;

  const outcomeLabel = isDraw ? "Draw" : youWon ? "Victory" : opponentWon ? "Defeat" : "Match complete";
  const OutcomeIcon = isDraw ? Minus : youWon ? Trophy : Crown;

  return (
    <PageShell>
      <SectionContainer
        size="wide"
        className="pt-[calc(var(--nav-height)+var(--space-section-sm))] pb-[var(--space-section-sm)]"
      >
        <AnimatedSection>
          <MetaChip tone="bronze">
            <Swords className="h-3 w-3" strokeWidth={2.2} aria-hidden />
            Duel complete
          </MetaChip>
          <h1 className="mt-4 text-[clamp(1.8rem,4vw,2.7rem)] font-semibold tracking-tight text-foreground">
            {set.title}
          </h1>
          <p className="mt-3 max-w-xl text-[0.9rem] leading-relaxed text-foreground/60">
            Room {room.room_code ?? roomCode} — server-graded results.
          </p>
        </AnimatedSection>

        <AnimatedSection>
          <div className="game-surface mt-10 rounded-2xl p-6 text-center sm:p-8">
            <span
              className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${
                isDraw
                  ? "border-bronze/30 bg-bronze/10 text-bronze-glow"
                  : youWon
                    ? "border-[oklch(0.72_0.13_150/0.5)] bg-[oklch(0.72_0.13_150/0.12)] text-[oklch(0.78_0.12_150)]"
                    : "border-[oklch(0.66_0.18_20/0.4)] bg-[oklch(0.66_0.18_20/0.1)] text-[oklch(0.72_0.14_20)]"
              }`}
            >
              <OutcomeIcon className="h-7 w-7" strokeWidth={1.8} aria-hidden />
            </span>
            <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">{outcomeLabel}</h2>
            <p className="mt-2 text-[0.88rem] text-foreground/55">
              {isDraw
                ? "Both players scored equally."
                : youWon
                  ? "Your score was higher."
                  : `${opponent?.username ?? "Opponent"} scored higher.`}
            </p>
          </div>
        </AnimatedSection>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[you, opponent].map((participant) => {
            if (!participant) return null;
            const isYou = participant.user_id === youUserId;
            const won = !isDraw && room.winner_user_id === participant.user_id;

            return (
              <AnimatedSection key={participant.id}>
                <div
                  className={`game-surface rounded-2xl p-5 ${
                    won ? "ring-1 ring-bronze/40" : ""
                  }`}
                >
                  <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
                    {isYou ? "Your result" : "Opponent"}
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {participant.username}
                    {won ? " · Winner" : isDraw ? " · Draw" : ""}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.82rem]">
                    <div>
                      <dt className="text-foreground/50">Score</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">{participant.score ?? 0}</dd>
                    </div>
                    <div>
                      <dt className="text-foreground/50">Correct</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">
                        {participant.correct ?? 0}/{participant.total ?? 0}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-foreground/50">Best streak</dt>
                      <dd className="mt-0.5 font-semibold text-foreground">
                        {participant.best_streak ?? 0}
                      </dd>
                    </div>
                    {participant.xp_earned != null ? (
                      <div>
                        <dt className="text-foreground/50">XP earned</dt>
                        <dd className="mt-0.5 font-semibold text-bronze-glow">+{participant.xp_earned}</dd>
                      </div>
                    ) : null}
                    {participant.credits_earned != null ? (
                      <div>
                        <dt className="text-foreground/50">Credits earned</dt>
                        <dd className="mt-0.5 font-semibold text-foreground">
                          +{participant.credits_earned}
                        </dd>
                      </div>
                    ) : null}
                  </dl>
                </div>
              </AnimatedSection>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <GeoButton variant="solid" size="md" asChild>
            <Link to="/play/pvp">Back to PvP hub</Link>
          </GeoButton>
          <GeoButton variant="dark" size="md" asChild>
            <Link to="/play">Play hub</Link>
          </GeoButton>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
