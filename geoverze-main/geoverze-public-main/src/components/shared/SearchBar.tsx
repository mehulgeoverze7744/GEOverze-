import { Loader2, Search, X } from "lucide-react";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

/**
 * The one search field in GEOverze.
 *
 * Presentational and controlled: callers own the query and the querying. It
 * supports an async `loading` indicator and a clear affordance so a backend
 * search reuses the exact same component.
 */
export function SearchBar({
  id = "search",
  label,
  className,
  wrapperClassName,
  loading = false,
  onClear,
  value,
  ...props
}: ComponentProps<"input"> & {
  id?: string;
  label?: string;
  wrapperClassName?: string;
  /** Shows a spinner while a query is in flight. */
  loading?: boolean;
  /** Renders a clear button when a query is present. */
  onClear?: () => void;
}) {
  const hasValue = typeof value === "string" ? value.length > 0 : false;
  const showClear = Boolean(onClear) && hasValue && !loading;

  return (
    <div className={cn("relative", wrapperClassName)}>
      {label ? (
        <label htmlFor={id} className="sr-only">
          {label}
        </label>
      ) : null}
      <Search
        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-bronze/90"
        strokeWidth={1.5}
        aria-hidden
      />
      <input
        id={id}
        type="search"
        value={value}
        className={cn(
          "motion-fast w-full rounded-full border border-bronze/20 bg-charcoal/50 py-3 pl-11 pr-11 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus:border-bronze/60 focus:outline-none focus:ring-2 focus:ring-bronze/20",
          className,
        )}
        {...props}
      />
      {loading ? (
        <Loader2
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-bronze/90"
          strokeWidth={1.5}
          aria-hidden
        />
      ) : null}
      {showClear ? (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className="focus-ring motion-fast absolute right-3 top-1/2 inline-flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-foreground/50 transition-colors hover:text-bronze"
        >
          <X className="h-3.5 w-3.5" strokeWidth={1.6} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
