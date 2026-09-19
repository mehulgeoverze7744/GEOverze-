import { EUROPE_MICROSTATES_ANALYSIS } from "./europes-smallest-states/analysis";
import { EUROPE_MICROSTATES_COUNTRIES } from "./europes-smallest-states/countries";
import { EUROPE_MICROSTATES_INTRO } from "./europes-smallest-states/intro";
import type { ArticleBlock } from "./articles";

/** Full editorial blocks for the atlas-parchment microstates article. */
export const EUROPES_SMALLEST_STATES_BLOCKS: readonly ArticleBlock[] = [
  ...EUROPE_MICROSTATES_INTRO,
  ...EUROPE_MICROSTATES_COUNTRIES,
  ...EUROPE_MICROSTATES_ANALYSIS,
];
