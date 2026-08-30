/**
 * Membership tier types and static presentation metadata.
 *
 * Prices, limits, and credit grants come from Supabase `subscription_plans`
 * via `usePricingCatalog()` — not from this module.
 */

export type TierId = "explorer" | "basic" | "pro" | "advance";

export type BillingCycle = "monthly" | "annual";

export const TIER_ORDER: readonly TierId[] = ["explorer", "basic", "pro", "advance"];

export type PlanPrice = {
  /** Display amount, already formatted for the cycle. */
  amount: string;
  /** Short cadence label rendered next to the amount. */
  cadence: string;
  /** Optional struck-through standard price (intro promotions). */
  compareAt?: string;
  /** Optional note under the price (savings, billing rhythm). */
  note?: string;
  /** Future provider identifiers. Empty until billing goes live. */
  providerPriceId: { stripe: string | null; razorpay: string | null };
};

export type PricingPlan = {
  id: TierId;
  name: string;
  positioning: string;
  summary: string;
  features: string[];
  monthlyCreditGrant: number;
  featured: boolean;
  badge?: string;
  cta: string;
  prices: Record<BillingCycle, PlanPrice>;
};

type TierPresentation = {
  positioning: string;
  summary: string;
  cta: string;
  featured: boolean;
  badge?: string;
  /** Non-limit marketing bullets appended after DB-backed limits. */
  extraFeatures: string[];
};

/** Static copy keyed by tier — limits and prices are catalog-driven. */
export const TIER_PRESENTATION: Record<TierId, TierPresentation> = {
  explorer: {
    positioning: "Start knowing Earth",
    summary: "Enough of the universe to know whether you belong in it.",
    cta: "Start free",
    featured: false,
    extraFeatures: [
      "GEOlibrary browsing",
      "Global leaderboard entry",
      "Daily streak tracking",
      "Standard credit earning",
    ],
  },
  basic: {
    positioning: "More room to explore",
    summary: "A full month of quizzes and a steady credit grant without going unlimited.",
    cta: "Choose Basic",
    featured: false,
    extraFeatures: [
      "GEOlibrary browsing",
      "Global leaderboard entry",
      "Daily streak tracking",
      "Standard credit earning",
    ],
  },
  pro: {
    positioning: "The complete experience",
    summary: "Every mode, every atlas, no ceilings — the way GEOverze is meant to be played.",
    cta: "Choose Pro",
    featured: true,
    badge: "Most chosen",
    extraFeatures: [
      "PvP duels and multiplayer rooms",
      "All atlases and question packs",
      "Advanced progress analytics",
      "Member-only challenges",
    ],
  },
  advance: {
    positioning: "For creators and competitors",
    summary: "Everything in Pro, plus the Creator Studio and the frontier features first.",
    cta: "Go Advance",
    featured: false,
    extraFeatures: [
      "Creator Studio and publishing",
      "Creator analytics and earnings",
      "Priority content review",
      "Early access to AI features",
    ],
  },
};
