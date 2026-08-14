/** Placeholder article catalogue for the Content Studio. */
import type { ArticleBlock, StudioArticle, StudioQuestionType } from "./types";

const COASTLINE_BLOCKS: ArticleBlock[] = [
  {
    id: "b1",
    kind: "paragraph",
    text: "A coastline has no single length. Measure Norway's shore with a 50 km ruler and you get 2,500 km; measure it with a 50 m ruler and the number passes 100,000 km. The coast is not getting longer — the ruler is getting honest.",
  },
  { id: "b2", kind: "heading", level: 2, text: "The coastline paradox" },
  {
    id: "b3",
    kind: "paragraph",
    text: "Lewis Fry Richardson noticed the problem while studying the length of national borders. Every time he shortened his measuring unit, the total grew. Benoit Mandelbrot later named the property fractal self-similarity.",
  },
  {
    id: "b4",
    kind: "fact",
    title: "Why atlases disagree",
    text: "National agencies pick different measurement scales, so published coastline lengths for the same country can differ by an order of magnitude.",
  },
  {
    id: "b5",
    kind: "list",
    ordered: false,
    items: [
      "Fjord coasts amplify the effect most strongly.",
      "Sandy barrier coasts are comparatively stable across scales.",
      "Satellite resolution now sets the practical floor.",
    ],
  },
  {
    id: "b6",
    kind: "table",
    columns: ["Country", "Coarse estimate", "Fine estimate"],
    rows: [
      ["Norway", "2,500 km", "100,915 km"],
      ["Canada", "58,000 km", "202,080 km"],
      ["Chile", "6,400 km", "78,563 km"],
    ],
  },
  {
    id: "b7",
    kind: "image",
    imageKey: "asset-fjord-01",
    caption: "Sognefjord's branching inlets — the reason Norway's number explodes.",
  },
  {
    id: "b8",
    kind: "didyouknow",
    text: "The United Kingdom's official coastline length has been revised upward four times since 1950, purely because of better surveying.",
  },
  {
    id: "b9",
    kind: "reference",
    label: "Richardson, L. F. (1961)",
    source: "The problem of contiguity: an appendix to Statistics of Deadly Quarrels",
  },
];

const MONSOON_BLOCKS: ArticleBlock[] = [
  {
    id: "m1",
    kind: "paragraph",
    text: "The South Asian monsoon is a seasonal reversal of wind driven by the different heat capacities of land and ocean. It is the most reliable large-scale weather event on the planet, and roughly two billion people plan their year around it.",
  },
  { id: "m2", kind: "heading", level: 2, text: "How the reversal works" },
  {
    id: "m3",
    kind: "list",
    ordered: true,
    items: [
      "Spring sun heats the Indian subcontinent faster than the Indian Ocean.",
      "Rising air over land creates a low-pressure trough.",
      "Moist ocean air flows inland to fill it, arriving as rain.",
    ],
  },
  {
    id: "m4",
    kind: "fact",
    title: "Onset date",
    text: "The monsoon typically reaches Kerala around 1 June and Delhi by the end of the month.",
  },
];

export const STUDIO_ARTICLES: StudioArticle[] = [
  {
    id: "how-long-is-a-coastline",
    title: "How Long Is a Coastline?",
    summary:
      "Why Norway's shore can measure 2,500 km or 100,000 km depending entirely on your ruler.",
    categoryId: "physical",
    tags: ["fractals", "measurement", "coasts"],
    coverKey: "article-coastline",
    status: "published",
    updatedAt: "2026-07-30T10:12:00Z",
    readMinutes: 7,
    views: 48_210,
    bookmarks: 3_140,
    blocks: COASTLINE_BLOCKS,
  },
  {
    id: "monsoon-machine",
    title: "The Monsoon Machine",
    summary:
      "A seasonal wind reversal that feeds two billion people, explained from first principles.",
    categoryId: "climate",
    tags: ["climate", "asia", "rainfall"],
    coverKey: "article-monsoon",
    status: "published",
    updatedAt: "2026-07-22T15:00:00Z",
    readMinutes: 9,
    views: 31_875,
    bookmarks: 2_265,
    blocks: MONSOON_BLOCKS,
  },
  {
    id: "seven-strangest-borders",
    title: "The Seven Strangest Borders on Earth",
    summary:
      "Enclaves inside enclaves, a border through a hotel, and a village split by a library.",
    categoryId: "borders",
    tags: ["borders", "enclaves", "history"],
    coverKey: "article-borders",
    status: "in-review",
    updatedAt: "2026-08-05T08:45:00Z",
    readMinutes: 11,
    views: 0,
    bookmarks: 0,
    blocks: [
      {
        id: "s1",
        kind: "paragraph",
        text: "Baarle-Hertog is a Belgian municipality that exists as 22 separate parcels inside the Netherlands, some of which contain Dutch parcels of their own.",
      },
    ],
  },
  {
    id: "reading-a-topographic-map",
    title: "Reading a Topographic Map",
    summary: "Contours, hachures and saddle points — a working guide for the field.",
    categoryId: "physical",
    tags: ["maps", "fieldwork"],
    coverKey: "article-topo",
    status: "draft",
    updatedAt: "2026-08-06T06:30:00Z",
    readMinutes: 6,
    views: 0,
    bookmarks: 0,
    blocks: [],
  },
  {
    id: "cities-below-sea-level",
    title: "Cities Below Sea Level",
    summary: "Nine metropolitan areas that exist only because of engineering.",
    categoryId: "culture",
    tags: ["cities", "engineering"],
    coverKey: "article-belowsea",
    status: "scheduled",
    updatedAt: "2026-08-03T12:00:00Z",
    readMinutes: 8,
    views: 0,
    bookmarks: 0,
    blocks: [],
  },
  {
    id: "salt-roads",
    title: "The Salt Roads of the Sahara",
    summary: "Caravan routes that priced a commodity by the camel-load for a thousand years.",
    categoryId: "economy",
    tags: ["trade", "africa", "history"],
    coverKey: "article-salt",
    status: "archived",
    updatedAt: "2026-04-18T09:00:00Z",
    readMinutes: 12,
    views: 12_400,
    bookmarks: 810,
    blocks: [],
  },
  {
    id: "why-maps-lie",
    title: "Why Every Map Lies",
    summary: "Projection is a choice, and every choice distorts something.",
    categoryId: "physical",
    tags: ["projections", "cartography"],
    coverKey: "article-projections",
    status: "rejected",
    updatedAt: "2026-06-27T14:20:00Z",
    readMinutes: 10,
    views: 0,
    bookmarks: 0,
    blocks: [],
  },
];

export function findArticle(id: string): StudioArticle | undefined {
  return STUDIO_ARTICLES.find((a) => a.id === id);
}

export function emptyArticle(): StudioArticle {
  return {
    id: "new",
    title: "",
    summary: "",
    categoryId: "physical",
    tags: [],
    coverKey: "article-new",
    status: "draft",
    updatedAt: new Date().toISOString(),
    readMinutes: 0,
    views: 0,
    bookmarks: 0,
    blocks: [],
  };
}

let blockSeq = 0;

export function emptyBlock(kind: ArticleBlock["kind"]): ArticleBlock {
  blockSeq += 1;
  const id = `nb-${blockSeq}-${Math.random().toString(36).slice(2, 6)}`;
  switch (kind) {
    case "heading":
      return { id, kind: "heading", level: 2, text: "" };
    case "list":
      return { id, kind: "list", ordered: false, items: [""] };
    case "image":
      return { id, kind: "image", imageKey: "asset-new", caption: "" };
    case "table":
      return {
        id,
        kind: "table",
        columns: ["Column A", "Column B"],
        rows: [
          ["", ""],
          ["", ""],
        ],
      };
    case "fact":
      return { id, kind: "fact", title: "", text: "" };
    case "didyouknow":
      return { id, kind: "didyouknow", text: "" };
    case "reference":
      return { id, kind: "reference", label: "", source: "" };
    case "paragraph":
    default:
      return { id, kind: "paragraph", text: "" };
  }
}

/** Quiz types an article can be converted into later. Placeholder mapping. */
export const SUGGESTED_QUIZ_TYPES: StudioQuestionType[] = ["mcq", "text", "image"];
