/** Studio navigation, activity feed and review-queue placeholders. */
import {
  BarChart3,
  Coins,
  FileText,
  Images,
  LayoutDashboard,
  ListChecks,
  Settings,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StudioNavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  exact?: boolean;
};

export type StudioNavGroup = { id: string; label: string; items: StudioNavItem[] };

export const STUDIO_NAV: StudioNavGroup[] = [
  {
    id: "workspace",
    label: "Workspace",
    items: [{ label: "Overview", to: "/studio", icon: LayoutDashboard, exact: true }],
  },
  {
    id: "create",
    label: "Create",
    items: [
      { label: "Quizzes", to: "/studio/quizzes", icon: ListChecks },
      { label: "Articles", to: "/studio/articles", icon: FileText },
      { label: "Media library", to: "/studio/media", icon: Images },
    ],
  },
  {
    id: "grow",
    label: "Grow",
    items: [
      { label: "Analytics", to: "/studio/analytics", icon: BarChart3 },
      { label: "Audience", to: "/studio/audience", icon: Users },
    ],
  },
  {
    id: "business",
    label: "Business",
    items: [
      { label: "Earnings", to: "/studio/earnings", icon: Coins },
      { label: "Settings", to: "/studio/settings", icon: Settings },
    ],
  },
];

export type StudioActivity = {
  id: string;
  label: string;
  detail: string;
  at: string;
  tone: "publish" | "review" | "audience" | "earning" | "system";
};

export const STUDIO_ACTIVITY: StudioActivity[] = [
  {
    id: "a1",
    label: "Country Silhouettes submitted for review",
    detail: "Expected decision within 48 hours",
    at: "2026-08-06T07:40:00Z",
    tone: "review",
  },
  {
    id: "a2",
    label: "Flags That Fool Everyone passed 26,000 plays",
    detail: "Up 18% week over week",
    at: "2026-08-05T19:12:00Z",
    tone: "audience",
  },
  {
    id: "a3",
    label: "Earnings credited",
    detail: "$184.60 from quiz plays",
    at: "2026-08-05T09:12:00Z",
    tone: "earning",
  },
  {
    id: "a4",
    label: "How Long Is a Coastline? featured in GEOlibrary",
    detail: "Editorial shelf — Physical geography",
    at: "2026-08-04T11:30:00Z",
    tone: "publish",
  },
  {
    id: "a5",
    label: "Why Every Map Lies was rejected",
    detail: "Reviewer asked for sourcing on two claims",
    at: "2026-08-02T15:05:00Z",
    tone: "system",
  },
  {
    id: "a6",
    label: "1,180 new followers this month",
    detail: "Highest month since joining",
    at: "2026-08-01T08:00:00Z",
    tone: "audience",
  },
];

export type ReviewItem = {
  id: string;
  title: string;
  type: "Quiz" | "Article";
  submittedAt: string;
  stage: "queued" | "in-review" | "changes-requested";
  note: string;
};

export const REVIEW_QUEUE: ReviewItem[] = [
  {
    id: "silhouettes",
    title: "Country Silhouettes",
    type: "Quiz",
    submittedAt: "2026-08-06T07:40:00Z",
    stage: "in-review",
    note: "Assigned to the content team.",
  },
  {
    id: "seven-strangest-borders",
    title: "The Seven Strangest Borders on Earth",
    type: "Article",
    submittedAt: "2026-08-05T08:45:00Z",
    stage: "queued",
    note: "Waiting for a reviewer.",
  },
  {
    id: "why-maps-lie",
    title: "Why Every Map Lies",
    type: "Article",
    submittedAt: "2026-06-27T14:20:00Z",
    stage: "changes-requested",
    note: "Add citations for the Peters projection claims.",
  },
];

export type StudioTip = { id: string; title: string; body: string };

export const STUDIO_TIPS: StudioTip[] = [
  {
    id: "tip-1",
    title: "Write the explanation first",
    body: "Quizzes with explanations on every question keep 22% more players through to the last round.",
  },
  {
    id: "tip-2",
    title: "Twelve is the sweet spot",
    body: "Sets between 10 and 14 questions have the highest completion rate across every category.",
  },
  {
    id: "tip-3",
    title: "Pair a quiz with an article",
    body: "Cross-linked content earns roughly a third more repeat plays.",
  },
];
