import { Link } from "@tanstack/react-router";
import { Bell, CalendarDays, Flame, Bookmark } from "lucide-react";
import { useEffect, useState } from "react";

import { AnimatedSection, EmptyState, GeoButton, SectionHeading } from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";

import { COMMUNITY_CHALLENGES, FUTURE_TOURNAMENTS } from "../data/challenges";
import { EVENTS } from "../data/events";
import {
  COMMUNITY_NOTIFICATIONS,
  NOTIFICATION_KIND_LABEL,
  type CommunityNotificationKind,
} from "../data/notifications";
import { POSTS } from "../data/posts";
import { MemberAvatar } from "../components/MemberAvatar";
import { PostCard } from "../components/PostCard";
import { compactCount, relativeTime } from "../lib/format";
import { useCommunityActions } from "../lib/useCommunityActions";
import { useCommunityStore } from "@/stores/communityStore";

const DIFFICULTY_STYLE = {
  casual: "border-foreground/15 text-foreground/55",
  standard: "border-bronze/35 text-bronze/85",
  hard: "border-bronze/55 text-bronze-glow",
} as const;

/** Community challenges, events and future tournament formats. */
export function ChallengesScreen() {
  const [status, setStatus] = useState<"all" | "live" | "upcoming">("all");
  const list = COMMUNITY_CHALLENGES.filter((c) => status === "all" || c.status === status);

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <p className="eyebrow">Challenges</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Community challenges
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/60">
          Shared objectives the whole community plays at once. Rewards are placeholders until
          progression goes live.
        </p>
      </AnimatedSection>

      <div className="flex flex-wrap gap-1.5">
        {(["all", "live", "upcoming"] as const).map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={status === id}
            onClick={() => setStatus(id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] transition-colors motion-snap",
              status === id
                ? "border-bronze/55 bg-bronze/10 text-bronze-glow"
                : "border-bronze/15 text-foreground/50 hover:border-bronze/40",
            )}
          >
            {id}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {list.map((challenge) => (
          <GameCard key={challenge.slug} interactive={false} className="flex h-full flex-col p-5">
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
              <div className="min-w-0">
                <p className="text-[0.6rem] uppercase tracking-[0.2em] text-bronze/90">
                  {challenge.category}
                </p>
                <h2 className="mt-1.5 truncate text-base font-medium text-foreground">
                  {challenge.name}
                </h2>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full border px-2.5 py-0.5 text-[0.58rem] uppercase tracking-[0.16em]",
                  DIFFICULTY_STYLE[challenge.difficulty],
                )}
              >
                {challenge.difficulty}
              </span>
            </div>

            <p className="mt-3 text-sm leading-relaxed text-foreground/60">{challenge.blurb}</p>

            <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-bronze/10 pt-4">
              <div>
                <dt className="text-[0.56rem] uppercase tracking-[0.18em] text-foreground/50">
                  Window
                </dt>
                <dd className="mt-1 text-[0.75rem] text-foreground/80">{challenge.window}</dd>
              </div>
              <div>
                <dt className="text-[0.56rem] uppercase tracking-[0.18em] text-foreground/50">
                  Playing
                </dt>
                <dd className="mt-1 text-[0.75rem] tabular-nums text-foreground/80">
                  {compactCount(challenge.participants)}
                </dd>
              </div>
              <div>
                <dt className="text-[0.56rem] uppercase tracking-[0.18em] text-foreground/50">
                  Reward
                </dt>
                <dd className="mt-1 text-[0.75rem] tabular-nums text-bronze-glow">
                  +{challenge.rewardXp} XP
                </dd>
              </div>
            </dl>

            <GeoButton variant="solid" size="sm" className="mt-5 w-full" asChild>
              <Link to="/play">Play now</Link>
            </GeoButton>
          </GameCard>
        ))}
      </div>

      <section className="space-y-4">
        <SectionHeading
          eyebrow="Coming later"
          title="Tournament formats in design"
          description="Bracketed competition is planned, not built. These are the shapes being explored."
          as="h2"
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {FUTURE_TOURNAMENTS.map((t) => (
            <GameCard key={t.name} interactive={false} className="p-5">
              <Flame className="h-4 w-4 text-bronze/90" strokeWidth={1.4} />
              <p className="mt-3 text-sm font-medium text-foreground">{t.name}</p>
              <p className="mt-1.5 text-[0.75rem] leading-relaxed text-foreground/55">{t.blurb}</p>
            </GameCard>
          ))}
        </div>
      </section>
    </div>
  );
}

/** Upcoming community events. */
export function EventsScreen() {
  return (
    <div className="space-y-6">
      <AnimatedSection>
        <p className="eyebrow">Events</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Live rounds, workshops and meetups
        </h1>
      </AnimatedSection>

      <div className="space-y-4">
        {EVENTS.map((event) => (
          <GameCard
            key={event.id}
            interactive={false}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 p-5"
          >
            <div className="min-w-0">
              <p className="text-[0.6rem] uppercase tracking-[0.2em] text-bronze/90">
                {event.kind}
              </p>
              <h2 className="mt-1.5 truncate text-base font-medium text-foreground">
                {event.name}
              </h2>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground/55">{event.blurb}</p>
              <p className="mt-2 flex items-center gap-2 text-[0.68rem] text-foreground/50">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={1.5} />
                {event.when} · {compactCount(event.attendees)} going
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <MemberAvatar handle={event.host} size="sm" />
              <GeoButton variant="dark" size="sm">
                Remind me
              </GeoButton>
            </div>
          </GameCard>
        ))}
      </div>
    </div>
  );
}

/** Notification centre for community interactions. */
export function NotificationsScreen() {
  const [kind, setKind] = useState<"all" | CommunityNotificationKind>("all");
  const read = useCommunityStore((s) => s.readNotifications);
  const markRead = useCommunityStore((s) => s.markNotificationsRead);

  useEffect(() => {
    const unread = COMMUNITY_NOTIFICATIONS.filter((n) => !n.read).map((n) => n.id);
    if (unread.length > 0) markRead(unread);
  }, [markRead]);

  const kinds = ["all", ...Object.keys(NOTIFICATION_KIND_LABEL)] as (
    "all" | CommunityNotificationKind
  )[];
  const list = COMMUNITY_NOTIFICATIONS.filter((n) => kind === "all" || n.kind === kind);

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <p className="eyebrow">Notifications</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Community activity
        </h1>
      </AnimatedSection>

      <div className="flex flex-wrap gap-1.5">
        {kinds.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={kind === id}
            onClick={() => setKind(id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] transition-colors motion-snap",
              kind === id
                ? "border-bronze/55 bg-bronze/10 text-bronze-glow"
                : "border-bronze/15 text-foreground/50 hover:border-bronze/40",
            )}
          >
            {id === "all" ? "All" : NOTIFICATION_KIND_LABEL[id]}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <EmptyState icon={Bell} title="Nothing here" description="No notifications of this kind." />
      ) : (
        <GameCard interactive={false} className="divide-y divide-bronze/10">
          {list.map((n) => {
            const unread = !n.read && !read.includes(n.id);
            return (
              <div key={n.id} className="flex items-start gap-3 p-5">
                <MemberAvatar handle={n.actor} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground/85">
                    <span className="text-foreground">@{n.actor}</span> {n.summary}
                  </p>
                  {n.context ? (
                    <p className="mt-1.5 border-l border-bronze/25 pl-3 text-[0.78rem] leading-relaxed text-foreground/50">
                      {n.context}
                    </p>
                  ) : null}
                  <p className="mt-2 text-[0.66rem] uppercase tracking-[0.16em] text-foreground/50">
                    {NOTIFICATION_KIND_LABEL[n.kind]} · {relativeTime(n.createdAt)}
                  </p>
                </div>
                {n.postId ? (
                  <Link
                    to="/community/post/$postId"
                    params={{ postId: n.postId }}
                    className="shrink-0 text-[0.64rem] uppercase tracking-[0.16em] text-foreground/50 transition-colors hover:text-bronze"
                  >
                    View
                  </Link>
                ) : null}
                {unread ? (
                  <span
                    aria-label="Unread"
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-bronze"
                  />
                ) : null}
              </div>
            );
          })}
        </GameCard>
      )}
    </div>
  );
}

/** Saved posts. */
export function SavedScreen() {
  const actions = useCommunityActions();
  const saved = POSTS.filter((p) => actions.bookmarks.includes(p.id));

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <p className="eyebrow">Saved</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Posts you kept
        </h1>
      </AnimatedSection>

      {saved.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          title="Nothing saved yet"
          description="Use the bookmark action on any post to keep it here."
          action={
            <GeoButton variant="dark" size="sm" asChild>
              <Link to="/community/feed">Open feed</Link>
            </GeoButton>
          }
        />
      ) : (
        <div className="space-y-5">
          {saved.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
