import { Flame, Play, Trophy } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { useMidnightCountdown } from "../lib/useMidnightCountdown";
import { MetaChip } from "./Badges";
import { CoverArt } from "./CoverArt";
import { GameCard } from "./GameCard";

/** Daily challenge banner with a live countdown to the midnight reset. */
export function DailyChallenge({ onPlay }: { onPlay: () => void }) {
  const { hours, minutes, seconds } = useMidnightCountdown();

  return (
    <GameCard interactive={false} className="relative">
      <div className="absolute inset-0">
        <CoverArt art="daily-banner" className="h-full" ratio="square" />
      </div>
      <div className="relative grid gap-6 bg-[oklch(0.13_0.006_60/0.82)] p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
        <div>
          <div className="flex flex-wrap gap-2">
            <MetaChip tone="bronze">
              <Flame className="h-3 w-3" strokeWidth={2.4} /> Daily challenge
            </MetaChip>
            <MetaChip>
              <Trophy className="h-3 w-3" strokeWidth={2.2} /> Double XP
            </MetaChip>
          </div>
          <h2 className="mt-4 text-xl font-semibold tracking-tight text-foreground md:text-2xl">
            Ten questions. One attempt. A new set at midnight.
          </h2>
          <p className="mt-2 max-w-xl text-[0.85rem] leading-relaxed text-foreground/60">
            Finish clean to extend your streak and climb today&apos;s global board.
          </p>
        </div>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div className="flex gap-2" aria-label="Time until the next daily challenge">
            {[
              { value: hours, label: "hrs" },
              { value: minutes, label: "min" },
              { value: seconds, label: "sec" },
            ].map((unit) => (
              <div
                key={unit.label}
                className="game-surface-raised min-w-[3.6rem] rounded-xl px-3 py-2 text-center"
              >
                <span className="block text-lg font-semibold tabular-nums tracking-tight text-bronze-glow">
                  {unit.value}
                </span>
                <span className="block text-[0.55rem] uppercase tracking-[0.2em] text-foreground/50">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
          <GeoButton variant="solid" size="lg" onClick={onPlay}>
            <Play className="h-4 w-4" strokeWidth={2.4} />
            Play today&apos;s set
          </GeoButton>
        </div>
      </div>
    </GameCard>
  );
}
