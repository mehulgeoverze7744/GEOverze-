import { Link } from "@tanstack/react-router";
import { Bell, Compass, Pencil, Sparkles } from "lucide-react";

import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { GeoButton } from "@/components/shared/GeoButton";
import { UserAvatar } from "@/features/auth/components/UserAvatar";
import { greetingFor, motivationFor } from "@/features/dashboard/data/dashboard";
import { formatJoinDate, useProfile } from "@/features/profile/lib/useProfile";
import { CreditProgressBar } from "@/features/progression/components/CreditProgressBar";
import { useCreditHistory } from "@/features/progression/hooks/useCreditHistory";
import { nextLevel } from "@/features/progression/lib/progress";
import { REDEMPTION } from "@/features/progression/data/player";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { selectUnreadCount, useNotificationsStore } from "@/stores/notificationsStore";
import { cn } from "@/lib/utils";

import { DashboardEarthBackground } from "./DashboardEarthBackground";
import { PlayerProgressHud } from "./PlayerProgressHud";

/**
 * Cinematic explorer command-centre hero — identity, progression and CTAs.
 *
 * Layer stack (back → front):
 * atmosphere → Earth → surface gradient → content shade → interactive content
 */
export function DashboardHero({ className }: { className?: string }) {
  const profile = useProfile();
  const unread = useNotificationsStore(selectUnreadCount);
  const player = useProgressionStore(selectPlayer);
  const { monthlyEarned } = useCreditHistory();
  const next = nextLevel(player.level);
  const greeting = greetingFor();
  const motivation = motivationFor();

  return (
    <section
      className={cn(
        "dashboard-hero relative overflow-hidden rounded-[1.75rem] border border-bronze/22",
        className,
      )}
    >
      <div className="dashboard-hero-atmosphere pointer-events-none absolute inset-0" aria-hidden="true">
        <DashboardEarthBackground />
        <div className="dashboard-hero-surface" />
        <div className="dashboard-hero-content-shade" />
        <div className="dashboard-hero-glow" />
      </div>

      <div className="relative z-[1] p-6 sm:p-8 lg:p-10 xl:p-12">
        <div className="dashboard-hero-content max-w-[min(100%,640px)] space-y-6 lg:max-w-[52%]">
          <div className="flex items-start gap-4 sm:gap-5">
            <UserAvatar
              avatarUrl={profile.avatarUrl}
              avatarId={profile.avatarId}
              size={80}
              className="shrink-0 drop-shadow-[0_8px_20px_rgba(0,0,0,0.45)]"
            />
            <div className="min-w-0 pt-1">
              <p className="dashboard-section-label">{greeting}</p>
              <h1 className="mt-2 truncate text-[clamp(1.75rem,3.6vw,2.65rem)] font-light tracking-tight text-foreground">
                {profile.displayName}
              </h1>
              <p className="mt-2 text-sm text-foreground/55">
                <span className="text-bronze/90">{profile.handle}</span>
                <span className="mx-2 text-foreground/25">·</span>
                Explorer since {formatJoinDate(profile.joinedAt)}
              </p>
            </div>
          </div>

          <PlayerProgressHud
            level={player.level}
            levelTitle={player.levelTitle}
            xpIntoLevel={player.xpIntoLevel}
            xpForLevel={player.xpForLevel}
            nextRank={next ? { level: next.level, title: next.title } : null}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="dashboard-reward-module rounded-2xl border border-bronze/18 bg-charcoal/35 p-4 backdrop-blur-sm">
              <p className="dashboard-section-label">Geo credits</p>
              <p className="mt-2 text-[clamp(1.6rem,2.8vw,2.1rem)] font-light leading-none text-gradient-bronze">
                <AnimatedCounter value={player.credits} />
              </p>
              <p className="mt-2 text-xs text-foreground/50">Available</p>
            </div>
            <div className="dashboard-reward-module rounded-2xl border border-bronze/18 bg-charcoal/35 p-4 backdrop-blur-sm">
              <CreditProgressBar
                credits={monthlyEarned}
                goal={REDEMPTION.goal}
                label="Monthly progress"
              />
            </div>
          </div>

          <p className="flex items-start gap-3 text-sm italic text-foreground/50">
            <Sparkles
              className="mt-0.5 h-4 w-4 shrink-0 text-bronze/90"
              strokeWidth={1.4}
              aria-hidden="true"
            />
            {motivation}
          </p>

          <div className="flex flex-wrap gap-3">
            <GeoButton asChild variant="primary" className="dashboard-cta-expedition group">
              <Link to="/play">
                <Compass
                  className="mr-2 h-4 w-4 transition-transform motion-base group-hover:rotate-12 motion-reduce:transform-none"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                Start expedition
              </Link>
            </GeoButton>
            <GeoButton asChild variant="secondary">
              <Link to="/progress">View progress</Link>
            </GeoButton>
            <GeoButton asChild variant="secondary">
              <Link to="/profile/edit">
                <Pencil className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                Edit profile
              </Link>
            </GeoButton>
            <GeoButton asChild variant="ghost">
              <Link to="/notifications">
                <Bell className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                Notifications
                {unread > 0 ? <span className="ml-2 text-bronze">{unread}</span> : null}
              </Link>
            </GeoButton>
          </div>
        </div>
      </div>
    </section>
  );
}
