import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import type { ReactNode } from "react";

import { GeoButton } from "./GeoButton";
import { GlassCard } from "./GlassCard";

/**
 * Standard failure state for any panel, list or table.
 *
 * Route-level crashes use `RouteErrorFallback`; this is the inline version for
 * a single failed read, with retry as the primary action.
 */
export function ErrorState({
  icon: Icon = AlertTriangle,
  title = "This didn't load",
  description = "The request failed. Retrying usually clears it.",
  onRetry,
  action,
}: {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
}) {
  return (
    <GlassCard className="flex flex-col items-center px-8 py-14 text-center" role="alert">
      <span className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze">
        <Icon className="h-6 w-6" strokeWidth={1.3} />
      </span>
      <h3 className="text-lg font-light tracking-tight text-foreground">{title}</h3>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/50">{description}</p>
      {onRetry || action ? (
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {onRetry ? (
            <GeoButton variant="primary" onClick={onRetry}>
              Try again
            </GeoButton>
          ) : null}
          {action}
        </div>
      ) : null}
    </GlassCard>
  );
}
