export const planTiers = ["Basic", "Pro", "Advanced"] as const;
export type PlanTier = (typeof planTiers)[number];

export const billingCycles = ["Monthly", "Annual"] as const;
export type BillingCycle = (typeof billingCycles)[number];

export const subscriberStatuses = ["active", "trialing", "past_due", "cancelled"] as const;
export type SubscriberStatus = (typeof subscriberStatuses)[number];

export interface SubscriptionPlan {
  id: string;
  tier: PlanTier;
  tagline: string;
  monthlyPrice: number;
  annualPrice: number;
  includedSeats: number;
  monthlyCredits: number;
  features: string[];
  subscribers: number;
  mrr: number;
  popular: boolean;
}

export interface Subscriber {
  id: string;
  account: string;
  contact: string;
  tier: PlanTier;
  cycle: BillingCycle;
  status: SubscriberStatus;
  seats: number;
  mrr: number;
  startedAt: string;
  renewsAt: string;
  lifetimeValue: number;
  invoices: SubscriptionInvoice[];
}

export interface SubscriptionInvoice {
  id: string;
  amount: number;
  status: "paid" | "open" | "failed";
  issuedAt: string;
}

export interface SubscriberFilterState {
  tier: string;
  status: string;
  cycle: string;
}

export const emptySubscriberFilters: SubscriberFilterState = {
  tier: "all",
  status: "all",
  cycle: "all",
};
