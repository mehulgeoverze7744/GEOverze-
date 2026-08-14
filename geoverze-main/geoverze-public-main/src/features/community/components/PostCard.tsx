import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share2,
  Flag,
  UserPlus,
} from "lucide-react";
import { Link } from "@tanstack/react-router";

import { GeoDropdown, GeoDropdownItem } from "@/components/shared";
import { cn } from "@/lib/utils";

import type { Post } from "../data/posts";
import { CURRENT_HANDLE } from "../data/members";
import { GameCard } from "@/features/play/components/GameCard";
import { compactCount, mentionSegments, relativeTime } from "../lib/format";
import { useCommunityActions } from "../lib/useCommunityActions";
import { AchievementBlock, QuizResultBlock } from "./PostBlocks";
import { MemberIdentity } from "./MemberIdentity";
import { PollBlock } from "./PollBlock";
import { PostImageGrid } from "./PostImage";
import { TopicChips } from "./TopicChips";

function Body({ text }: { text: string }) {
  return (
    <p className="mt-3 text-sm leading-relaxed text-foreground/75">
      {mentionSegments(text).map((seg, i) =>
        seg.mention ? (
          <span key={i} className="text-bronze-glow">
            {seg.text}
          </span>
        ) : (
          <span key={i}>{seg.text}</span>
        ),
      )}
    </p>
  );
}

function Action({
  icon: Icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: typeof Heart;
  label: string;
  count?: number;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs transition-[color,background-color,transform] motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 active:scale-[0.96]",
        active ? "text-bronze-glow" : "text-foreground/50 hover:text-bronze",
      )}
    >
      <Icon className={cn("h-4 w-4", active && "fill-current")} strokeWidth={1.5} />
      {count !== undefined ? <span className="tabular-nums">{compactCount(count)}</span> : null}
    </button>
  );
}

/**
 * Renders every post kind from one card. Solid game-surface fill keeps the feed
 * readable and fast; interactions are local-only until a backend exists.
 */
export function PostCard({ post, detail = false }: { post: Post; detail?: boolean }) {
  const actions = useCommunityActions();
  const liked = actions.likedPosts.includes(post.id);
  const saved = actions.bookmarks.includes(post.id);
  const own = post.author === CURRENT_HANDLE;

  return (
    <GameCard interactive={false} className="p-6">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
        <MemberIdentity handle={post.author} meta={relativeTime(post.createdAt)} showTier />
        <GeoDropdown
          trigger={
            <span
              className="inline-flex h-8 w-8 items-center justify-center rounded-full text-foreground/50 transition-colors hover:text-bronze"
              aria-label="Post options"
            >
              <MoreHorizontal className="h-4 w-4" strokeWidth={1.5} />
            </span>
          }
        >
          <GeoDropdownItem onSelect={() => actions.bookmark(post.id)}>
            {saved ? "Remove from saved" : "Save post"}
          </GeoDropdownItem>
          <GeoDropdownItem onSelect={() => actions.share(post.id)}>Copy link</GeoDropdownItem>
          {own ? null : (
            <GeoDropdownItem onSelect={() => actions.follow(post.author)}>
              {actions.following.includes(post.author) ? "Unfollow author" : "Follow author"}
            </GeoDropdownItem>
          )}
          {own ? null : (
            <GeoDropdownItem onSelect={() => actions.report(post.id)}>Report post</GeoDropdownItem>
          )}
        </GeoDropdown>
      </div>

      {post.kind === "question" ? (
        <div className="mt-4 rounded-xl border-l-2 border-bronze/50 bg-bronze/5 px-4 py-3">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">
            Question {post.answered ? "· answered" : "· open"}
          </p>
          <p className="mt-1.5 text-sm font-medium leading-relaxed text-foreground">
            {post.question}
          </p>
        </div>
      ) : null}

      {post.kind === "creatorUpdate" ? (
        <div className="mt-4 rounded-xl border border-bronze/20 bg-charcoal/50 p-5">
          <p className="text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">{post.series}</p>
          <p className="mt-1.5 text-base font-medium text-foreground">{post.title}</p>
          <p className="mt-2 text-[0.65rem] uppercase tracking-[0.2em] text-foreground/50">
            {post.readMinutes} min read
          </p>
        </div>
      ) : null}

      <Body text={post.body} />

      {post.kind === "image" ? (
        <PostImageGrid images={post.images} {...(post.caption ? { caption: post.caption } : {})} />
      ) : null}

      {post.kind === "quizResult" ? (
        <QuizResultBlock
          quiz={post.quiz}
          score={post.score}
          total={post.total}
          accuracy={post.accuracy}
          xp={post.xp}
          durationSeconds={post.durationSeconds}
        />
      ) : null}

      {post.kind === "achievement" ? (
        <AchievementBlock
          achievement={post.achievement}
          note={post.achievementNote}
          rarity={post.rarity}
        />
      ) : null}

      {post.kind === "poll" ? (
        <PollBlock
          question={post.question}
          options={post.options}
          closesIn={post.closesIn}
          {...(actions.pollVotes[post.id] ? { choice: actions.pollVotes[post.id] } : {})}
          onVote={(optionId) => actions.vote(post.id, optionId)}
        />
      ) : null}

      {post.topics.length > 0 ? <TopicChips topics={post.topics} className="mt-4" /> : null}

      <div className="mt-5 flex flex-wrap items-center gap-1 border-t border-bronze/10 pt-3">
        <Action
          icon={Heart}
          label={liked ? "Unlike post" : "Like post"}
          count={post.likes + (liked ? 1 : 0)}
          active={liked}
          onClick={() => actions.like(post.id)}
        />
        {detail ? (
          <Action icon={MessageCircle} label="Comments" count={post.comments} />
        ) : (
          <Link
            to="/community/post/$postId"
            params={{ postId: post.id }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-foreground/50 transition-colors motion-snap hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            <span className="tabular-nums">{compactCount(post.comments)}</span>
          </Link>
        )}
        <Action
          icon={Share2}
          label="Share post"
          count={post.shares}
          onClick={() => actions.share(post.id)}
        />
        <Action
          icon={Bookmark}
          label={saved ? "Remove from saved" : "Save post"}
          active={saved}
          onClick={() => actions.bookmark(post.id)}
        />
        <span className="ml-auto flex items-center gap-1">
          {own ? null : (
            <Action
              icon={UserPlus}
              label="Invite to quiz"
              onClick={() => actions.invite(post.author)}
            />
          )}
          {own ? null : (
            <Action icon={Flag} label="Report post" onClick={() => actions.report(post.id)} />
          )}
        </span>
      </div>
    </GameCard>
  );
}
