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
  imageSrc?: string;
  imageAlt?: string;
  objectPosition?: string;
  to?: "/play/search" | "/play/draw-guess" | "/play/imposter";
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
    imageSrc: "/assets/play/draw-and-guess.jpg",
    imageAlt: "Sketchbook world map with flags and landmarks for Draw & Guess",
    to: "/play/draw-guess",
  },
  {
    id: "geography-imposter",
    title: "GEOsus",
    description: "Find the imposter using geography clues before they fool everyone.",
    emoji: "🕵️‍♂️",
    art: "geography-imposter",
    tags: ["Social", "Deduction"],
    imageSrc: "/assets/play/geography-imposter-thumbnail.jpg",
    imageAlt: "Vintage globe, ivory mask, compass, and maps for GEOsus",
    objectPosition: "center 46%",
    to: "/play/imposter",
  },
  {
    id: "emoji-fun",
    title: "Emoji & Fun Quizzes",
    description: "Challenge yourself with emojis, images, shapes and fast-paced geography quizzes.",
    emoji: "🤩",
    art: "emoji-fun",
    tags: ["Fast", "Visual"],
    imageSrc: "/assets/play/emoji-and-fun-quizzes.jpg",
    imageAlt: "Globe surrounded by emoji and geography stickers for Emoji & Fun Quizzes",
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
    imageSrc: "/assets/play/educational-quizzes.jpg",
    imageAlt: "Desk globe, atlas, and compass for Educational Quizzes",
    objectPosition: "center 42%",
    to: "/play/search",
    search: { q: undefined, category: undefined },
  },
];
