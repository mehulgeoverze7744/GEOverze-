import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "Most people carry a mental map of the world built from school atlases, geography games, and half-remembered lessons. That mental map is reliably wrong in the same places every time. The errors are not random — they cluster around specific geographic biases: an assumption that coastlines run straight, that famous countries sit in the middle of their continents, that big things look big on maps. The corrections, once learned, stick permanently — partly because they are surprising, and partly because the explanation for why the error exists is usually as interesting as the truth that replaces it.",
  },

  {
    kind: "heading",
    id: "panama-canal",
    text: "The Panama Canal: the Pacific end is east of the Atlantic end",
  },
  {
    kind: "paragraph",
    text: "Most people assume the Panama Canal runs roughly west to east, connecting the Atlantic on the west to the Pacific on the east. The reality is the reverse: the Panama Canal runs roughly north-west to south-east, and the Pacific Ocean entrance at Panama City is almost due east of the Atlantic entrance at Colón. The Pacific end sits at approximately 8.9°N 79.5°W; the Atlantic end sits at approximately 9.4°N 79.9°W — meaning the Atlantic entrance is both further north and further west. The confusion arises from a reasonable assumption: everyone knows the Pacific Ocean is west of North America and the Atlantic is east. But Panama's isthmus makes an S-curve: the country bends eastward at its centre, so 'crossing from Atlantic to Pacific' actually means travelling from northwest to southeast, not from west to east.",
  },
  {
    kind: "image",
    art: "article-panama-canal-satellite",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/PanamaCanal-EO.JPG/1280px-PanamaCanal-EO.JPG",
    caption:
      "NASA satellite view of the Panama Canal — the Pacific entrance (lower right) is east of the Atlantic entrance (upper left), confounding most people's mental maps.",
    credit: "Wikimedia Commons / Public Domain (NASA)",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "Standing at the Pacific entrance to the Panama Canal and looking toward the Atlantic entrance, you are looking roughly north-west. The Pacific end of the canal is east of the Atlantic end. This is the single most consistently misunderstood geographic fact about one of the world's most famous landmarks.",
  },

  {
    kind: "heading",
    id: "sydney-latitude",
    text: "Sydney's latitude: same as Cape Town, not Melbourne",
  },
  {
    kind: "paragraph",
    text: "Australia's east coast is commonly imagined as running roughly north-south, with Sydney in the south and Brisbane in the north. What many people underestimate is how far north Sydney actually sits relative to the rest of the temperate world. Sydney is at latitude 33.9°S — roughly the same latitude as Cape Town, South Africa (33.9°S), Casablanca, Morocco (33.6°N), and Los Angeles (34.1°N). Sydney is not a cold, southern city: it sits well into the subtropics. Melbourne, by contrast, is at 37.8°S — noticeably further south, at the equivalent of southern Spain or San Francisco's latitude in the northern hemisphere. The straight-line distance between Sydney and Melbourne is 878 km, about the same as Paris to Rome. Sydney is to Australia's north-east what people often imagine as the deep south.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Brisbane (27.5°S) is at roughly the same latitude as Buenos Aires. Perth (31.9°S) is close to the latitude of Casablanca. The Australian city most commonly imagined as 'near Antarctica' — Hobart, Tasmania — is at 42.9°S, the same latitude as Rome or Chicago. The actual closest Australian city to Antarctica is still well within the temperate zone.",
  },

  {
    kind: "heading",
    id: "cairo-position",
    text: "Cairo is at the northern tip of Egypt, not the centre",
  },
  {
    kind: "paragraph",
    text: "Egypt is commonly imagined with Cairo positioned somewhere near the geographic middle of the country, perhaps slightly north. In reality, Cairo sits near the very northern end of Egypt, at the apex of the Nile Delta, at approximately 30°N. The country extends some 1,100 km south to Wadi Halfa on the Sudanese border. Most of Egypt is empty: the Nile corridor, narrow strips of irrigated farmland, and then vast expanses of the Eastern Desert, Western Desert (part of the Sahara), and Sinai Peninsula. More than 95% of Egypt's population lives along the Nile corridor and in the Delta — a strip representing less than 4% of Egypt's total land area. Cairo functions as the entry point of the Nile into its delta and has always been a city positioned at the junction of Egypt's arable land and the Mediterranean trade routes, not at its geographic centre.",
  },
  {
    kind: "image",
    art: "article-nile-delta-satellite",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Nile_River_Delta_at_Night_-_Flickr_-_NASA_Goddard_Photo_and_Video.jpg/1280px-Nile_River_Delta_at_Night_-_Flickr_-_NASA_Goddard_Photo_and_Video.jpg",
    caption:
      "NASA night image of the Nile Delta — Cairo and Alexandria glow at the very northern tip of Egypt; almost no light appears to the south, where most of Egypt's land area lies.",
    credit: "Wikimedia Commons / NASA Goddard Photo and Video",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The southernmost point of Egypt is approximately 900 km south of Cairo. The southernmost significant city, Aswan (24°N), is at the same latitude as Abu Dhabi, Muscat, or Cancún. The pyramids of Giza are at 30°N — the same latitude as New Orleans, Shanghai, and Lhasa.",
  },

  {
    kind: "heading",
    id: "india-scale",
    text: "India's true scale: larger than all of Western Europe",
  },
  {
    kind: "paragraph",
    text: "India (3.29 million km²) is one of the most consistently underestimated countries on the world map. On Mercator projections, which inflate areas at higher latitudes and compress equatorial countries, India appears roughly the same size as Greenland — which is actually 2.17 million km², 34% smaller. India's actual size means it encompasses greater geographic, climatic, and cultural diversity than the entire European continent west of Russia. The distance from Srinagar in Kashmir to Kanyakumari at the southern tip is approximately 3,200 km — equivalent to the distance from Edinburgh in Scotland to Tunis in Tunisia. India spans desert (Rajasthan), tropical jungle (Western Ghats), high alpine terrain (the Himalayas), mangrove swamps (the Sundarbans), and a 7,500 km coastline touching three seas.",
  },
  {
    kind: "sizeComparison",
    title: "India compared to European countries",
    items: [
      { label: "India", areaKm2: 3287263 },
      { label: "France", areaKm2: 551695 },
      { label: "Germany", areaKm2: 357114 },
      { label: "Spain", areaKm2: 505990 },
      { label: "Italy", areaKm2: 301340 },
      { label: "Poland", areaKm2: 312696 },
      { label: "UK", areaKm2: 243610 },
      { label: "Sweden", areaKm2: 450295 },
    ],
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "India's area of 3.29 million km² would contain France (551,695 km²), Germany (357,114 km²), Spain (505,990 km²), Italy (301,340 km²), Poland (312,696 km²), and the UK (243,610 km²) simultaneously — with room to spare. The Mercator projection, used in most school wall maps, compresses India to roughly the apparent size of Greenland.",
  },

  { kind: "heading", id: "la-east-of-reno", text: "Los Angeles is east of Reno, Nevada" },
  {
    kind: "paragraph",
    text: "Most people who have never studied a detailed map of California assume the state's coastline runs roughly north-south, with cities at their intuited latitudes. But California's coastline curves dramatically to the southeast below San Francisco, so that Los Angeles, on the southern coast, ends up further east than Reno, which sits in Nevada to the east of the Sierra Nevada mountains. Los Angeles is at 118.2°W longitude. Reno, Nevada, is at 119.8°W. In other words, Reno is 1.6 degrees further west than Los Angeles — meaning that if you drew a vertical line through Los Angeles, Reno would be to the west of it. This surprises almost everyone who has not looked carefully at a west coast map, because the mental image of California is a straight north-south coastline with Nevada straightforwardly to its east.",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Longitude check: Los Angeles = 118.2°W. Reno, Nevada = 119.8°W. Portland, Oregon = 122.7°W. Seattle = 122.3°W. The entire California coast bends eastward so significantly that the southern end of the state is almost as far east as Denver, Colorado (104.9°W).",
  },
  {
    kind: "image",
    art: "article-california-coast-shape",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/California_terrain.jpg/640px-California_terrain.jpg",
    caption:
      "California terrain map showing the dramatic southeastward curve of the coast — Los Angeles sits further east than Reno, Nevada, despite being on the Pacific coast.",
    credit: "Wikimedia Commons / Public Domain",
  },

  {
    kind: "heading",
    id: "uk-russia-latitude",
    text: "The UK and Russia share more latitude than you think",
  },
  {
    kind: "paragraph",
    text: "London sits at 51.5°N. New York is at 40.7°N — fully 11 degrees further south, equivalent to the difference between London and Madrid. Most of continental Western Europe is at latitudes where North America has prairie, not major cities. The latitude of London corresponds roughly to the latitude of Calgary, Alberta, or the southern shore of Hudson Bay — yet London's winters are mild due to the Gulf Stream warming the North Atlantic. Russia's most densely populated zone runs from roughly 50°N (Moscow at 55.7°N, Volgograd at 48.7°N) northward. Vladivostok, Russia's Pacific coast city, is at 43.1°N — further south than Moscow, though both are commonly imagined as neighbouring arctic outposts. The distance between Moscow and Vladivostok is approximately 9,300 km along the Trans-Siberian Railway — nearly the full width of the Eurasian continent.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "London (51.5°N) is further north than all of the contiguous United States except the very northernmost fringe of states like Montana and North Dakota. Paris (48.9°N) is at the same latitude as Vancouver, British Columbia. Rome (41.9°N) is at the same latitude as Chicago, IL or Denver, CO.",
  },

  {
    kind: "heading",
    id: "antarctica-largest-desert",
    text: "Antarctica is the world's largest desert",
  },
  {
    kind: "paragraph",
    text: "A desert is formally defined as a region that receives less than 250 mm of precipitation per year. By this definition, Antarctica is the world's largest desert: it covers approximately 14.2 million km² and receives less than 200 mm of precipitation per year over most of its surface, with the interior receiving less than 50 mm — making it drier than the Sahara. The Sahara, which most people assume is the largest desert, covers 9.2 million km² and is genuinely the world's largest hot desert. The Arctic Desert (covering the ice-covered portions of the high Arctic) is the second-largest desert overall at about 13.9 million km². This means three of the world's four largest deserts are cold, not hot — Antarctica, the Arctic, and the Gobi Desert in Asia (1.3 million km²).",
  },
  {
    kind: "facts",
    title: "World's largest deserts by area",
    facts: [
      {
        label: "Antarctic Desert (cold)",
        value: "~14.2 million km² — world's largest; < 200 mm precipitation/year",
      },
      {
        label: "Arctic Desert (cold)",
        value: "~13.9 million km² — second largest; < 250 mm precipitation/year",
      },
      { label: "Sahara Desert (hot)", value: "~9.2 million km² — world's largest hot desert" },
      { label: "Arabian Desert (hot)", value: "~2.3 million km²" },
      { label: "Gobi Desert (cold)", value: "~1.3 million km² — Central Asia" },
      {
        label: "Patagonian Desert (cold)",
        value: "~670,000 km² — South America, rain shadow of Andes",
      },
    ],
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The Dry Valleys of Antarctica receive virtually no rainfall and have not seen rain in approximately two million years — making them the driest places on Earth. They are also ice-free due to the katabatic winds that evaporate any snow that falls, and are used by NASA as an analogue for conditions on Mars.",
  },

  {
    kind: "heading",
    id: "everest-chimborazo",
    text: "Everest vs Chimborazo: two different meanings of 'highest'",
  },
  {
    kind: "paragraph",
    text: "Mount Everest is unambiguously the highest point above mean sea level at 8,848.86 m (as officially revised in 2020). But 'above sea level' is not the same as 'furthest from Earth's centre' — because the Earth is not a perfect sphere. It is an oblate spheroid, compressed at the poles and bulging at the equator, with a difference of about 21 km between the polar and equatorial radii. Chimborazo in Ecuador (6,263 m above sea level) sits near the equator at a latitude where the Earth's surface is at its maximum distance from the planet's centre. The summit of Chimborazo is approximately 6,384 km from Earth's centre — about 2,168 m further from the centre than Everest's summit, despite being over 2,500 m lower in altitude. For a satellite in low orbit, Chimborazo is the highest obstacle on Earth. For a mountaineer, Everest remains the undisputed challenge.",
  },
  {
    kind: "dualCompare",
    title: "Two definitions of 'highest mountain'",
    leftTitle: "Highest above sea level — Everest",
    leftItems: [
      "Mount Everest: 8,848.86 m above sea level",
      "Nepal/China border, Himalayas — 27.9°N",
      "First climbed May 29, 1953 (Hillary and Tenzing Norgay)",
      "Standard definition; reference for all mountaineering",
      "Sea level distance from Earth's centre: ~6,382 km",
    ],
    rightTitle: "Furthest from Earth's centre — Chimborazo",
    rightItems: [
      "Chimborazo: 6,263 m above sea level",
      "Ecuador, near the equator — 1.5°S",
      "Equatorial bulge adds ~21 km to sea-level distances",
      "Summit ~6,384 km from Earth's centre — 2.1 km more than Everest",
      "Relevant for atmospheric, orbital, and planetary geometry",
    ],
  },
  {
    kind: "image",
    art: "article-chimborazo-volcano",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Chimborazo_volcano.jpg/1280px-Chimborazo_volcano.jpg",
    caption:
      "Chimborazo, Ecuador (6,263 m) — lower than Everest above sea level, but further from Earth's centre due to the equatorial bulge of the planet.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  { kind: "heading", id: "new-zealand-australia", text: "New Zealand is not near Australia" },
  {
    kind: "paragraph",
    text: "New Zealand and Australia are frequently imagined as close neighbours — a reasonable assumption given that New Zealand is typically shown in an inset map box next to Australia in many atlases. The actual distance from Auckland, New Zealand, to Sydney, Australia, is approximately 2,157 km. That is roughly the same as the distance from London to Cairo, or from New York to Denver. A flight between the two countries takes approximately three hours. New Zealanders do not 'pop over' to Australia any more than Londoners pop to Cairo. The confusion is compounded by the map-box inset convention, which places New Zealand physically adjacent to Australia on the page even when the scale is clearly different. On an accurate world map, New Zealand sits in the South Pacific well to the east of Australia, with the Tasman Sea between them.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "New Zealand's two main islands span roughly the same north-south distance as Italy — about 1,600 km from the Far North to the southern tip of the South Island. New Zealand's capital Wellington sits at 41.3°S, approximately the same latitude as Barcelona, Spain (41.4°N). Yet Wellington is famous for strong winds and cool summers — testament to how much the southern hemisphere ocean circulation differs from the northern.",
  },

  {
    kind: "heading",
    id: "africa-south-america",
    text: "Africa and South America: closer than they look",
  },
  {
    kind: "paragraph",
    text: "The narrowest part of the Atlantic Ocean — between the bulge of West Africa and the eastward-jutting coast of South America — is about 2,850 km wide, between Dakar, Senegal (14.7°W), and Natal/Recife in Brazil (34-35°W). This is the segment of the Atlantic that Alfred Wegener cited as evidence for continental drift in 1912: the two coastlines are not only geometrically complementary in shape, but share matching rock formations, fossil species, and geological ages. Most people dramatically overestimate this distance because the Atlantic looks enormous on standard world maps. Africa itself is also commonly underestimated in its southward extent: Cape Agulhas, the southernmost point of Africa, is at 34.8°S — almost exactly the same latitude as Sydney, Australia, and significantly further south than Cairo is north.",
  },
  {
    kind: "image",
    art: "article-africa-south-america-drift",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Snider-Pellegrini_Wegener_fossil_map.svg/1280px-Snider-Pellegrini_Wegener_fossil_map.svg",
    caption:
      "Wegener's 1915 diagram showing matching fossil and geological evidence across Africa and South America — the narrowest Atlantic crossing is about 2,850 km.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Africa is the continent with the most equatorial land: the equator passes through 6 African countries (Gabon, Republic of Congo, DRC, Uganda, Kenya, Somalia). Africa also spans 37 degrees of latitude from its northernmost point (Ras ben Sakka, Tunisia, 37.3°N) to its southernmost (Cape Agulhas, 34.8°S) — a span of 8,000 km.",
  },

  { kind: "heading", id: "mercator-problem", text: "Map projections and the Mercator distortion" },
  {
    kind: "paragraph",
    text: "The Mercator projection — still the default in most web maps and classroom atlases — was designed in 1569 by Flemish cartographer Gerardus Mercator for maritime navigation. It has one crucial property: straight lines on the map correspond to lines of constant compass bearing, making it ideal for plotting ship routes. Its crucial flaw: it massively distorts areas at higher latitudes. Greenland (2.17 million km²) appears roughly the same size as Africa (30.4 million km²) on a Mercator map — but Africa is 14 times larger. Alaska looks bigger than Brazil on a Mercator map; Brazil is actually 6.5 times larger. Russia looks enormous relative to Africa; Africa is actually larger than Russia, the United States, China, and India combined. The projection shrinks countries near the equator and inflates countries near the poles, systematically making rich, high-latitude countries look larger and poor, equatorial countries look smaller.",
  },
  {
    kind: "image",
    art: "article-mercator-projection",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/Mercator_projection_Square.JPG/1280px-Mercator_projection_Square.JPG",
    caption:
      "The Mercator projection — designed for navigation, not for area comparison. Greenland appears roughly the size of Africa; in reality Africa is 14 times larger.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Greenland: 2.17 million km². Africa: 30.37 million km² — Africa is 14 times larger. Alaska: 1.72 million km². Brazil: 8.51 million km² — Brazil is nearly 5 times larger. Russia: 17.1 million km². Africa: 30.37 million km² — Africa is larger than Russia. The Mercator projection reverses the visual impression of all three comparisons.",
  },

  {
    kind: "heading",
    id: "international-date-line",
    text: "The International Date Line: it doesn't run straight",
  },
  {
    kind: "paragraph",
    text: "The International Date Line (IDL) runs roughly along the 180° meridian in the Pacific Ocean, separating one calendar day from the next. Most people imagine it as a straight vertical line. In reality it zigs and zags substantially to keep political and economic territories on the same calendar day. The most dramatic deviation was caused by Kiribati, a Pacific island nation whose 33 atolls originally straddled the date line, meaning the western islands were 24 hours behind the eastern islands despite being in the same country. In 1995, Kiribati unilaterally moved the date line eastward around its entire territory, so all Kiribati islands share the same date. This made Kiribati the first territory to welcome the year 2000 — a deliberate tourism strategy. Samoa performed a similar date-line jump in 2011, switching from the eastern to the western side to align with Australia and New Zealand, its primary trade partners.",
  },
  {
    kind: "image",
    art: "article-international-date-line",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/International_date_line.png/1280px-International_date_line.png",
    caption:
      "The International Date Line — far from straight, it zigzags around Kiribati, Samoa, Tonga, and Fiji to keep island nations on one calendar day.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "Samoa's 2011 date line switch meant the country skipped Friday 30 December 2011 entirely — the day went from Thursday to Saturday. The decision aligned Samoa with its main trading partners Australia and New Zealand, which had been separated from Samoa by a day despite being closer in distance than Los Angeles, Samoa's old primary trading partner.",
  },

  {
    kind: "heading",
    id: "europe-northern-latitude",
    text: "Europe's surprisingly northern position",
  },
  {
    kind: "paragraph",
    text: "Western Europe sits at latitudes that few people realise correspond to some of the harshest climates in North America. London (51.5°N) is at the same latitude as Calgary, Alberta — a city famous for cold winters and sudden Chinook storms. Paris (48.9°N) is at the latitude of Vancouver. Rome (41.9°N) matches Chicago or Denver. Madrid (40.4°N) matches New York. The fact that European cities are dramatically warmer than North American cities at the same latitude is entirely due to the Gulf Stream and its extension into Europe, the North Atlantic Current. If the Gulf Stream were to weaken significantly — as some climate models project — Northern European winters could shift toward the climate of Newfoundland or southern Alaska.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Oslo, Norway (59.9°N) is at the same latitude as Anchorage, Alaska (61.2°N). Yet Oslo has mild winters with average January temperatures around -3°C, while Anchorage averages -12°C in January. The entire difference is the Atlantic Ocean's heat transfer, which makes western Europe dramatically warmer than its latitude would predict.",
  },

  {
    kind: "heading",
    id: "brazil-hemispheres",
    text: "Brazil is mostly in the southern hemisphere",
  },
  {
    kind: "paragraph",
    text: "Brazil is commonly imagined as a tropical country straddling the equator, and while this is partially true — the equator does cross northern Brazil, including the mouth of the Amazon — the vast majority of the country lies south of the equator. São Paulo (23.5°S), Rio de Janeiro (22.9°S), Brasília (15.8°S), and even Manaus (3.1°S) are all south of the equator. Only the northernmost state of Amapá, and small portions of Pará and Amazonas, lie north of the equator. This means most of Brazil experiences seasons opposite to Europe and North America: December is summer, June is winter. Brazil's agricultural cycles, festival calendar, and climate patterns follow southern hemisphere rhythms, not the northern hemisphere patterns that most of the world's media and culture assumes.",
  },

  { kind: "heading", id: "alaska-size", text: "Alaska is bigger than most people realise" },
  {
    kind: "paragraph",
    text: "Alaska (1.72 million km²) is larger than Texas, California, and Montana combined — the three largest of the lower 48 US states. It accounts for approximately 17% of the entire United States land area and is larger than most sovereign nations, including Iran (1.65 million km²), Libya (1.76 million km²), and Saudi Arabia (2.15 million km²). Yet on standard US maps, Alaska is typically shown in an inset box at a different scale, placed off the coast of southern California for convenience. When shown at the same scale as the rest of the US, Alaska dramatically dominates the western portion of the continent. On a Mercator projection, Alaska also appears significantly larger than it actually is due to its high latitude (57–72°N), further distorting the perception.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "If Alaska were a sovereign nation, it would be the 17th largest country in the world — larger than Libya, Iran, and Indonesia. Alaska's coastline alone is longer than the entire coastline of all the lower 48 US states combined, due to its thousands of islands, fjords, and peninsulas.",
  },

  {
    kind: "heading",
    id: "misconceptions-table",
    text: "Ten geographic misconceptions and their corrections",
  },
  {
    kind: "table",
    title: "Commonly held geographic beliefs and the reality",
    columns: ["The common belief", "The reality", "Why it matters"],
    rows: [
      [
        "The Panama Canal runs west-east",
        "It runs roughly NW-SE; the Pacific end is east of the Atlantic end",
        "Navigation and strategic geography",
      ],
      [
        "Sydney is in southern Australia",
        "Sydney (33.9°S) is near Cape Town's latitude — it's subtropical",
        "Climate expectations, tourist planning",
      ],
      [
        "Cairo is roughly in Egypt's centre",
        "Cairo is at the very northern tip of Egypt, at the Nile Delta apex",
        "Understanding Egypt's geography and demographics",
      ],
      [
        "India is a medium-sized country",
        "India (3.29M km²) is larger than all of Western Europe combined",
        "Scale of governance, diversity, logistics",
      ],
      [
        "Nevada is east of California (entirely)",
        "Reno (119.8°W) is west of Los Angeles (118.2°W)",
        "US West Coast geography",
      ],
      [
        "The Sahara is the world's largest desert",
        "Antarctica (14.2M km²) is the largest; the Sahara is third overall",
        "Definition of desert as precipitation-based",
      ],
      [
        "Everest is the mountain farthest from Earth's centre",
        "Chimborazo in Ecuador is furthest from Earth's centre due to equatorial bulge",
        "Earth's shape, satellite orbital geometry",
      ],
      [
        "New Zealand is close to Australia",
        "Auckland–Sydney = 2,157 km, same as London–Cairo",
        "Pacific geography, distance misperception",
      ],
      [
        "Greenland is as large as Africa",
        "Africa (30.4M km²) is 14× larger than Greenland (2.17M km²)",
        "Mercator projection distortion",
      ],
      [
        "The International Date Line runs straight",
        "It zigzags around Kiribati, Samoa, Tonga, and Fiji",
        "Pacific political geography",
      ],
    ],
  },

  {
    kind: "heading",
    id: "geographic-surprises",
    text: "Geographic facts that surprise most people",
  },
  {
    kind: "facts",
    title: "Surprising geographic facts",
    facts: [
      {
        label: "Africa's actual size vs. common perception",
        value: "Africa (30.4M km²) fits USA, China, India, and Europe simultaneously",
      },
      {
        label: "Russia's population despite size",
        value: "Russia (17.1M km²) has only 144M people — smaller than Nigeria's 220M",
      },
      {
        label: "Australia's population vs. size",
        value:
          "Australia (7.7M km²) has only 26M people — one of the lowest density inhabited continents",
      },
      {
        label: "Panama Canal's transit direction",
        value: "Ships travel SE to reach Pacific from Atlantic — not west",
      },
      {
        label: "Hawaii's position",
        value: "Hawaii (19-22°N) is the southernmost US state, level with Mexico City",
      },
      {
        label: "Distance from tip of Chile to Antarctic Peninsula",
        value: "Drake Passage is 800 km — shortest route from any continent to Antarctica",
      },
    ],
  },

  {
    kind: "heading",
    id: "why-mental-maps-fail",
    text: "Why our mental maps are wrong in the same places",
  },
  {
    kind: "paragraph",
    text: "Mental maps fail systematically, not randomly, because they are built from a small set of shared inputs: Mercator projection classroom maps, jigsaw-puzzle shaped country outlines, and geography textbooks that emphasise political boundaries over physical scale. The Mercator projection's influence is pervasive: most people's sense of relative country size was formed by looking at Mercator maps in school, where Greenland appears comparable to Africa and Russia appears to dwarf the United States. The inset map convention — showing Alaska, Hawaii, and New Zealand at different scales beside their parent geographies — trains people to think of these territories as smaller than they are. Correcting a mental map requires not just learning new facts but actively overwriting a visual image, which is why the corrections in this article tend to be sticky: they produce a genuine visual surprise that replaces the old image.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The reason these geographic errors cluster — Panama Canal, Mercator distortion, Sydney latitude, Cairo's position — is that they all arise from the same three sources: Mercator projection distortion, the misleading inset map convention, and the assumption that famous countries sit at the geographic centre of their most prominent feature. None of these assumptions is true anywhere.",
  },

  ...editorialClosing({
    conclusion:
      "The mental map most people carry is wrong in consistent, predictable ways — shaped by the Mercator projection's distortions, classroom inset-map conventions, and assumptions that famous landmarks occupy the middle of things rather than the edges. The Panama Canal runs perpendicular to most people's expectation. Africa is 14 times larger than Greenland. Sydney is subtropical, not southern. Cairo is at Egypt's northern tip. Chimborazo, not Everest, is the peak furthest from Earth's centre. Each correction rewires a visual image that has been in place since school, and the rewired image is more durable than the fact that replaced it.",
    remember:
      "The Pacific end of the Panama Canal is east of the Atlantic end. Africa (30.4M km²) is 14× larger than Greenland (2.17M km²). Sydney is at 33.9°S — the same latitude as Cape Town and Casablanca. Antarctica (14.2M km²) is the world's largest desert. Chimborazo, not Everest, is furthest from Earth's centre.",
    quizTopic: "physical geography and map reading",
  }),
];
