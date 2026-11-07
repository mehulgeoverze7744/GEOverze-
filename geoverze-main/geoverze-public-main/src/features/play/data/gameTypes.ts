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
  to?: "/play/search" | "/play/catalogue" | "/play/draw-guess" | "/play/imposter";
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
    // Vintage world map covered in colourful push-pins — authentic explorer's desk, real photography
    imageSrc: "/assets/play/draw-and-guess.jpg",
    imageAlt: "Vintage world map covered in colourful push-pins on an explorer's desk",
    objectPosition: "center center",
    to: "/play/draw-guess",
  },
  {
    id: "geography-imposter",
    title: "GEOsus",
    description: "Find the imposter using geography clues before they fool everyone.",
    emoji: "🕵️‍♂️",
    art: "geography-imposter",
    tags: ["Social", "Deduction"],
    // Real globe on a wooden desk, warm bokeh lighting — genuine photographic still life
    imageSrc: "/assets/play/geography-imposter-thumbnail.jpg",
    imageAlt: "Antique globe on a wooden desk with warm ambient lighting",
    objectPosition: "center 42%",
    to: "/play/imposter",
  },
  {
    id: "emoji-fun",
    title: "Emoji & Fun Quizzes",
    description: "Challenge yourself with emojis, images, shapes and fast-paced geography quizzes.",
    emoji: "🤩",
    art: "emoji-fun",
    tags: ["Fast", "Visual"],
    // Large glossy 3D emojis — playful visual quizzes, studio still life
    imageSrc: "/assets/play/emoji-and-fun-quizzes.jpg",
    imageAlt: "Large colourful 3D emojis including laughing, star-struck, sunglasses, party, thinking, heart-eyes, mind-blown, target and Earth",
    objectPosition: "center center",
    to: "/play/search",
    search: { q: undefined, category: "emoji-fun" },
  },
  {
    id: "educational",
    title: "Educational Quizzes",
    description:
      "Master countries, capitals, flags, maps, history and everything around the world.",
    emoji: "🌍",
    art: "educational-quizzes",
    tags: ["Classic", "Catalog"],
    // Open atlas with handwritten notes and a full bookshelf behind — real educational photography
    imageSrc: "/assets/play/educational-quizzes.jpg",
    imageAlt: "Open atlas and handwritten notebook on a desk with a bookshelf in the background",
    objectPosition: "center 55%",
    to: "/play/catalogue",
  },
];
