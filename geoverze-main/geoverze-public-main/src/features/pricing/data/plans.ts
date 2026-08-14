/**
 * Membership tiers. Placeholder pricing — every plan carries provider price id
 * slots so a real provider (Stripe / Razorpay) can be wired without touching UI.
 */

export type TierId = "explorer" | "pro" | "advance";

export type BillingCycle = "monthly" | "annual";

export type PlanPrice = {
  /** Display amount, already formatted for the cycle. */
  amount: string;
  /** Short cadence label rendered next to the amount. */
  cadence: string;
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
  featured: boolean;
  badge?: string;
  cta: string;
  prices: Record<BillingCycle, PlanPrice>;
};

export const pricingPlans: PricingPlan[] = [
  {
    id: "explorer",
    name: "Explorer",
    positioning: "Start knowing Earth",
    summary: "Enough of the universe to know whether you belong in it.",
    features: [
      "Three solo rounds a day",
      "GEOlibrary browsing",
      "Global leaderboard entry",
      "Daily streak tracking",
      "Standard credit earning",
    ],
    featured: false,
    cta: "Start free",
    prices: {
      monthly: {
        amount: "Free",
        cadence: "forever",
        note: "No card, no expiry.",
        providerPriceId: { stripe: null, razorpay: null },
      },
      annual: {
        amount: "Free",
        cadence: "forever",
        note: "No card, no expiry.",
        providerPriceId: { stripe: null, razorpay: null },
      },
    },
  },
  {
    id: "pro",
    name: "Pro",
    positioning: "The complete experience",
    summary: "Every mode, every atlas, no ceilings — the way GEOverze is meant to be played.",
    features: [
      "Unlimited rounds and retries",
      "PvP duels and multiplayer rooms",
      "All atlases and question packs",
      "Advanced progress analytics",
      "1.5× credit earning",
      "Member-only challenges",
    ],
    featured: true,
    badge: "Most chosen",
    cta: "Choose Pro",
    prices: {
      monthly: {
        amount: "$9",
        cadence: "per month",
        note: "Billed monthly, cancel anytime.",
        providerPriceId: { stripe: null, razorpay: null },
      },
      annual: {
        amount: "$90",
        cadence: "per year",
        note: "Two months free versus monthly.",
        providerPriceId: { stripe: null, razorpay: null },
      },
    },
  },
  {
    id: "advance",
    name: "Advance",
    positioning: "For creators and competitors",
    summary: "Everything in Pro, plus the Creator Studio and the frontier features first.",
    features: [
      "Everything in Pro",
      "Creator Studio and publishing",
      "Creator analytics and earnings",
      "Priority content review",
      "2× credit earning and premium rewards",
      "Early access to AI features",
    ],
    featured: false,
    cta: "Go Advance",
    prices: {
      monthly: {
        amount: "$19",
        cadence: "per month",
        note: "Billed monthly, cancel anytime.",
        providerPriceId: { stripe: null, razorpay: null },
      },
      annual: {
        amount: "$190",
        cadence: "per year",
        note: "Two months free versus monthly.",
        providerPriceId: { stripe: null, razorpay: null },
      },
    },
  },
];

export const planById = (id: TierId): PricingPlan =>
  pricingPlans.find((p) => p.id === id) ?? pricingPlans[0]!;
