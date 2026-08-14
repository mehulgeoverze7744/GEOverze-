/** Shared community interaction handlers. Thin by design: a future backend
 * call replaces the body of each function without touching components. */
import { toast } from "sonner";

import { useCommunityStore } from "@/stores/communityStore";

import { memberByHandle } from "../data/members";

export function useCommunityActions() {
  const store = useCommunityStore();

  return {
    likedPosts: store.likedPosts,
    bookmarks: store.bookmarks,
    following: store.following,
    pollVotes: store.pollVotes,
    reactions: store.reactions,
    likedComments: store.likedComments,

    like: (postId: string) => store.toggleLike(postId),
    likeComment: (commentId: string) => store.toggleCommentLike(commentId),
    react: (commentId: string, emoji: string) => store.react(commentId, emoji),
    vote: (postId: string, optionId: string) => store.vote(postId, optionId),

    bookmark: (postId: string) => {
      const saved = store.bookmarks.includes(postId);
      store.toggleBookmark(postId);
      toast[saved ? "message" : "success"](
        saved ? "Removed from saved posts" : "Saved to your posts",
      );
    },

    follow: (handle: string) => {
      const already = store.following.includes(handle);
      store.toggleFollow(handle);
      const name = memberByHandle(handle)?.name ?? handle;
      toast[already ? "message" : "success"](already ? `Unfollowed ${name}` : `Following ${name}`);
    },

    share: (postId: string) => {
      toast.success("Link copied", { description: `geoverze.com/community/post/${postId}` });
    },

    report: (postId: string) => {
      toast.message("Report submitted", {
        description: `Our moderators will review post ${postId}.`,
      });
    },

    invite: (handle: string) => {
      const name = memberByHandle(handle)?.name ?? handle;
      toast.success(`Quiz invite sent to ${name}`, {
        description: "They'll see it in their invites.",
      });
    },

    accept: (handle: string) => {
      store.acceptRequest(handle);
      toast.success(`${memberByHandle(handle)?.name ?? handle} is now a friend`);
    },

    decline: (handle: string) => {
      store.declineRequest(handle);
      toast.message("Request declined");
    },

    dismiss: (handle: string) => store.dismissSuggestion(handle),
    acceptedRequests: store.acceptedRequests,
    declinedRequests: store.declinedRequests,
    dismissedSuggestions: store.dismissedSuggestions,
  };
}
