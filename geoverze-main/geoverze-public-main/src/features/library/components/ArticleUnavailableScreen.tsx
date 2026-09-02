import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { EmptyState, GeoButton, SectionContainer } from "@/components/shared";

import {
  libraryTierLabel,
  libraryTierRequiresLabel,
  type LibraryAccessTier,
} from "../lib/access-tier";

export type ArticleUnavailableKind = "not_found" | "sign_in_required" | "tier_restricted";

type ArticleUnavailableScreenProps = {
  kind: ArticleUnavailableKind;
  slug: string;
  requiredTier?: LibraryAccessTier | null;
  title?: string | null;
};

/** Distinct empty states for missing, sign-in-gated, and tier-gated library entries. */
export function ArticleUnavailableScreen({
  kind,
  slug,
  requiredTier,
  title,
}: ArticleUnavailableScreenProps) {
  if (kind === "not_found") {
    return (
      <SectionContainer>
        <EmptyState
          title="Entry not found"
          description="This library entry does not exist or is no longer published. Browse the library for available reading."
        />
        <GeoButton asChild variant="ghost" className="mt-6">
          <Link to="/geolibrary/browse">Browse the library</Link>
        </GeoButton>
      </SectionContainer>
    );
  }

  const tierLabel = requiredTier
    ? libraryTierRequiresLabel(requiredTier)
    : "a higher membership tier";
  const heading =
    kind === "sign_in_required" ? "Sign in to read this entry" : "Membership upgrade required";

  const description =
    kind === "sign_in_required"
      ? `This entry is reserved for ${requiredTier ? libraryTierLabel(requiredTier) : "members"}. Sign in to check your access, or explore free reading in the library.`
      : `Your current plan does not include this entry${requiredTier ? ` (${libraryTierRequiresLabel(requiredTier)})` : ""}. Upgrade to unlock it and the rest of the GEOlibrary catalogue.`;

  return (
    <SectionContainer>
      <div className="glass-panel surface-gradient mx-auto max-w-xl rounded-2xl p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-bronze/35 bg-bronze/10 text-bronze-glow">
          <Lock className="h-5 w-5" strokeWidth={1.6} aria-hidden />
        </div>
        <p className="mt-6 text-[0.6rem] uppercase tracking-[0.22em] text-bronze/90">{tierLabel}</p>
        <h1 className="mt-3 text-2xl font-light tracking-tight text-foreground">{heading}</h1>
        {title ? (
          <p className="mt-2 text-sm text-foreground/50">{title}</p>
        ) : (
          <p className="mt-2 text-xs text-foreground/40">{slug}</p>
        )}
        <p className="mt-4 text-sm leading-relaxed text-foreground/60">{description}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {kind === "sign_in_required" ? (
            <GeoButton asChild>
              <Link to="/auth/login">Sign in</Link>
            </GeoButton>
          ) : (
            <GeoButton asChild>
              <Link to="/pricing">View plans</Link>
            </GeoButton>
          )}
          <GeoButton asChild variant="ghost">
            <Link to="/geolibrary/browse">Browse free entries</Link>
          </GeoButton>
        </div>
      </div>
    </SectionContainer>
  );
}
