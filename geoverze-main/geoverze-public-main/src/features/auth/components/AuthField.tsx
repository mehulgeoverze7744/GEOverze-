import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-bronze/20 bg-charcoal/50 px-4 py-3 text-sm text-foreground placeholder:text-foreground/50 outline-none transition-all motion-fast focus:border-bronze/60 focus:ring-2 focus:ring-bronze/25 focus:shadow-[var(--glow-bronze)] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none";

export { fieldBase as authFieldClass };

/** Label + hint/error frame used by every auth control. */
export function AuthFieldFrame({
  id,
  label,
  hint,
  error,
  children,
  className,
  required,
}: {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
  required?: boolean;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {label ? (
        <label
          htmlFor={id}
          className="block text-[0.62rem] uppercase tracking-[0.28em] text-foreground/50"
        >
          {label}
          {required ? <span className="ml-1 text-bronze/90">*</span> : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-xs text-foreground/50">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Branded auth text input with accessible error wiring. */
export function AuthField({
  id,
  label,
  hint,
  error,
  className,
  wrapperClassName,
  required,
  ...props
}: ComponentProps<"input"> & {
  id: string;
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <AuthFieldFrame
      id={id}
      {...(label ? { label } : {})}
      {...(hint ? { hint } : {})}
      {...(error ? { error } : {})}
      {...(wrapperClassName ? { className: wrapperClassName } : {})}
      {...(required ? { required } : {})}
    >
      <input
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        aria-required={required || undefined}
        className={cn(
          fieldBase,
          error && "border-destructive/60 focus:ring-destructive/25",
          className,
        )}
        {...props}
      />
    </AuthFieldFrame>
  );
}

/** Bronze checkbox with a rich label slot (for Terms / Privacy links). */
export function AuthCheckbox({
  label,
  error,
  className,
  id: idProp,
  ...props
}: Omit<ComponentProps<"input">, "type"> & { label: ReactNode; error?: string }) {
  const generated = useId();
  const id = idProp ?? generated;
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-start gap-3">
        <span className="relative mt-0.5 inline-flex h-[1.15rem] w-[1.15rem] shrink-0">
          <input
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="peer h-full w-full cursor-pointer appearance-none rounded-md border border-bronze/30 bg-charcoal/60 transition-all motion-fast checked:border-bronze checked:bg-bronze/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bronze/50 motion-reduce:transition-none"
            {...props}
          />
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto h-3 w-3 scale-50 text-bronze-glow opacity-0 transition-all motion-fast peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none"
          >
            <path
              d="M2 8.5l4 4 8-9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <label htmlFor={id} className="cursor-pointer text-xs leading-relaxed text-foreground/60">
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="pl-8 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
