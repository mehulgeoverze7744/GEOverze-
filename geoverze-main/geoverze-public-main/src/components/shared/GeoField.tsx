import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-bronze/20 bg-charcoal/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/50 transition-colors motion-fast focus:border-bronze/60 focus:outline-none focus:ring-2 focus:ring-bronze/20 disabled:cursor-not-allowed disabled:opacity-45";

function FieldFrame({
  id,
  label,
  hint,
  error,
  children,
  className,
}: {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-[0.62rem] uppercase tracking-[0.28em] text-foreground/50"
        >
          {label}
        </label>
      ) : null}
      {children}
      {error ? (
        <p className="text-xs text-destructive/80">{error}</p>
      ) : hint ? (
        <p className="text-xs text-foreground/50">{hint}</p>
      ) : null}
    </div>
  );
}

/** Branded text input. */
export function GeoInput({
  id,
  label,
  hint,
  error,
  className,
  wrapperClassName,
  ...props
}: ComponentProps<"input"> & {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldFrame
      id={id}
      {...(label ? { label } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
      {...(wrapperClassName ? { className: wrapperClassName } : {})}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(fieldBase, error && "border-destructive/50", className)}
        {...props}
      />
    </FieldFrame>
  );
}

/** Branded multi-line input. */
export function GeoTextarea({
  id,
  label,
  hint,
  error,
  className,
  wrapperClassName,
  ...props
}: ComponentProps<"textarea"> & {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldFrame
      id={id}
      {...(label ? { label } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
      {...(wrapperClassName ? { className: wrapperClassName } : {})}
    >
      <textarea
        id={id}
        aria-invalid={error ? true : undefined}
        className={cn(fieldBase, "min-h-32 resize-y", error && "border-destructive/50", className)}
        {...props}
      />
    </FieldFrame>
  );
}

/** Branded native select — keeps keyboard and mobile behaviour intact. */
export function GeoSelect({
  id,
  label,
  hint,
  error,
  className,
  wrapperClassName,
  children,
  ...props
}: ComponentProps<"select"> & {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}) {
  return (
    <FieldFrame
      id={id}
      {...(label ? { label } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
      {...(wrapperClassName ? { className: wrapperClassName } : {})}
    >
      <select
        id={id}
        className={cn(
          fieldBase,
          "appearance-none pr-10",
          error && "border-destructive/50",
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </FieldFrame>
  );
}
