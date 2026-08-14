import { Coins, Palette, ShoppingBag, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type StoreShelf = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const storeShelves: StoreShelf[] = [
  {
    icon: Coins,
    title: "Credits",
    description: "The currency behind entries, retries and premium rounds.",
  },
  {
    icon: ShoppingBag,
    title: "Atlases",
    description: "Themed question packs and reference volumes to unlock.",
  },
  {
    icon: Palette,
    title: "Finishes",
    description: "Bronze, patina and obsidian treatments for your profile.",
  },
  {
    icon: Sparkles,
    title: "Season passes",
    description: "Tiered rewards that track a full competitive season.",
  },
];

export const storeRoadmap = [
  { title: "Credits ledger", description: "Transparent balance and history." },
  { title: "Secure checkout", description: "Payments handled by a trusted provider." },
  { title: "Inventory", description: "Everything you own, in one vault." },
];
