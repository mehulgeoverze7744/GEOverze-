import { GAME_TYPES } from "./gameTypes";
import { quizThumbnailForId, type QuizThumbnail } from "./quizThumbnails";

export type SessionThumbnail = QuizThumbnail;

/** Cover props shared by Let's Play cards and session screens. */
export function coverFromThumbnail(thumbnail: SessionThumbnail | undefined) {
  if (!thumbnail) return {};
  return {
    imageSrc: thumbnail.src,
    imageAlt: thumbnail.alt,
    fit: "cover" as const,
    overlay: "subtle" as const,
    ...(thumbnail.objectPosition ? { objectPosition: thumbnail.objectPosition } : {}),
  };
}

export function thumbnailForGameType(id: string): SessionThumbnail | undefined {
  const type = GAME_TYPES.find((entry) => entry.id === id);
  if (!type?.imageSrc) return undefined;
  return {
    src: type.imageSrc,
    alt: type.imageAlt ?? type.title,
    ...(type.objectPosition ? { objectPosition: type.objectPosition } : {}),
  };
}

/**
 * Quiz session art: prefer the individual quiz card thumbnail, then the
 * Educational Quizzes category image.
 */
export function thumbnailForQuizSession(quizId: string | undefined): SessionThumbnail | undefined {
  if (quizId) {
    const specific = quizThumbnailForId(quizId);
    if (specific) return specific;
  }
  return thumbnailForGameType("educational");
}
