import { Flame, Globe2, Sparkles, Target, Zap } from "lucide-react";

import { AnimatedCounter } from "@/components/shared";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { MetaChip } from "@/features/play/components/Badges";
import { GameCard } from "@/features/play/components/GameCard";
import { useProfile } from "@/features/profile/lib/useProfile";
import type { PlayerSnapshot } from "../data/player";
import { useStreakStats } from "../hooks/useStreakStats";

/** Player summary header used at the top of every progression surface. */
export function PlayerSummaryCard({ player }: { player: PlayerSnapshot }) {
  const profile = useProfile();
  const { stats: streak } = useStreakStats();
  const currentStreak = streak.current;

  const stats = [
    { icon: Sparkles, label: "Total XP", value: player.xp, suffix: " XP" },
    { icon: Zap, label: "Quizzes", value: player.totalQuizzes, suffix: "" },
    { icon: Target, label: "Accuracy", value: player.accuracy, suffix: "%", decimals: 1 },
    {
      icon: Flame,
      label: "Streak",
      value: currentStreak,
      suffix: currentStreak === 1 ? " day" : " days",
    },
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
            {profile.identityPending ? (
              <span
                className="block h-[78px] w-[78px] shrink-0 animate-pulse rounded-full bg-bronze/15 motion-reduce:animate-none"
                aria-hidden
              />
            ) : (
              <UserAvatar
                avatarUrl={profile.avatarUrl}
                avatarId={profile.avatarId}
                size={78}
                className="drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
              />
            )}
            <div className="min-w-0">
              {profile.identityPending ? (
                <span
                  className="block h-6 w-40 animate-pulse rounded-md bg-bronze/10 motion-reduce:animate-none"
                  aria-hidden
                />
              ) : (
                <h2 className="truncate text-xl font-semibold tracking-tight text-foreground">
                  {profile.displayName || "Profile unavailable"}
                </h2>
              )}
              {profile.handle ? (
                <p className="mt-1 text-xs text-foreground/50">{profile.handle}</p>
              ) : null}
              {profile.identityError ? (
                <button
                  type="button"
                  className="mt-2 text-xs text-bronze underline underline-offset-2"
                  onClick={() => profile.retryProfile()}
                >
                  Retry profile
                </button>
              ) : null}
              <p className="mt-3">
                <MetaChip tone="bronze">
                  <Sparkles className="h-3 w-3" strokeWidth={2.4} aria-hidden="true" />
                  {player.favoriteCategory} specialist
                </MetaChip>
              </p>
            </div>
          </div>
        </div>

        <dl className="mt-8 grid grid-cols-2 gap-4 border-t border-bronze/12 pt-6 sm:grid-cols-3 lg:grid-cols-5">
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
