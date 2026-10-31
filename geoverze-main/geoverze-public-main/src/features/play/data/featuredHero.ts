import type { Difficulty } from "./categories";
import { GAME_TYPES, type GameType, type GameTypeSearch } from "./gameTypes";
import { FEATURED_QUIZ_IDS, type Quiz } from "./quizzes";
import { quizThumbnailForId } from "./quizThumbnails";

export type FeaturedHeroAction =
  | { kind: "quiz"; quizId: string }
  | {
      kind: "route";
      to: NonNullable<GameType["to"]>;
      search?: GameTypeSearch;
    };

export type FeaturedHeroSlide = {
  id: string;
  title: string;
  art: string;
  imageSrc: string;
  imageAlt: string;
  objectPosition?: string;
  action: FeaturedHeroAction;
  creator?: string;
  difficulty?: Difficulty;
  questions?: number;
  minutes?: number;
  players?: number;
  rating?: number;
};

function requireGameType(id: string): GameType {
  const type = GAME_TYPES.find((entry) => entry.id === id);
  if (!type?.imageSrc || !type.to) {
    throw new Error(`Missing play-hub artwork or route for game type ${id}`);
  }
  return type;
}

function catalogHeroSlide(
  quizId: string,
  fallbackTitle: string,
  catalog: readonly Quiz[],
): FeaturedHeroSlide {
  const thumbnail = quizThumbnailForId(quizId);
  if (!thumbnail) {
    throw new Error(`Missing quiz thumbnail for ${quizId}`);
  }
  const quiz = catalog.find((entry) => entry.id === quizId);
  return {
    id: quizId,
    title: quiz?.title ?? fallbackTitle,
    art: quiz?.art ?? quizId,
    imageSrc: thumbnail.src,
    imageAlt: thumbnail.alt,
    ...(thumbnail.objectPosition ? { objectPosition: thumbnail.objectPosition } : {}),
    action: { kind: "quiz", quizId },
    ...(quiz
      ? {
          creator: quiz.creator,
          difficulty: quiz.difficulty,
          questions: quiz.questions,
          minutes: quiz.minutes,
          players: quiz.players,
          rating: quiz.rating,
        }
      : {}),
  };
}

function gameTypeHeroSlide(typeId: string, title: string): FeaturedHeroSlide {
  const type = requireGameType(typeId);
  return {
    id: typeId,
    title,
    art: type.art,
    imageSrc: type.imageSrc as string,
    imageAlt: type.imageAlt ?? title,
    ...(type.objectPosition ? { objectPosition: type.objectPosition } : {}),
    action: {
      kind: "route",
      to: type.to as NonNullable<GameType["to"]>,
      ...(type.search ? { search: type.search } : {}),
    },
  };
}

/** Let's Play hero — fixed five covers, independent of discovery rails. */
export function buildFeaturedHeroSlides(catalog: readonly Quiz[]): FeaturedHeroSlide[] {
  return [
    catalogHeroSlide("q-flag-blitz", "Flag Blitz", catalog),
    catalogHeroSlide("q-pin-the-place", "Pin the Place", catalog),
    gameTypeHeroSlide("draw-guess", "Draw and Guess"),
    gameTypeHeroSlide("geography-imposter", "GEOsus"),
    gameTypeHeroSlide("emoji-fun", "Fun Emoji Quiz"),
  ];
}

const POPULAR_FALLBACK_TITLES: Record<string, string> = {
  "q-flag-blitz": "Flag Blitz",
  "q-atlas-sprint": "Atlas Sprint",
  "q-grand-tour": "Grand Tour",
  "q-pin-the-place": "Pin the Place",
  "q-extremes": "Extremes",
  "q-monuments": "Monuments",
  "q-deep-blue": "Deep Blue",
};

/** Popular banner set — existing catalog games ranked by popularity. */
export function buildPopularHeroSlides(catalog: readonly Quiz[]): FeaturedHeroSlide[] {
  const ranked = [...catalog]
    .filter((quiz) => quizThumbnailForId(quiz.id))
    .sort((a, b) => b.popularity - a.popularity || b.players - a.players)
    .slice(0, 5)
    .map((quiz) => catalogHeroSlide(quiz.id, quiz.title, catalog));

  if (ranked.length > 0) return ranked;

  return FEATURED_QUIZ_IDS.flatMap((id) => {
    if (!quizThumbnailForId(id)) return [];
    return [catalogHeroSlide(id, POPULAR_FALLBACK_TITLES[id] ?? id, catalog)];
  }).slice(0, 5);
}
