import { Search, X } from "lucide-react";
import { useId } from "react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string | undefined;
  label?: string | undefined;
  /** Shows a ⌘K hint on the right — for global search triggers. */
  shortcutHint?: boolean | undefined;
  autoFocus?: boolean | undefined;
  /** Matches the 32px control height used inside toolbars. */
  compact?: boolean | undefined;
  className?: string | undefined;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search…",
  label = "Search",
  shortcutHint,
  autoFocus,
  compact,
  className,
}: SearchBarProps) {
  const id = useId();

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Search
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={cn("pr-16 pl-8", compact ? "h-8" : "h-9")}
      />
      {value ? (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="absolute top-1/2 right-1 size-7 -translate-y-1/2"
        >
          <X className="size-3.5" aria-hidden="true" />
        </Button>
      ) : (
        shortcutHint && (
          <kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        )
      )}
    </div>
  );
}
