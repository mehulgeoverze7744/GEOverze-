import { type ComponentProps, type ReactNode, useId } from "react";

import { cn } from "@/lib/utils";

const fieldBase =
  "h-[54px] w-full rounded-[16px] border border-[#E5E5EA] bg-[#F5F5F7] px-4 text-[16px] text-[#1D1D1F] placeholder:text-[#86868B] outline-none transition-[border-color,box-shadow,background-color] duration-200 ease-out focus:border-[#007AFF] focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,122,255,0.16)] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none";

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
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <label htmlFor={id} className="block text-[13px] font-medium text-[#1D1D1F]">
          {label}
          {required ? (
            <span className="ml-0.5 text-[#86868B]" aria-hidden="true">
              *
            </span>
          ) : null}
        </label>
      ) : null}
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="auth-error text-[12px] text-[#FF3B30]">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[12px] text-[#86868B]">
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
          error && "border-[#FF3B30] focus:border-[#FF3B30] focus:shadow-[0_0_0_4px_rgba(255,59,48,0.14)]",
          className,
        )}
        {...props}
      />
    </AuthFieldFrame>
  );
}

/** iOS-style rounded checkbox with a rich label slot (for Terms / Privacy links). */
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
      <div className="flex min-h-11 items-center gap-3">
        <span className="relative inline-flex h-[22px] w-[22px] shrink-0">
          <input
            id={id}
            type="checkbox"
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? `${id}-error` : undefined}
            className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
            {...props}
          />
          <span className="pointer-events-none h-full w-full rounded-[7px] border border-[#C7C7CC] bg-white transition-colors duration-200 peer-checked:border-[#007AFF] peer-checked:bg-[#007AFF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#007AFF]/40" />
          <svg
            viewBox="0 0 16 16"
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 m-auto h-3 w-3 scale-50 text-white opacity-0 transition-all duration-200 peer-checked:scale-100 peer-checked:opacity-100 motion-reduce:transition-none"
          >
            <path
              d="M2 8.5l4 4 8-9"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <label htmlFor={id} className="cursor-pointer text-[14px] leading-snug text-[#86868B]">
          {label}
        </label>
      </div>
      {error ? (
        <p id={`${id}-error`} role="alert" className="auth-error pl-8 text-[12px] text-[#FF3B30]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
