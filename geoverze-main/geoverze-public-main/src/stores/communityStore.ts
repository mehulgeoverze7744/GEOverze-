/**
 * Community interaction state.
 *
 * Only the viewer's own interactions live here — likes, bookmarks, follows,
 * poll votes, reactions and friend-request decisions. Content itself stays in
 * the feature's data layer, so a future backend swaps that layer alone.
 */
import { create } from "zustand";
import { persist } from "zustand/middleware";

type CommunityState = {
  likedPosts: string[];
  likedComments: string[];
  bookmarks: string[];
  following: string[];
  /** postId -> chosen option id. */
  pollVotes: Record<string, string>;
  /** commentId -> emoji the viewer picked. */
  reactions: Record<string, string>;
  /** Handles of accepted friend requests. */
  acceptedRequests: string[];
  /** Handles of declined friend requests. */
  declinedRequests: string[];
  dismissedSuggestions: string[];
  readNotifications: string[];
  toggleLike: (postId: string) => void;
  toggleCommentLike: (commentId: string) => void;
  toggleBookmark: (postId: string) => void;
  toggleFollow: (handle: string) => void;
  vote: (postId: string, optionId: string) => void;
  react: (commentId: string, emoji: string) => void;
  acceptRequest: (handle: string) => void;
  declineRequest: (handle: string) => void;
  dismissSuggestion: (handle: string) => void;
  markNotificationsRead: (ids: string[]) => void;
  reset: () => void;
};

const initial = {
  likedPosts: [] as string[],
  likedComments: [] as string[],
  bookmarks: ["p-6", "p-7"] as string[],
  following: ["lucasferreira", "hannawinter"] as string[],
  pollVotes: {} as Record<string, string>,
  reactions: {} as Record<string, string>,
  acceptedRequests: [] as string[],
  declinedRequests: [] as string[],
  dismissedSuggestions: [] as string[],
  readNotifications: [] as string[],
};

const toggle = (list: string[], value: string) =>
  list.includes(value) ? list.filter((x) => x !== value) : [value, ...list];

export const useCommunityStore = create<CommunityState>()(
  persist(
    (set) => ({
      ...initial,
      toggleLike: (postId) => set((s) => ({ likedPosts: toggle(s.likedPosts, postId) })),
      toggleCommentLike: (commentId) =>
        set((s) => ({ likedComments: toggle(s.likedComments, commentId) })),
      toggleBookmark: (postId) => set((s) => ({ bookmarks: toggle(s.bookmarks, postId) })),
      toggleFollow: (handle) => set((s) => ({ following: toggle(s.following, handle) })),
      vote: (postId, optionId) =>
        set((s) => ({ pollVotes: { ...s.pollVotes, [postId]: optionId } })),
      react: (commentId, emoji) =>
        set((s) => ({
          reactions:
            s.reactions[commentId] === emoji
              ? Object.fromEntries(Object.entries(s.reactions).filter(([k]) => k !== commentId))
              : { ...s.reactions, [commentId]: emoji },
        })),
      acceptRequest: (handle) =>
        set((s) => ({
          acceptedRequests: [...new Set([handle, ...s.acceptedRequests])],
          declinedRequests: s.declinedRequests.filter((x) => x !== handle),
        })),
      declineRequest: (handle) =>
        set((s) => ({
          declinedRequests: [...new Set([handle, ...s.declinedRequests])],
          acceptedRequests: s.acceptedRequests.filter((x) => x !== handle),
        })),
      dismissSuggestion: (handle) =>
        set((s) => ({ dismissedSuggestions: [...new Set([handle, ...s.dismissedSuggestions])] })),
      markNotificationsRead: (ids) =>
        set((s) => ({ readNotifications: [...new Set([...ids, ...s.readNotifications])] })),
      reset: () => set({ ...initial }),
    }),
    { name: "geoverze.community", version: 1 },
  ),
);

export const selectLikedPosts = (s: CommunityState) => s.likedPosts;
export const selectBookmarks = (s: CommunityState) => s.bookmarks;
export const selectFollowing = (s: CommunityState) => s.following;
