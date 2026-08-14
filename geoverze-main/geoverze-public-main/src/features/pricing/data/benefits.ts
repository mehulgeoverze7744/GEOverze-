import {
  BarChart3,
  BadgeCheck,
  Bot,
  Gift,
  Infinity as InfinityIcon,
  PenTool,
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
    title: "Unlimited learning",
    description: "No daily ceiling. Play, read and revisit as long as your curiosity holds out.",
  },
  {
    icon: BarChart3,
    title: "Advanced analytics",
    description:
      "Continent mastery, accuracy curves and the gaps worth closing next — measured, not guessed.",
  },
  {
    icon: PenTool,
    title: "Creator access",
    description:
      "The Creator Studio: build quizzes, publish long-form geography and watch it travel.",
  },
  {
    icon: Swords,
    title: "Exclusive challenges",
    description: "Member duels, seasonal tournaments and weekly ladders reserved for subscribers.",
  },
  {
    icon: Gift,
    title: "Premium rewards",
    description: "Faster credit earning and reward drops that only reach paid tiers.",
  },
  {
    icon: BadgeCheck,
    title: "Exclusive badges",
    description: "Membership marks that sit on your profile, leaderboard row and community posts.",
  },
  {
    icon: Bot,
    title: "Future AI coach",
    description: "Adaptive practice and on-demand explanations — Advance members see it first.",
  },
];
