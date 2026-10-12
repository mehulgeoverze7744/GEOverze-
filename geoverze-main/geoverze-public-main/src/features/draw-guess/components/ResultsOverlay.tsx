import { Link } from "@tanstack/react-router";
import { Trophy } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { ParticipantAvatar } from "@/features/matchmaking/components/RoomPlayerAvatar";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[oklch(0.07_0.004_60/0.88)] backdrop-blur-sm p-4">
      <div className="game-surface mx-auto w-full max-w-lg rounded-3xl p-8">
        <div className="text-center">
          <Trophy className="mx-auto h-10 w-10 text-bronze" strokeWidth={1.6} aria-hidden />
          <h2 className="mt-4 text-2xl font-semibold tracking-tight text-foreground">Game over!</h2>
          {winner ? (
            <p className="mt-2 text-[0.9rem] text-foreground/65">
              Winner:{" "}
              <span className="font-semibold text-bronze-glow">
                {winner.display_name || winner.username}
              </span>{" "}
              with {winner.total_score} pts
            </p>
          ) : null}
        </div>

        <ul className="mt-6 flex flex-col gap-2" aria-label="Final leaderboard">
          {sorted.map((p, i) => (
            <li
              key={p.user_id}
              className="flex items-center gap-3 rounded-xl border border-bronze/20 p-3"
            >
              <span className="w-5 text-center text-[0.8rem] font-semibold text-foreground/50">
                {i + 1}.
              </span>
              <ParticipantAvatar
                participant={p}
                you={p.user_id === myUserId}
                selfAvatar={{ avatarId: user?.avatarId, avatarUrl: user?.avatarUrl }}
                size={32}
                alt=""
              />
              <div className="flex-1">
                <p className="text-[0.82rem] font-semibold text-foreground">
                  {p.display_name || p.username}
                  {p.user_id === myUserId ? (
                    <span className="ml-1 text-[0.65rem] font-normal text-foreground/40">
                      (you)
                    </span>
                  ) : null}
                </p>
                <p className="text-[0.7rem] text-foreground/50 tabular-nums">
                  {p.total_score} pts · {p.correct_count} correct
                </p>
              </div>
              {i === 0 ? (
                <span className="text-[1.1rem]" aria-hidden>
                  🏆
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-3">
          {isHost ? (
            <GeoButton
              variant="solid"
              size="lg"
              className="w-full"
              disabled={restartPending}
              onClick={onRestart}
            >
              Play again
            </GeoButton>
          ) : (
            <p className="text-center text-[0.8rem] text-foreground/50">
              Waiting for the host to start a new game…
            </p>
          )}
          <GeoButton variant="ghost" size="md" className="w-full" asChild>
            <Link to="/play">Return to Let's Play</Link>
          </GeoButton>
        </div>
      </div>
    </div>
  );
}
