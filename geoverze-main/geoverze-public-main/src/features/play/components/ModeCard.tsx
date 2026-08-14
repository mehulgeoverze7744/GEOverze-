import { Lock } from "lucide-react";

import { GeoButton } from "@/components/shared";
import type { GameMode } from "../data/gameModes";
import { MetaChip } from "./Badges";
import { CoverArt } from "./CoverArt";
import { GameCard } from "./GameCard";

/** Large game-mode selection card. */
export function ModeCard({ mode, onSelect }: { mode: GameMode; onSelect: (m: GameMode) => void }) {
  return (
    <GameCard interactive={!mode.comingSoon} className="flex flex-col">
      <div className="relative">
        <CoverArt art={mode.art} icon={mode.icon} ratio="wide" />
        {mode.comingSoon ? (
          <div className="absolute right-3 top-3">
            <MetaChip>
              <Lock className="h-3 w-3" strokeWidth={2.2} /> Coming soon
            </MetaChip>
          </div>
        ) : null}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-base font-semibold tracking-tight text-foreground">{mode.title}</h3>
        <p className="mt-2 flex-1 text-[0.82rem] leading-relaxed text-foreground/55">
          {mode.description}
        </p>
        <GeoButton
          variant={mode.comingSoon ? "dark" : "solid"}
          size="md"
          className="mt-5 w-full"
          disabled={mode.comingSoon}
          onClick={() => onSelect(mode)}
        >
          {mode.cta}
        </GeoButton>
      </div>
    </GameCard>
  );
}
