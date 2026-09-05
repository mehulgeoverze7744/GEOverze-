import { Link } from "@tanstack/react-router";
import { Award, BookMarked, MapPin, Pencil, Settings2, Share2 } from "lucide-react";

import { PageShell } from "@/components/layout/PageShell";
import { AnimatedBadge } from "@/components/shared/AnimatedBadge";
import { AnimatedCounter } from "@/components/shared/AnimatedCounter";
import { AnimatedSection } from "@/components/shared/AnimatedSection";
import { GeoButton } from "@/components/shared/GeoButton";
import { GlassCard } from "@/components/shared/GlassCard";
import { ProgressRing } from "@/components/shared/ProgressRing";
import { SectionContainer } from "@/components/shared/SectionContainer";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { StatGrid } from "@/components/shared/StatGrid";
import { TimelineItem } from "@/components/shared/TimelineItem";
import { AvatarMark } from "@/features/auth/components/AvatarMark";
import { QUIZ_HISTORY } from "@/features/dashboard/data/dashboard";
import { ACHIEVEMENTS } from "@/features/profile/data/achievements";
import { PROFILE_STATS, RECORD_STATS, STREAK } from "@/features/profile/data/stats";
import { formatJoinDate, useProfile } from "@/features/profile/lib/useProfile";
import { ContinentMasteryList, StreakPanel } from "@/features/progress";
import { LevelBadge } from "@/features/progression/components/LevelBadge";
import { selectPlayer, useProgressionStore } from "@/stores/progressionStore";

/**
 * Public-facing explorer profile.
 *
 * Identity is real (session + onboarding + profile store); statistics and
 * badges are placeholder data until the quiz engine exists.
 */
export function ProfilePage() {
  const profile = useProfile();
  const player = useProgressionStore(selectPlayer);

  const unlocked = ACHIEVEMENTS.filter((item) => item.status === "unlocked");
  const completion = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <PageShell>
      <SectionContainer className="pt-[calc(var(--nav-height)+var(--space-section-sm))]">
        <AnimatedSection>
          <GlassCard strong className="overflow-hidden">
            <div aria-hidden="true" className="h-28 bg-gradient-bronze opacity-25 sm:h-36" />
            <div className="px-7 pb-8 sm:px-9">
              <div className="-mt-12 flex flex-col gap-6 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex items-end gap-5">
                  <AvatarMark
                    id={profile.avatarId}
                    size={104}
                    className="border border-bronze/30 bg-charcoal shadow-[var(--glow-bronze)]"
                  />
                  <div className="min-w-0 pb-1">
                    <h1 className="truncate text-[clamp(1.5rem,3.2vw,2.2rem)] font-light tracking-tight text-foreground">
                      {profile.displayName}
                    </h1>
                    <p className="mt-1 text-xs text-foreground/50">{profile.handle}</p>
                    <LevelBadge
                      className="mt-4"
                      size="sm"
                      level={player.level}
                      title={player.levelTitle}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 sm:pb-2">
                  <GeoButton asChild variant="primary">
                    <Link to="/profile/edit">
                      <Pencil className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                      Edit profile
                    </Link>
                  </GeoButton>
                  <GeoButton asChild variant="secondary">
                    <Link to="/settings">
                      <Settings2
                        className="mr-2 h-3.5 w-3.5"
                        strokeWidth={1.5}
                        aria-hidden="true"
                      />
                      Settings
                    </Link>
                  </GeoButton>
                </div>
              </div>

              <p className="mt-7 max-w-2xl text-sm leading-relaxed text-foreground/55">
                {profile.bio}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-foreground/50">
                {profile.country ? (
                  <span className="inline-flex items-center gap-2">
                    <MapPin
                      className="h-3.5 w-3.5 text-bronze/90"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    {profile.country.name}
                  </span>
                ) : null}
                <span>Explorer since {formatJoinDate(profile.joinedAt)}</span>
                {profile.skillLevel ? <span>{profile.skillLevel.label} tier</span> : null}
                <span className="inline-flex items-center gap-2">
                  <Share2
                    className="h-3.5 w-3.5 text-bronze/90"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  Public profile sharing arrives with the community phase
                </span>
              </div>

              {profile.interests.length > 0 ? (
                <ul className="mt-7 flex flex-wrap gap-2">
                  {profile.interests.map((interest) => (
                    <li key={interest.id}>
                      <AnimatedBadge>{interest.label}</AnimatedBadge>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </GlassCard>
        </AnimatedSection>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <AnimatedSection>
          <SectionHeading
            eyebrow="Statistics"
            title="Your expedition record"
            description="Illustrative figures until the quiz engine starts reporting."
          />
        </AnimatedSection>
        <div className="mt-8">
          <StatGrid stats={PROFILE_STATS} columns={3} />
        </div>
        <div className="mt-4">
          <StatGrid stats={RECORD_STATS} columns={4} />
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-2">
          <AnimatedSection>
            <GlassCard className="h-full p-7 sm:p-8">
              <SectionHeading as="h2" eyebrow="Mastery" title="Continents" />
              <div className="mt-8">
                <ContinentMasteryList />
              </div>
              <div className="mt-8">
                <GeoButton asChild variant="secondary">
                  <Link to="/progress">Full progress breakdown</Link>
                </GeoButton>
              </div>
            </GlassCard>
          </AnimatedSection>
          <AnimatedSection delay={80}>
            <GlassCard className="h-full p-7 sm:p-8">
              <SectionHeading as="h2" eyebrow="Consistency" title="Streak" />
              <div className="mt-8">
                <StreakPanel />
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </SectionContainer>

      <SectionContainer className="mt-[var(--space-section-sm)]">
        <div className="grid gap-4 lg:grid-cols-3">
          <AnimatedSection className="lg:col-span-2">
            <GlassCard className="p-6 sm:p-8">
              <SectionHeading
                as="h3"
                title="Recent activity"
                action={
                  <GeoButton asChild variant="ghost">
                    <Link to="/dashboard">Open dashboard</Link>
                  </GeoButton>
                }
              />
              <ol className="mt-7 list-none">
                {QUIZ_HISTORY.map((entry, index) => (
                  <TimelineItem
                    key={entry.id}
                    icon={entry.icon}
                    title={entry.title}
                    meta={entry.when}
                    last={index === QUIZ_HISTORY.length - 1}
                  >
                    Scored {entry.score} of {entry.total}
                  </TimelineItem>
                ))}
              </ol>
            </GlassCard>
          </AnimatedSection>

          <AnimatedSection delay={80}>
            <GlassCard className="flex h-full flex-col items-center p-6 text-center sm:p-8">
              <ProgressRing value={completion} label="Badge completion" size={120}>
                <span className="text-2xl font-light text-gradient-bronze">{completion}%</span>
                <span className="text-[0.55rem] uppercase tracking-[0.24em] text-foreground/50">
                  badges
                </span>
              </ProgressRing>
              <p className="mt-6 text-sm text-foreground/70">
                {unlocked.length} of {ACHIEVEMENTS.length} badges unlocked
              </p>
              <p className="mt-2 text-xs text-foreground/50">
                Longest streak {STREAK.longest} days
              </p>
              <div className="mt-7 flex w-full flex-col gap-3">
                <GeoButton asChild variant="secondary">
                  <Link to="/achievements">
                    <Award className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    Achievements and Rewards
                  </Link>
                </GeoButton>
                <GeoButton asChild variant="ghost">
                  <Link to="/bookmarks">
                    <BookMarked className="mr-2 h-3.5 w-3.5" strokeWidth={1.5} aria-hidden="true" />
                    Bookmarks
                  </Link>
                </GeoButton>
              </div>
            </GlassCard>
          </AnimatedSection>
        </div>
      </SectionContainer>
    </PageShell>
  );
}
