import { Clock, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { SessionHero } from "@/features/play/components/SessionHero";
import { thumbnailForGameType } from "@/features/play/data/sessionArtwork";
import { cn } from "@/lib/utils";
import type { DrawCurrentTurn, DrawRoom } from "../types";

type GameHeaderProps = {
  room: DrawRoom;
  turn: DrawCurrentTurn | null;
  totalTurns: number;
  drawerName: string | undefined;
};

function useCountdown(endsAt: string | null | undefined): number | null {
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

export function GameHeader({ room, turn, totalTurns, drawerName }: GameHeaderProps) {
  const countdown = useCountdown(
    turn?.status === "drawing"
      ? turn.turn_ends_at
      : turn?.status === "choosing"
        ? turn.choose_deadline
        : null,
  );

  const timerColor =
    countdown == null
      ? "text-foreground/40"
      : countdown > 20
        ? "text-foreground"
        : countdown > 10
          ? "text-amber-400"
          : "text-red-400";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-bronze/20 bg-[oklch(0.12_0.006_60/0.7)] px-4 py-3 text-sm">
      <div className="h-9 w-14 shrink-0 overflow-hidden rounded-lg border border-bronze/25">
        <SessionHero thumbnail={thumbnailForGameType("draw-guess")} className="h-full" />
      </div>
      {/* Room code */}
      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-foreground/50">
        Room <span className="text-foreground">{room.room_code}</span>
      </span>

      {/* Round & turn progress */}
      <div className="flex items-center gap-2 text-[0.78rem] text-foreground/70">
        <Users className="h-3.5 w-3.5 text-bronze/80" strokeWidth={2} aria-hidden />
        Round <span className="font-semibold text-foreground">{room.current_round}</span>/
        {room.rounds}
        &nbsp;·&nbsp; Turn{" "}
        <span className="font-semibold text-foreground">{turn?.turn_number ?? "–"}</span>/
        {totalTurns}
      </div>

      {/* Timer */}
      <div className="flex items-center gap-2">
        <Clock className="h-3.5 w-3.5 text-bronze/80" strokeWidth={2} aria-hidden />
        <span className={cn("min-w-[2ch] text-right font-semibold tabular-nums", timerColor)}>
          {countdown != null ? countdown : "–"}
        </span>
        <span className="text-[0.7rem] text-foreground/50">s</span>
      </div>

      {/* Active drawer */}
      {turn?.status !== "ended" && drawerName ? (
        <span className="text-[0.75rem] text-foreground/70">
          <span aria-hidden>🎨</span>{" "}
          <span className="font-semibold text-bronze">{drawerName}</span>
          {turn?.status === "choosing" ? " is choosing a word…" : " is drawing"}
        </span>
      ) : null}
    </div>
  );
}
