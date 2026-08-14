/**
 * Featured quiz creators surfaced on the play hub.
 *
 * Handles match the GEOlibrary creator profiles so the rail can deep-link
 * straight into an existing profile page.
 */

export type FeaturedCreator = {
  handle: string;
  name: string;
  focus: string;
  art: string;
  quizzes: number;
  followers: number;
};

export const FEATURED_CREATORS: readonly FeaturedCreator[] = [
  {
    handle: "atlas-studio",
    name: "Atlas Studio",
    focus: "Borders & sovereignty",
    art: "countries",
    quizzes: 34,
    followers: 128_400,
  },
  {
    handle: "meridian",
    name: "Meridian",
    focus: "Map-reading drills",
    art: "maps",
    quizzes: 21,
    followers: 96_200,
  },
  {
    handle: "delta-notes",
    name: "Delta Notes",
    focus: "Rivers & landforms",
    art: "physical",
    quizzes: 18,
    followers: 74_800,
  },
  {
    handle: "terra-lingua",
    name: "Terra Lingua",
    focus: "Languages & culture",
    art: "culture",
    quizzes: 15,
    followers: 61_500,
  },
  {
    handle: "heritage-desk",
    name: "Heritage Desk",
    focus: "Monuments & history",
    art: "landmarks",
    quizzes: 12,
    followers: 48_900,
  },
];
