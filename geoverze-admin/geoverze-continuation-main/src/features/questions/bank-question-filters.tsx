import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import {
  emptyBankQuestionFilters,
  questionTypes,
  type BankQuestionFilterState,
} from "@/features/questions/types";

export function BankQuestionFilters({
  value,
  onChange,
  quizzes,
}: {
  value: BankQuestionFilterState;
  onChange: (next: BankQuestionFilterState) => void;
  quizzes: { id: string; title: string }[];
}) {
  const definitions: FilterDefinition[] = [
    {
      id: "type",
      label: "Type",
      multiple: false,
      options: questionTypes.map((type) => ({ label: type, value: type })),
    },
    {
      id: "quizId",
      label: "Quiz",
      multiple: false,
      options: quizzes.map((quiz) => ({ label: quiz.title, value: quiz.id })),
    },
    {
      id: "quizStatus",
      label: "Quiz status",
      multiple: false,
      options: [
        { label: "Published", value: "published" },
        { label: "Draft", value: "draft" },
      ],
    },
  ];

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
        const merged: BankQuestionFilterState = { ...emptyBankQuestionFilters };
        for (const key of Object.keys(emptyBankQuestionFilters) as (keyof BankQuestionFilterState)[]) {
          merged[key] = next[key]?.[0] ?? "all";
        }
        onChange(merged);
      }}
    />
  );
}
