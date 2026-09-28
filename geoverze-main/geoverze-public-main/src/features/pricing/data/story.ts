export type UpgradeBeat = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  points: string[];
};

export const upgradeStory: UpgradeBeat[] = [
  {
    id: "community",
    eyebrow: "Community",
    title: "Daniel Okoye",
    description:
      "“Multiplayer quizzes are what keep me coming back to GEOverze. Competing with real players makes every round more exciting, and now I’ve even redeemed my credits for a mug that I use every day. It’s a great reminder of the games I’ve played.”",
    points: ["Pro", "Multiplayer player", "Mug reward"],
  },
  {
    id: "explorer",
    eyebrow: "Explorer",
    title: "Yusuf Rahman",
    description:
      "“I went from guessing at capitals to reading coastlines. The mastery map showed me exactly which continent I was avoiding.”",
    points: ["Pro", "Level 24", "96 day streak"],
  },
  {
    id: "competition",
    eyebrow: "Competition",
    title: "Mira Halvorsen",
    description:
      "“The duels are the part I did not expect to love. Two minutes, real opponents, and geography suddenly has stakes.”",
    points: ["Pro", "Top 2% global standing"],
  },
  {
    id: "rewards",
    eyebrow: "Rewards",
    title: "Aarav Mehta",
    description:
      "“I started with the Basic plan just to play more quizzes, and eventually redeemed my credits for the sticker collection. The designs are genuinely fun, and getting a physical reward from simply playing made the experience even better.”",
    points: ["Basic", "18 quizzes played", "Sticker reward"],
  },
  {
    id: "geostore",
    eyebrow: "GEOstore",
    title: "Riya Kapoor",
    description:
      "“The T-shirt itself looks great, but the packaging surprised me even more. The acrylic sheet box felt premium enough to keep as a photo frame instead of throwing it away. It felt like opening a proper collector’s piece.”",
    points: ["GEOstore", "T-shirt buyer", "Premium packaging"],
  },
];
