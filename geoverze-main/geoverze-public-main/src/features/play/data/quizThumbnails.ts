/** Frontend-only quiz label artwork for Let's Play cards. Keyed by quiz id — not slug or DB art key. */
export type QuizThumbnail = {
  src: string;
  alt: string;
  /** Artwork already includes the quiz title — hide duplicate card headings. */
  labelArtwork: true;
};

const QUIZ_LABEL_BASE = "/assets/quizzes";

export const QUIZ_THUMBNAILS: Readonly<Record<string, QuizThumbnail>> = {
  "q-pin-the-place": {
    src: `${QUIZ_LABEL_BASE}/pin-the-place-quiz-label.jpg`,
    alt: "Pin the Place geography quiz artwork",
    labelArtwork: true,
  },
  "q-capital-cities": {
    src: `${QUIZ_LABEL_BASE}/capital-confusion-quiz-label.png`,
    alt: "GEOverze Capital Confusion quiz",
    labelArtwork: true,
  },
  "q-monuments": {
    src: `${QUIZ_LABEL_BASE}/monuments-and-marvels-quiz-label.jpg`,
    alt: "Monuments and Marvels geography quiz artwork",
    labelArtwork: true,
  },
  "q-atlas-sprint": {
    src: `${QUIZ_LABEL_BASE}/atlas-sprint-quiz-label.jpg`,
    alt: "Atlas Sprint geography quiz artwork",
    labelArtwork: true,
  },
  "q-flag-blitz": {
    src: `${QUIZ_LABEL_BASE}/flag-blitz-quiz-label.jpg`,
    alt: "Flag Blitz geography quiz artwork",
    labelArtwork: true,
  },
};

export function quizThumbnailForId(quizId: string): QuizThumbnail | undefined {
  return QUIZ_THUMBNAILS[quizId];
}
