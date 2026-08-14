import { Check, ChevronDown, Filter, X } from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
  count?: number | undefined;
}

export interface FilterDefinition {
  id: string;
  label: string;
  options: FilterOption[];
  multiple?: boolean | undefined;
}

export interface FilterBarProps {
  filters: FilterDefinition[];
  /** Map of filter id -> selected values. */
  value: Record<string, string[]>;
  onChange: (next: Record<string, string[]>) => void;
  /** Extra controls (date pickers, saved views…). */
  children?: ReactNode | undefined;
  className?: string | undefined;
}

export function FilterBar({ filters, value, onChange, children, className }: FilterBarProps) {
  const activeCount = Object.values(value).reduce((total, list) => total + list.length, 0);

  const toggle = (filter: FilterDefinition, option: string) => {
    const current = value[filter.id] ?? [];
    const next =
      filter.multiple === false
        ? current.includes(option)
          ? []
          : [option]
        : current.includes(option)
          ? current.filter((entry) => entry !== option)
          : [...current, option];
    onChange({ ...value, [filter.id]: next });
  };

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Filter className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      {filters.map((filter) => {
        const selected = value[filter.id] ?? [];
        return (
          <DropdownMenu key={filter.id}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                {filter.label}
                {selected.length > 0 && (
                  <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px] tabular">
                    {selected.length}
                  </Badge>
                )}
                <ChevronDown className="size-3.5 opacity-60" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              <DropdownMenuLabel className="text-xs">{filter.label}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {filter.options.map((option) => {
                const checked = selected.includes(option.value);
                return (
                  <DropdownMenuItem
                    key={option.value}
                    onSelect={(event) => {
                      event.preventDefault();
                      toggle(filter, option.value);
                    }}
                    className="justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Check
                        className={cn("size-3.5", checked ? "opacity-100" : "opacity-0")}
                        aria-hidden="true"
                      />
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground tabular">{option.count}</span>
                    )}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      })}

      {children}

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="h-8" onClick={() => onChange({})}>
          <X className="size-3.5" aria-hidden="true" />
          Reset
        </Button>
      )}
    </div>
  );
}
