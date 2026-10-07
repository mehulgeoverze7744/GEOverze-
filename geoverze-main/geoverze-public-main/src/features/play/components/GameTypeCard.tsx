import { Link, useNavigate } from "@tanstack/react-router";
import { Play } from "lucide-react";

import { GeoButton } from "@/components/shared";
import { cn } from "@/lib/utils";
import type { GameType } from "../data/gameTypes";
import { MetaChip } from "./Badges";
import { CoverArt } from "./CoverArt";
import { GameCard } from "./GameCard";

/** Game-type selection card — same lobby structure as collection cards. */
export function GameTypeCard({ type }: { type: GameType }) {
  const navigate = useNavigate();
  const playable = Boolean(type.to);

  const play = () => {
    if (!type.to) return;
    navigate({
      to: type.to,
      search: type.search ?? { q: undefined, category: undefined },
    });
  };

  return (
    <GameCard interactive className="group/card flex h-full cursor-pointer flex-col" onClick={play}>
      <div className="relative">
        <CoverArt art={type.art} ratio="wide" />
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-bronze/45 bg-[oklch(0.12_0.006_60/0.82)] shadow-[0_8px_24px_oklch(0_0_0/0.35)] transition-transform duration-200 ease-out group-hover/card:scale-110 motion-reduce:transition-none motion-reduce:group-hover/card:scale-100">
            <span
              aria-hidden="true"
              className="select-none text-[32px] leading-none"
              style={{
                fontFamily:
                  '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif',
                fontVariantEmoji: "emoji",
                color: "initial",
                WebkitTextFillColor: "initial",
              }}
            >
              {type.emoji}
            </span>
          </span>
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex flex-wrap items-center gap-2">
          {type.tags.map((tag) => (
            <MetaChip key={tag} tone="bronze">
              {tag}
            </MetaChip>
          ))}
        </div>
        <h3 className="mt-4 text-[0.98rem] font-semibold tracking-tight text-foreground">
          {type.title}
        </h3>
        <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-foreground/55">
          {type.description}
        </p>
        <GeoButton
          asChild={playable}
          variant="solid"
          size="md"
          className={cn(
            "mt-5 w-full transition-[filter] duration-200 group-hover/card:brightness-110",
          )}
          onClick={
            playable
              ? undefined
              : (event) => {
                  event.stopPropagation();
                }
          }
        >
          {playable && type.to ? (
            <Link
              to={type.to}
              search={type.search ?? { q: undefined, category: undefined }}
              onClick={(event) => event.stopPropagation()}
            >
              <Play className="h-4 w-4" strokeWidth={2.4} aria-hidden />
              Play now
            </Link>
          ) : (
            <>
              <Play className="h-4 w-4" strokeWidth={2.4} aria-hidden />
              Play now
            </>
          )}
        </GeoButton>
      </div>
    </GameCard>
  );
}
