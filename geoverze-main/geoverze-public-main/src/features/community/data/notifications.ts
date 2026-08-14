/**
 * Community notification feed. Presentation only — no notification logic,
 * no realtime layer. A future backend will hydrate the same shape.
 */

export type CommunityNotificationKind =
  "reply" | "mention" | "friendRequest" | "challengeInvite" | "like" | "comment";

export type CommunityNotification = {
  id: string;
  kind: CommunityNotificationKind;
  /** Handle of the person who triggered it. */
  actor: string;
  /** Short sentence describing the event. */
  summary: string;
  /** Optional quoted context. */
  context?: string;
  createdAt: string;
  read: boolean;
  postId?: string;
};

export const NOTIFICATION_KIND_LABEL: Record<CommunityNotificationKind, string> = {
  reply: "Replies",
  mention: "Mentions",
  friendRequest: "Friend requests",
  challengeInvite: "Challenge invites",
  like: "Likes",
  comment: "Comments",
};

export const COMMUNITY_NOTIFICATIONS: readonly CommunityNotification[] = [
  {
    id: "n-1",
    kind: "reply",
    actor: "tomasnovak",
    summary: "replied to your comment",
    context: "That is annoyingly elegant. Thank you.",
    createdAt: "2026-08-06T05:50:00Z",
    read: false,
    postId: "p-11",
  },
  {
    id: "n-2",
    kind: "mention",
    actor: "jonasberg",
    summary: "mentioned you in a question",
    context: "@amaraokoye you'd know this one — Sahel borders again.",
    createdAt: "2026-08-06T04:35:00Z",
    read: false,
    postId: "p-2",
  },
  {
    id: "n-3",
    kind: "friendRequest",
    actor: "kwamemensah",
    summary: "sent you a friend request",
    createdAt: "2026-08-06T03:02:00Z",
    read: false,
  },
  {
    id: "n-4",
    kind: "challengeInvite",
    actor: "priyanair",
    summary: "invited you to Capital Sprint",
    context: "Best of five, ten seconds a question.",
    createdAt: "2026-08-05T22:14:00Z",
    read: true,
  },
  {
    id: "n-5",
    kind: "like",
    actor: "sofiarossi",
    summary: "and 554 others liked your achievement",
    context: "Sahel Specialist",
    createdAt: "2026-08-05T19:40:00Z",
    read: true,
    postId: "p-12",
  },
  {
    id: "n-6",
    kind: "comment",
    actor: "meiling",
    summary: "commented on your post",
    context: "Learning by basin genuinely works, can confirm.",
    createdAt: "2026-08-05T12:26:00Z",
    read: true,
    postId: "p-12",
  },
  {
    id: "n-7",
    kind: "challengeInvite",
    actor: "noahclarke",
    summary: "invited you to the Weekend Expedition",
    createdAt: "2026-08-04T16:11:00Z",
    read: true,
  },
  {
    id: "n-8",
    kind: "mention",
    actor: "hannawinter",
    summary: "mentioned you in Border Stories",
    context: "Thanks to @amaraokoye for the Sahel corrections.",
    createdAt: "2026-08-04T10:05:00Z",
    read: true,
    postId: "p-6",
  },
];
