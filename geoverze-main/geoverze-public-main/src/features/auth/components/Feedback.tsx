import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Inline error banner. Announced to screen readers. */
export function ValidationMessage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "auth-error flex items-start gap-2.5 rounded-[14px] border border-[#FF3B30]/25 bg-[#FF3B30]/8 px-4 py-3 text-[13px] leading-relaxed text-[#FF3B30]",
        className,
      )}
    >
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/** Inline success banner. */
export function SuccessMessage({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="status"
      className={cn(
        "auth-error flex items-start gap-2.5 rounded-[14px] border border-[#34C759]/30 bg-[#34C759]/10 px-4 py-3 text-[13px] leading-relaxed text-[#1D1D1F]",
        className,
      )}
    >
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#34C759]" strokeWidth={1.6} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/**
 * Full-panel success state: animated ring + tick, headline, copy and
 * actions. Shared by login, reset, verification and onboarding completion.
 */
export function SuccessBurst({
  title,
  description,
  icon,
  children,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center text-center", className)} role="status">
      <span className="relative mb-6 inline-flex h-14 w-14 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-[#E5E5EA] bg-[#F5F5F7]" />
        <span className="relative text-[#111111]">
          {icon ?? <CheckCircle2 className="h-7 w-7" strokeWidth={1.2} aria-hidden="true" />}
        </span>
      </span>
      <h2 className="text-[1.15rem] font-semibold tracking-tight text-[#1D1D1F]">{title}</h2>
      {description ? (
        <p className="mt-2.5 max-w-sm text-[14px] leading-relaxed text-[#86868B]">{description}</p>
      ) : null}
      {children ? <div className="mt-7 w-full">{children}</div> : null}
    </div>
  );
}
