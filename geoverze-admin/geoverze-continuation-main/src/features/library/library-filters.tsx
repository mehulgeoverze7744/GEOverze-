import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import {
  emptyLibraryFilters,
  libraryDifficulties,
  type LibraryFilterState,
} from "@/features/library/types";
import { languages, libraryCategories, regions } from "@/lib/catalog";

const definitions: FilterDefinition[] = [
  {
    id: "status",
    label: "Status",
    multiple: false,
    options: [
      { label: "Published", value: "published" },
      { label: "Draft", value: "draft" },
      { label: "Pending review", value: "pending" },
      { label: "Archived", value: "archived" },
    ],
  },
  {
    id: "category",
    label: "Category",
    multiple: false,
    options: libraryCategories.map((category) => ({ label: category, value: category })),
  },
  {
    id: "region",
    label: "Region",
    multiple: false,
    options: regions.map((region) => ({ label: region, value: region })),
  },
  {
    id: "difficulty",
    label: "Difficulty",
    multiple: false,
    options: libraryDifficulties.map((level) => ({ label: level, value: level })),
  },
  {
    id: "language",
    label: "Language",
    multiple: false,
    options: languages.map((language) => ({ label: language, value: language })),
  },
  {
    id: "featured",
    label: "Featured",
    multiple: false,
    options: [
      { label: "Featured only", value: "true" },
      { label: "Not featured", value: "false" },
    ],
  },
];

export function LibraryFilters({
  value,
  onChange,
}: {
  value: LibraryFilterState;
  onChange: (next: LibraryFilterState) => void;
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
        const merged: LibraryFilterState = { ...emptyLibraryFilters };
        for (const key of Object.keys(emptyLibraryFilters) as (keyof LibraryFilterState)[]) {
          merged[key] = next[key]?.[0] ?? "all";
        }
        onChange(merged);
      }}
    />
  );
}
