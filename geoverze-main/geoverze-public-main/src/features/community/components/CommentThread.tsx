import { Heart, Reply, SmilePlus } from "lucide-react";
import { useState } from "react";

import { GeoButton, GeoTextarea } from "@/components/shared";
import { cn } from "@/lib/utils";

import { REACTION_EMOJI, type Comment } from "../data/comments";
import { compactCount, mentionSegments, relativeTime } from "../lib/format";
import { useCommunityActions } from "../lib/useCommunityActions";
import { MemberIdentity } from "./MemberIdentity";

function ReplyBox({ to, onDone }: { to: string; onDone: () => void }) {
  const [value, setValue] = useState(`@${to} `);
  return (
    <form
      className="mt-3 space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        onDone();
      }}
    >
      <GeoTextarea
        id={`reply-${to}`}
        label={`Reply to @${to}`}
        rows={2}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <div className="flex gap-2">
        <GeoButton type="submit" variant="solid" size="sm" disabled={value.trim().length === 0}>
          Reply
        </GeoButton>
        <GeoButton type="button" variant="ghost" size="sm" onClick={onDone}>
          Cancel
        </GeoButton>
      </div>
    </form>
  );
}

function CommentRow({ comment, depth }: { comment: Comment; depth: number }) {
  const actions = useCommunityActions();
  const [replying, setReplying] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const liked = actions.likedComments.includes(comment.id);
  const mine = actions.reactions[comment.id];

  const tallies = Object.entries(comment.reactions).map(([emoji, count]) => ({
    emoji,
    count: count + (mine === emoji ? 1 : 0),
  }));
  if (mine && !comment.reactions[mine]) tallies.push({ emoji: mine, count: 1 });

  return (
    <li className={cn(depth > 0 && "border-l border-bronze/12 pl-4 sm:pl-5")}>
      <div className="py-4">
        <MemberIdentity handle={comment.author} meta={relativeTime(comment.createdAt)} size="sm" />
        <p className="mt-2.5 text-sm leading-relaxed text-foreground/75">
          {mentionSegments(comment.body).map((seg, i) =>
            seg.mention ? (
              <span key={i} className="text-bronze-glow">
                {seg.text}
              </span>
            ) : (
              <span key={i}>{seg.text}</span>
            ),
          )}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1">
          <button
            type="button"
            onClick={() => actions.likeComment(comment.id)}
            aria-pressed={liked}
            aria-label={liked ? "Unlike comment" : "Like comment"}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] transition-colors motion-snap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50",
              liked ? "text-bronze-glow" : "text-foreground/50 hover:text-bronze",
            )}
          >
            <Heart className={cn("h-3.5 w-3.5", liked && "fill-current")} strokeWidth={1.5} />
            <span className="tabular-nums">{compactCount(comment.likes + (liked ? 1 : 0))}</span>
          </button>

          <button
            type="button"
            onClick={() => setReplying((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.7rem] text-foreground/50 transition-colors motion-snap hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            <Reply className="h-3.5 w-3.5" strokeWidth={1.5} />
            Reply
          </button>

          <button
            type="button"
            onClick={() => setPickerOpen((v) => !v)}
            aria-expanded={pickerOpen}
            aria-label="Add reaction"
            className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] text-foreground/50 transition-colors motion-snap hover:text-bronze focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50"
          >
            <SmilePlus className="h-3.5 w-3.5" strokeWidth={1.5} />
          </button>

          {tallies.map((t) => (
            <button
              key={t.emoji}
              type="button"
              onClick={() => actions.react(comment.id, t.emoji)}
              aria-pressed={mine === t.emoji}
              className={cn(
                "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.7rem] transition-colors motion-snap",
                mine === t.emoji
                  ? "border-bronze/50 text-bronze-glow"
                  : "border-bronze/15 text-foreground/55 hover:border-bronze/35",
              )}
            >
              <span aria-hidden>{t.emoji}</span>
              <span className="tabular-nums">{t.count}</span>
            </button>
          ))}
        </div>

        {pickerOpen ? (
          <div className="mt-2 flex gap-1.5">
            {REACTION_EMOJI.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  actions.react(comment.id, emoji);
                  setPickerOpen(false);
                }}
                aria-label={`React ${emoji}`}
                className="grid h-8 w-8 place-items-center rounded-full border border-bronze/20 text-sm transition-[transform,border-color] motion-snap hover:border-bronze/50 active:scale-95"
              >
                <span aria-hidden>{emoji}</span>
              </button>
            ))}
          </div>
        ) : null}

        {replying ? <ReplyBox to={comment.author} onDone={() => setReplying(false)} /> : null}
      </div>

      {comment.replies.length > 0 ? (
        <ul className="ml-4 border-t border-bronze/8 sm:ml-6">
          {comment.replies.map((reply) => (
            <CommentRow key={reply.id} comment={reply} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

/** Nested comment thread, up to three levels deep in the placeholder data. */
export function CommentThread({ comments }: { comments: readonly Comment[] }) {
  if (comments.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-foreground/50">
        No replies yet. Be the first to answer.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-bronze/10">
      {comments.map((comment) => (
        <CommentRow key={comment.id} comment={comment} depth={0} />
      ))}
    </ul>
  );
}
