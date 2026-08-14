import { Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";

import { GeoButton } from "./GeoButton";
import { GlassCard } from "./GlassCard";

/**
 * Permission-denied surface. Used wherever a signed-in account lacks the
 * membership or role a screen requires — the real role check arrives with the
 * backend, the UI is final.
 */
export function PermissionDenied({
  title = "You don't have access to this",
  description = "This area needs a different membership or creator role on your account.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <GlassCard strong className="flex flex-col items-center px-8 py-14 text-center" role="alert">
      <span className="mb-7 inline-flex h-14 w-14 items-center justify-center rounded-full border border-bronze/25 bg-bronze/5 text-bronze">
        <ShieldAlert className="h-5 w-5" strokeWidth={1.3} aria-hidden />
      </span>
      <h2 className="text-lg font-light tracking-tight text-foreground">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-foreground/50">{description}</p>
      <div className="mt-9 flex flex-wrap justify-center gap-3">
        <GeoButton asChild variant="primary">
          <Link to="/pricing">View memberships</Link>
        </GeoButton>
        <GeoButton asChild variant="secondary">
          <Link to="/dashboard">Back to dashboard</Link>
        </GeoButton>
      </div>
    </GlassCard>
  );
}
