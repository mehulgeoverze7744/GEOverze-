import { Link } from "@tanstack/react-router";
import { useState } from "react";

import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  GeoInput,
  SectionHeading,
} from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { cn } from "@/lib/utils";

import { MEMBERS, memberByHandle } from "../data/members";
import { POSTS } from "../data/posts";
import { TOPICS, topicBySlug } from "../data/topics";
import { FRIENDS, FRIEND_REQUESTS, RECENTLY_PLAYED } from "../data/suggestions";
import { MemberAvatar } from "../components/MemberAvatar";
import { MemberIdentity } from "../components/MemberIdentity";
import { PostCard } from "../components/PostCard";
import { TierBadge, VerifiedMark } from "../components/TierBadge";
import { compactCount } from "../lib/format";
import { SEARCH_SCOPES, searchCommunity, type SearchScope } from "../lib/search";
import { useCommunityActions } from "../lib/useCommunityActions";

function FollowButton({ handle }: { handle: string }) {
  const actions = useCommunityActions();
  const following = actions.following.includes(handle);
  return (
    <GeoButton
      size="sm"
      variant={following ? "dark" : "solid"}
      onClick={() => actions.follow(handle)}
      className="shrink-0"
    >
      {following ? "Following" : "Follow"}
    </GeoButton>
  );
}

function MemberRow({ handle, reason }: { handle: string; reason?: string }) {
  const actions = useCommunityActions();
  return (
    <GameCard
      interactive={false}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5"
    >
      <div className="min-w-0">
        <MemberIdentity handle={handle} showTier />
        {reason ? <p className="mt-1.5 pl-12 text-[0.68rem] text-foreground/50">{reason}</p> : null}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <GeoButton size="sm" variant="dark" onClick={() => actions.invite(handle)}>
          Invite
        </GeoButton>
        <FollowButton handle={handle} />
      </div>
    </GameCard>
  );
}

/** Explorer directory with tier and country filters. */
export function MembersScreen() {
  const [tier, setTier] = useState<string>("all");
  const tiers = ["all", "creator", "cartographer", "navigator", "explorer"];
  const list = MEMBERS.filter((m) => tier === "all" || m.tier === tier);

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <p className="eyebrow">Explorers</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Everyone mapping the world
        </h1>
      </AnimatedSection>

      <div className="flex flex-wrap gap-1.5">
        {tiers.map((id) => (
          <button
            key={id}
            type="button"
            aria-pressed={tier === id}
            onClick={() => setTier(id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-[0.66rem] uppercase tracking-[0.16em] transition-colors motion-snap",
              tier === id
                ? "border-bronze/55 bg-bronze/10 text-bronze-glow"
                : "border-bronze/15 text-foreground/50 hover:border-bronze/40",
            )}
          >
            {id === "all" ? "All" : id}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {list.map((member) => (
          <MemberRow key={member.handle} handle={member.handle} reason={member.bio} />
        ))}
      </div>
    </div>
  );
}

/** Public member profile with stats, achievements and their posts. */
export function MemberProfileScreen({ handle }: { handle: string }) {
  const member = memberByHandle(handle);
  const actions = useCommunityActions();

  if (!member) {
    return (
      <EmptyState
        title="Explorer not found"
        description="That profile does not exist yet."
        action={
          <GeoButton variant="dark" size="sm" asChild>
            <Link to="/community/members">Browse explorers</Link>
          </GeoButton>
        }
      />
    );
  }

  const posts = POSTS.filter((p) => p.author === handle);
  const stats = [
    { label: "Level", value: `${member.level}` },
    { label: "XP", value: compactCount(member.xp) },
    { label: "Accuracy", value: `${member.accuracy}%` },
    { label: "Streak", value: `${member.streak}d` },
    { label: "Quizzes", value: compactCount(member.quizzes) },
    { label: "Credits", value: compactCount(member.credits) },
  ];

  return (
    <div className="space-y-6">
      <GameCard interactive={false} className="p-6 sm:p-8">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 sm:flex sm:flex-wrap sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <MemberAvatar handle={handle} size="xl" linked={false} showPresence />
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-2">
                <h1 className="truncate text-xl font-light tracking-tight text-foreground sm:text-2xl">
                  {member.name}
                </h1>
                {member.verified ? <VerifiedMark /> : null}
                <TierBadge tier={member.tier} />
              </div>
              <p className="mt-1 truncate text-[0.72rem] text-foreground/50">
                <span aria-hidden className="mr-1">
                  {member.flag}
                </span>
                @{member.handle} · {member.country} · {member.levelTitle}
              </p>
              <p className="mt-1 text-[0.68rem] text-foreground/50">
                {compactCount(member.followers)} followers · {compactCount(member.following)}{" "}
                following · {member.mutuals} mutual
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <GeoButton size="sm" variant="dark" onClick={() => actions.invite(handle)}>
              Invite to quiz
            </GeoButton>
            <FollowButton handle={handle} />
          </div>
        </header>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-foreground/65">{member.bio}</p>

        <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-bronze/10 pt-6 sm:grid-cols-3 lg:grid-cols-6">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="text-[0.58rem] uppercase tracking-[0.2em] text-foreground/50">
                {stat.label}
              </dt>
              <dd className="mt-1.5 text-lg font-light tabular-nums text-bronze-glow">
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 border-t border-bronze/10 pt-6">
          <p className="text-[0.58rem] uppercase tracking-[0.2em] text-foreground/50">
            Achievements
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {member.achievements.map((achievement) => (
              <li
                key={achievement}
                className="rounded-full border border-bronze/25 bg-bronze/8 px-3 py-1 text-[0.68rem] text-bronze-glow"
              >
                {achievement}
              </li>
            ))}
          </ul>
        </div>
      </GameCard>

      <section className="space-y-4">
        <SectionHeading eyebrow="Activity" title={`Posts by ${member.name}`} as="h2" />
        {posts.length === 0 ? (
          <EmptyState title="No posts yet" description="This explorer has not shared anything." />
        ) : (
          <div className="space-y-5">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

/** Friends, requests and recent head-to-head history. */
export function FriendsScreen() {
  const actions = useCommunityActions();
  const pending = FRIEND_REQUESTS.filter(
    (r) =>
      !actions.acceptedRequests.includes(r.member.handle) &&
      !actions.declinedRequests.includes(r.member.handle),
  );

  return (
    <div className="space-y-8">
      <AnimatedSection>
        <p className="eyebrow">Friends</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Your explorers
        </h1>
      </AnimatedSection>

      <section className="space-y-4">
        <SectionHeading eyebrow="Requests" title="Waiting on you" as="h2" />
        {pending.length === 0 ? (
          <EmptyState title="No pending requests" description="You are all caught up." />
        ) : (
          <div className="space-y-4">
            {pending.map(({ member, mutuals }) => (
              <GameCard
                key={member.handle}
                interactive={false}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5"
              >
                <div className="min-w-0">
                  <MemberIdentity handle={member.handle} showTier />
                  <p className="mt-1.5 pl-12 text-[0.68rem] text-foreground/50">
                    {mutuals} mutual explorers
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <GeoButton
                    size="sm"
                    variant="solid"
                    onClick={() => actions.accept(member.handle)}
                  >
                    Accept
                  </GeoButton>
                  <GeoButton
                    size="sm"
                    variant="ghost"
                    onClick={() => actions.decline(member.handle)}
                  >
                    Decline
                  </GeoButton>
                </div>
              </GameCard>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <SectionHeading eyebrow="Friends" title="People you play with" as="h2" />
        <div className="space-y-4">
          {FRIENDS.map((member) => (
            <MemberRow key={member.handle} handle={member.handle} reason={member.bio} />
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <SectionHeading eyebrow="History" title="Recently played together" as="h2" />
        <GameCard interactive={false} className="divide-y divide-bronze/10">
          {RECENTLY_PLAYED.map((row) => (
            <div
              key={`${row.member.handle}-${row.quiz}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 p-5"
            >
              <div className="flex min-w-0 items-center gap-3">
                <MemberAvatar handle={row.member.handle} size="sm" />
                <div className="min-w-0">
                  <p className="truncate text-sm text-foreground/85">{row.quiz}</p>
                  <p className="truncate text-[0.68rem] text-foreground/50">
                    {row.member.name} · {row.when}
                  </p>
                </div>
              </div>
              <p className="shrink-0 text-[0.7rem] uppercase tracking-[0.14em] text-bronze/90">
                {row.result}
              </p>
            </div>
          ))}
        </GameCard>
      </section>
    </div>
  );
}

/** Topic index. */
export function TopicsScreen() {
  return (
    <div className="space-y-6">
      <AnimatedSection>
        <p className="eyebrow">Topics</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Follow what interests you
        </h1>
      </AnimatedSection>

      <div className="grid gap-4 sm:grid-cols-2">
        {TOPICS.map((topic) => (
          <Link key={topic.slug} to="/community/topic/$slug" params={{ slug: topic.slug }}>
            <GameCard className="h-full p-5">
              <p className="text-sm font-medium text-foreground">#{topic.slug}</p>
              <p className="mt-1.5 text-[0.78rem] leading-relaxed text-foreground/55">
                {topic.blurb}
              </p>
              <p className="mt-3 text-[0.66rem] uppercase tracking-[0.16em] text-foreground/50">
                {compactCount(topic.posts)} posts · {topic.trend >= 0 ? "+" : ""}
                {topic.trend}% this week
              </p>
            </GameCard>
          </Link>
        ))}
      </div>
    </div>
  );
}

/** Single topic page: description and every post carrying the tag. */
export function TopicScreen({ slug }: { slug: string }) {
  const topic = topicBySlug(slug);
  const posts = POSTS.filter((p) => p.topics.includes(slug));

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <p className="eyebrow">Topic</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          #{slug}
        </h1>
        {topic ? (
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-foreground/60">{topic.blurb}</p>
        ) : null}
        {topic ? (
          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.18em] text-foreground/50">
            {compactCount(topic.posts)} posts · {topic.trend >= 0 ? "+" : ""}
            {topic.trend}% this week
          </p>
        ) : null}
      </AnimatedSection>

      {posts.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="No posts carry this topic in the current feed."
          action={
            <GeoButton variant="dark" size="sm" asChild>
              <Link to="/community/topics">Browse topics</Link>
            </GeoButton>
          }
        />
      ) : (
        <div className="space-y-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Search across people, creators, posts, topics and challenges. */
export function CommunitySearchScreen() {
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<SearchScope>("all");
  const results = searchCommunity(query, scope);

  return (
    <div className="space-y-6">
      <AnimatedSection>
        <p className="eyebrow">Discover</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground sm:text-3xl">
          Find explorers, posts and topics
        </h1>
      </AnimatedSection>

      <GameCard interactive={false} className="space-y-4 p-6">
        <GeoInput
          id="community-search"
          label="Search the community"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rivers, Priya, flags, Border Stories…"
        />
        <div className="flex flex-wrap gap-1.5">
          {SEARCH_SCOPES.map((s) => (
            <button
              key={s.id}
              type="button"
              aria-pressed={scope === s.id}
              onClick={() => setScope(s.id)}
              className={cn(
                "rounded-full border px-3 py-1.5 text-[0.64rem] uppercase tracking-[0.16em] transition-colors motion-snap",
                scope === s.id
                  ? "border-bronze/55 bg-bronze/10 text-bronze-glow"
                  : "border-bronze/15 text-foreground/50 hover:border-bronze/40",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </GameCard>

      {query.trim().length === 0 ? (
        <EmptyState
          title="Start typing"
          description="Search names, handles, topics or challenges."
        />
      ) : results.total === 0 ? (
        <EmptyState title="No matches" description={`Nothing found for “${query}”.`} />
      ) : (
        <div className="space-y-8">
          {results.people.length > 0 ? (
            <section className="space-y-4">
              <SectionHeading
                eyebrow="People"
                title={`${results.people.length} explorers`}
                as="h2"
              />
              <div className="space-y-4">
                {results.people.map((m) => (
                  <MemberRow key={m.handle} handle={m.handle} reason={m.bio} />
                ))}
              </div>
            </section>
          ) : null}

          {results.creators.length > 0 ? (
            <section className="space-y-4">
              <SectionHeading
                eyebrow="Creators"
                title={`${results.creators.length} creators`}
                as="h2"
              />
              <div className="space-y-4">
                {results.creators.map((m) => (
                  <MemberRow key={m.handle} handle={m.handle} reason={m.bio} />
                ))}
              </div>
            </section>
          ) : null}

          {results.topics.length > 0 ? (
            <section className="space-y-4">
              <SectionHeading eyebrow="Topics" title={`${results.topics.length} topics`} as="h2" />
              <div className="grid gap-3 sm:grid-cols-2">
                {results.topics.map((t) => (
                  <Link key={t.slug} to="/community/topic/$slug" params={{ slug: t.slug }}>
                    <GameCard className="h-full p-4">
                      <p className="text-sm text-foreground/85">#{t.slug}</p>
                      <p className="mt-1 text-[0.72rem] text-foreground/50">{t.blurb}</p>
                    </GameCard>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {results.challenges.length > 0 ? (
            <section className="space-y-4">
              <SectionHeading
                eyebrow="Challenges"
                title={`${results.challenges.length} challenges`}
                as="h2"
              />
              <div className="grid gap-3 sm:grid-cols-2">
                {results.challenges.map((c) => (
                  <GameCard key={c.slug} interactive={false} className="p-4">
                    <p className="text-sm text-foreground/85">{c.name}</p>
                    <p className="mt-1 text-[0.72rem] text-foreground/50">{c.blurb}</p>
                  </GameCard>
                ))}
              </div>
            </section>
          ) : null}

          {results.posts.length > 0 ? (
            <section className="space-y-4">
              <SectionHeading eyebrow="Posts" title={`${results.posts.length} posts`} as="h2" />
              <div className="space-y-5">
                {results.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
    </div>
  );
}
