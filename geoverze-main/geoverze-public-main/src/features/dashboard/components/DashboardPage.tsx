import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Bell, Flame, Pencil, Sparkles } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { AvatarMark } from "@/features/auth/components/AvatarMark";
import { greetingFor, motivationFor, QUICK_ACTIONS } from "@/features/dashboard/data/dashboard";
import { RECENT_ACTIVITY } from "@/features/dashboard/data/activity";
import { formatJoinDate, useProfile } from "@/features/profile/lib/useProfile";
import { STREAK } from "@/features/profile/data/stats";
import { StreakPanel } from "@/features/progress";
import { CreditProgressBar } from "@/features/progression/components/CreditProgressBar";
import { LevelBadge } from "@/features/progression/components/LevelBadge";
import { XpProgressBar } from "@/features/progression/components/XpProgressBar";
import { nextLevel } from "@/features/progression/lib/progress";
import { REDEMPTION } from "@/features/progression/data/player";
import { ActivityFeedItem } from "@/components/shared/ActivityFeedItem";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";
import { selectUnreadCount, useNotificationsStore } from "@/stores/notificationsStore";

import { DashboardWidgets } from "./DashboardWidgets";

/**
 * Logged-in command centre.
 *
 * Content is placeholder until the quiz engine reports real telemetry; the
 * identity block is genuine and reads from the session, onboarding and profile
 * stores through `useProfile`.
 */
export function DashboardPage() {
  const profile = useProfile();
  const unread = useNotificationsStore(selectUnreadCount);
  const player = useProgressionStore(selectPlayer);
  const next = nextLevel(player.level);
  const greeting = greetingFor();
  const motivation = motivationFor();
  const goalProgress = Math.round((STREAK.daysThisWeek / STREAK.weeklyGoal) * 100);

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <GlassCard strong className="p-7 sm:p-9">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex min-w-0 items-center gap-5">
                <AvatarMark id={profile.avatarId} size={72} />
                <div className="min-w-0">
                  <p className="eyebrow">{greeting}</p>
                  <h1 className="mt-2 truncate text-[clamp(1.6rem,3.4vw,2.4rem)] font-light tracking-tight text-foreground">
                    {profile.displayName}
                  </h1>
                  <p className="mt-2 text-xs text-foreground/50">
                    {profile.handle} · Explorer since {formatJoinDate(profile.joinedAt)}
                  </p>
                </div>
              </div>

              <div className="w-full max-w-md shrink-0 space-y-6">
                <div className="flex items-center justify-between gap-5">
                  <LevelBadge level={player.level} title={player.levelTitle} />
                  <ProgressRing value={goalProgress} label="Weekly goal" size={80}>
                    <span className="text-base font-light text-gradient-bronze">
                      {STREAK.daysThisWeek}/{STREAK.weeklyGoal}
                    </span>
                    <span className="text-[0.5rem] uppercase tracking-[0.24em] text-foreground/50">
                      goal
                    </span>
                  </ProgressRing>
                </div>
                <XpProgressBar
                  xpIntoLevel={player.xpIntoLevel}
                  xpForLevel={player.xpForLevel}
                  nextLevelLabel={next ? `Level ${next.level} · ${next.title}` : undefined}
                />
                <CreditProgressBar credits={player.credits} goal={REDEMPTION.goal} />
              </div>
            </div>

            <div className="mt-8 border-t border-bronze/10 pt-7">
              <StreakPanel compact />
            </div>

            <p className="mt-8 flex items-start gap-3 border-t border-bronze/10 pt-6 text-sm italic text-foreground/50">
              <Sparkles
                className="mt-0.5 h-4 w-4 shrink-0 text-bronze/90"
                strokeWidth={1.4}
                aria-hidden="true"
              />
              {motivation}
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <GeoButton asChild variant="primary">
                <Link to="/play">Start expedition</Link>
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
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Recent activity"
            title="What you have been up to"
            description="Quizzes, badges, credits and saves in one timeline. Placeholder entries until sessions are recorded."
          />
        </AnimatedSection>
        <AnimatedSection className="mt-8">
          <GlassCard className="p-4 sm:p-6">
            <ul className="space-y-1">
              {RECENT_ACTIVITY.map((entry) => (
                <ActivityFeedItem
                  key={entry.id}
                  icon={entry.icon}
                  title={entry.title}
                  detail={entry.detail}
                  when={entry.when}
                  tone={entry.tone}
                  {...(entry.to ? { to: entry.to } : {})}
                />
              ))}
            </ul>
            <div className="mt-6 border-t border-bronze/10 pt-5">
              <GeoButton asChild variant="ghost" size="sm">
                <Link to="/quiz-history">See full quiz history</Link>
              </GeoButton>
            </div>
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Quick actions"
            title="Where do you want to go?"
            description="Six doors into the platform. Modules still in construction say so on arrival."
          />
        </AnimatedSection>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {QUICK_ACTIONS.map((action, index) => (
            <AnimatedSection key={action.id} delay={index * 60}>
              <Link
                to={action.to}
                className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/45"
              >
                <GlassCard className="flex h-full flex-col p-6 transition-colors motion-base group-hover:border-bronze/35">
                  <div className="flex items-start justify-between gap-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-bronze/25 bg-bronze/5 text-bronze">
                      <action.icon className="h-4 w-4" strokeWidth={1.4} aria-hidden="true" />
                    </span>
                    {action.badge ? <AnimatedBadge>{action.badge}</AnimatedBadge> : null}
                  </div>
                  <p className="mt-5 flex items-center gap-2 text-sm text-foreground/85">
                    {action.label}
                    <ArrowUpRight
                      className="h-3.5 w-3.5 text-bronze/90 transition-transform motion-base group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-foreground/50">
                    {action.description}
                  </p>
                </GlassCard>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </SectionContainer>

      <DashboardWidgets />
    </PageShell>
  );
}
