import { Flame, Globe2, Sparkles, Target, Zap } from "lucide-react";

import { AnimatedCounter } from "@/components/shared";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { MetaChip } from "@/features/play/components/Badges";
import { GameCard } from "@/features/play/components/GameCard";
import { useProfile } from "@/features/profile/lib/useProfile";
import type { PlayerSnapshot } from "../data/player";
import { nextLevel } from "../lib/progress";
import { LevelBadge } from "./LevelBadge";
import { XpProgressBar } from "./XpProgressBar";

/** Player summary header used at the top of every progression surface. */
export function PlayerSummaryCard({ player }: { player: PlayerSnapshot }) {
  const profile = useProfile();
  const next = nextLevel(player.level);

  const stats = [
    { icon: Zap, label: "Quizzes", value: player.totalQuizzes, suffix: "" },
    { icon: Target, label: "Accuracy", value: player.accuracy, suffix: "%", decimals: 1 },
    { icon: Flame, label: "Streak", value: player.currentStreak, suffix: " days" },
    {
      icon: Globe2,
      label: "Countries",
      value: player.countriesExplored,
      suffix: ` / ${player.countriesTotal}`,
    },
  ];

  return (
    <GameCard interactive={false} raised>
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-5">
            <UserAvatar
              avatarUrl={profile.avatarUrl}
              avatarId={profile.avatarId}
              size={78}
              className="drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
            />
            <div className="min-w-0">
              <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">
                {profile.displayName}
              </h2>
              <p className="mt-1 text-xs text-foreground/50">{profile.handle}</p>
              <p className="mt-3">
                <MetaChip tone="bronze">
                  <Sparkles className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
                  {player.favoriteCategory} specialist
                </MetaChip>
              </p>
            </div>
          </div>
          <LevelBadge level={player.level} title={player.levelTitle} size="lg" />
        </div>

        <XpProgressBar
          className="mt-8"
          xpIntoLevel={player.xpIntoLevel}
          xpForLevel={player.xpForLevel}
          nextLevelLabel={next ? `Level ${next.level} · ${next.title}` : undefined}
        />

        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-bronze/12 pt-6 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="inline-flex items-center gap-2 text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
                <stat.icon
                  className="h-3.5 w-3.5 text-bronze/90"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                {stat.label}
              </dt>
              <dd className="mt-2 text-lg font-semibold text-foreground">
                <AnimatedCounter
                  value={stat.value}
                  decimals={stat.decimals ?? 0}
                  suffix={stat.suffix}
                />
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </GameCard>
  );
}
