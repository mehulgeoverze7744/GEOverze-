import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { ParticipantAvatar } from "@/features/matchmaking/components/RoomPlayerAvatar";
import {
  MatchResultsLeaderboardCard,
  matchResultsTokens,
} from "@/features/rooms/components/MatchResultsLightShell";
import { selectUser, useAuthStore } from "@/stores/authStore";
import type { DrawParticipant, DrawRoom } from "../types";

type ResultsOverlayProps = {
  room: DrawRoom;
  participants: DrawParticipant[];
  myUserId: string | undefined;
  isHost: boolean;
  restartPending: boolean;
  onRestart: () => void;
};

export function ResultsOverlay({
  room,
  participants,
  myUserId,
  isHost,
  restartPending,
  onRestart,
}: ResultsOverlayProps) {
  const user = useAuthStore(selectUser);
  const sorted = [...participants].sort((a, b) => b.total_score - a.total_score);
  const winner = sorted[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#F3F4F6]/95 p-4 backdrop-blur-[2px]">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-lg sm:p-8">
        <header className="text-center">
          <p className={matchResultsTokens.label}>Draw &amp; guess</p>
          <span className="mt-2 inline-flex rounded-full border border-[#E5E7EB] bg-[#FAFAFA] px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-[#374151]">
            Game completed
          </span>
          <Trophy className="mx-auto mt-4 h-10 w-10 text-[#111827]" strokeWidth={1.6} aria-hidden />
          <h2 className="mt-3 text-2xl font-bold tracking-tight text-[#111827]">Game over</h2>
          {winner ? (
            <p className={`mt-2 text-[0.9rem] ${matchResultsTokens.muted}`}>
              Winner:{" "}
              <span className="font-semibold text-[#111827]">
                {winner.display_name || winner.username}
              </span>{" "}
              with {winner.total_score} pts
            </p>
          ) : null}
          {room.room_code ? (
            <p className={`mt-1 text-[0.78rem] ${matchResultsTokens.muted}`}>Room {room.room_code}</p>
          ) : null}
        </header>

        <ul className="mt-6 list-none space-y-2 p-0" aria-label="Final leaderboard">
          {sorted.map((p, i) => (
            <MatchResultsLeaderboardCard
              key={p.user_id}
              highlight={p.user_id === myUserId}
              winner={i === 0}
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="w-6 text-center text-sm font-bold text-[#9CA3AF]">{i + 1}</span>
                <ParticipantAvatar
                  participant={p}
                  you={p.user_id === myUserId}
                  selfAvatar={{ avatarId: user?.avatarId, avatarUrl: user?.avatarUrl }}
                  size={36}
                  alt=""
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[0.88rem] font-semibold text-[#111827]">
                    {p.display_name || p.username}
                    {p.user_id === myUserId ? (
                      <span
                        className={`ml-1 text-[0.65rem] font-normal ${matchResultsTokens.muted}`}
                      >
                        (you)
                      </span>
                    ) : null}
                  </p>
                  <p className={`text-[0.72rem] tabular-nums ${matchResultsTokens.muted}`}>
                    {p.total_score} pts · {p.correct_count} correct
                  </p>
                </div>
                {i === 0 ? (
                  <Trophy className="h-4 w-4 shrink-0 text-emerald-600" aria-hidden />
                ) : null}
              </div>
            </MatchResultsLeaderboardCard>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2.5">
          {isHost ? (
            <GeoButton
              variant="solid"
              size="lg"
              className="min-h-11 w-full border border-[#111827] bg-[#111827] text-white"
              disabled={restartPending}
              onClick={onRestart}
            >
              Play again
            </GeoButton>
          ) : (
            <p className={`text-center text-[0.8rem] ${matchResultsTokens.muted}`}>
              Waiting for the host to start a new game…
            </p>
          )}
          <GeoButton
            variant="ghost"
            size="md"
            className="min-h-11 w-full bg-white text-[#111827] ring-1 ring-[#E5E7EB]"
            asChild
          >
            <Link to="/play">Back to play</Link>
          </GeoButton>
        </div>
      </div>
    </div>
  );
}