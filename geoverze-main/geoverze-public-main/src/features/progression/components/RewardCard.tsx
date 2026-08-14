import { Lock, Sparkles } from "lucide-react";

import { CoverArt } from "@/features/play/components/CoverArt";
import { GameCard } from "@/features/play/components/GameCard";
import { MetaChip } from "@/features/play/components/Badges";
import type { Reward } from "../data/rewards";

const STATUS_LABEL: Record<Reward["status"], string> = {
  available: "Available",
  locked: "Locked",
  "coming-soon": "Coming soon",
};

/** Premium reward tile with procedural art and a glow on hover. */
export function RewardCard({ reward }: { reward: Reward }) {
  const locked = reward.status !== "available";

  return (
    <GameCard className="group h-full">
      <div className="relative">
        <CoverArt art={reward.art} ratio="video" />
        <span className="absolute right-3 top-3">
          <MetaChip tone={locked ? "muted" : "bronze"}>
            {locked ? (
              <Lock className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
            ) : (
              <Sparkles className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
            )}
            {STATUS_LABEL[reward.status]}
          </MetaChip>
        </span>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity motion-snap group-hover:opacity-100"
          style={{ boxShadow: "var(--glow-bronze) inset" }}
        />
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">{reward.title}</h3>
          <span className="shrink-0 text-xs font-semibold text-bronze-glow">{reward.value}</span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-foreground/55">{reward.description}</p>
      </div>
    </GameCard>
  );
}
