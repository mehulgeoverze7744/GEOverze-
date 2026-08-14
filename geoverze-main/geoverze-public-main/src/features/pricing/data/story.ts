export type UpgradeBeat = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};

export const upgradeStory: UpgradeBeat[] = [
  {
    id: "learning",
    eyebrow: "Learning",
    title: "Knowledge that accumulates",
    description:
      "Membership turns scattered play into a curriculum. Every round feeds a picture of what you know, and the library fills the parts you do not.",
    points: ["Unlimited rounds", "Full GEOlibrary", "Mastery tracking"],
  },
  {
    id: "competition",
    eyebrow: "Competition",
    title: "Someone to measure against",
    description:
      "Duels, live rooms and seasonal ladders. Geography stops being a solo pastime and becomes a standing.",
    points: ["PvP duels", "Multiplayer rooms", "Ranked seasons"],
  },
  {
    id: "creation",
    eyebrow: "Creation",
    title: "Build the universe you play in",
    description:
      "Advance members open the Creator Studio and publish quizzes and articles into the same surfaces they explore.",
    points: ["Quiz builder", "Article publishing", "Creator analytics"],
  },
  {
    id: "community",
    eyebrow: "Community",
    title: "A room full of explorers",
    description:
      "Member circles, challenge threads and creator updates. The people who care about the same 510 million square kilometres you do.",
    points: ["Member challenges", "Creator circles", "Recognition"],
  },
  {
    id: "growth",
    eyebrow: "Growth",
    title: "Compounding, not collecting",
    description:
      "Credits, streaks and levels carry forward. Membership makes the curve steeper without making it shorter.",
    points: ["Faster credits", "Streak protection", "Premium rewards"],
  },
];
