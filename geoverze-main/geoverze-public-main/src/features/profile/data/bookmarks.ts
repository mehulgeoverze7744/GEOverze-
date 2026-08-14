/** Placeholder saved items grouped by the four bookmarkable surfaces. */
import type { LucideIcon } from "lucide-react";
import { BookOpen, Map, Route, Zap } from "lucide-react";

export type BookmarkItem = {
  id: string;
  title: string;
  description: string;
  meta: string;
  tag: string;
};

export type BookmarkSection = {
  id: "articles" | "quizzes" | "maps" | "paths";
  label: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyBody: string;
  items: BookmarkItem[];
};

export const BOOKMARK_SECTIONS: readonly BookmarkSection[] = [
  {
    id: "articles",
    label: "Articles",
    icon: BookOpen,
    emptyTitle: "No saved articles yet",
    emptyBody: "Anything you bookmark in the GEOlibrary lands here for later reading.",
    items: [
      {
        id: "a1",
        title: "How the Himalayas keep growing",
        description: "Plate collision, uplift rates and the rivers that cut back through it.",
        meta: "9 min read",
        tag: "Nature",
      },
      {
        id: "a2",
        title: "Why some countries have two capitals",
        description: "Administrative, legislative and judicial seats, and who splits them.",
        meta: "6 min read",
        tag: "Capitals",
      },
      {
        id: "a3",
        title: "The straightest borders on Earth",
        description: "Colonial rulers, latitude lines and the geometry left behind.",
        meta: "7 min read",
        tag: "History",
      },
    ],
  },
  {
    id: "quizzes",
    label: "Quizzes",
    icon: Zap,
    emptyTitle: "No saved quizzes yet",
    emptyBody: "Save a quiz from Let's Play and it will wait for you right here.",
    items: [
      {
        id: "q1",
        title: "Flags of Africa — Expert",
        description: "54 flags, 90 seconds, no second guesses.",
        meta: "Expert · 54 questions",
        tag: "Flags",
      },
      {
        id: "q2",
        title: "Capitals sprint: Europe",
        description: "Every European capital against the clock.",
        meta: "Intermediate · 44 questions",
        tag: "Capitals",
      },
    ],
  },
  {
    id: "maps",
    label: "Maps",
    icon: Map,
    emptyTitle: "No saved maps yet",
    emptyBody: "Bookmark an atlas plate to pin it to your collection.",
    items: [
      {
        id: "m1",
        title: "Physical world — bronze plate",
        description: "Relief, ocean depth and the great mountain chains.",
        meta: "Atlas plate",
        tag: "Physical",
      },
      {
        id: "m2",
        title: "Timezones of the world",
        description: "UTC offsets with every irregular boundary drawn in.",
        meta: "Atlas plate",
        tag: "Reference",
      },
    ],
  },
  {
    id: "paths",
    label: "Learning paths",
    icon: Route,
    emptyTitle: "No saved paths yet",
    emptyBody: "Learning paths chain quizzes and articles into a guided route.",
    items: [],
  },
] as const;
