/**
 * Curated quiz collections.
 *
 * Placeholder curation shaped like a future `collections` API response: a slug,
 * editorial copy and an ordered list of quiz ids.
 */

export type Collection = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  art: string;
  curator: string;
  minutes: number;
  quizIds: readonly string[];
};

export const COLLECTIONS: readonly Collection[] = [
  {
    slug: "grand-tour",
    title: "The Grand Tour",
    tagline: "Six sets, one lap of the planet",
    description:
      "A guided run across continents: flags, capitals, borders and landmarks in the order a cartographer would teach them.",
    art: "countries",
    curator: "GEOverze Studio",
    minutes: 42,
    quizIds: [
      "q-atlas-sprint",
      "q-capital-cities",
      "q-flag-blitz",
      "q-grand-tour",
      "q-monuments",
      "q-timeline",
    ],
  },
  {
    slug: "map-reading",
    title: "Read Any Map",
    tagline: "Train the skill, not the trivia",
    description:
      "Pin-drop rounds that build spatial memory. Start wide, finish on street-level precision.",
    art: "maps",
    curator: "Cartography Club",
    minutes: 34,
    quizIds: ["q-pin-the-place", "q-riverrun", "q-extremes", "q-summit"],
  },
  {
    slug: "wild-earth",
    title: "Wild Earth",
    tagline: "Ecosystems, oceans and protected ground",
    description:
      "Everything that lives on the map: reefs, rainforests, migration routes and the parks that guard them.",
    art: "nature",
    curator: "Terra Lingua",
    minutes: 29,
    quizIds: ["q-deep-blue", "q-wildlands", "q-protected", "q-summit"],
  },
  {
    slug: "culture-run",
    title: "Culture Run",
    tagline: "People, festivals and landmarks",
    description:
      "The human layer of geography — languages, celebrations and the monuments they left behind.",
    art: "culture",
    curator: "Heritage Desk",
    minutes: 26,
    quizIds: ["q-festival", "q-monuments", "q-timeline"],
  },
];

const BY_SLUG = new Map(COLLECTIONS.map((c) => [c.slug, c]));

export const collectionBySlug = (slug: string): Collection | undefined => BY_SLUG.get(slug);
