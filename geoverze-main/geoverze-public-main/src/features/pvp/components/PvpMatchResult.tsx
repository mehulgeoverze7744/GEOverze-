import { useNavigate } from "@tanstack/react-router";
import { Crown, Minus, Trophy } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { ParticipantAvatar } from "@/features/matchmaking/components/RoomPlayerAvatar";
import {
  MatchResultsActions,
  MatchResultsHeader,
  MatchResultsHeroCard,
  MatchResultsLeaderboardCard,
  MatchResultsLightPage,
  matchResultsTokens,
} from "@/features/rooms/components/MatchResultsLightShell";
import { selectUser, useAuthStore } from "@/stores/authStore";
import type { QuizSet } from "@/features/quiz/data/types";
import { resetQuizRun } from "@/stores/quizStore";
import type { PvpParticipant, PvpRoom } from "../types";

type PvpMatchResultProps = {
  set: QuizSet;
  room: PvpRoom;
  participants: PvpParticipant[];
  youUserId: string | undefined;
  roomCode: string | undefined;
};

/** Final authoritative duel result after both players submit. */
export function PvpMatchResult({
  set,
  room,
  participants,
  youUserId,
  roomCode,
}: PvpMatchResultProps) {
  const user = useAuthStore(selectUser);
  const navigate = useNavigate();
  const you = participants.find((p) => p.user_id === youUserId) ?? null;
  const opponent = participants.find((p) => p.user_id !== youUserId) ?? null;

  const exitTo = (to: "/play/pvp" | "/play") => {
    resetQuizRun();
    void navigate({ to, replace: true });
  };

  const isDraw = room.is_draw ?? room.winner_user_id === null;
  const youWon = !isDraw && room.winner_user_id === youUserId;
  const opponentWon = !isDraw && room.winner_user_id === opponent?.user_id;

  const outcomeLabel = isDraw
    ? "Draw"
    : youWon
      ? "Victory"
      : opponentWon
        ? "Defeat"
        : "Match complete";
  const OutcomeIcon = isDraw ? Minus : youWon ? Trophy : Crown;

  const ordered = [...participants].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));

  return (
    <MatchResultsLightPage>
      <MatchResultsHeader
        eyebrow="Player vs player"
        modeLabel="PvP"
        title={set.title}
        description={`Room ${room.room_code ?? roomCode} — server-graded final results.`}
      />

      <MatchResultsHeroCard>
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-[#E5E7EB] bg-[#FAFAFA] text-[#111827]">
          <OutcomeIcon className="h-7 w-7" strokeWidth={1.8} aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#111827]">{outcomeLabel}</h2>
        <p className={`mt-2 text-[0.9rem] ${matchResultsTokens.muted}`}>
          {isDraw
            ? "Both players scored equally."
            : youWon
              ? "Your score was higher."
              : `${opponent?.username ?? "Opponent"} scored higher.`}
        </p>
      </MatchResultsHeroCard>

      <ul className="mt-8 list-none space-y-3 p-0" aria-label="Final standings">
        {ordered.map((participant, index) => {
          const isYou = participant.user_id === youUserId;
          const won = !isDraw && room.winner_user_id === participant.user_id;
          return (
            <MatchResultsLeaderboardCard key={participant.id} highlight={isYou} winner={won}>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span className="w-6 text-center text-sm font-bold tabular-nums text-[#9CA3AF]">
                  {index + 1}
                </span>
                <ParticipantAvatar
                  participant={participant}
                  you={isYou}
                  selfAvatar={{ avatarId: user?.avatarId, avatarUrl: user?.avatarUrl }}
                  size={48}
                  alt=""
                />
                <div className="min-w-0">
                  <p className={matchResultsTokens.label}>
                    {isYou ? "You" : "Opponent"}
                    {won ? " · Winner" : isDraw ? " · Draw" : ""}
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold text-[#111827]">
                    {participant.username}
                  </p>
                </div>
              </div>
              <dl className="grid shrink-0 grid-cols-2 gap-x-6 gap-y-2 text-[0.82rem] sm:grid-cols-4">
                <div>
                  <dt className={matchResultsTokens.muted}>Score</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-[#111827]">
                    {participant.score ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className={matchResultsTokens.muted}>Correct</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-[#111827]">
                    {participant.correct ?? 0}/{participant.total ?? 0}
                  </dd>
                </div>
                <div>
                  <dt className={matchResultsTokens.muted}>Best streak</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-[#111827]">
                    {participant.best_streak ?? 0}
                  </dd>
                </div>
                {participant.xp_earned != null ? (
                  <div>
                    <dt className={matchResultsTokens.muted}>XP</dt>
                    <dd className="mt-0.5 font-semibold text-emerald-700">+{participant.xp_earned}</dd>
                  </div>
                ) : null}
              </dl>
            </MatchResultsLeaderboardCard>
          );
        })}
      </ul>

      <MatchResultsActions>
        <GeoButton
          variant="solid"
          size="lg"
          className="min-h-11 w-full border border-[#111827] bg-[#111827] text-white sm:w-auto"
          onClick={() => exitTo("/play/pvp")}
        >
          Play again
        </GeoButton>
        <GeoButton
          variant="dark"
          size="lg"
          className="min-h-11 w-full bg-white text-[#111827] ring-1 ring-[#E5E7EB] sm:w-auto"
          onClick={() => exitTo("/play")}
        >
          Back to play
        </GeoButton>
      </MatchResultsActions>
    </MatchResultsLightPage>
  );
}