/** Reward catalogue placeholders, grouped by section. */
import type { LucideIcon } from "lucide-react";
import { Award, Coins, Gift, Shirt, Sparkles, Snowflake, Wallet, Zap } from "lucide-react";

export type RewardStatus = "available" | "locked" | "coming-soon";

export type Reward = {
  id: string;
  title: string;
  description: string;
  value: string;
  status: RewardStatus;
  art: string;
};

export type RewardSection = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  rewards: readonly Reward[];
};

export const REWARD_SECTIONS: readonly RewardSection[] = [
  {
    id: "credits",
    title: "Credits",
    description: "Earned by defeating opponents. 100 credits in one calendar month unlocks US$1.",
    icon: Coins,
    rewards: [
      {
        id: "credit-monthly",
        title: "Monthly redemption",
        description: "Reach 100 credits inside the month to become eligible.",
        value: "100 → US$1",
        status: "available",
        art: "reward-credits",
      },
      {
        id: "credit-duel",
        title: "Duel victories",
        description: "New opponents pay the most; rematches taper down.",
        value: "+5 / +3 / +2 / +1",
        status: "available",
        art: "reward-duel",
      },
    ],
  },
  {
    id: "xp",
    title: "XP",
    description: "Experience drives your level and unlocks the reward ladder.",
    icon: Zap,
    rewards: [
      {
        id: "xp-daily",
        title: "Daily challenge XP",
        description: "Five objectives refresh every midnight.",
        value: "+100 XP",
        status: "available",
        art: "reward-xp-daily",
      },
      {
        id: "xp-perfect",
        title: "Perfect run bonus",
        description: "Clear a set without a single mistake.",
        value: "+150 XP",
        status: "available",
        art: "reward-xp-perfect",
      },
    ],
  },
  {
    id: "achievements",
    title: "Achievements",
    description: "Permanent badges for milestones across every mode.",
    icon: Award,
    rewards: [
      {
        id: "ach-flags",
        title: "Flag Master",
        description: "Identify 500 flags correctly.",
        value: "Badge",
        status: "locked",
        art: "reward-flags",
      },
      {
        id: "ach-streak",
        title: "Unbroken",
        description: "Hold a 30 day streak.",
        value: "Badge",
        status: "locked",
        art: "reward-streak",
      },
    ],
  },
  {
    id: "merch",
    title: "Merchandise",
    description: "Physical rewards arrive with the GEOstore fulfilment phase.",
    icon: Shirt,
    rewards: [
      {
        id: "merch-tee",
        title: "Explorer tee",
        description: "Bronze emblem print on charcoal cotton.",
        value: "Coming soon",
        status: "coming-soon",
        art: "reward-merch-tee",
      },
      {
        id: "merch-poster",
        title: "Atlas print",
        description: "Collector world map, numbered edition.",
        value: "Coming soon",
        status: "coming-soon",
        art: "reward-merch-poster",
      },
    ],
  },
  {
    id: "seasonal",
    title: "Seasonal rewards",
    description: "Limited tracks that rotate with each GEOverze season.",
    icon: Snowflake,
    rewards: [
      {
        id: "season-frame",
        title: "Season 1 frame",
        description: "Avatar finish for top seasonal ranks.",
        value: "Season reward",
        status: "coming-soon",
        art: "reward-season-frame",
      },
      {
        id: "season-title",
        title: "Seasonal title",
        description: "Displayed beside your username.",
        value: "Season reward",
        status: "coming-soon",
        art: "reward-season-title",
      },
    ],
  },
  {
    id: "mystery",
    title: "Mystery rewards",
    description: "Sealed crates revealed on unlock.",
    icon: Gift,
    rewards: [
      {
        id: "mystery-crate",
        title: "Mystery crate",
        description: "Contents hidden until opened.",
        value: "???",
        status: "locked",
        art: "reward-mystery",
      },
    ],
  },
  {
    id: "cash",
    title: "Cash redemption",
    description: "Monthly credit goals convert to real value. Payout tooling is not built yet.",
    icon: Wallet,
    rewards: [
      {
        id: "cash-one",
        title: "US$1 redemption",
        description: "Unlocked at 100 credits in a single calendar month.",
        value: "US$1",
        status: "coming-soon",
        art: "reward-cash",
      },
    ],
  },
] as const;

export const SEASON = {
  name: "Season 1 · Meridian",
  description: "Climb the seasonal ladder before the reset. Rewards preview only.",
  progress: 42,
  daysLeft: 26,
  icon: Sparkles,
} as const;
