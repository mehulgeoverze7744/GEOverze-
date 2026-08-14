import { Check, Crown, HelpCircle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { CoverArt } from "@/features/play/components/CoverArt";
import { MetaChip } from "@/features/play/components/Badges";
import { MEMBERSHIP_LABEL, type MatchPlayer } from "../data/players";

/** One player seat: identity, rank and ready state. */
export function PlayerSlot({
  player,
  ready,
  onToggleReady,
  className,
}: {
  player: MatchPlayer;
  ready?: boolean;
  onToggleReady?: (id: string) => void;
  className?: string;
}) {
  return (
    <div className={cn("game-surface overflow-hidden rounded-2xl", className)}>
      <div className="relative">
        <CoverArt art={player.art} ratio="wide" className="h-24" />
        {player.you ? (
          <span className="absolute left-3 top-3">
            <MetaChip tone="bronze">You</MetaChip>
          </span>
        ) : null}
        <span className="absolute right-3 top-3">
          <MetaChip>
            <Crown className="h-3 w-3 text-bronze" strokeWidth={2.2} aria-hidden />
            {MEMBERSHIP_LABEL[player.membership]}
          </MetaChip>
        </span>
      </div>
      <div className="p-4">
        <p className="truncate text-[0.9rem] font-semibold tracking-tight text-foreground">
          {player.flag} {player.username}
        </p>
        <p className="mt-1 text-[0.72rem] text-foreground/50">
          Level {player.level} · {player.rankTitle}
        </p>
        <p className="mt-3 text-[0.7rem] tabular-nums text-foreground/50">
          {player.winRate}% win rate · {player.country}
        </p>
        {onToggleReady && player.you ? (
          <button
            type="button"
            onClick={() => onToggleReady(player.id)}
            aria-pressed={Boolean(ready)}
            className={cn(
              "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em] transition-all motion-snap active:scale-[0.98]",
              ready
                ? "border-bronze bg-bronze/20 text-bronze-glow"
                : "border-bronze/25 bg-[oklch(0.185_0.008_62)] text-foreground/60 hover:border-bronze/60",
            )}
          >
            {ready ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
            ) : (
              <HelpCircle className="h-3.5 w-3.5" strokeWidth={2.2} aria-hidden />
            )}
            {ready ? "Ready" : "Not ready"}
          </button>
        ) : (
          <p
            className={cn(
              "mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-[0.75rem] font-semibold uppercase tracking-[0.14em]",
              ready
                ? "border-bronze/40 bg-bronze/12 text-bronze-glow"
                : "border-bronze/15 bg-[oklch(0.185_0.008_62)] text-foreground/50",
            )}
          >
            {ready ? (
              <Check className="h-3.5 w-3.5" strokeWidth={2.4} aria-hidden />
            ) : (
              <Loader2
                className="h-3.5 w-3.5 animate-spin motion-reduce:animate-none"
                aria-hidden
              />
            )}
            {ready ? "Ready" : "Waiting"}
          </p>
        )}
      </div>
    </div>
  );
}

/** Reserved, inert seat for a feature that has not shipped yet. */
export function ReservedSlot({ label, note }: { label: string; note: string }) {
  return (
    <div
      aria-disabled
      className="rounded-2xl border border-dashed border-bronze/25 bg-[oklch(0.14_0.006_60/0.6)] p-5 text-center"
    >
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-bronze/90">
        {label}
      </p>
      <p className="mt-2 text-[0.78rem] leading-relaxed text-foreground/50">{note}</p>
    </div>
  );
}
