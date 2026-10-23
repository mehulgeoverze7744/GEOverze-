import { ChevronDown, X } from "lucide-react";
import { useMemo } from "react";

import { SearchBar } from "@/components/shared";
import { cn } from "@/lib/utils";
import { QUIZ_CATEGORIES } from "../data/categories";
import { COUNT_OPTIONS, DIFFICULTY_OPTIONS, SORT_OPTIONS, TIME_OPTIONS } from "../data/filters";
import type { Quiz } from "../data/quizzes";
import { INITIAL_FILTERS, isFiltering, type PlayFilterState } from "../lib/filter";

function FilterSelect({
  label,
  value,
  onChange,
  options,
  active,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { id: string; label: string }[];
  active?: boolean;
}) {
  const selectId = `play-filter-${label.toLowerCase().replace(/\s+/g, "-")}`;

  return (
    <label className="flex min-w-0 flex-col gap-1.5" htmlFor={selectId}>
      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.2em] text-foreground/42">
        {label}
      </span>
      <span className="relative">
        <select
          id={selectId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-10 w-full min-w-0 cursor-pointer appearance-none truncate rounded-xl border bg-[oklch(0.13_0.006_60/0.88)] px-3 pr-9 text-[0.78rem] text-foreground/88 outline-none",
            "transition-[border-color,box-shadow,background-color] duration-200 ease-out motion-reduce:transition-none",
            "hover:border-bronze/35 focus:border-bronze/55 focus:ring-2 focus:ring-bronze/18",
            active ? "border-bronze/40 text-foreground" : "border-bronze/16",
          )}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id} className="bg-[oklch(0.16_0.008_60)]">
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-bronze/70"
          strokeWidth={2}
          aria-hidden
        />
      </span>
    </label>
  );
}

type FilterChip = {
  key: keyof PlayFilterState;
  label: string;
};

function chipsForFilters(
  filters: PlayFilterState,
  categoryLabel: string | undefined,
): FilterChip[] {
  const chips: FilterChip[] = [];
  const query = filters.query.trim();
  if (query) chips.push({ key: "query", label: query });
  if (filters.difficulty !== "any") chips.push({ key: "difficulty", label: filters.difficulty });
  if (filters.category !== "any") {
    chips.push({ key: "category", label: categoryLabel ?? filters.category });
  }
  if (filters.time !== "any") {
    chips.push({
      key: "time",
      label: TIME_OPTIONS.find((option) => option.id === filters.time)?.label ?? filters.time,
    });
  }
  if (filters.count !== "any") {
    chips.push({
      key: "count",
      label: COUNT_OPTIONS.find((option) => option.id === filters.count)?.label ?? filters.count,
    });
  }
  if (filters.creator !== "any") chips.push({ key: "creator", label: filters.creator });
  if (filters.sort !== "popularity") {
    chips.push({
      key: "sort",
      label: SORT_OPTIONS.find((option) => option.id === filters.sort)?.label ?? filters.sort,
    });
  }
  return chips;
}

function clearChip(key: FilterChip["key"], onChange: (patch: Partial<PlayFilterState>) => void) {
  if (key === "query") {
    onChange({ query: "" });
    return;
  }
  if (key === "sort") {
    onChange({ sort: "popularity" });
    return;
  }
  onChange({ [key]: "any" });
}

/** Search, filter and sort controls for the browse grid. */
export function FilterBar({
  filters,
  onChange,
  resultCount,
  quizzes,
}: {
  filters: PlayFilterState;
  onChange: (patch: Partial<PlayFilterState>) => void;
  resultCount: number;
  quizzes: readonly Quiz[];
}) {
  const active = isFiltering(filters);
  const creators = useMemo(
    () => Array.from(new Set(quizzes.map((quiz) => quiz.creator))).sort(),
    [quizzes],
  );
  const categoryLabel =
    QUIZ_CATEGORIES.find((category) => category.id === filters.category)?.title ??
    (filters.category === "emoji-fun" ? "Emoji & Fun" : undefined);
  const chips = chipsForFilters(filters, categoryLabel);

  return (
    <div className="rounded-2xl border border-bronze/14 bg-[oklch(0.11_0.006_60/0.72)] p-4 shadow-[0_12px_40px_oklch(0_0_0/0.18)] sm:p-5">
      <SearchBar
        id="play-search"
        label="Search quizzes"
        placeholder="Search quizzes, categories or creators"
        value={filters.query}
        onChange={(event) => onChange({ query: event.currentTarget.value })}
        onClear={() => onChange({ query: "" })}
        className="rounded-2xl border-bronze/18 bg-[oklch(0.13_0.006_60/0.9)] py-3.5 focus:border-bronze/50 focus:ring-bronze/18"
      />

      <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-6 xl:gap-3">
        <FilterSelect
          label="Difficulty"
          value={filters.difficulty}
          onChange={(difficulty) => onChange({ difficulty })}
          active={filters.difficulty !== "any"}
          options={[
            { id: "any", label: "Any difficulty" },
            ...DIFFICULTY_OPTIONS.map((difficulty) => ({ id: difficulty, label: difficulty })),
          ]}
        />
        <FilterSelect
          label="Category"
          value={filters.category}
          onChange={(category) => onChange({ category })}
          active={filters.category !== "any"}
          options={[
            { id: "any", label: "All categories" },
            ...QUIZ_CATEGORIES.map((category) => ({ id: category.id, label: category.title })),
            { id: "emoji-fun", label: "Emoji & Fun" },
          ]}
        />
        <FilterSelect
          label="Length"
          value={filters.time}
          onChange={(time) => onChange({ time })}
          active={filters.time !== "any"}
          options={TIME_OPTIONS.map((option) => ({ id: option.id, label: option.label }))}
        />
        <FilterSelect
          label="Questions"
          value={filters.count}
          onChange={(count) => onChange({ count })}
          active={filters.count !== "any"}
          options={COUNT_OPTIONS.map((option) => ({ id: option.id, label: option.label }))}
        />
        <FilterSelect
          label="Creator"
          value={filters.creator}
          onChange={(creator) => onChange({ creator })}
          active={filters.creator !== "any"}
          options={[
            { id: "any", label: "Any creator" },
            ...creators.map((creator) => ({ id: creator, label: creator })),
          ]}
        />
        <FilterSelect
          label="Sort by"
          value={filters.sort}
          onChange={(sort) => onChange({ sort: sort as PlayFilterState["sort"] })}
          active={filters.sort !== "popularity"}
          options={SORT_OPTIONS}
        />
      </div>

      {chips.length > 0 ? (
        <ul className="mt-3.5 flex flex-wrap gap-1.5" aria-label="Active filters">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button"
                onClick={() => clearChip(chip.key, onChange)}
                className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-bronze/25 bg-bronze/10 px-2.5 py-1 text-[0.68rem] text-foreground/80 transition-colors duration-200 hover:border-bronze/45 hover:text-foreground motion-reduce:transition-none"
              >
                <span className="truncate">{chip.label}</span>
                <X className="h-3 w-3 shrink-0 text-bronze/80" strokeWidth={2.2} aria-hidden />
                <span className="sr-only">Remove {chip.label} filter</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[0.72rem] text-foreground/45" aria-live="polite">
          <span className="font-semibold tabular-nums text-bronze-glow">{resultCount}</span> quizzes
          match
        </p>
        {active ? (
          <button
            type="button"
            onClick={() => onChange(INITIAL_FILTERS)}
            className="text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-bronze/80 transition-colors duration-200 hover:text-bronze-glow motion-reduce:transition-none"
          >
            Reset filters
          </button>
        ) : null}
      </div>
    </div>
  );
}
