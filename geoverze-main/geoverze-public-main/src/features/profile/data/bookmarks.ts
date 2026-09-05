/** Bookmark surface metadata — items are resolved at runtime from live stores. */
import type { LinkProps } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Map, Route, Zap } from "lucide-react";

export type BookmarkKind = "articles" | "quizzes" | "maps" | "paths";

export type BookmarkFilterId = "all" | BookmarkKind;

export type SavedBookmark = {
  id: string;
  kind: BookmarkKind;
  typeLabel: string;
  category: string;
  title: string;
  description: string;
  meta: string;
  actionLabel: string;
  to: NonNullable<LinkProps["to"]>;
  search?: LinkProps["search"];
  params?: LinkProps["params"];
  imageSrc?: string;
  imageAlt?: string;
  art?: string;
  categoryId?: string;
};

export type BookmarkSectionConfig = {
  id: BookmarkKind;
  label: string;
  icon: LucideIcon;
  emptyTitle: string;
  emptyBody: string;
  exploreLabel: string;
  exploreTo: NonNullable<LinkProps["to"]>;
  exploreSearch?: LinkProps["search"];
};

export const BOOKMARK_SECTIONS: readonly BookmarkSectionConfig[] = [
  {
    id: "articles",
    label: "Articles",
    icon: BookOpen,
    emptyTitle: "No saved articles",
    emptyBody: "Articles you bookmark in the GEOlibrary will appear here.",
    exploreLabel: "Explore GEOlibrary",
    exploreTo: "/geolibrary/browse",
    exploreSearch: {
      q: "",
      continent: "all",
      difficulty: "all",
      time: "all",
      category: "all",
      sort: "popular",
      saved: false,
      view: "grid",
    },
  },
  {
    id: "quizzes",
    label: "Quizzes",
    icon: Zap,
    emptyTitle: "No saved quizzes",
    emptyBody: "Save a quiz from Let's Play and it will wait for you here.",
    exploreLabel: "Explore quizzes",
    exploreTo: "/play",
  },
  {
    id: "maps",
    label: "Maps",
    icon: Map,
    emptyTitle: "No saved maps",
    emptyBody: "Maps you bookmark will appear here.",
    exploreLabel: "Explore maps",
    exploreTo: "/play/search",
    exploreSearch: { category: "maps" },
  },
  {
    id: "paths",
    label: "Learning paths",
    icon: Route,
    emptyTitle: "No saved paths",
    emptyBody: "Learning paths you bookmark will appear here.",
    exploreLabel: "Explore learning paths",
    exploreTo: "/geostore",
  },
] as const;

export const BOOKMARK_FILTER_LABELS: Record<BookmarkFilterId, string> = {
  all: "All",
  articles: "Articles",
  quizzes: "Quizzes",
  maps: "Maps",
  paths: "Learning paths",
};
