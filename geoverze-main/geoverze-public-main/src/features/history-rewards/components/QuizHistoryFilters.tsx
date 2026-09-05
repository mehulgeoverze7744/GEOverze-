import { Search } from "lucide-react";

import {
  MODE_FILTERS,
  RANGE_FILTERS,
  RESULT_FILTERS,
  SORT_OPTIONS,
} from "@/features/history/data/history";
import type { HistoryFilters } from "@/features/history/lib/filter";

type QuizHistoryFiltersProps = {
  filters: HistoryFilters;
  onChange: <K extends keyof HistoryFilters>(key: K, value: HistoryFilters[K]) => void;
  search: string;
  onSearchChange: (value: string) => void;
  resultCount: number;
};

function FilterSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string }[];
  onChange: (value: T) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as T)}
      className="hr-filter-select"
      aria-label={label}
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

/** Compact filter toolbar for quiz history. */
export function QuizHistoryFilters({
  filters,
  onChange,
  search,
  onSearchChange,
  resultCount,
}: QuizHistoryFiltersProps) {
  return (
    <div>
      <p className="hr-panel-label">History</p>
      <div className="hr-filters">
        <FilterSelect
          label="Filter by mode"
          value={filters.mode}
          options={MODE_FILTERS}
          onChange={(value) => onChange("mode", value)}
        />
        <FilterSelect
          label="Filter by result"
          value={filters.result}
          options={RESULT_FILTERS}
          onChange={(value) => onChange("result", value)}
        />
        <FilterSelect
          label="Filter by timeframe"
          value={filters.range}
          options={RANGE_FILTERS}
          onChange={(value) => onChange("range", value)}
        />
        <FilterSelect
          label="Sort quiz history"
          value={filters.sort}
          options={SORT_OPTIONS}
          onChange={(value) => onChange("sort", value)}
        />

        <div className="hr-search-wrap">
          <Search className="hr-search-icon h-3.5 w-3.5" strokeWidth={1.75} aria-hidden="true" />
          <input
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search quizzes"
            aria-label="Search quiz history"
            className="hr-search"
          />
        </div>
      </div>
      <p className="text-[0.68rem] text-foreground/42" aria-live="polite">
        {resultCount} {resultCount === 1 ? "run" : "runs"}
      </p>
    </div>
  );
}
