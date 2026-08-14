/** Filter + sort option sets for the Let's Play browse controls. */
export const DIFFICULTY_OPTIONS = ["Easy", "Medium", "Hard", "Expert"] as const;

export const TIME_OPTIONS = [
  { id: "any", label: "Any length", max: Infinity },
  { id: "short", label: "Under 6 min", max: 6 },
  { id: "medium", label: "6–9 min", max: 9 },
  { id: "long", label: "10 min+", max: Infinity, min: 10 },
] as const;

export const COUNT_OPTIONS = [
  { id: "any", label: "Any count", min: 0 },
  { id: "s", label: "20–29 questions", min: 20, max: 29 },
  { id: "m", label: "30–49 questions", min: 30, max: 49 },
  { id: "l", label: "50+ questions", min: 50 },
] as const;

export const SORT_OPTIONS = [
  { id: "popularity", label: "Most popular" },
  { id: "newest", label: "Newest" },
  { id: "questions", label: "Most questions" },
  { id: "rating", label: "Highest rated" },
] as const;

export type SortId = (typeof SORT_OPTIONS)[number]["id"];
