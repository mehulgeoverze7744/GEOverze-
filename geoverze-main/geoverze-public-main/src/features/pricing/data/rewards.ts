import { Coins, Gift, Sparkles, Store } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type RewardStep = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const rewardSteps: RewardStep[] = [
  {
    icon: Coins,
    title: "Earn credits",
    description:
      "Rounds, streaks, challenges and reading all pay credits. Paid tiers earn at 1.5× and 2×.",
  },
  {
    icon: Store,
    title: "Redeem in the GEOstore",
    description: "Spend credits on atlases, question packs, cosmetics and physical merchandise.",
  },
  {
    icon: Gift,
    title: "Membership bonuses",
    description:
      "A monthly credit grant lands on every paid plan, plus reward drops reserved for members.",
  },
  {
    icon: Sparkles,
    title: "Exclusive offers",
    description: "Seasonal bundles and member pricing that never appear on the public shelves.",
  },
];

export type CreatorPerk = { title: string; description: string };

export const creatorPerks: CreatorPerk[] = [
  {
    title: "Creator Studio",
    description: "A professional workspace for quizzes, articles and media — not a posting box.",
  },
  {
    title: "Analytics",
    description: "Plays, completion, accuracy and audience growth, per piece of content.",
  },
  {
    title: "Publishing",
    description: "Ship straight into Let's Play and the GEOlibrary, where explorers already are.",
  },
  {
    title: "Future monetization",
    description:
      "Royalties and payouts are designed into the model, waiting on the payments phase.",
  },
  {
    title: "Priority review",
    description: "Advance submissions move to the front of the review queue.",
  },
];
