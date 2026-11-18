import { Slot } from "@radix-ui/react-slot";
import type { ComponentProps } from "react";

import { cn } from "@/lib/utils";

function AuthSpinner({ label }: { label: string }) {
  return (
    <span role="status" aria-label={label} className="inline-flex">
      <span className="h-4 w-4 animate-spin rounded-full border border-white/25 border-t-white motion-reduce:animate-none" />
    </span>
  );
}

const controlBase =
  "inline-flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[16px] px-5 text-[15px] font-semibold tracking-[0.01em] transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/35 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-45 active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100";

/**
 * Submit button with a built-in pending state.
 *
 * Keeps the label in place while a spinner replaces it, so the button never
 * changes size mid-request.
 */
export function AuthSubmitButton({
  pending,
  pendingLabel = "Working",
  children,
  className,
  disabled,
  asChild = false,
  type = "submit",
  ...props
}: ComponentProps<"button"> & { pending?: boolean; pendingLabel?: string; asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      {...(asChild ? {} : { type })}
      aria-busy={pending || undefined}
      disabled={disabled || pending}
      className={cn(controlBase, "bg-[#111111] text-white hover:bg-black", className)}
      {...props}
    >
      {pending ? (
        <>
          <AuthSpinner label={pendingLabel} />
          <span>{pendingLabel}</span>
        </>
      ) : (
        children
      )}
    </Comp>
  );
}

export function AuthSecondaryButton({
  className,
  asChild = false,
  type = "button",
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      {...(asChild ? {} : { type })}
      className={cn(
        controlBase,
        "border border-[#E5E5EA] bg-white text-[#1D1D1F] hover:bg-[#F5F5F7]",
        className,
      )}
      {...props}
    />
  );
}

export function AuthGhostButton({
  className,
  asChild = false,
  type = "button",
  ...props
}: ComponentProps<"button"> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      {...(asChild ? {} : { type })}
      className={cn(
        "inline-flex min-h-11 w-full items-center justify-center rounded-[14px] px-4 text-[14px] font-medium text-[#007AFF] transition-opacity duration-200 hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/35 disabled:opacity-40",
        className,
      )}
      {...props}
    />
  );
}
