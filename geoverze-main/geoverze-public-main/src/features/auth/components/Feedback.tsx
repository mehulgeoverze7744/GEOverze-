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
        "flex items-start gap-2.5 rounded-xl border border-destructive/35 bg-destructive/10 px-4 py-3 text-xs leading-relaxed text-destructive",
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
        "flex items-start gap-2.5 rounded-xl border border-bronze/35 bg-bronze/10 px-4 py-3 text-xs leading-relaxed text-bronze-glow",
        className,
      )}
    >
      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" strokeWidth={1.6} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}

/**
 * Full-panel success state: animated bronze ring + tick, headline, copy and
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
      <span className="relative mb-7 inline-flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-bronze/30 bg-bronze/5" />
        <span className="absolute inset-0 animate-ping rounded-full border border-bronze/25 motion-reduce:animate-none" />
        <span className="relative text-bronze-glow">
          {icon ?? <CheckCircle2 className="h-7 w-7" strokeWidth={1.2} aria-hidden="true" />}
        </span>
      </span>
      <h2 className="text-lg font-light tracking-tight text-foreground">{title}</h2>
      {description ? (
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground/50">{description}</p>
      ) : null}
      {children ? <div className="mt-8 w-full">{children}</div> : null}
    </div>
  );
}
