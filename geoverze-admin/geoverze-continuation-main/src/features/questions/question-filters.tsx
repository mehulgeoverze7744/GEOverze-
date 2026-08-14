import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { questionLanguages, questionRegions, questionTopics } from "@/features/questions/data";
import {
  emptyQuestionFilters,
  questionDifficulties,
  questionTypes,
  type QuestionFilterState,
} from "@/features/questions/types";

const definitions: FilterDefinition[] = [
  {
    id: "type",
    label: "Type",
    multiple: false,
    options: questionTypes.map((type) => ({ label: type, value: type })),
  },
  {
    id: "difficulty",
    label: "Difficulty",
    multiple: false,
    options: questionDifficulties.map((level) => ({ label: level, value: level })),
  },
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
    id: "region",
    label: "Region",
    multiple: false,
    options: questionRegions.map((region) => ({ label: region, value: region })),
  },
  {
    id: "language",
    label: "Language",
    multiple: false,
    options: questionLanguages.map((language) => ({ label: language, value: language })),
  },
  {
    id: "topic",
    label: "Topic",
    multiple: false,
    options: questionTopics.map((topic) => ({ label: topic, value: topic })),
  },
];

export function QuestionFilters({
  value,
  onChange,
}: {
  value: QuestionFilterState;
  onChange: (next: QuestionFilterState) => void;
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
        const merged: QuestionFilterState = { ...emptyQuestionFilters };
        for (const key of Object.keys(emptyQuestionFilters) as (keyof QuestionFilterState)[]) {
          merged[key] = next[key]?.[0] ?? "all";
        }
        onChange(merged);
      }}
    />
  );
}
