import { COUNT_OPTIONS, TIME_OPTIONS, type SortId } from "../data/filters";
import type { Quiz } from "../data/quizzes";

export type PlayFilterState = {
  query: string;
  difficulty: string;
  category: string;
  time: string;
  count: string;
  creator: string;
  sort: SortId;
};

export const INITIAL_FILTERS: PlayFilterState = {
  query: "",
  difficulty: "any",
  category: "any",
  time: "any",
  count: "any",
  creator: "any",
  sort: "popularity",
};

export function isFiltering(f: PlayFilterState) {
  return (
    f.query.trim().length > 0 ||
    f.difficulty !== "any" ||
    f.category !== "any" ||
    f.time !== "any" ||
    f.count !== "any" ||
    f.creator !== "any"
  );
}

export function applyFilters(quizzes: readonly Quiz[], f: PlayFilterState): Quiz[] {
  const q = f.query.trim().toLowerCase();
  const time = TIME_OPTIONS.find((t) => t.id === f.time);
  const count = COUNT_OPTIONS.find((c) => c.id === f.count);

  const filtered = quizzes.filter((quiz) => {
    if (q && !`${quiz.title} ${quiz.creator} ${quiz.categoryId}`.toLowerCase().includes(q))
      return false;
    if (f.difficulty !== "any" && quiz.difficulty !== f.difficulty) return false;
    if (f.category !== "any" && quiz.categoryId !== f.category) return false;
    if (f.creator !== "any" && quiz.creator !== f.creator) return false;
    if (time) {
      const min = "min" in time ? (time.min as number) : 0;
      if (quiz.minutes < min || quiz.minutes > time.max) return false;
    }
    if (count) {
      const max = "max" in count ? (count.max as number) : Infinity;
      if (quiz.questions < count.min || quiz.questions > max) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  sorted.sort((a, b) => {
    switch (f.sort) {
      case "newest":
        return a.ageDays - b.ageDays;
      case "questions":
        return b.questions - a.questions;
      case "rating":
        return b.rating - a.rating;
      default:
        return b.popularity - a.popularity;
    }
  });
  return sorted;
}
