/** Level ladder placeholders. */
export type LevelTier = {
  level: number;
  title: string;
  xpRequired: number;
  reward: string;
};

export const LEVELS: readonly LevelTier[] = [
  { level: 12, title: "Navigator", xpRequired: 16_000, reward: "Navigator badge" },
  { level: 13, title: "Surveyor", xpRequired: 17_200, reward: "+40 bonus XP daily" },
  { level: 14, title: "Cartographer", xpRequired: 18_000, reward: "Bronze map frame" },
  { level: 15, title: "Pathfinder", xpRequired: 19_000, reward: "Pathfinder badge + 10 credits" },
  { level: 16, title: "Explorer", xpRequired: 20_400, reward: "Seasonal avatar finish" },
  { level: 17, title: "Voyager", xpRequired: 22_000, reward: "Mystery reward crate" },
  { level: 18, title: "Geographer", xpRequired: 24_000, reward: "Custom profile banner" },
  { level: 20, title: "Atlas Keeper", xpRequired: 28_500, reward: "Atlas Keeper title" },
] as const;

export type Milestone = {
  level: number;
  label: string;
  description: string;
};

export const MILESTONES: readonly Milestone[] = [
  { level: 15, label: "Pathfinder", description: "Unlocks credit boosts on daily challenges." },
  { level: 20, label: "Atlas Keeper", description: "Unlocks seasonal reward track." },
  { level: 25, label: "Continental", description: "Unlocks merchandise reward preview." },
  { level: 30, label: "Planetary", description: "Unlocks the mystery reward vault." },
] as const;
