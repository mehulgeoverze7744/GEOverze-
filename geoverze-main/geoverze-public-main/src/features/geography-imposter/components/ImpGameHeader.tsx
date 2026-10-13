import { Clock, Shield, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { SessionHero } from "@/features/play/components/SessionHero";
import { thumbnailForGameType } from "@/features/play/data/sessionArtwork";
import { cn } from "@/lib/utils";
import type { ImpGamePhase, ImpRoom } from "../types";

// ─────────────────────────────────────────────
// Countdown hook
// ─────────────────────────────────────────────

export function useCountdown(endsAt: string | null | undefined): number | null {
  const [secs, setSecs] = useState<number | null>(null);

  useEffect(() => {
    if (!endsAt) {
      setSecs(null);
      return;
    }
    const update = () => {
      const remaining = Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 1000));
      setSecs(remaining);
    };
    update();
    const id = window.setInterval(update, 500);
    return () => window.clearInterval(id);
  }, [endsAt]);

  return secs;
}

// ─────────────────────────────────────────────
// Phase label helpers
// ─────────────────────────────────────────────

function phaseLabel(phase: ImpGamePhase | null, round: number): string {
  if (!phase) return "Lobby";
  switch (phase) {
    case "clue":
      return `Round ${round} — Clues`;
    case "discussion":
      return `Round ${round} — Discussion`;
    case "voting":
      return "Final Vote";
    case "finalizing":
      return "Calculating…";
    case "reveal":
      return "Results";
  }
}

// ─────────────────────────────────────────────
// ImpGameHeader
// ─────────────────────────────────────────────

type ImpGameHeaderProps = {
  room: ImpRoom;
  participantCount: number;
};

export function ImpGameHeader({ room, participantCount }: ImpGameHeaderProps) {
  const countdown = useCountdown(room.phase_deadline);

  const timerColor =
    countdown === null
      ? "text-foreground/40"
      : countdown <= 5
        ? "text-red-400"
        : countdown <= 10
          ? "text-amber-400"
          : "text-emerald-400";

  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl game-surface px-4 py-3 text-sm">
      <div className="h-9 w-14 shrink-0 overflow-hidden rounded-lg border border-bronze/25">
        <SessionHero thumbnail={thumbnailForGameType("geography-imposter")} className="h-full" />
      </div>
      {/* Left: phase + round */}
      <div className="flex items-center gap-2 min-w-0">
        <Shield className="h-4 w-4 shrink-0 text-bronze" strokeWidth={1.9} aria-hidden />
        <span className="font-semibold truncate text-foreground">
          {phaseLabel(room.phase, room.current_round)}
        </span>
        {room.status === "playing" && room.phase !== "reveal" && room.phase !== "finalizing" && (
          <span className="text-[0.72rem] text-foreground/50 hidden sm:inline">
            · {room.difficulty}
          </span>
        )}
      </div>

      {/* Right: player count + timer */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="flex items-center gap-1 text-foreground/60">
          <Users className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
          {participantCount}
        </span>
        {countdown !== null && (
          <span className={cn("flex items-center gap-1 font-mono font-semibold", timerColor)}>
            <Clock className="h-3.5 w-3.5" strokeWidth={1.9} aria-hidden />
            {countdown}s
          </span>
        )}
      </div>
    </div>
  );
}
