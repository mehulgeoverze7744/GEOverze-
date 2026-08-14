import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { userCountries, userRoles } from "@/features/users/data";
import { emptyUserFilters, type UserFilterState } from "@/features/users/types";
import { cn } from "@/lib/utils";

const selectFields = [
  {
    id: "membership" as const,
    label: "Membership",
    options: ["Free", "Plus", "Premium", "Elite"],
  },
  { id: "role" as const, label: "Role", options: userRoles },
  { id: "country" as const, label: "Country", options: userCountries },
  { id: "status" as const, label: "Status", options: ["active", "pending", "suspended"] },
  {
    id: "creatorStatus" as const,
    label: "Creator status",
    options: ["None", "Applied", "Approved", "Rejected"],
  },
  {
    id: "ageVerification" as const,
    label: "Age verification",
    options: ["Verified", "Unverified"],
  },
  {
    id: "registeredWithin" as const,
    label: "Registration date",
    options: ["Last 7 days", "Last 30 days", "Last 90 days", "Last 12 months"],
  },
  {
    id: "lastActiveWithin" as const,
    label: "Last active",
    options: ["Today", "Last 7 days", "Last 30 days", "Over 30 days"],
  },
];

const rangeFields = [
  { min: "creditsMin" as const, max: "creditsMax" as const, label: "Credits" },
  { min: "xpMin" as const, max: "xpMax" as const, label: "XP" },
];

export function countActiveFilters(value: UserFilterState) {
  return Object.entries(value).filter(([key, v]) =>
    key.endsWith("Min") || key.endsWith("Max") ? v !== "" : v !== "all",
  ).length;
}

export interface UserFiltersProps {
  value: UserFilterState;
  onChange: (next: UserFilterState) => void;
  className?: string | undefined;
}

export function UserFilters({ value, onChange, className }: UserFiltersProps) {
  const active = countActiveFilters(value);
  const set = <K extends keyof UserFilterState>(key: K, next: UserFilterState[K]) =>
    onChange({ ...value, [key]: next });

  const chips = [
    ...selectFields
      .filter((field) => value[field.id] !== "all")
      .map((field) => ({
        key: field.id as keyof UserFilterState,
        label: `${field.label}: ${value[field.id]}`,
        clear: () => set(field.id, "all"),
      })),
    ...rangeFields.flatMap((field) =>
      [
        value[field.min] !== ""
          ? {
              key: field.min as keyof UserFilterState,
              label: `${field.label} ≥ ${value[field.min]}`,
              clear: () => set(field.min, ""),
            }
          : null,
        value[field.max] !== ""
          ? {
              key: field.max as keyof UserFilterState,
              label: `${field.label} ≤ ${value[field.max]}`,
              clear: () => set(field.max, ""),
            }
          : null,
      ].filter(
        Boolean as unknown as (
          v: unknown,
        ) => v is { key: keyof UserFilterState; label: string; clear: () => void },
      ),
    ),
  ];

  return (
    <Collapsible
      defaultOpen={false}
      className={cn("rounded-lg border border-border bg-card", className)}
    >
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8">
            <SlidersHorizontal className="size-4" aria-hidden="true" />
            Advanced filters
            {active > 0 && (
              <span className="ml-1 rounded-full bg-primary/15 px-1.5 text-xs font-medium tabular text-primary">
                {active}
              </span>
            )}
          </Button>
        </CollapsibleTrigger>

        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
          {chips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.clear}
              className="focus-visible:ring-ring/50 inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:outline-none"
              aria-label={`Remove filter ${chip.label}`}
            >
              {chip.label}
              <X className="size-3" aria-hidden="true" />
            </button>
          ))}
        </div>

        {active > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8"
            onClick={() => onChange(emptyUserFilters)}
          >
            Clear all
          </Button>
        )}
      </div>

      <CollapsibleContent>
        <div className="grid gap-3 border-t border-border p-3 sm:grid-cols-2 lg:grid-cols-4">
          {selectFields.map((field) => (
            <div key={field.id} className="space-y-1.5">
              <Label htmlFor={`filter-${field.id}`} className="text-xs text-muted-foreground">
                {field.label}
              </Label>
              <Select value={value[field.id]} onValueChange={(next) => set(field.id, next)}>
                <SelectTrigger id={`filter-${field.id}`} className="h-9 w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  {field.options.map((option) => (
                    <SelectItem key={option} value={option} className="capitalize">
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}

          {rangeFields.map((field) => (
            <div key={field.label} className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">{field.label} range</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  inputMode="numeric"
                  className="h-9"
                  placeholder="Min"
                  aria-label={`Minimum ${field.label}`}
                  value={value[field.min]}
                  onChange={(e) => set(field.min, e.target.value)}
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  inputMode="numeric"
                  className="h-9"
                  placeholder="Max"
                  aria-label={`Maximum ${field.label}`}
                  value={value[field.max]}
                  onChange={(e) => set(field.max, e.target.value)}
                />
              </div>
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
