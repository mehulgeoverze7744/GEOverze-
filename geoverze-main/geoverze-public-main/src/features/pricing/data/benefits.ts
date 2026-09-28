import {
  BookOpen,
  Coins,
  Gift,
  Infinity as InfinityIcon,
  ShoppingBag,
  Sparkles,
  Swords,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MembershipBenefit = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const membershipBenefits: MembershipBenefit[] = [
  {
    icon: InfinityIcon,
    title: "Unlimited quizzes",
    description: "No monthly ceiling. Play as many rounds as your curiosity holds out for.",
  },
  {
    icon: BookOpen,
    title: "Full GEOlibrary access",
    description: "Every article, atlas and collection in the GEOlibrary, unlocked.",
  },
  {
    icon: Swords,
    title: "PvP & Multiplayer",
    description: "Head-to-head duels and live multiplayer rooms with explorers worldwide.",
  },
  {
    icon: Coins,
    title: "Membership credits",
    description: "A fresh monthly credit grant that rolls over and spends across GEOverze.",
  },
  {
    icon: ShoppingBag,
    title: "GEOstore savings",
    description: "Member discounts on every GEOstore purchase — up to 10% off with Pro.",
  },
  {
    icon: Gift,
    title: "Exclusive rewards",
    description: "Member-only avatars, themes and reward drops that only reach paid tiers.",
  },
  {
    icon: Sparkles,
    title: "Unlimited fun",
    description: "Every mode, every challenge, no limits — geography the way it should feel.",
  },
];
