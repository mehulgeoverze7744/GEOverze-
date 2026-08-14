import { useEffect } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";

import { reportLovableError } from "@/lib/lovable-error-reporting";
import { GeoButton } from "./GeoButton";
import { GlassCard } from "./GlassCard";
import { SectionContainer } from "./SectionContainer";

/**
 * Route-level error boundary UI. Keeps navigation and chrome intact so a single
 * failing feature module never takes the whole platform down.
 */
export function RouteErrorFallback({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_route_error_component" });
  }, [error]);

  return (
    <SectionContainer className="py-[var(--space-section-sm)]">
      <GlassCard strong className="p-10 text-center md:p-14">
        <p className="eyebrow">Signal lost</p>
        <h1 className="mt-6 text-xl font-light tracking-tight text-foreground">
          This section didn't load
        </h1>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-foreground/50">
          Something went wrong while opening this part of GEOverze. You can try again without
          leaving the page.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <GeoButton variant="primary" onClick={reset}>
            Try again
          </GeoButton>
        </div>
      </GlassCard>
    </SectionContainer>
  );
}
