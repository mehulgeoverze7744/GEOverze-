import { LIBRARY_QUIZ_THUMBNAILS } from "./libraryQuizThumbnails.generated";

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

const EXISTING_QUIZ_THUMBNAILS: Readonly<Record<string, QuizThumbnail>> = {
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
  "q-passport-to-the-planet": {
    src: `${QUIZ_COVER_BASE}/passport-to-the-planet-quiz.jpg`,
    alt: "Passport and globe still life for the Passport to the Planet quiz",
    objectPosition: "center 45%",
  },
  "q-flag-frenzy": {
    src: `${QUIZ_COVER_BASE}/flag-frenzy-quiz.jpg`,
    alt: "National flags arranged for the Flag Frenzy quiz",
    objectPosition: "center 46%",
  },
  "q-country-shape-safari": {
    src: `${QUIZ_COVER_BASE}/country-shape-safari-quiz.jpg`,
    alt: "Country outlines on a map for the Country Shape Safari quiz",
    objectPosition: "center 44%",
  },
  "q-capitals-made-easy": {
    src: `${QUIZ_COVER_BASE}/capitals-made-easy-quiz.jpg`,
    alt: "Capital-city landmarks for the Capitals Made Easy quiz",
    objectPosition: "center 42%",
  },
  "q-around-the-world-in-10": {
    src: `${QUIZ_COVER_BASE}/around-the-world-in-10-quiz.jpg`,
    alt: "World tour collage for the Around the World in 10 quiz",
    objectPosition: "center 45%",
  },
  "q-island-hopping": {
    src: `${QUIZ_COVER_BASE}/island-hopping-quiz.jpg`,
    alt: "Tropical islands and sea charts for the Island Hopping quiz",
    objectPosition: "center 48%",
  },
  "q-border-detectives": {
    src: `${QUIZ_COVER_BASE}/border-detectives-quiz.jpg`,
    alt: "Mapped international borders for the Border Detectives quiz",
    objectPosition: "center 44%",
  },
  "q-guess-the-country": {
    src: `${QUIZ_COVER_BASE}/guess-the-country-quiz.jpg`,
    alt: "Mystery country clues on a desk for the Guess the Country quiz",
    objectPosition: "center 46%",
  },
  "q-national-wonders": {
    src: `${QUIZ_COVER_BASE}/national-wonders-quiz.jpg`,
    alt: "Natural landmarks for the National Wonders quiz",
    objectPosition: "center 40%",
  },
  "q-seven-continents-challenge": {
    src: `${QUIZ_COVER_BASE}/seven-continents-challenge-quiz.jpg`,
    alt: "Seven continents on a globe for the Seven Continents Challenge quiz",
    objectPosition: "center 48%",
  },
  "q-country-or-not": {
    src: `${QUIZ_COVER_BASE}/country-or-not-quiz.jpg`,
    alt: "Political map puzzle for the Country or Not quiz",
    objectPosition: "center 45%",
  },
  "q-rivers-lakes-nations": {
    src: `${QUIZ_COVER_BASE}/rivers-lakes-nations-quiz.jpg`,
    alt: "Rivers and lakes on a physical map for the Rivers, Lakes and Nations quiz",
    objectPosition: "center 50%",
  },
  "q-world-neighbourhood": {
    src: `${QUIZ_COVER_BASE}/world-neighbourhood-quiz.jpg`,
    alt: "Neighbouring countries on a regional map for the World Neighbourhood quiz",
    objectPosition: "center 44%",
  },
  "q-famous-places-famous-countries": {
    src: `${QUIZ_COVER_BASE}/famous-places-famous-countries-quiz.jpg`,
    alt: "Famous landmarks for the Famous Places, Famous Countries quiz",
    objectPosition: "center 40%",
  },
  "q-world-geography-warmup": {
    src: `${QUIZ_COVER_BASE}/world-geography-warmup-quiz.jpg`,
    alt: "Beginner atlas desk for the World Geography Warm-Up quiz",
    objectPosition: "center 46%",
  },
  "q-borderline-genius": {
    src: `${QUIZ_COVER_BASE}/borderline-genius-quiz.jpg`,
    alt: "Complex border lines for the Borderline Genius quiz",
    objectPosition: "center 44%",
  },
  "q-countries-capital-confusion": {
    src: `${QUIZ_COVER_BASE}/countries-capital-confusion-quiz.jpg`,
    alt: "Capital-city skyline clues for the Capital Confusion quiz",
    objectPosition: "center 38%",
  },
  "q-flags-beyond-the-obvious": {
    src: `${QUIZ_COVER_BASE}/flags-beyond-the-obvious-quiz.jpg`,
    alt: "Similar national flags for the Flags Beyond the Obvious quiz",
    objectPosition: "center 46%",
  },
  "q-global-explorers-trial": {
    src: `${QUIZ_COVER_BASE}/global-explorers-trial-quiz.jpg`,
    alt: "Explorer's atlas for the Global Explorer's Trial quiz",
    objectPosition: "center 45%",
  },
  "q-cartographers-gauntlet": {
    src: `${QUIZ_COVER_BASE}/cartographers-gauntlet-quiz.jpg`,
    alt: "Detailed cartography tools for the Cartographer's Gauntlet quiz",
    objectPosition: "center 44%",
  },
  "q-enclave-enigma": {
    src: `${QUIZ_COVER_BASE}/enclave-enigma-quiz.jpg`,
    alt: "Enclave map detail for the Enclave Enigma quiz",
    objectPosition: "center 46%",
  },
  "q-microstate-mastermind": {
    src: `${QUIZ_COVER_BASE}/microstate-mastermind-quiz.jpg`,
    alt: "Tiny European states on a map for the Microstate Mastermind quiz",
    objectPosition: "center 42%",
  },
  "q-latitude-longitude-elite": {
    src: `${QUIZ_COVER_BASE}/latitude-longitude-elite-quiz.jpg`,
    alt: "Latitude and longitude grid for the Latitude and Longitude Elite quiz",
    objectPosition: "center 48%",
  },
  "q-the-final-atlas": {
    src: `${QUIZ_COVER_BASE}/the-final-atlas-quiz.jpg`,
    alt: "Open final atlas for The Final Atlas quiz",
    objectPosition: "center 46%",
  },
};

export const QUIZ_THUMBNAILS: Readonly<Record<string, QuizThumbnail>> = {
  ...EXISTING_QUIZ_THUMBNAILS,
  ...LIBRARY_QUIZ_THUMBNAILS,
};

export function quizThumbnailForId(quizId: string): QuizThumbnail | undefined {
  return QUIZ_THUMBNAILS[quizId];
}
