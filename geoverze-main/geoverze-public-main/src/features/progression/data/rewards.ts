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
    description: "Earned by defeating opponents. First win vs a new opponent = +5; repeats = +1.",
    icon: Coins,
    rewards: [
      {
        id: "credit-monthly",
        title: "Monthly milestone",
        description: "Track credits earned inside the calendar month.",
        value: "100 credits",
        status: "available",
        art: "reward-credits",
      },
      {
        id: "credit-duel",
        title: "Duel victories",
        description: "First win against a new opponent pays the most; rematches stay flat.",
        value: "+5 / +1",
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
    id: "platform",
    title: "Platform rewards",
    description: "Credits unlock merchandise, digital rewards, and premium subscriptions.",
    icon: Wallet,
    rewards: [
      {
        id: "platform-rewards",
        title: "GEOverze rewards",
        description: "Spend credits on merch, digital drops, and premium perks when available.",
        value: "Coming soon",
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
