import { Check, Crown } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { cn } from "@/lib/utils";
import type { DrawParticipant } from "../types";

type PlayerScoreListProps = {
  participants: DrawParticipant[];
  currentDrawerId?: string | undefined;
  correctUserIds?: string[] | undefined;
  myUserId?: string | undefined;
};

export function PlayerScoreList({
  participants, currentDrawerId, correctUserIds = [], myUserId,
}: PlayerScoreListProps) {
  const sorted = [...participants].sort((a, b) => b.total_score - a.total_score);

  return (
    <ul className="flex flex-col gap-2" aria-label="Scores">
      {sorted.map((p) => {
        const isDrawer = p.user_id === currentDrawerId;
        const hasGuessed = correctUserIds.includes(p.user_id);
        const isYou = p.user_id === myUserId;

        return (
          <li
            key={p.user_id}
            className={cn(
              "flex items-center gap-3 rounded-xl border p-2 transition-colors",
              isDrawer ? "border-bronze/40 bg-bronze/8" : "border-bronze/15 bg-transparent",
              p.left_game || !p.connected ? "opacity-50" : "",
            )}
          >
            <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded-full border border-bronze/25">
              <CoverArt art={p.avatar_id ?? "solo"} ratio="square" className="h-8 w-8" />
            </div>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate text-[0.78rem] font-semibold text-foreground">
                {p.is_host ? (
                  <Crown className="h-3 w-3 flex-shrink-0 text-bronze" strokeWidth={2} aria-label="Host" />
                ) : null}
                {isDrawer ? <span className="mr-0.5 text-[0.65rem]" aria-hidden>🎨</span> : null}
                {p.display_name || p.username}
                {isYou ? <span className="text-[0.6rem] font-normal text-foreground/40">(you)</span> : null}
              </p>
              <p className="text-[0.7rem] text-foreground/50 tabular-nums">{p.total_score} pts</p>
            </div>

            <span className="flex-shrink-0">
              {hasGuessed && !isDrawer ? (
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                  <Check className="h-3 w-3" strokeWidth={3} aria-label="Guessed" />
                </span>
              ) : isDrawer ? (
                <span className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-bronze/80">
                  drawing
                </span>
              ) : p.left_game ? (
                <span className="text-[0.6rem] text-foreground/40">left</span>
              ) : !p.connected ? (
                <span className="text-[0.6rem] text-foreground/40">offline</span>
              ) : null}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
