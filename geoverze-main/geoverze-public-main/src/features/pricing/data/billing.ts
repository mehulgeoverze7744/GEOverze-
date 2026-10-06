import { Banknote, CreditCard, Globe2, Landmark, Smartphone, Wallet } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type PaymentMethodOption = {
  id: string;
  icon: LucideIcon;
  label: string;
  description: string;
  availability: "planned" | "later";
};

/** Safe catalog of providers — no stored cards or secrets are shown. */
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
