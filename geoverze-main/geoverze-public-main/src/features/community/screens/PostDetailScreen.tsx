import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

import {
  AnimatedSection,
  EmptyState,
  GeoButton,
  GeoTextarea,
  SectionHeading,
} from "@/components/shared";
import { GameCard } from "@/features/play/components/GameCard";
import { toast } from "sonner";

import { commentsForPost, countComments } from "../data/comments";
import { POSTS, postById } from "../data/posts";
import { CommentThread } from "../components/CommentThread";
import { PostCard } from "../components/PostCard";
import { compactCount } from "../lib/format";

/** Single post with its full comment thread. */
export function PostDetailScreen({ postId }: { postId: string }) {
  const post = postById(postId);
  const [draft, setDraft] = useState("");

  if (!post) {
    return (
      <EmptyState
        title="Post not found"
        description="This discussion may have been removed."
        action={
          <GeoButton variant="dark" size="sm" asChild>
            <Link to="/community/feed">Back to feed</Link>
          </GeoButton>
        }
      />
    );
  }

  const comments = commentsForPost(post.id);
  const related = POSTS.filter(
    (p) => p.id !== post.id && p.topics.some((t) => post.topics.includes(t)),
  ).slice(0, 2);

  return (
    <div className="space-y-6">
      <Link
        to="/community/feed"
        className="inline-flex items-center gap-2 text-[0.68rem] uppercase tracking-[0.18em] text-foreground/50 transition-colors hover:text-bronze"
      >
        <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
        Back to feed
      </Link>

      <PostCard post={post} detail />

      <GameCard interactive={false} className="p-6">
        <h2 className="text-[0.62rem] uppercase tracking-[0.24em] text-bronze/90">
          {compactCount(countComments(comments))} replies
        </h2>

        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            toast.success("Reply ready", {
              description: "Posting arrives when the community backend goes live.",
            });
            setDraft("");
          }}
        >
          <GeoTextarea
            id="post-reply"
            label="Add your answer"
            rows={3}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add context, a source, or a mnemonic that helped you…"
          />
          <GeoButton type="submit" variant="solid" size="sm" disabled={draft.trim().length === 0}>
            Reply
          </GeoButton>
        </form>

        <div className="mt-2 border-t border-bronze/10">
          <CommentThread comments={comments} />
        </div>
      </GameCard>

      {related.length > 0 ? (
        <section className="space-y-4">
          <AnimatedSection>
            <SectionHeading eyebrow="Related" title="More on these topics" as="h2" />
          </AnimatedSection>
          <div className="space-y-5">
            {related.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
