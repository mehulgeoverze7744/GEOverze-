/** Frontend-only quiz cover photography for Let's Play cards. Keyed by quiz id — not slug or DB art key. */
export type QuizThumbnail = {
  src: string;
  alt: string;
  /**
   * Artwork already includes the quiz title — hide duplicate card headings.
   * Photographic covers leave this unset so titles remain visible.
   */
  labelArtwork?: true;
  /** CSS object-position for landscape card crops. */
  objectPosition?: string;
};

const QUIZ_COVER_BASE = "/assets/quizzes";

export const QUIZ_THUMBNAILS: Readonly<Record<string, QuizThumbnail>> = {
  "q-pin-the-place": {
    src: `${QUIZ_COVER_BASE}/pin-the-place-quiz.jpg`,
    alt: "World map with a magnifying glass over Europe for the Pin the Place quiz",
    objectPosition: "center 42%",
  },
  "q-capital-cities": {
    src: `${QUIZ_COVER_BASE}/capital-confusion-quiz.jpg`,
    alt: "European landmarks along a river for the Capital Confusion quiz",
    objectPosition: "center 38%",
  },
  "q-monuments": {
    src: `${QUIZ_COVER_BASE}/monuments-and-marvels-quiz.jpg`,
    alt: "Taj Mahal, pyramids, and Colosseum for the Monuments and Marvels quiz",
    objectPosition: "center 40%",
  },
  "q-atlas-sprint": {
    src: `${QUIZ_COVER_BASE}/atlas-sprint-quiz.jpg`,
    alt: "Open world atlas with a marked route for the Atlas Sprint quiz",
    objectPosition: "center 48%",
  },
  "q-flag-blitz": {
    src: `${QUIZ_COVER_BASE}/flag-blitz-quiz.jpg`,
    alt: "Globe marked with national flags for the Flag Blitz quiz",
    objectPosition: "center 46%",
  },
};

export function quizThumbnailForId(quizId: string): QuizThumbnail | undefined {
  return QUIZ_THUMBNAILS[quizId];
}
