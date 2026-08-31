/**
 * GEOlibrary articles — canonical seed fixture / development reference.
 *
 * Production read paths use Supabase via fetchPublishedArticles.ts.
 * This module remains the GL-4 seed source of truth.
 */
import type { CategoryId, ContinentId, DifficultyId } from "./taxonomy";

export type ArticleBlock =
  | { kind: "heading"; id: string; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; items: readonly string[]; ordered?: boolean }
  | { kind: "quote"; text: string; attribution?: string }
  | { kind: "image"; art: string; caption: string; storagePath?: string }
  | { kind: "map"; region: string; caption: string }
  | { kind: "facts"; title: string; facts: readonly { label: string; value: string }[] }
  | { kind: "didYouKnow"; text: string };

export type Article = {
  slug: string;
  title: string;
  dek: string;
  category: CategoryId;
  continent: ContinentId;
  difficulty: DifficultyId;
  /** Estimated reading time in minutes. */
  minutes: number;
  publishedAt: string;
  creator: string;
  tags: readonly string[];
  views: number;
  likes: number;
  bookmarks: number;
  /** library-media cover object path */
  coverArtKey?: string | null;
  blocks: readonly ArticleBlock[];
};

const closing = (topic: string): readonly ArticleBlock[] => [
  {
    kind: "map",
    region: topic,
    caption: `Interactive ${topic.toLowerCase()} map — arriving with the GEOverze map engine.`,
  },
  {
    kind: "didYouKnow",
    text: `Every figure in this entry is cross-linked to the same dataset that powers ${topic} questions in Let's Play, so reading here directly sharpens your quiz accuracy.`,
  },
];

export const ARTICLES: readonly Article[] = [
  {
    slug: "why-some-countries-have-two-capitals",
    title: "Why some countries have two capitals",
    dek: "Bolivia, South Africa, the Netherlands — splitting a capital is more common, and more deliberate, than most maps suggest.",
    category: "capitals",
    continent: "global",
    difficulty: "beginner",
    minutes: 6,
    publishedAt: "2026-08-01",
    creator: "atlas-studio",
    tags: ["capitals", "government", "politics"],
    views: 48_210,
    likes: 3_180,
    bookmarks: 1_244,
    blocks: [
      {
        kind: "paragraph",
        text: "A capital is a job description, not a single city. Somewhere has to host the legislature, somewhere the executive, somewhere the highest court — and nothing in international law says those places must share a postcode.",
      },
      { kind: "heading", id: "the-split", text: "The three-way split" },
      {
        kind: "paragraph",
        text: "South Africa is the textbook case. Pretoria holds the executive, Cape Town the parliament and Bloemfontein the judiciary. The arrangement was a compromise at union in 1910, and it survived because moving any branch would cost a province its status.",
      },
      {
        kind: "list",
        items: [
          "Bolivia: Sucre is constitutional, La Paz is where the government sits.",
          "Netherlands: Amsterdam is the constitutional capital, The Hague the seat of government.",
          "Malaysia: Kuala Lumpur is the capital, Putrajaya the administrative centre.",
          "Tanzania: Dodoma is official, Dar es Salaam remains the commercial anchor.",
        ],
      },
      {
        kind: "facts",
        title: "At a glance",
        facts: [
          { label: "Countries with split functions", value: "12+" },
          { label: "Oldest arrangement", value: "South Africa, 1910" },
          { label: "Most recent move", value: "Indonesia, Nusantara" },
          { label: "Quiz appearances", value: "High" },
        ],
      },
      { kind: "heading", id: "why-it-happens", text: "Why it happens" },
      {
        kind: "paragraph",
        text: "Three forces recur: federation compromises, decongestion of an overgrown primate city, and symbolic relocation toward a geographic centre. Brazil built Brasília for the third reason and got the second as a bonus.",
      },
      {
        kind: "quote",
        text: "A capital city is the argument a country is having with itself, written in concrete.",
        attribution: "Atlas Studio field notes",
      },
      ...closing("Capitals"),
    ],
  },
  {
    slug: "how-the-himalayas-keep-growing",
    title: "How the Himalayas keep growing",
    dek: "India is still driving north at roughly the speed your fingernails grow, and the roof of the world is the receipt.",
    category: "physical",
    continent: "asia",
    difficulty: "intermediate",
    minutes: 9,
    publishedAt: "2026-07-28",
    creator: "meridian",
    tags: ["himalaya", "mountains", "tectonics", "everest"],
    views: 61_930,
    likes: 5_120,
    bookmarks: 2_408,
    blocks: [
      {
        kind: "paragraph",
        text: "Fifty million years ago the Indian plate was an island heading north across the Tethys Ocean. It hit Eurasia, and because both plates were continental crust, neither could sink. Everything went up instead.",
      },
      { kind: "heading", id: "collision", text: "A collision with nowhere to go" },
      {
        kind: "paragraph",
        text: "Convergence continues at about 45 mm a year. Roughly a third of that is absorbed by the range itself, which is why the Himalayas gain a few millimetres of height annually — while erosion quietly claws some of it back.",
      },
      {
        kind: "image",
        art: "article-himalaya-uplift",
        caption: "Uplift and erosion in balance across the main range.",
      },
      {
        kind: "facts",
        title: "The numbers",
        facts: [
          { label: "Convergence rate", value: "~45 mm / year" },
          { label: "Uplift", value: "~5 mm / year" },
          { label: "Peaks above 8,000 m", value: "10 of 14" },
          { label: "Age of collision", value: "~50 million years" },
        ],
      },
      { kind: "heading", id: "monsoon", text: "The range that makes the weather" },
      {
        kind: "paragraph",
        text: "The wall does more than exist: it blocks cold Central Asian air from reaching the subcontinent and forces the summer monsoon to dump its moisture on the southern slopes. Half of Asia's agriculture depends on that mechanism.",
      },
      {
        kind: "list",
        items: [
          "Ten of the world's fourteen 8,000 m peaks sit on the Himalayan arc.",
          "The range feeds the Indus, Ganges and Brahmaputra systems.",
          "Glacial retreat is now measurable decade to decade.",
        ],
      },
      ...closing("Mountain ranges"),
    ],
  },
  {
    slug: "the-sahel-explained",
    title: "The Sahel, explained",
    dek: "A 5,000 km belt of semi-arid land where the Sahara negotiates with the savanna — and where climate and politics meet head-on.",
    category: "climate",
    continent: "africa",
    difficulty: "intermediate",
    minutes: 8,
    publishedAt: "2026-07-21",
    creator: "terra-lingua",
    tags: ["sahel", "africa", "climate", "desert"],
    views: 39_470,
    likes: 2_760,
    bookmarks: 1_512,
    blocks: [
      {
        kind: "paragraph",
        text: "The word comes from the Arabic sāḥil, meaning shore. Seen from the desert, the Sahel is exactly that: the coastline of a sea of sand, where scrub gives way to grass and rain becomes possible again.",
      },
      { kind: "heading", id: "geography", text: "Where it actually is" },
      {
        kind: "paragraph",
        text: "It runs from Senegal on the Atlantic to Eritrea on the Red Sea, crossing Mauritania, Mali, Burkina Faso, Niger, Nigeria, Chad and Sudan. Rainfall averages 200–600 mm a year, almost all of it in a single short season.",
      },
      {
        kind: "map",
        region: "Sahel belt",
        caption: "The Sahel belt across eleven countries — map engine pending.",
      },
      {
        kind: "facts",
        title: "Key figures",
        facts: [
          { label: "Length", value: "~5,400 km" },
          { label: "Annual rainfall", value: "200 – 600 mm" },
          { label: "Countries crossed", value: "11" },
          { label: "Population", value: "~150 million" },
        ],
      },
      { kind: "heading", id: "great-green-wall", text: "The Great Green Wall" },
      {
        kind: "paragraph",
        text: "Launched in 2007, the plan was a literal wall of trees across the continent. It has since become something better: a mosaic of restored farmland, water-harvesting bunds and community land rights that works with existing agriculture rather than around it.",
      },
      {
        kind: "quote",
        text: "The Sahel is not the Sahara advancing. It is rainfall variability meeting land under pressure.",
        attribution: "Terra Lingua",
      },
      ...closing("Climate"),
    ],
  },
  {
    slug: "the-straightest-borders-on-earth",
    title: "The straightest borders on Earth",
    dek: "Where a boundary follows a parallel instead of a river, someone drew it in a room far away.",
    category: "countries",
    continent: "global",
    difficulty: "beginner",
    minutes: 7,
    publishedAt: "2026-07-14",
    creator: "atlas-studio",
    tags: ["borders", "colonial", "surveying"],
    views: 54_120,
    likes: 4_390,
    bookmarks: 1_870,
    blocks: [
      {
        kind: "paragraph",
        text: "Natural borders wander. They follow watersheds, rivers and ridgelines because those are the things people historically could not cross. Straight borders are a signature of cartography imposed from outside.",
      },
      { kind: "heading", id: "the-longest", text: "The longest straight line" },
      {
        kind: "paragraph",
        text: "The 49th parallel carries the Canada–United States boundary for nearly 2,000 km. Surveying it took decades, and the crews cut a six-metre clearing through forest — the Slash — that is still maintained today.",
      },
      {
        kind: "list",
        items: [
          "Egypt–Sudan: the 22nd parallel, with the disputed Hala'ib triangle as its footnote.",
          "Algeria–Mali–Niger: desert lines drawn by compass bearing.",
          "Western Australia: a state boundary on the 129th meridian.",
        ],
      },
      {
        kind: "image",
        art: "article-straight-borders",
        caption: "Parallels and meridians as political instruments.",
      },
      { kind: "heading", id: "consequences", text: "What straight lines cost" },
      {
        kind: "paragraph",
        text: "A line drawn without reference to who lives there splits language groups, grazing routes and watersheds. Many long-running boundary disputes trace directly to a nineteenth-century ruler on a small-scale map.",
      },
      ...closing("Countries"),
    ],
  },
  {
    slug: "reading-a-flag-in-thirty-seconds",
    title: "Reading a flag in thirty seconds",
    dek: "Colours, charges and proportions carry more information than most people expect. Here is the grammar.",
    category: "flags",
    continent: "global",
    difficulty: "beginner",
    minutes: 4,
    publishedAt: "2026-07-09",
    creator: "atlas-studio",
    tags: ["flags", "vexillology", "symbols"],
    views: 72_640,
    likes: 6_910,
    bookmarks: 3_120,
    blocks: [
      {
        kind: "paragraph",
        text: "Flags are compressed history. Once you know the recurring families — tricolours, Nordic crosses, pan-African and pan-Arab palettes — most of the world's 195 national flags become guessable rather than memorisable.",
      },
      { kind: "heading", id: "families", text: "The five big families" },
      {
        kind: "list",
        ordered: true,
        items: [
          "Tricolours: France's 1794 design copied across Europe, Africa and the Americas.",
          "Nordic crosses: an off-centre cross, always signalling the Nordic sphere.",
          "Pan-African: green, gold and red, from Ethiopia outward.",
          "Pan-Arab: black, white, green and red from the 1916 Arab Revolt.",
          "Union-derived: a canton in the top-left, tracing British administration.",
        ],
      },
      {
        kind: "facts",
        title: "Vexillology quick sheet",
        facts: [
          { label: "Most common colour", value: "Red" },
          { label: "Only non-rectangular", value: "Nepal" },
          { label: "Identical pairs", value: "Monaco & Indonesia" },
          { label: "Newest national flag", value: "2021, Afghanistan" },
        ],
      },
      {
        kind: "didYouKnow",
        text: "Nepal's flag is the only national flag that is not a quadrilateral — its two stacked pennants represent the Himalayas and the country's two dominant faiths.",
      },
      ...closing("Flags"),
    ],
  },
  {
    slug: "the-nile-and-the-amazon",
    title: "The Nile and the Amazon: which is longest?",
    dek: "A measurement argument that has run for a century, and why the answer depends on where you decide a river begins.",
    category: "oceans",
    continent: "global",
    difficulty: "intermediate",
    minutes: 8,
    publishedAt: "2026-07-02",
    creator: "delta-notes",
    tags: ["rivers", "nile", "amazon", "hydrology"],
    views: 44_980,
    likes: 3_640,
    bookmarks: 1_690,
    blocks: [
      {
        kind: "paragraph",
        text: "Length sounds like a fact. For rivers it is a decision: which headwater counts, how you handle a braided delta, and what resolution your coastline data uses.",
      },
      { kind: "heading", id: "the-case", text: "The case for each" },
      {
        kind: "paragraph",
        text: "The Nile is conventionally 6,650 km from Lake Victoria's feeders to the Mediterranean. The Amazon is usually given as 6,400 km, but expeditions tracing it to the Mantaro headwaters in Peru push it past 6,900 km.",
      },
      {
        kind: "facts",
        title: "Not close on discharge",
        facts: [
          { label: "Amazon discharge", value: "~209,000 m³/s" },
          { label: "Nile discharge", value: "~2,800 m³/s" },
          { label: "Amazon basin", value: "7.0 million km²" },
          { label: "Nile basin", value: "3.4 million km²" },
        ],
      },
      {
        kind: "paragraph",
        text: "By volume there is no contest. The Amazon carries roughly a fifth of all river water reaching the ocean, and its plume is detectable hundreds of kilometres out to sea.",
      },
      {
        kind: "quote",
        text: "Ask which river is longest and you get an answer about methodology, not geography.",
        attribution: "Delta Notes",
      },
      ...closing("Rivers"),
    ],
  },
  {
    slug: "how-unesco-picks-a-world-heritage-site",
    title: "How UNESCO picks a World Heritage site",
    dek: "Ten criteria, one committee and a long queue. Inside the process that turns a place into a protected one.",
    category: "heritage",
    continent: "global",
    difficulty: "beginner",
    minutes: 5,
    publishedAt: "2026-06-25",
    creator: "heritage-desk",
    tags: ["unesco", "heritage", "conservation"],
    views: 31_220,
    likes: 2_140,
    bookmarks: 1_105,
    blocks: [
      {
        kind: "paragraph",
        text: "A site must show what the convention calls Outstanding Universal Value: significance so exceptional it transcends national boundaries. In practice that means meeting at least one of ten criteria, six cultural and four natural.",
      },
      { kind: "heading", id: "the-route", text: "The route to inscription" },
      {
        kind: "list",
        ordered: true,
        items: [
          "The state party adds the site to its tentative list.",
          "A full nomination dossier is prepared, often over years.",
          "ICOMOS or IUCN carries out an independent evaluation.",
          "The World Heritage Committee votes at its annual session.",
        ],
      },
      {
        kind: "facts",
        title: "The register today",
        facts: [
          { label: "Total sites", value: "1,200+" },
          { label: "Cultural", value: "~933" },
          { label: "Natural", value: "~227" },
          { label: "In danger", value: "~56" },
        ],
      },
      {
        kind: "didYouKnow",
        text: "Sites can be removed. Dresden's Elbe Valley lost its status in 2009 after a four-lane bridge was built through the protected landscape.",
      },
      ...closing("UNESCO heritage"),
    ],
  },
  {
    slug: "why-there-are-five-oceans-now",
    title: "Why there are five oceans now",
    dek: "The Southern Ocean was recognised in 2021, and the reason is a current rather than a coastline.",
    category: "oceans",
    continent: "antarctica",
    difficulty: "beginner",
    minutes: 5,
    publishedAt: "2026-06-18",
    creator: "delta-notes",
    tags: ["oceans", "southern ocean", "antarctica", "currents"],
    views: 37_640,
    likes: 2_980,
    bookmarks: 1_260,
    blocks: [
      {
        kind: "paragraph",
        text: "Every other ocean is defined by the land around it. The Southern Ocean is defined by water: the Antarctic Circumpolar Current, which circles the continent uninterrupted and keeps its cold water distinct from what lies north.",
      },
      { kind: "heading", id: "boundary", text: "Where it starts" },
      {
        kind: "paragraph",
        text: "The working boundary is 60° south. North of it the water warms and mixes with the Atlantic, Pacific and Indian; south of it the circumpolar current dominates and the ecosystem changes with it.",
      },
      {
        kind: "facts",
        title: "The five",
        facts: [
          { label: "Pacific", value: "165.2 million km²" },
          { label: "Atlantic", value: "106.5 million km²" },
          { label: "Indian", value: "70.6 million km²" },
          { label: "Southern", value: "21.9 million km²" },
        ],
      },
      {
        kind: "map",
        region: "Southern Ocean",
        caption: "The 60° south boundary and the circumpolar current.",
      },
      ...closing("Oceans"),
    ],
  },
  {
    slug: "languages-that-cross-the-most-borders",
    title: "Languages that cross the most borders",
    dek: "Official status is politics; everyday speech is geography. The two rarely line up.",
    category: "culture",
    continent: "global",
    difficulty: "intermediate",
    minutes: 7,
    publishedAt: "2026-06-10",
    creator: "terra-lingua",
    tags: ["languages", "culture", "linguistics"],
    views: 28_910,
    likes: 2_310,
    bookmarks: 980,
    blocks: [
      {
        kind: "paragraph",
        text: "Around 7,000 languages are spoken today, but fewer than a hundred hold official status anywhere. The gap between those numbers is where most of the world's linguistic geography lives.",
      },
      { kind: "heading", id: "widest", text: "The widest reach" },
      {
        kind: "list",
        items: [
          "English: official or co-official in 58 countries.",
          "French: 29 countries across five continents.",
          "Arabic: 25 countries, with dialect continua that ignore borders entirely.",
          "Spanish: 21 countries, remarkably mutually intelligible.",
        ],
      },
      {
        kind: "paragraph",
        text: "Reach is not the same as speaker count. Mandarin has more native speakers than English but official status in only a handful of states, because its distribution is concentrated rather than colonial.",
      },
      {
        kind: "didYouKnow",
        text: "Papua New Guinea has over 840 living languages — roughly 12% of the world's total in 0.3% of its land area.",
      },
      ...closing("Cultures"),
    ],
  },
  {
    slug: "what-a-currency-tells-you-about-a-country",
    title: "What a currency tells you about a country",
    dek: "Pegs, unions and dollarisation are geography problems disguised as monetary ones.",
    category: "culture",
    continent: "global",
    difficulty: "advanced",
    minutes: 11,
    publishedAt: "2026-06-03",
    creator: "terra-lingua",
    tags: ["currencies", "economics", "trade"],
    views: 19_540,
    likes: 1_420,
    bookmarks: 760,
    blocks: [
      {
        kind: "paragraph",
        text: "There are about 180 recognised currencies for 195 countries. The shortfall is the interesting part: shared unions, adopted foreign notes and hard pegs each say something about trade, size and trust.",
      },
      { kind: "heading", id: "unions", text: "Currency unions" },
      {
        kind: "paragraph",
        text: "The euro is the famous one, but the CFA franc covers fourteen African states across two zones, and the Eastern Caribbean dollar binds eight island economies to a single central bank.",
      },
      { kind: "heading", id: "dollarisation", text: "Adopting someone else's money" },
      {
        kind: "list",
        items: [
          "Ecuador, El Salvador and Panama use the US dollar outright.",
          "Montenegro and Kosovo use the euro without being in the eurozone.",
          "Several Pacific states use the Australian or New Zealand dollar.",
        ],
      },
      {
        kind: "facts",
        title: "Currency map",
        facts: [
          { label: "Recognised currencies", value: "~180" },
          { label: "Countries using the euro", value: "20 official" },
          { label: "CFA franc states", value: "14" },
          { label: "Fully dollarised", value: "7+" },
        ],
      },
      {
        kind: "quote",
        text: "A currency border is the most honest border there is — it shows where trust actually stops.",
        attribution: "Terra Lingua",
      },
      ...closing("Currencies"),
    ],
  },
  {
    slug: "the-landmarks-everyone-misplaces",
    title: "The landmarks everyone misplaces",
    dek: "Machu Picchu is not in the Andes' highest range, and the Sphinx is younger than you think.",
    category: "landmarks",
    continent: "global",
    difficulty: "beginner",
    minutes: 6,
    publishedAt: "2026-05-27",
    creator: "heritage-desk",
    tags: ["landmarks", "monuments", "misconceptions"],
    views: 58_300,
    likes: 5_040,
    bookmarks: 2_010,
    blocks: [
      {
        kind: "paragraph",
        text: "Famous places accumulate folklore faster than facts. These are the six that cause the most wrong answers in Let's Play rounds, and the corrections that stick.",
      },
      { kind: "heading", id: "six", text: "Six corrections" },
      {
        kind: "list",
        ordered: true,
        items: [
          "Machu Picchu sits at 2,430 m — lower than Cusco, which is at 3,400 m.",
          "The Great Wall is not visible to the naked eye from orbit.",
          "Stonehenge predates the pyramids of Giza.",
          "The Leaning Tower began tilting during construction, not centuries later.",
          "Mount Everest is not the furthest point from Earth's centre — Chimborazo is.",
          "Angkor Wat is Hindu in origin, Buddhist by later adaptation.",
        ],
      },
      {
        kind: "image",
        art: "article-landmark-myths",
        caption: "Six landmarks, six persistent misreadings.",
      },
      ...closing("Landmarks"),
    ],
  },
  {
    slug: "how-to-read-a-topographic-map",
    title: "How to read a topographic map",
    dek: "Contours, intervals and the three shapes that tell you everything about terrain.",
    category: "basics",
    continent: "global",
    difficulty: "beginner",
    minutes: 5,
    publishedAt: "2026-05-20",
    creator: "meridian",
    tags: ["maps", "contours", "basics", "navigation"],
    views: 41_770,
    likes: 3_880,
    bookmarks: 2_240,
    blocks: [
      {
        kind: "paragraph",
        text: "A contour line joins points of equal elevation. That single rule generates every pattern on a topographic sheet, and three of those patterns cover most of what you need in the field.",
      },
      { kind: "heading", id: "patterns", text: "The three shapes" },
      {
        kind: "list",
        items: [
          "Concentric closed loops: a hill, with the smallest ring at the summit.",
          "V-shapes pointing uphill: a valley, with the V aiming upstream.",
          "Lines packed tightly together: a steep face; widely spaced means gentle ground.",
        ],
      },
      {
        kind: "facts",
        title: "Reading essentials",
        facts: [
          { label: "Standard interval", value: "10 m or 20 m" },
          { label: "Index contours", value: "Every 5th line, labelled" },
          { label: "Grid north vs true north", value: "Check the declination" },
          { label: "Scale on hiking sheets", value: "1:25,000" },
        ],
      },
      {
        kind: "didYouKnow",
        text: "Contour lines never cross. Where terrain overhangs, cartographers switch to dashed lines rather than break the rule.",
      },
      ...closing("Geography basics"),
    ],
  },
  {
    slug: "europes-smallest-states",
    title: "Europe's smallest states",
    dek: "Six microstates, six very different reasons for surviving the age of empires intact.",
    category: "countries",
    continent: "europe",
    difficulty: "beginner",
    minutes: 6,
    publishedAt: "2026-05-12",
    creator: "atlas-studio",
    tags: ["europe", "microstates", "countries", "vatican"],
    views: 35_480,
    likes: 2_620,
    bookmarks: 1_140,
    blocks: [
      {
        kind: "paragraph",
        text: "Vatican City, Monaco, San Marino, Liechtenstein, Malta and Andorra together would fit inside a mid-sized city. Each survived by being useful, defensible or simply too small to bother annexing.",
      },
      {
        kind: "facts",
        title: "By area",
        facts: [
          { label: "Vatican City", value: "0.49 km²" },
          { label: "Monaco", value: "2.02 km²" },
          { label: "San Marino", value: "61 km²" },
          { label: "Liechtenstein", value: "160 km²" },
        ],
      },
      { kind: "heading", id: "how", text: "How they held on" },
      {
        kind: "paragraph",
        text: "San Marino claims continuous independence since 301 CE by staying strategically irrelevant on a defensible mountain. Liechtenstein was bought as a package of estates specifically to qualify for a seat in the Imperial Diet.",
      },
      ...closing("Countries"),
    ],
  },
  {
    slug: "megacities-and-the-limits-of-growth",
    title: "Megacities and the limits of growth",
    dek: "Thirty-three cities now pass ten million people. Water, not land, decides which of them keep growing.",
    category: "capitals",
    continent: "asia",
    difficulty: "advanced",
    minutes: 12,
    publishedAt: "2026-05-04",
    creator: "meridian",
    tags: ["cities", "urban", "population", "water"],
    views: 22_130,
    likes: 1_710,
    bookmarks: 890,
    blocks: [
      {
        kind: "paragraph",
        text: "A megacity is any urban agglomeration above ten million people. In 1975 there were three. Today there are more than thirty, and two thirds of them are in Asia.",
      },
      { kind: "heading", id: "constraint", text: "The binding constraint" },
      {
        kind: "paragraph",
        text: "Housing and transport are solvable with capital. Water is not. Mexico City is sinking as it drains its aquifer, Jakarta is moving its capital function partly because of subsidence, and Cape Town has already run a countdown to Day Zero.",
      },
      {
        kind: "facts",
        title: "Largest agglomerations",
        facts: [
          { label: "Tokyo", value: "~37 million" },
          { label: "Delhi", value: "~33 million" },
          { label: "Shanghai", value: "~29 million" },
          { label: "Dhaka", value: "~23 million" },
        ],
      },
      {
        kind: "map",
        region: "Global megacities",
        caption: "Thirty-three agglomerations above ten million.",
      },
      {
        kind: "quote",
        text: "Cities do not stop growing when they run out of land. They stop when they run out of water.",
        attribution: "Meridian",
      },
      ...closing("Capitals"),
    ],
  },
] as const;

const BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));

export const articleBySlug = (slug: string): Article | undefined => BY_SLUG.get(slug);

/** Articles sharing a category or continent, excluding the source article. */
export function relatedArticles(
  article: Article,
  limit = 3,
  source: readonly Article[] = ARTICLES,
): Article[] {
  return source
    .filter((a) => a.slug !== article.slug)
    .map((a) => ({
      a,
      score:
        (a.category === article.category ? 3 : 0) +
        (a.continent === article.continent ? 2 : 0) +
        a.tags.filter((t) => article.tags.includes(t)).length,
    }))
    .sort((x, y) => y.score - x.score || y.a.views - x.a.views)
    .slice(0, limit)
    .map((x) => x.a);
}

/** Headings, used for the table of contents. */
export function articleHeadings(article: Article) {
  return article.blocks.filter(
    (b): b is Extract<ArticleBlock, { kind: "heading" }> => b.kind === "heading",
  );
}
