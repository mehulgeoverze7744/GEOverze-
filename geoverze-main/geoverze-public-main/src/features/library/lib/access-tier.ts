/** Public subscription tiers used by GEOlibrary access checks (matches subscription_plans.tier). */
export type LibraryAccessTier = "explorer" | "basic" | "pro" | "advance";

export type ResourceAccessState =
  | { kind: "open" }
  | { kind: "sign_in_required"; requiredTier: LibraryAccessTier }
  | { kind: "tier_insufficient"; requiredTier: LibraryAccessTier; userTier: LibraryAccessTier };

const TIER_RANK: Record<LibraryAccessTier, number> = {
  explorer: 0,
  basic: 1,
  pro: 2,
  advance: 3,
};

const TIER_LABEL: Record<LibraryAccessTier, string> = {
  explorer: "Explorer",
  basic: "Basic",
  pro: "Pro",
  advance: "Advance",
};

const TIER_REQUIRES_LABEL: Record<LibraryAccessTier, string> = {
  explorer: "Free",
  basic: "Requires Basic",
  pro: "Requires Pro",
  advance: "Requires Advance",
};

/** Normalize nullable backend tier strings. */
export function parseLibraryAccessTier(value: string | null | undefined): LibraryAccessTier | null {
  if (value === "explorer" || value === "basic" || value === "pro" || value === "advance") {
    return value;
  }
  return null;
}

export function libraryTierRank(tier: LibraryAccessTier): number {
  return TIER_RANK[tier];
}

export function libraryTierLabel(tier: LibraryAccessTier): string {
  return TIER_LABEL[tier];
}

export function libraryTierRequiresLabel(tier: LibraryAccessTier): string {
  return TIER_REQUIRES_LABEL[tier];
}

/** Client-side access hint — RLS remains authoritative. */
export function getResourceAccessState(
  minAccessTier: LibraryAccessTier | null | undefined,
  userTier: LibraryAccessTier,
  signedIn: boolean,
): ResourceAccessState {
  if (!minAccessTier) return { kind: "open" };

  if (!signedIn) {
    return { kind: "sign_in_required", requiredTier: minAccessTier };
  }

  if (libraryTierRank(userTier) < libraryTierRank(minAccessTier)) {
    return { kind: "tier_insufficient", requiredTier: minAccessTier, userTier };
  }

  return { kind: "open" };
}

export function isResourceAccessRestricted(state: ResourceAccessState): boolean {
  return state.kind !== "open";
}
