import { catalogDaysAgo, pickFrom, rng } from "@/lib/catalog";
import {
  billingCycles,
  planTiers,
  subscriberStatuses,
  type BillingCycle,
  type PlanTier,
  type Subscriber,
  type SubscriberStatus,
  type SubscriptionInvoice,
  type SubscriptionPlan,
} from "@/features/subscriptions/types";

const accountNames = [
  "Northwind Academy",
  "Cartography Club",
  "Atlas Labs",
  "Meridian School",
  "Compass Collective",
  "Terra Institute",
  "Summit Learning",
  "Horizon Campus",
  "Voyager Group",
  "Equator Studios",
  "Latitude Works",
  "Polaris Academy",
];

const planPricing: Record<
  PlanTier,
  { monthly: number; annual: number; seats: number; credits: number }
> = {
  Basic: { monthly: 9, annual: 90, seats: 1, credits: 500 },
  Pro: { monthly: 24, annual: 240, seats: 5, credits: 2500 },
  Advanced: { monthly: 59, annual: 590, seats: 25, credits: 8000 },
};

const planFeatures: Record<PlanTier, string[]> = {
  Basic: [
    "Unlimited quiz play",
    "500 monthly GEOcredits",
    "Standard GEOlibrary access",
    "Community leaderboards",
  ],
  Pro: [
    "Everything in Basic",
    "2,500 monthly GEOcredits",
    "Quiz creation & publishing",
    "Advanced analytics",
    "Priority support",
  ],
  Advanced: [
    "Everything in Pro",
    "8,000 monthly GEOcredits",
    "25 included seats",
    "Custom branding",
    "Bulk credit allocation",
    "Dedicated success manager",
  ],
};

function buildSubscribers(): Subscriber[] {
  const rand = rng(3311);
  return Array.from({ length: 96 }, (_, index) => {
    const tier = pickFrom(rand, planTiers) as PlanTier;
    const cycle = pickFrom(rand, billingCycles) as BillingCycle;
    const status = pickFrom(rand, subscriberStatuses) as SubscriberStatus;
    const pricing = planPricing[tier];
    const seats = pricing.seats + Math.floor(rand() * pricing.seats * 2);
    const mrr =
      Math.round(seats * (cycle === "Annual" ? pricing.annual / 12 : pricing.monthly) * 100) / 100;
    const invoices: SubscriptionInvoice[] = Array.from({ length: 6 }, (_, i) => ({
      id: `INV-${7000 + index * 6 + i}`,
      amount: Math.round(mrr * (cycle === "Annual" ? 12 : 1) * 100) / 100,
      status: rand() > 0.9 ? "failed" : rand() > 0.85 ? "open" : "paid",
      issuedAt: catalogDaysAgo(30 * (i + 1), 10),
    }));
    return {
      id: `SUB-${3000 + index}`,
      account: `${pickFrom(rand, accountNames)} ${index + 1}`,
      contact: `billing${index + 1}@geoverze.io`,
      tier,
      cycle,
      status,
      seats,
      mrr,
      startedAt: catalogDaysAgo(60 + Math.floor(rand() * 700), 10),
      renewsAt: catalogDaysAgo(-(1 + Math.floor(rand() * 60)), 10),
      lifetimeValue: Math.round(mrr * (6 + Math.floor(rand() * 30))),
      invoices,
    } satisfies Subscriber;
  });
}

export const subscribers = buildSubscribers();

export const subscriptionPlans: SubscriptionPlan[] = planTiers.map((tier) => {
  const pricing = planPricing[tier];
  const tierSubs = subscribers.filter((sub) => sub.tier === tier);
  return {
    id: `PLAN-${tier.toUpperCase()}`,
    tier,
    tagline:
      tier === "Basic"
        ? "For solo explorers getting started."
        : tier === "Pro"
          ? "For creators and small teams."
          : "For institutions and large cohorts.",
    monthlyPrice: pricing.monthly,
    annualPrice: pricing.annual,
    includedSeats: pricing.seats,
    monthlyCredits: pricing.credits,
    features: planFeatures[tier],
    subscribers: tierSubs.length,
    mrr: Math.round(tierSubs.reduce((sum, sub) => sum + sub.mrr, 0)),
    popular: tier === "Pro",
  };
});

export interface SubscriptionSummary {
  activeSubscribers: number;
  mrr: number;
  arr: number;
  seats: number;
  churnRate: number;
}

export function summarizeSubscriptions(list: Subscriber[]): SubscriptionSummary {
  const active = list.filter((sub) => sub.status === "active" || sub.status === "trialing");
  const mrr = Math.round(active.reduce((sum, sub) => sum + sub.mrr, 0));
  const cancelled = list.filter((sub) => sub.status === "cancelled").length;
  return {
    activeSubscribers: active.length,
    mrr,
    arr: mrr * 12,
    seats: active.reduce((sum, sub) => sum + sub.seats, 0),
    churnRate: Math.round((cancelled / Math.max(1, list.length)) * 1000) / 10,
  };
}

export const mrrTrend = [48, 53, 57, 62, 60, 68, 72, 77, 75, 84, 88, 94];
