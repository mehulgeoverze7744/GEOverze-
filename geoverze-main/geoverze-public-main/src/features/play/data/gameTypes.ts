export type GameTypeSearch = {
  q: string | undefined;
  category: string | undefined;
};

export type GameType = {
  id: string;
  title: string;
  description: string;
  emoji: string;
  art: string;
  tags: readonly string[];
  to?: "/play/search";
  search?: GameTypeSearch;
};

/** Play-hub game types — distinct from Solo/PvP/Multiplayer mode cards. */
export const GAME_TYPES: readonly GameType[] = [
  {
    id: "draw-guess",
    title: "Draw & Guess",
    description: "Draw countries, landmarks, flags and geography clues while others guess.",
    emoji: "🎨",
    art: "draw-guess",
    tags: ["Party", "Live"],
  },
  {
    id: "geography-imposter",
    title: "Geography Imposter",
    description: "Find the imposter using geography clues before they fool everyone.",
    emoji: "🕵️‍♂️",
    art: "geography-imposter",
    tags: ["Social", "Deduction"],
  },
  {
    id: "emoji-fun",
    title: "Emoji & Fun Quizzes",
    description: "Challenge yourself with emojis, images, shapes and fast-paced geography quizzes.",
    emoji: "🤩",
    art: "emoji-fun",
    tags: ["Fast", "Visual"],
    to: "/play/search",
    search: { q: undefined, category: "flags" },
  },
  {
    id: "educational",
    title: "Educational Quizzes",
    description:
      "Master countries, capitals, flags, maps, history and everything around the world.",
    emoji: "🌍",
    art: "educational-quizzes",
    tags: ["Classic", "Catalog"],
    to: "/play/search",
    search: { q: undefined, category: undefined },
  },
];
