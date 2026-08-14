import { FilterBar, type FilterDefinition } from "@/components/shared/filter-bar";
import { creatorCountries, creatorTiers, verificationStates } from "@/features/creators/data";
import { emptyCreatorFilters, type CreatorFilterState } from "@/features/creators/types";

const definitions: FilterDefinition[] = [
  {
    id: "tier",
    label: "Tier",
    multiple: false,
    options: creatorTiers.map((tier) => ({ label: tier, value: tier })),
  },
  {
    id: "verification",
    label: "Verification",
    multiple: false,
    options: verificationStates.map((state) => ({ label: state, value: state })),
  },
  {
    id: "status",
    label: "Status",
    multiple: false,
    options: [
      { label: "Active", value: "active" },
      { label: "Pending", value: "pending" },
      { label: "Suspended", value: "suspended" },
    ],
  },
  {
    id: "country",
    label: "Country",
    multiple: false,
    options: creatorCountries.map((country) => ({ label: country, value: country })),
  },
  {
    id: "activityState",
    label: "Activity",
    multiple: false,
    options: [
      { label: "Active (30d)", value: "Active" },
      { label: "Inactive", value: "Inactive" },
    ],
  },
  {
    id: "joinedWithin",
    label: "Joined",
    multiple: false,
    options: [
      { label: "Last 30 days", value: "Last 30 days" },
      { label: "Last 90 days", value: "Last 90 days" },
      { label: "Last 12 months", value: "Last 12 months" },
      { label: "Over 12 months", value: "Over 12 months" },
    ],
  },
];

export function CreatorFilters({
  value,
  onChange,
}: {
  value: CreatorFilterState;
  onChange: (next: CreatorFilterState) => void;
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
        const merged: CreatorFilterState = { ...emptyCreatorFilters };
        for (const key of Object.keys(emptyCreatorFilters) as (keyof CreatorFilterState)[]) {
          merged[key] = next[key]?.[0] ?? "all";
        }
        onChange(merged);
      }}
    />
  );
}
