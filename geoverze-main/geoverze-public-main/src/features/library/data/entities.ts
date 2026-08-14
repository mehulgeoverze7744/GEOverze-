/**
 * Reference entities for library search.
 *
 * Compact records for the non-article kinds (countries, capitals, rivers,
 * UNESCO sites and so on). They are searchable and each points at the article
 * or collection that covers it, so nothing links into a dead end.
 */
import type { ContinentId, EntityKind } from "./taxonomy";

/** Where an entity resolves to inside the library. */
export type EntityTarget = { type: "article" | "collection"; slug: string };

export type LibraryEntity = {
  id: string;
  kind: EntityKind;
  name: string;
  meta: string;
  continent: ContinentId;
  keywords: readonly string[];
  target: EntityTarget;
};

const article = (slug: string) => ({ target: { type: "article", slug } }) as const;
const collection = (slug: string) => ({ target: { type: "collection", slug } }) as const;

export const ENTITIES: readonly LibraryEntity[] = [
  // Countries
  {
    id: "e-c-fr",
    kind: "country",
    name: "France",
    meta: "Country · Europe",
    continent: "europe",
    keywords: ["france", "paris", "euro"],
    ...collection("countries-of-europe"),
  },
  {
    id: "e-c-jp",
    kind: "country",
    name: "Japan",
    meta: "Country · Asia",
    continent: "asia",
    keywords: ["japan", "tokyo", "yen"],
    ...article("megacities-and-the-limits-of-growth"),
  },
  {
    id: "e-c-br",
    kind: "country",
    name: "Brazil",
    meta: "Country · South America",
    continent: "south-america",
    keywords: ["brazil", "brasilia", "amazon"],
    ...article("the-nile-and-the-amazon"),
  },
  {
    id: "e-c-ke",
    kind: "country",
    name: "Kenya",
    meta: "Country · Africa",
    continent: "africa",
    keywords: ["kenya", "nairobi", "shilling"],
    ...article("the-sahel-explained"),
  },
  {
    id: "e-c-nz",
    kind: "country",
    name: "New Zealand",
    meta: "Country · Oceania",
    continent: "oceania",
    keywords: ["new zealand", "wellington", "aotearoa"],
    ...article("the-straightest-borders-on-earth"),
  },
  {
    id: "e-c-sm",
    kind: "country",
    name: "San Marino",
    meta: "Country · Europe · 61 km²",
    continent: "europe",
    keywords: ["san marino", "microstate"],
    ...article("europes-smallest-states"),
  },

  // Capitals
  {
    id: "e-cap-la-paz",
    kind: "capital",
    name: "La Paz",
    meta: "Seat of government · Bolivia",
    continent: "south-america",
    keywords: ["la paz", "bolivia", "capital"],
    ...article("why-some-countries-have-two-capitals"),
  },
  {
    id: "e-cap-pretoria",
    kind: "capital",
    name: "Pretoria",
    meta: "Executive capital · South Africa",
    continent: "africa",
    keywords: ["pretoria", "south africa"],
    ...article("why-some-countries-have-two-capitals"),
  },
  {
    id: "e-cap-canberra",
    kind: "capital",
    name: "Canberra",
    meta: "Capital · Australia",
    continent: "oceania",
    keywords: ["canberra", "australia"],
    ...collection("world-capitals"),
  },
  {
    id: "e-cap-delhi",
    kind: "capital",
    name: "New Delhi",
    meta: "Capital · India",
    continent: "asia",
    keywords: ["delhi", "india", "megacity"],
    ...article("megacities-and-the-limits-of-growth"),
  },

  // Flags
  {
    id: "e-f-np",
    kind: "flag",
    name: "Flag of Nepal",
    meta: "Only non-quadrilateral national flag",
    continent: "asia",
    keywords: ["nepal", "flag", "pennant"],
    ...article("reading-a-flag-in-thirty-seconds"),
  },
  {
    id: "e-f-nordic",
    kind: "flag",
    name: "Nordic cross flags",
    meta: "Flag family · 5 states",
    continent: "europe",
    keywords: ["nordic", "cross", "flag", "scandinavia"],
    ...article("reading-a-flag-in-thirty-seconds"),
  },
  {
    id: "e-f-panafrican",
    kind: "flag",
    name: "Pan-African colours",
    meta: "Flag family · green, gold, red",
    continent: "africa",
    keywords: ["pan-african", "flag", "ethiopia"],
    ...article("reading-a-flag-in-thirty-seconds"),
  },

  // Landmarks & UNESCO
  {
    id: "e-l-machu",
    kind: "landmark",
    name: "Machu Picchu",
    meta: "Landmark · Peru · 2,430 m",
    continent: "south-america",
    keywords: ["machu picchu", "inca", "peru"],
    ...article("the-landmarks-everyone-misplaces"),
  },
  {
    id: "e-l-angkor",
    kind: "landmark",
    name: "Angkor Wat",
    meta: "Landmark · Cambodia",
    continent: "asia",
    keywords: ["angkor", "cambodia", "temple"],
    ...article("the-landmarks-everyone-misplaces"),
  },
  {
    id: "e-u-stonehenge",
    kind: "unesco",
    name: "Stonehenge",
    meta: "UNESCO site · United Kingdom",
    continent: "europe",
    keywords: ["stonehenge", "unesco", "neolithic"],
    ...article("how-unesco-picks-a-world-heritage-site"),
  },
  {
    id: "e-u-dresden",
    kind: "unesco",
    name: "Dresden Elbe Valley",
    meta: "UNESCO · delisted 2009",
    continent: "europe",
    keywords: ["dresden", "delisted", "unesco"],
    ...article("how-unesco-picks-a-world-heritage-site"),
  },
  {
    id: "e-u-serengeti",
    kind: "unesco",
    name: "Serengeti",
    meta: "UNESCO natural site · Tanzania",
    continent: "africa",
    keywords: ["serengeti", "migration", "unesco"],
    ...collection("unesco-heritage"),
  },

  // Mountains
  {
    id: "e-m-everest",
    kind: "mountain",
    name: "Mount Everest",
    meta: "8,849 m · Nepal / China",
    continent: "asia",
    keywords: ["everest", "sagarmatha", "himalaya"],
    ...article("how-the-himalayas-keep-growing"),
  },
  {
    id: "e-m-chimborazo",
    kind: "mountain",
    name: "Chimborazo",
    meta: "Furthest point from Earth's centre",
    continent: "south-america",
    keywords: ["chimborazo", "ecuador", "andes"],
    ...article("the-landmarks-everyone-misplaces"),
  },
  {
    id: "e-m-alps",
    kind: "mountain",
    name: "The Alps",
    meta: "Range · 8 countries",
    continent: "europe",
    keywords: ["alps", "range", "europe"],
    ...collection("mountain-ranges"),
  },

  // Rivers, lakes, oceans
  {
    id: "e-r-nile",
    kind: "river",
    name: "Nile",
    meta: "6,650 km · 11 countries",
    continent: "africa",
    keywords: ["nile", "egypt", "river"],
    ...article("the-nile-and-the-amazon"),
  },
  {
    id: "e-r-amazon",
    kind: "river",
    name: "Amazon",
    meta: "209,000 m³/s discharge",
    continent: "south-america",
    keywords: ["amazon", "brazil", "river"],
    ...article("the-nile-and-the-amazon"),
  },
  {
    id: "e-r-danube",
    kind: "river",
    name: "Danube",
    meta: "2,850 km · 10 countries",
    continent: "europe",
    keywords: ["danube", "europe", "river"],
    ...collection("great-rivers"),
  },
  {
    id: "e-lk-baikal",
    kind: "lake",
    name: "Lake Baikal",
    meta: "Deepest lake · 1,642 m",
    continent: "asia",
    keywords: ["baikal", "lake", "siberia"],
    ...collection("great-rivers"),
  },
  {
    id: "e-lk-victoria",
    kind: "lake",
    name: "Lake Victoria",
    meta: "Largest tropical lake",
    continent: "africa",
    keywords: ["victoria", "lake", "nile"],
    ...article("the-nile-and-the-amazon"),
  },
  {
    id: "e-o-southern",
    kind: "ocean",
    name: "Southern Ocean",
    meta: "Recognised 2021 · 21.9M km²",
    continent: "antarctica",
    keywords: ["southern ocean", "antarctic", "current"],
    ...article("why-there-are-five-oceans-now"),
  },
  {
    id: "e-o-pacific",
    kind: "ocean",
    name: "Pacific Ocean",
    meta: "165.2 million km²",
    continent: "global",
    keywords: ["pacific", "ocean"],
    ...article("why-there-are-five-oceans-now"),
  },

  // Continents
  {
    id: "e-cn-africa",
    kind: "continent",
    name: "Africa",
    meta: "Continent · 54 countries",
    continent: "africa",
    keywords: ["africa", "continent"],
    ...article("the-sahel-explained"),
  },
  {
    id: "e-cn-europe",
    kind: "continent",
    name: "Europe",
    meta: "Continent · 44 countries",
    continent: "europe",
    keywords: ["europe", "continent"],
    ...collection("countries-of-europe"),
  },
  {
    id: "e-cn-antarctica",
    kind: "continent",
    name: "Antarctica",
    meta: "Continent · no permanent population",
    continent: "antarctica",
    keywords: ["antarctica", "continent", "ice"],
    ...article("why-there-are-five-oceans-now"),
  },

  // Cultures, languages, currencies
  {
    id: "e-cu-sahel",
    kind: "culture",
    name: "Sahelian pastoralism",
    meta: "Culture · Sahel belt",
    continent: "africa",
    keywords: ["pastoral", "sahel", "culture", "nomad"],
    ...article("the-sahel-explained"),
  },
  {
    id: "e-cu-png",
    kind: "culture",
    name: "Papuan language cultures",
    meta: "Culture · 840+ languages",
    continent: "oceania",
    keywords: ["papua", "culture", "diversity"],
    ...article("languages-that-cross-the-most-borders"),
  },
  {
    id: "e-lg-french",
    kind: "language",
    name: "French",
    meta: "Official in 29 countries",
    continent: "global",
    keywords: ["french", "language", "francophone"],
    ...article("languages-that-cross-the-most-borders"),
  },
  {
    id: "e-lg-arabic",
    kind: "language",
    name: "Arabic",
    meta: "Official in 25 countries",
    continent: "global",
    keywords: ["arabic", "language", "dialect"],
    ...article("languages-that-cross-the-most-borders"),
  },
  {
    id: "e-cr-euro",
    kind: "currency",
    name: "Euro",
    meta: "Currency · 20 official users",
    continent: "europe",
    keywords: ["euro", "currency", "eurozone"],
    ...article("what-a-currency-tells-you-about-a-country"),
  },
  {
    id: "e-cr-cfa",
    kind: "currency",
    name: "CFA franc",
    meta: "Currency union · 14 states",
    continent: "africa",
    keywords: ["cfa", "franc", "currency"],
    ...article("what-a-currency-tells-you-about-a-country"),
  },
] as const;
