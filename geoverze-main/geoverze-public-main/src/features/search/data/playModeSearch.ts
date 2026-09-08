import type { LinkProps } from "@tanstack/react-router";

import { GAME_MODES } from "@/features/play/data/gameModes";
import { modeNavTarget } from "@/features/play/lib/modeNavigation";

import type { SearchHit } from "./index";

export type PlayModeSearchRecord = {
  id: string;
  title: string;
  meta: string;
  keywords: readonly string[];
  to: NonNullable<LinkProps["to"]>;
  search?: LinkProps["search"];
  comingSoon?: boolean;
};

const PLAY_FORMAT_ALIASES: readonly PlayModeSearchRecord[] = [
  {
    id: "play-emoji-quiz",
    title: "Emoji Quiz",
    meta: "Play · Flags",
    keywords: ["emoji", "flag", "flags", "glyph", "quiz"],
    to: "/play/search",
    search: { category: "flags" },
  },
  {
    id: "play-country-shape",
    title: "Country Shape Quiz",
    meta: "Play · Countries",
    keywords: ["shape", "outline", "silhouette", "country", "border"],
    to: "/play/search",
    search: { category: "countries" },
  },
  {
    id: "play-guess-country",
    title: "Guess the Country",
    meta: "Play · Countries",
    keywords: ["guess", "country", "countries", "identify", "nation"],
    to: "/play/search",
    search: { category: "countries" },
  },
];

function fromGameMode(mode: (typeof GAME_MODES)[number]): PlayModeSearchRecord {
  const nav = modeNavTarget(mode);
  return {
    id: `play-mode-${mode.id}`,
    title: mode.title,
    meta: mode.comingSoon ? "Play · Coming soon" : "Play · Game mode",
    keywords: [
      mode.id,
      mode.title.toLowerCase(),
      ...mode.description
        .toLowerCase()
        .split(/\W+/)
        .filter((w) => w.length > 3),
    ],
    to: nav?.to ?? "/play/modes",
    search: nav?.search,
    comingSoon: mode.comingSoon,
  };
}

export const PLAY_MODE_SEARCH_INDEX: readonly PlayModeSearchRecord[] = [
  ...GAME_MODES.map(fromGameMode),
  ...PLAY_FORMAT_ALIASES,
];

function scoreRecord(
  q: string,
  record: Pick<PlayModeSearchRecord, "title" | "meta" | "keywords">,
): number {
  const title = record.title.toLowerCase();
  const meta = record.meta.toLowerCase();
  let score = 0;

  if (title === q) score = 120;
  else if (title.startsWith(q)) score = 100;
  else if (title.includes(q)) score = 75;
  else if (record.keywords.some((k) => k === q)) score = 65;
  else if (record.keywords.some((k) => k.startsWith(q) || q.startsWith(k))) score = 55;
  else if (record.keywords.some((k) => k.includes(q) || q.includes(k))) score = 45;
  else if (meta.includes(q)) score = 25;

  return score;
}

/** Client-side play mode search — partial, case-insensitive. */
export function searchPlayModes(query: string, limit = 12): SearchHit[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];

  const hits: SearchHit[] = [];
  for (const record of PLAY_MODE_SEARCH_INDEX) {
    const score = scoreRecord(q, record);
    if (score > 0) {
      hits.push({
        id: record.id,
        group: "playModes",
        title: record.title,
        meta: record.meta,
        keywords: [...record.keywords],
        to: record.to,
        search: record.search,
        comingSoon: record.comingSoon,
        score,
      });
    }
  }

  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title)).slice(0, limit);
}
