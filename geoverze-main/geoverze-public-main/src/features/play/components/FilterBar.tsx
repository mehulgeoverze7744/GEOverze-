import { X } from "lucide-react";

import { GeoButton, SearchBar } from "@/components/shared";
import { cn } from "@/lib/utils";
import { QUIZ_CATEGORIES } from "../data/categories";
import { COUNT_OPTIONS, DIFFICULTY_OPTIONS, SORT_OPTIONS, TIME_OPTIONS } from "../data/filters";
import { INITIAL_FILTERS, isFiltering, type PlayFilterState } from "../lib/filter";
import { QUIZZES } from "../data/quizzes";

const CREATORS = Array.from(new Set(QUIZZES.map((q) => q.creator))).sort();

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: readonly { id: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[0.58rem] font-semibold uppercase tracking-[0.18em] text-foreground/50">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="game-surface-raised rounded-xl px-3 py-2.5 text-[0.8rem] text-foreground/85 outline-none transition-colors motion-snap focus:border-bronze/60"
      >
        {options.map((o) => (
          <option key={o.id} value={o.id} className="bg-[oklch(0.16_0.008_60)]">
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/** Search, filter and sort controls for the browse grid. */
export function FilterBar({
  filters,
  onChange,
  resultCount,
}: {
  filters: PlayFilterState;
  onChange: (patch: Partial<PlayFilterState>) => void;
  resultCount: number;
}) {
  const active = isFiltering(filters);

  return (
    <div className={cn("game-surface rounded-2xl p-5 md:p-6")}>
      <SearchBar
        id="play-search"
        label="Search quizzes"
        placeholder="Search quizzes, categories or creators"
        value={filters.query}
        onChange={(e) => onChange({ query: e.currentTarget.value })}
      />

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Select
          label="Difficulty"
          value={filters.difficulty}
          onChange={(difficulty) => onChange({ difficulty })}
          options={[
            { id: "any", label: "Any difficulty" },
            ...DIFFICULTY_OPTIONS.map((d) => ({ id: d, label: d })),
          ]}
        />
        <Select
          label="Category"
          value={filters.category}
          onChange={(category) => onChange({ category })}
          options={[
            { id: "any", label: "All categories" },
            ...QUIZ_CATEGORIES.map((c) => ({ id: c.id, label: c.title })),
          ]}
        />
        <Select
          label="Length"
          value={filters.time}
          onChange={(time) => onChange({ time })}
          options={TIME_OPTIONS.map((t) => ({ id: t.id, label: t.label }))}
        />
        <Select
          label="Questions"
          value={filters.count}
          onChange={(count) => onChange({ count })}
          options={COUNT_OPTIONS.map((c) => ({ id: c.id, label: c.label }))}
        />
        <Select
          label="Creator"
          value={filters.creator}
          onChange={(creator) => onChange({ creator })}
          options={[
            { id: "any", label: "Any creator" },
            ...CREATORS.map((c) => ({ id: c, label: c })),
          ]}
        />
        <Select
          label="Sort by"
          value={filters.sort}
          onChange={(sort) => onChange({ sort: sort as PlayFilterState["sort"] })}
          options={SORT_OPTIONS}
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[0.72rem] text-foreground/50">
          <span className="font-semibold text-bronze-glow">{resultCount}</span> quizzes match
        </p>
        {active ? (
          <GeoButton variant="dark" size="sm" onClick={() => onChange(INITIAL_FILTERS)}>
            <X className="h-3.5 w-3.5" strokeWidth={2.4} />
            Clear filters
          </GeoButton>
        ) : null}
      </div>
    </div>
  );
}
