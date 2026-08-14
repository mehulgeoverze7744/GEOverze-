import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { quizCreators } from "@/features/quizzes/data";
import { emptyQuizFilters, quizDifficulties, type QuizFilterState } from "@/features/quizzes/types";
import { languages, quizCategories, quizVisibilities } from "@/lib/catalog";

const definitions: FilterDefinition[] = [
  {
    id: "status",
    label: "Status",
    multiple: false,
    options: [
      { label: "Published", value: "published" },
      { label: "Draft", value: "draft" },
      { label: "Archived", value: "archived" },
    ],
  },
  {
    id: "category",
    label: "Category",
    multiple: false,
    options: quizCategories.map((category) => ({ label: category, value: category })),
  },
  {
    id: "difficulty",
    label: "Difficulty",
    multiple: false,
    options: quizDifficulties.map((level) => ({ label: level, value: level })),
  },
  {
    id: "visibility",
    label: "Visibility",
    multiple: false,
    options: quizVisibilities.map((value) => ({ label: value, value })),
  },
  {
    id: "language",
    label: "Language",
    multiple: false,
    options: languages.map((language) => ({ label: language, value: language })),
  },
  {
    id: "creator",
    label: "Creator",
    multiple: false,
    options: quizCreators.map((creator) => ({ label: creator, value: creator })),
  },
];

export function QuizFilters({
  value,
  onChange,
}: {
  value: QuizFilterState;
  onChange: (next: QuizFilterState) => void;
}) {
  const asRecord: Record<string, string[]> = Object.fromEntries(
    Object.entries(value)
      .filter(([, v]) => v !== "all")
      .map(([key, v]) => [key, [v]]),
  );

  return (
    <FilterBar
      filters={definitions}
      value={asRecord}
      onChange={(next) => {
        const merged: QuizFilterState = { ...emptyQuizFilters };
        for (const key of Object.keys(emptyQuizFilters) as (keyof QuizFilterState)[]) {
          merged[key] = next[key]?.[0] ?? "all";
        }
        onChange(merged);
      }}
    />
  );
}
