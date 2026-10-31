import { Link } from "@tanstack/react-router";
import { CalendarDays, Flame, Lock, Trophy, TrendingUp, Users } from "lucide-react";
import { useState } from "react";

import { GeoButton } from "@/components/shared";
import { isLeaderboardAvailable } from "@/features/leaderboard";
import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";

import { COMMUNITY_CHALLENGES } from "../data/challenges";
import { EVENTS } from "../data/events";
import { DAILY_TOPIC, SUGGESTED_COMMUNITIES, TOPICS } from "../data/topics";
import {
  FEATURED_EXPLORERS,
  LEADERBOARD_SNAPSHOT,
  RECENT_ACHIEVEMENTS,
  SNAPSHOT_LABEL,
  SUGGESTED_CREATORS,
  SUGGESTED_PEOPLE,
  type SnapshotBoard,
} from "../data/suggestions";
import { getCommunityStats } from "../lib/communityStats";
import { compactCount } from "../lib/format";
import { useCommunityActions } from "../lib/useCommunityActions";
import { MemberAvatar } from "./MemberAvatar";
import { MemberIdentity } from "./MemberIdentity";

function Panel({
  title,
  icon: Icon,
  children,
  action,
}: {
  title: string;
  icon?: typeof Flame;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <GameCard interactive={false} className="community-card p-5">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <h2 className="flex min-w-0 items-center gap-2 text-[0.62rem] uppercase tracking-[0.22em] text-[#17191D]">
          {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} /> : null}
          <span className="truncate">{title}</span>
        </h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </GameCard>
  );
}

/** Today's community-wide prompt. */
export function DailyTopicCard() {
  return (
    <GameCard interactive={false} className="community-card p-5">
      <p className="text-[0.62rem] uppercase tracking-[0.22em] text-[#17191D]">
        Topic of the day
      </p>
      <p className="mt-3 text-sm font-medium leading-relaxed text-[#17191D]">
        {DAILY_TOPIC.title}
      </p>
      <p className="mt-2 text-[0.78rem] leading-relaxed text-[#737B85]">{DAILY_TOPIC.prompt}</p>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex -space-x-2">
          {FEATURED_EXPLORERS.slice(0, 3).map((member) => (
            <MemberAvatar
              key={member.handle}
              handle={member.handle}
              size="xs"
              className="ring-2 ring-white"
            />
          ))}
        </div>
        <p className="text-[0.65rem] text-[#737B85]">
          {compactCount(DAILY_TOPIC.responses)} explorers joined
        </p>
      </div>
      <GeoButton variant="solid" size="sm" className="mt-4 w-full bg-[#17191D]" asChild>
        <Link to="/community/feed">Join the discussion</Link>
      </GeoButton>
    </GameCard>
  );
}

export function TrendingTopicsPanel({ limit = 5 }: { limit?: number }) {
  return (
    <Panel
      title="Trending topics"
      icon={TrendingUp}
      action={
        <Link
          to="/community/topics"
          className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-[#737B85] transition-colors hover:text-[#17191D]"
        >
          All
        </Link>
      }
    >
      <ul className="divide-y divide-[#DDE1E5]">
        {TOPICS.slice(0, limit).map((topic, index) => (
          <li key={topic.slug}>
            <Link
              to="/community/topic/$slug"
              params={{ slug: topic.slug }}
              className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 rounded-lg px-1 py-2.5 transition-colors motion-snap hover:bg-[#ECEFF2]"
            >
              <span className="w-4 shrink-0 text-[0.68rem] tabular-nums text-[#737B85]">
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-[#17191D]">#{topic.slug}</span>
                <span className="block truncate text-[0.68rem] text-[#737B85]">
                  {compactCount(topic.posts)} posts
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 text-[0.68rem] tabular-nums",
                  topic.trend >= 0 ? "text-[#17191D]" : "text-[#737B85]",
                )}
              >
                {topic.trend >= 0 ? "+" : ""}
                {topic.trend}%
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function SuggestedPeoplePanel({
  title = "People to follow",
  entries = SUGGESTED_PEOPLE,
}: {
  title?: string;
  entries?: readonly { member: { handle: string; name: string }; reason: string }[];
}) {
  const actions = useCommunityActions();
  const visible = entries.filter((e) => !actions.dismissedSuggestions.includes(e.member.handle));

  return (
    <Panel title={title} icon={Users}>
      <ul className="space-y-4">
        {visible.slice(0, 4).map(({ member, reason }) => {
          const following = actions.following.includes(member.handle);
          return (
            <li
              key={member.handle}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
            >
              <div className="min-w-0">
                <MemberIdentity handle={member.handle} size="sm" />
                <p className="mt-1 truncate pl-12 text-[0.66rem] text-foreground/50">{reason}</p>
              </div>
              <GeoButton
                size="sm"
                variant={following ? "dark" : "solid"}
                onClick={() => actions.follow(member.handle)}
                className="shrink-0"
              >
                {following ? "Following" : "Follow"}
              </GeoButton>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function SuggestedCreatorsPanel() {
  return <SuggestedPeoplePanel title="Creators to watch" entries={SUGGESTED_CREATORS} />;
}

export function FeaturedExplorersPanel() {
  return (
    <Panel title="Featured explorers" icon={Trophy}>
      <ul className="space-y-4">
        {FEATURED_EXPLORERS.map((member) => (
          <li key={member.handle}>
            <MemberIdentity
              handle={member.handle}
              meta={`${member.xp.toLocaleString()} XP`}
              showTier
            />
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function LeaderboardSnapshotPanel() {
  const [board, setBoard] = useState<SnapshotBoard>("xp");
  const boards = Object.keys(SNAPSHOT_LABEL) as SnapshotBoard[];
  const locked = !isLeaderboardAvailable();

  return (
    <Panel title="Leaderboard" icon={locked ? Lock : Trophy}>
      {locked ? null : (
        <div role="tablist" aria-label="Leaderboard boards" className="flex flex-wrap gap-1.5">
          {boards.map((id) => (
            <button
              key={id}
              role="tab"
              type="button"
              aria-selected={board === id}
              onClick={() => setBoard(id)}
              className={cn(
                "rounded-full border px-2.5 py-1 text-[0.6rem] uppercase tracking-[0.14em] transition-colors motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
                board === id
                  ? "border-bronze/55 bg-bronze/10 text-bronze-glow"
                  : "border-bronze/15 text-foreground/50 hover:border-bronze/40",
              )}
            >
              {SNAPSHOT_LABEL[id]}
            </button>
          ))}
        </div>
      )}

      {locked ? (
        <p className="mt-4 text-sm leading-relaxed text-foreground/50">
          Community ranks stay hidden until the global board is live.
        </p>
      ) : (
        <ol className="mt-4 space-y-3">
          {LEADERBOARD_SNAPSHOT[board].map((row, i) => (
            <li key={row.member.handle} className="flex items-center gap-3">
              <span className="w-4 shrink-0 text-[0.7rem] tabular-nums text-foreground/50">
                {i + 1}
              </span>
              <MemberAvatar handle={row.member.handle} size="xs" />
              <span className="min-w-0 flex-1 truncate text-sm text-foreground/80">
                {row.member.name}
              </span>
              <span className="shrink-0 text-[0.68rem] tabular-nums text-bronze-glow">
                {row.value}
              </span>
            </li>
          ))}
        </ol>
      )}

      {locked ? (
        <GeoButton
          type="button"
          variant="dark"
          size="sm"
          className="pointer-events-none mt-4 w-full cursor-not-allowed disabled:opacity-80"
          disabled
          aria-disabled="true"
        >
          <Lock className="h-3 w-3" strokeWidth={2.2} aria-hidden />
          Full leaderboard
        </GeoButton>
      ) : (
        <GeoButton variant="dark" size="sm" className="mt-4 w-full" asChild>
          <Link to="/play/leaderboard">Full leaderboard</Link>
        </GeoButton>
      )}
    </Panel>
  );
}

export function ActiveChallengesPanel() {
  return (
    <Panel
      title="Active challenges"
      icon={Flame}
      action={
        <Link
          to="/community/challenges"
          className="shrink-0 text-[0.62rem] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-bronze"
        >
          All
        </Link>
      }
    >
      <ul className="space-y-3">
        {COMMUNITY_CHALLENGES.filter((c) => c.status === "live")
          .slice(0, 3)
          .map((challenge) => (
            <li key={challenge.slug} className="rounded-lg border border-bronze/15 p-3">
              <p className="truncate text-sm text-foreground/85">{challenge.name}</p>
              <p className="mt-1 text-[0.66rem] text-foreground/50">
                {challenge.window} · {compactCount(challenge.participants)} playing
              </p>
              <p className="mt-1.5 text-[0.66rem] uppercase tracking-[0.16em] text-bronze/90">
                +{challenge.rewardXp} XP · +{challenge.rewardCredits} cr
              </p>
            </li>
          ))}
      </ul>
    </Panel>
  );
}

export function UpcomingEventsPanel() {
  return (
    <Panel title="Upcoming events" icon={CalendarDays}>
      <ul className="space-y-3">
        {EVENTS.slice(0, 3).map((event) => (
          <li key={event.id}>
            <p className="truncate text-sm text-foreground/85">{event.name}</p>
            <p className="mt-1 text-[0.66rem] text-foreground/50">
              {event.when} · {compactCount(event.attendees)} going
            </p>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function RecentAchievementsPanel() {
  return (
    <Panel title="Recent achievements" icon={Trophy}>
      <ul className="space-y-3">
        {RECENT_ACHIEVEMENTS.map((row) => (
          <li key={`${row.member.handle}-${row.achievement}`} className="flex items-center gap-3">
            <MemberAvatar handle={row.member.handle} size="xs" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-foreground/80">{row.achievement}</span>
              <span className="block truncate text-[0.66rem] text-foreground/50">
                {row.member.name} · {row.when}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

export function SuggestedCommunitiesPanel() {
  return (
    <Panel title="Communities" icon={Users}>
      <ul className="space-y-3">
        {SUGGESTED_COMMUNITIES.map((community) => (
          <li key={community.slug} className="rounded-lg border border-bronze/15 p-3">
            <p className="truncate text-sm text-foreground/85">{community.name}</p>
            <p className="mt-1 line-clamp-2 text-[0.68rem] leading-relaxed text-foreground/50">
              {community.blurb}
            </p>
            <p className="mt-1.5 text-[0.64rem] text-foreground/50">
              {compactCount(community.members)} members · {community.focus}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[0.64rem] text-foreground/50">
        Joining communities arrives in a later release.
      </p>
    </Panel>
  );
}

export function CommunityStatsPanel() {
  const stats = getCommunityStats();

  return (
    <GameCard interactive={false} className="community-card p-5">
      <h2 className="text-[0.62rem] uppercase tracking-[0.22em] text-[#17191D]">
        Community stats
      </h2>
      <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-[#737B85]">Explorers</dt>
          <dd className="mt-1.5 text-lg font-semibold tabular-nums text-[#17191D]">
            {stats.explorers}
          </dd>
        </div>
        <div>
          <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-[#737B85]">
            Discussions
          </dt>
          <dd className="mt-1.5 text-lg font-semibold tabular-nums text-[#17191D]">
            {stats.discussions}
          </dd>
        </div>
        <div>
          <dt className="text-[0.58rem] uppercase tracking-[0.16em] text-[#737B85]">Countries</dt>
          <dd className="mt-1.5 text-lg font-semibold tabular-nums text-[#17191D]">
            {stats.countries}
          </dd>
        </div>
      </dl>
    </GameCard>
  );
}

/** Left rail: navigation-adjacent context. */
export function CommunityLeftRail() {
  return (
    <div className="space-y-5">
      <DailyTopicCard />
      <TrendingTopicsPanel />
      <ActiveChallengesPanel />
    </div>
  );
}

/** Right rail: topic, trends and live community counts. */
export function CommunityRightRail() {
  return (
    <div className="space-y-4">
      <DailyTopicCard />
      <TrendingTopicsPanel />
      <CommunityStatsPanel />
    </div>
  );
}
