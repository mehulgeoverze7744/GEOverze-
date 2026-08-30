import { Banknote, CreditCard, Globe2, Landmark, Smartphone, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { BillingCycle, TierId } from "./plans";

export type SubscriptionState = {
  tier: TierId;
  status: "active" | "trialing" | "none";
  cycle: BillingCycle;
  since: string;
  renewsOn: string;
  creditsGrant: number;
};

/** Placeholder subscription — replaced by a real record when billing lands. */
export const currentSubscription: SubscriptionState = {
  tier: "pro",
  status: "active",
  cycle: "monthly",
  since: "12 March 2026",
  renewsOn: "12 September 2026",
  creditsGrant: 20,
};

export type Invoice = {
  id: string;
  date: string;
  description: string;
  amount: string;
  status: "paid" | "refunded" | "pending";
};

export const invoiceHistory: Invoice[] = [
  {
    id: "GV-2026-0812",
    date: "12 Aug 2026",
    description: "Pro — monthly",
    amount: "$4.99",
    status: "paid",
  },
  {
    id: "GV-2026-0712",
    date: "12 Jul 2026",
    description: "Pro — monthly",
    amount: "$4.99",
    status: "paid",
  },
  {
    id: "GV-2026-0612",
    date: "12 Jun 2026",
    description: "Pro — monthly",
    amount: "$4.99",
    status: "paid",
  },
  {
    id: "GV-2026-0512",
    date: "12 May 2026",
    description: "Pro — monthly",
    amount: "$4.99",
    status: "paid",
  },
  {
    id: "GV-2026-0412",
    date: "12 Apr 2026",
    description: "Pro — monthly",
    amount: "$4.99",
    status: "refunded",
  },
];

export type PaymentMethodOption = {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  availability: "planned" | "later";
};

export const paymentMethods: PaymentMethodOption[] = [
  {
    id: "cards",
    icon: CreditCard,
    label: "Cards",
    description: "Visa, Mastercard, RuPay and Amex.",
    availability: "planned",
  },
  {
    id: "upi",
    icon: Smartphone,
    label: "UPI",
    description: "Any UPI app, collect request or intent flow.",
    availability: "planned",
  },
  {
    id: "netbanking",
    icon: Landmark,
    label: "Net banking",
    description: "Direct debit from major Indian banks.",
    availability: "planned",
  },
  {
    id: "wallet",
    icon: Wallet,
    label: "Wallets",
    description: "Popular wallet balances and prepaid instruments.",
    availability: "planned",
  },
  {
    id: "international",
    icon: Globe2,
    label: "International cards",
    description: "Multi-currency charging with local tax handling.",
    availability: "planned",
  },
  {
    id: "future",
    icon: Banknote,
    label: "More providers",
    description: "Bank transfer, Apple Pay and Google Pay follow later.",
    availability: "later",
  },
];
