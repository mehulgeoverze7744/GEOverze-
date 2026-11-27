import { useNavigate } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

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
  const navigate = useNavigate();
  const user = useAuthStore(selectUser);
  const you = participants.find((p) => p.user_id === youUserId) ?? null;

  const exitToHub = () => {
    resetQuizRun();
    void navigate({ to: "/play/multiplayer", replace: true });
  };

  const youRank = you?.finish_rank ?? null;
  const isFirstPlace = youRank === 1;
  const headline = youRank != null ? `${formatRankLabel(youRank)} place` : "Match complete";
  const youCreditLabel = rewardsSettled ? creditLabel(you?.credits_earned) : null;
  const winner = participants.find((p) => p.finish_rank === 1) ?? participants[0];

  return (
    <MatchResultsLightPage>
      <MatchResultsHeader
        eyebrow="Multiplayer quiz"
        modeLabel="Multiplayer"
        title={set.title}
        description={`Room ${room.room_code ?? roomCode} — server-graded final standings for ${room.active_player_count ?? participants.length} players.`}
      />

      <MatchResultsHeroCard>
        <span
          className={`mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl border bg-[#FAFAFA] ${
            isFirstPlace ? "border-emerald-500/40 text-emerald-700" : "border-[#E5E7EB] text-[#111827]"
          }`}
        >
          <Trophy className="h-7 w-7" strokeWidth={1.8} aria-hidden />
        </span>
        <h2 className="mt-5 text-2xl font-bold tracking-tight text-[#111827]">{headline}</h2>
        {winner ? (
          <p className={`mt-2 text-[0.9rem] ${matchResultsTokens.muted}`}>
            Winner:{" "}
            <span className="font-semibold text-[#111827]">
              {winner.display_name || winner.username}
            </span>
          </p>
        ) : null}
        {!rewardsSettled ? (
          <p className={`mt-3 text-[0.82rem] ${matchResultsTokens.muted}`}>Settling rewards…</p>
        ) : null}
        {rewardsSettled && you?.xp_earned != null ? (
          <p className="mt-3 text-[0.85rem] font-medium text-emerald-700">+{you.xp_earned} XP</p>
        ) : null}
        {youCreditLabel ? (
          <p className="mt-1 text-[0.85rem] font-semibold text-[#111827]">{youCreditLabel}</p>
        ) : null}
      </MatchResultsHeroCard>

      <ul className="mt-8 list-none space-y-3 p-0" aria-label="Final leaderboard">
        {participants.map((participant) => {
          const isYou = participant.user_id === youUserId;
          const rankLabel = formatRankLabel(participant.finish_rank);
          const isFirst = participant.finish_rank === 1;
          const participantCreditLabel = rewardsSettled
            ? creditLabel(participant.credits_earned)
            : null;

          return (
            <MatchResultsLeaderboardCard key={participant.id} highlight={isYou} winner={isFirst}>
              <div className="flex min-w-0 flex-1 items-center gap-4">
                <span
                  className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold tabular-nums ${
                    isFirst
                      ? "border-emerald-500/35 bg-emerald-50 text-emerald-800"
                      : "border-[#E5E7EB] bg-[#FAFAFA] text-[#374151]"
                  }`}
                >
                  {isFirst ? <Trophy className="h-4 w-4" aria-hidden /> : rankLabel}
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
                    {rankLabel}
                    {isYou ? " · You" : ""}
                  </p>
                  <p className="mt-1 truncate text-lg font-semibold text-[#111827]">
                    {participant.display_name || participant.username}
                  </p>
                  {rewardsSettled && participant.xp_earned != null ? (
                    <p className={`mt-1 text-[0.78rem] ${matchResultsTokens.muted}`}>
                      +{participant.xp_earned} XP
                      {participantCreditLabel ? ` · ${participantCreditLabel}` : ""}
                    </p>
                  ) : null}
                </div>
              </div>

              <dl className="grid shrink-0 grid-cols-3 gap-4 text-[0.82rem] sm:gap-6">
                <div>
                  <dt className={matchResultsTokens.muted}>Score</dt>
                  <dd className="mt-0.5 font-semibold tabular-nums text-[#111827]">
                    {participant.score ?? "—"}
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
          onClick={exitToHub}
        >
          Play again
        </GeoButton>
        <GeoButton
          variant="dark"
          size="lg"
          className="min-h-11 w-full bg-white text-[#111827] ring-1 ring-[#E5E7EB] sm:w-auto"
          onClick={() => {
            resetQuizRun();
            void navigate({ to: "/play", replace: true });
          }}
        >
          Back to play
        </GeoButton>
      </MatchResultsActions>
    </MatchResultsLightPage>
  );
}