import type { ArticleBlock } from "@/features/library/data/articles";
export { estimateReadingMinutes } from "@/features/library/lib/article-content-utils";

import { BLOCKS as twoCapitals } from "./why-some-countries-have-two-capitals";
import { BLOCKS as himalayas } from "./how-the-himalayas-keep-growing";
import { BLOCKS as sahel } from "./the-sahel-explained";
import { BLOCKS as straightBorders } from "./the-straightest-borders-on-earth";
import { BLOCKS as readingFlag } from "./reading-a-flag-in-thirty-seconds";
import { BLOCKS as nileAmazon } from "./the-nile-and-the-amazon";
import { BLOCKS as unesco } from "./how-unesco-picks-a-world-heritage-site";
import { BLOCKS as fiveOceans } from "./why-there-are-five-oceans-now";
import { BLOCKS as languages } from "./languages-that-cross-the-most-borders";
import { BLOCKS as currency } from "./what-a-currency-tells-you-about-a-country";
import { BLOCKS as landmarks } from "./the-landmarks-everyone-misplaces";
import { BLOCKS as topoMap } from "./how-to-read-a-topographic-map";
import { BLOCKS as megacities } from "./megacities-and-the-limits-of-growth";

export const EXPANDED_ARTICLE_BLOCKS: Record<string, readonly ArticleBlock[]> = {
  "why-some-countries-have-two-capitals": twoCapitals,
  "how-the-himalayas-keep-growing": himalayas,
  "the-sahel-explained": sahel,
  "the-straightest-borders-on-earth": straightBorders,
  "reading-a-flag-in-thirty-seconds": readingFlag,
  "the-nile-and-the-amazon": nileAmazon,
  "how-unesco-picks-a-world-heritage-site": unesco,
  "why-there-are-five-oceans-now": fiveOceans,
  "languages-that-cross-the-most-borders": languages,
  "what-a-currency-tells-you-about-a-country": currency,
  "the-landmarks-everyone-misplaces": landmarks,
  "how-to-read-a-topographic-map": topoMap,
  "megacities-and-the-limits-of-growth": megacities,
};

export function expandedBlocksForSlug(slug: string): readonly ArticleBlock[] | undefined {
  return EXPANDED_ARTICLE_BLOCKS[slug];
}
