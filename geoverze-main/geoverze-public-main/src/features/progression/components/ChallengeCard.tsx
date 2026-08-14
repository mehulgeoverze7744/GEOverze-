import { CheckCircle2, Clock3 } from "lucide-react";

import { DifficultyBadge, MetaChip } from "@/features/play/components/Badges";
import { CoverArt } from "@/features/play/components/CoverArt";
import { GameCard } from "@/features/play/components/GameCard";
import type { Challenge } from "../data/challenges";
import { ProgressBarFill } from "./ProgressBarFill";

/** Daily / weekly challenge tile. */
export function ChallengeCard({ challenge }: { challenge: Challenge }) {
  const pct = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));
  const complete = challenge.progress >= challenge.target;

  return (
    <GameCard className="h-full">
      <div className="relative">
        <CoverArt art={challenge.art} ratio="wide" />
        <span className="absolute left-3 top-3">
          <DifficultyBadge level={challenge.difficulty} />
        </span>
        {complete ? (
          <span className="absolute right-3 top-3">
            <MetaChip tone="bronze">
              <CheckCircle2 className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" /> Complete
            </MetaChip>
          </span>
        ) : null}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">{challenge.title}</h3>
          <span className="shrink-0 rounded-full border border-bronze/45 bg-bronze/12 px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.1em] text-bronze-glow">
            {challenge.reward}
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-foreground/55">{challenge.description}</p>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[0.68rem] text-foreground/50">
            <span>Progress</span>
            <span className="tabular-nums">
              {challenge.progress} / {challenge.target}
            </span>
          </div>
          <ProgressBarFill
            className="mt-2"
            value={pct}
            label={`${challenge.title} progress`}
            valueText={`${challenge.progress} of ${challenge.target}`}
            tone={complete ? "bronze" : "muted"}
          />
        </div>

        <p className="mt-4 inline-flex items-center gap-2 text-[0.68rem] text-foreground/50">
          <Clock3 className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden="true" />
          {challenge.timeRemaining}
        </p>
      </div>
    </GameCard>
  );
}
