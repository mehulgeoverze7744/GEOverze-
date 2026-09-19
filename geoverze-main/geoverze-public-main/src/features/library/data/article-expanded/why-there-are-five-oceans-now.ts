import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "Every ocean boundary on a map is a human decision. Water does not know it is the Pacific or the Indian Ocean — it simply moves, driven by wind, heat, salinity, and the Coriolis effect. When cartographers and oceanographers draw lines across open water and assign names, they are not discovering divisions that exist in nature; they are creating a classification system to help humans navigate, study, and communicate about the sea. That is why the question of whether there are four oceans or five is genuinely interesting: it reveals how much the maps we inherit shape what we see, and how scientific understanding can take decades to update official cartography.",
  },

  { kind: "heading", id: "what-is-an-ocean", text: "What an Ocean Actually Is" },
  {
    kind: "paragraph",
    text: "In physical terms, the world has one ocean — a continuous body of salt water that covers 71 percent of the Earth's surface, with a volume of approximately 1.335 billion cubic kilometres. The divisions we call oceans are not separated by physical barriers the way continents are by distance or mountains are by height. They are overlapping regions of a single connected body of water, differentiated by their geographic position, the continental land masses that partly surround them, their temperature and salinity profiles, the currents that run through them, and the marine ecosystems they support. The reason we need names at all is practical: navigation requires reference points, oceanographic science requires defined study regions, and maritime law requires boundaries for jurisdictional purposes.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The total volume of the world's oceans is approximately 1.335 billion cubic kilometres — enough to fill the entire United States to a depth of over 130 kilometres. Despite this, more than 80 percent of the ocean floor has never been mapped at high resolution. We have better maps of the surface of Mars than of the deep ocean floor.",
  },

  { kind: "heading", id: "history-of-naming", text: "A Brief History of Ocean Naming" },
  {
    kind: "paragraph",
    text: "The Pacific Ocean got its name from the explorer Ferdinand Magellan, who crossed it in 1520 after passing through the stormy strait at the southern tip of South America. Finding the waters unusually calm — at least on his particular crossing — he called it 'Mar Pacífico,' the Peaceful Sea. The name stuck even though the Pacific is, in aggregate, no calmer than other oceans, and its typhoon frequency in the western basin puts it among the most storm-prone waters on Earth. Magellan's passage was the first documented crossing of the Pacific, and the name he gave it became universal in European cartographic tradition.",
  },
  {
    kind: "paragraph",
    text: "The Atlantic takes its name from the ancient Greek 'Atlantikos Pontos' — the Sea of Atlas — referencing the Titan condemned to hold up the sky at the edge of the world, located at the Atlas Mountains of northwest Africa. The Indian Ocean was named for the Indian subcontinent that forms its northern shore, and was known to ancient Arab, Persian, and South Asian navigators for millennia before European cartographers formalised the name. The Arctic Ocean takes its name from the ancient Greek 'Arktikos' — 'of the bear' — referring to the constellation Ursa Major (the Great Bear) that dominates the northern sky. All four names reflect the perspective of the civilisations that first mapped them rather than any inherent geographic logic.",
  },
  {
    kind: "paragraph",
    text: "The Southern Ocean has a more contested naming history. The concept of a distinctive southern sea circling Antarctica was discussed by European geographers as early as the 1650s, decades before Antarctica itself was sighted. Edmond Halley charted southern waters in 1700. James Cook circumnavigated Antarctica between 1772 and 1775 without actually sighting the continent, demonstrating its insularity. By the early nineteenth century, when Antarctic exploration intensified, most European naval charts recognised a distinct southern ocean. The question was never whether the waters existed but whether they warranted separate official status — a decision that turned out to require another two centuries of institutional negotiation.",
  },
  {
    kind: "image",
    art: "article-world-ocean-map",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/WorldMap-A_non-Frame.png/1280px-WorldMap-A_non-Frame.png",
    caption:
      "The world's five named oceans — Pacific, Atlantic, Indian, Southern, and Arctic — are divisions of a single continuous body of water covering 71 percent of Earth's surface.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "the-iho", text: "The International Hydrographic Organization" },
  {
    kind: "paragraph",
    text: "The body that officially defines ocean boundaries for cartographic purposes is the International Hydrographic Organization (IHO), headquartered in Monaco. Founded in 1919 as the International Hydrographic Bureau, it creates and maintains the world's navigational charts and standardises maritime terminology. Its key publication for ocean definitions is S-23, 'Limits of Oceans and Seas,' first published in 1928. S-23 defines the geographic boundaries of each named ocean and sea for use in official charts. The IHO does not have legislative authority — no international law compels countries to accept its definitions — but its standards are followed by cartographers, navies, academic oceanographers, and geographic publishers worldwide, giving it enormous practical influence over what maps look like.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The IHO was founded in Monaco partly because Prince Albert I of Monaco was an enthusiastic oceanographer who donated the facilities. The Principality has maintained its association with the IHO ever since, hosting its headquarters at the International Hydrographic Bureau in the port of Monaco. It is one of the few international scientific organisations based in a microstate.",
  },

  { kind: "heading", id: "four-ocean-era", text: "The Four-Ocean Era (1953–2000)" },
  {
    kind: "paragraph",
    text: "The original 1928 S-23 publication defined the Southern Ocean as a distinct body of water. The 1937 edition maintained this definition. But the 1953 second edition — driven by a preference among some member states for a cleaner, four-ocean classification — removed the Southern Ocean, redistributing its waters among the Atlantic, Pacific, and Indian Oceans. The four-ocean model became the global cartographic standard for the rest of the twentieth century, taught in schools, printed in atlases, and embedded in navigation training worldwide. Australia, New Zealand, and several other Southern Hemisphere countries continued to recognise five oceans in their national curricula and charts, creating a split in official cartographic practice that persisted for nearly fifty years.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "During the four-ocean era (1953–2000), the southern tip of South America officially 'met' all three southern oceans — the Atlantic to the east of Cape Horn, the Pacific to the west, and by some definitions the Indian beyond that. The Drake Passage, depending on which map you used, was simultaneously part of up to three different oceans.",
  },

  {
    kind: "heading",
    id: "restoration-2021",
    text: "The Southern Ocean's Restoration in 2000 and 2021",
  },
  {
    kind: "paragraph",
    text: "In 2000, the IHO published a draft fourth edition of S-23 that reinstated the Southern Ocean as a distinct body, defined by the 60° south latitude boundary. But the revision required ratification by member states, and disagreements stalled the process. The draft remained unratified for two decades, officially proposed but not formally adopted. During this period, oceanographers consistently treated the Southern Ocean as a separate entity in their research — its distinct water mass properties, circulation patterns, and ecosystem made treating it as part of the other three oceans scientifically awkward — but the cartographic community lacked a formal mandate to change maps.",
  },
  {
    kind: "paragraph",
    text: "The shift in public perception came on 8 June 2021 — World Ocean Day — when the National Geographic Society, whose maps are among the most widely distributed and authoritative in the world, officially recognised the Southern Ocean as the fifth ocean in all its publications and educational materials. The Society cited the scientific consensus that the Antarctic Circumpolar Current creates a genuinely distinct ocean body and noted that its geographers had long informally recognised the Southern Ocean. Five months later, in November 2021, the IHO confirmed that a majority of member states had approved the S-23 revision, formally reinstating the Southern Ocean in international cartographic standards after a 68-year absence.",
  },

  {
    kind: "timeline",
    title: "The Southern Ocean's recognition timeline",
    events: [
      {
        date: "1650s",
        text: "European geographers begin discussing a distinctive southern sea circling Antarctica in navigational literature.",
      },
      {
        date: "1928",
        text: "IHO's first S-23 publication defines the Southern Ocean as a distinct body of water.",
      },
      { date: "1937", text: "IHO second edition maintains Southern Ocean designation." },
      {
        date: "1953",
        text: "Third edition of S-23 removes Southern Ocean; world reverts to four-ocean model for cartographic purposes.",
      },
      {
        date: "2000",
        text: "IHO draft fourth edition reinstates Southern Ocean at 60°S; ratification process stalls for two decades.",
      },
      {
        date: "June 2021",
        text: "National Geographic Society officially adds the Southern Ocean to its maps on World Ocean Day.",
      },
      {
        date: "Nov 2021",
        text: "IHO confirms majority member approval; Southern Ocean formally reinstated in international cartographic standards.",
      },
    ],
  },

  { kind: "heading", id: "circumpolar-current", text: "The Antarctic Circumpolar Current" },
  {
    kind: "paragraph",
    text: "The physical argument for recognising the Southern Ocean as distinct rests on a single extraordinary phenomenon: the Antarctic Circumpolar Current (ACC). The ACC moves approximately 173 Sverdrups of water — 173 million cubic metres per second — in a continuous eastward loop around Antarctica, unimpeded by any land mass. To put this in perspective: it is 100 to 150 times the combined flow of all the world's rivers. No other ocean current comes close. The ACC acts as a wall, separating the cold, nutrient-rich Antarctic waters from the warmer waters of the Atlantic, Pacific, and Indian Oceans. It is this wall, defined by water properties and current rather than by land, that makes the Southern Ocean genuinely distinct in a way that has no parallel anywhere else in global ocean geography.",
  },
  {
    kind: "paragraph",
    text: "The ACC formed approximately 30 million years ago, when South America and the Antarctic Peninsula finally separated, opening the Drake Passage and allowing water to flow continuously around the continent for the first time. Before that separation, Antarctica was connected to South America and did not have its permanent ice sheet — the continent was significantly warmer. The formation of the circumpolar current allowed Antarctic surface waters to cool dramatically, driving the long-term Cenozoic cooling trend that culminated in the Ice Ages and shaped the modern world's climate. The Drake Passage, at roughly 800 kilometres wide, is the narrowest chokepoint the current must navigate.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The Drake Passage between the southern tip of South America and the Antarctic Peninsula is just 800 km wide — but all 173 Sverdrups of the Antarctic Circumpolar Current must pass through it. This makes the Drake Passage one of the most turbulent and challenging maritime crossings in the world, with waves frequently exceeding 10 metres.",
  },

  { kind: "heading", id: "boundary-60-south", text: "The Boundary at 60° South" },
  {
    kind: "paragraph",
    text: "The working definition of the Southern Ocean's northern boundary is 60° south latitude — a fixed line chosen for administrative practicality because it corresponds roughly to the northern edge of the Antarctic Treaty area (1959) and to the approximate position of the Antarctic Polar Front, where cold Antarctic surface water meets warmer sub-Antarctic water and sinks beneath it. The Polar Front, also called the Antarctic Convergence, is a dynamic feature: it migrates seasonally between about 48° and 61° south. Using the Polar Front as a dynamic boundary would require maps to be updated seasonally, which is impractical; 60° south is a stable proxy that captures the essential distinction.",
  },

  {
    kind: "sizeComparison",
    title: "The five oceans by area",
    items: [
      { label: "Pacific Ocean", areaKm2: 165_250_000 },
      { label: "Atlantic Ocean", areaKm2: 106_460_000 },
      { label: "Indian Ocean", areaKm2: 70_560_000 },
      { label: "Southern Ocean", areaKm2: 21_960_000 },
      { label: "Arctic Ocean", areaKm2: 14_060_000 },
    ],
  },

  { kind: "heading", id: "depth-records", text: "Five Oceans: Depths and Key Statistics" },
  {
    kind: "facts",
    title: "Deepest points by ocean",
    facts: [
      { label: "Pacific — Challenger Deep (Mariana Trench)", value: "10,935 m" },
      { label: "Southern — South Sandwich Trench", value: "8,428 m" },
      { label: "Atlantic — Puerto Rico Trench", value: "8,376 m" },
      { label: "Indian — Java Trench", value: "7,729 m" },
      { label: "Arctic — Molloy Deep", value: "5,607 m" },
    ],
  },
  {
    kind: "table",
    title: "The five oceans: key comparative data (2024)",
    columns: [
      "Ocean",
      "Area (km²)",
      "Avg Depth (m)",
      "Deepest Point",
      "% of World Ocean",
      "Distinctive Feature",
    ],
    rows: [
      [
        "Pacific",
        "165,250,000",
        "4,080",
        "Challenger Deep (10,935 m)",
        "46.0%",
        "Largest; Ring of Fire; most Pacific islands",
      ],
      [
        "Atlantic",
        "106,460,000",
        "3,332",
        "Puerto Rico Trench (8,376 m)",
        "29.6%",
        "S-shaped; major hurricane corridor; AMOC conveyor",
      ],
      [
        "Indian",
        "70,560,000",
        "3,890",
        "Java Trench (7,729 m)",
        "19.6%",
        "Monsoon-dominated; Persian Gulf oil routes",
      ],
      [
        "Southern",
        "21,960,000",
        "3,270",
        "South Sandwich Trench (8,428 m)",
        "6.1%",
        "Circumpolar current; largest carbon/heat sink per area",
      ],
      [
        "Arctic",
        "14,060,000",
        "1,205",
        "Molloy Deep (5,607 m)",
        "3.9%",
        "Shallowest; sea ice cover; fastest warming ocean",
      ],
    ],
  },
  {
    kind: "image",
    art: "article-southern-ocean-icebergs",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/29/Iceberg_in_the_Southern_Ocean.jpg/1280px-Iceberg_in_the_Southern_Ocean.jpg",
    caption:
      "Icebergs in the Southern Ocean — the largest icebergs on Earth calve from Antarctica and are carried north by the Circumpolar Current before gradually melting.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "temperature-salinity", text: "Ocean Temperature and Salinity" },
  {
    kind: "paragraph",
    text: "Each ocean has a distinct temperature and salinity signature that reflects its geography and circulation patterns. The Pacific is the largest and deepest, with surface temperatures ranging from near-freezing in the far north and south to over 30°C in the equatorial western Pacific — the 'warm pool' that drives much of global weather through the El Niño–Southern Oscillation (ENSO). The Atlantic is slightly saltier than average because water evaporates rapidly from its tropical reaches and is not replaced by major river input in the same way the Pacific is. The Mediterranean Sea, connected to the Atlantic through the Strait of Gibraltar, produces a distinctive outflow of warm, salty water that flows along the Atlantic seafloor for thousands of kilometres before mixing.",
  },
  {
    kind: "paragraph",
    text: "The Indian Ocean is unique among the five in being completely closed to the north by the Asian continent — it has no Arctic connection. This means its circulation is fundamentally different: rather than a closed gyre, its surface currents reverse seasonally with the South Asian monsoon, driven by the alternating heating and cooling of the Asian land mass. The Southern Ocean is the coldest and richest in nutrients, its upwelling zones bringing deep, mineral-rich water to the surface to fuel phytoplankton blooms. The Arctic Ocean, the shallowest and smallest, is dominated by freshwater inputs from Siberian and North American rivers, and by the seasonal melting and freezing of sea ice — a process that is now accelerating under climate warming.",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "The Atlantic Ocean is the saltiest of the five, with an average surface salinity of about 37 parts per thousand (ppt). The Arctic is the least salty at about 30 ppt, diluted by freshwater from river input and ice melt. The global ocean average is approximately 35 ppt.",
  },

  {
    kind: "heading",
    id: "thermohaline",
    text: "The Thermohaline Circulation: The Ocean Conveyor Belt",
  },
  {
    kind: "paragraph",
    text: "The thermohaline circulation, sometimes called the ocean conveyor belt or the Global Ocean Conveyor, is a system of deep ocean currents driven by differences in water temperature (thermo) and salinity (haline). Cold, dense, salty water sinks in the North Atlantic near Greenland and Iceland, initiating a deep-water flow that travels south through the Atlantic, around Africa, into the Indian Ocean, into the Pacific, and eventually returns — warmed and less dense — through the surface Atlantic as the Gulf Stream. The complete circuit takes roughly 1,000 years. Without this circulation, the North Atlantic and Europe would be significantly colder — the Gulf Stream delivers the equivalent of about one million power stations' worth of heat to Europe annually.",
  },
  {
    kind: "paragraph",
    text: "The Atlantic Meridional Overturning Circulation (AMOC) — the Atlantic component of this conveyor — has been weakening. Studies published in 2021 and 2023 using proxy data from sediments and instrumental records suggest the AMOC is at its weakest state in at least 1,000 years, likely due to the influx of cold freshwater from melting Greenland ice diluting the salty, dense water that drives the downwelling. A significant slowdown would paradoxically cool Western Europe even as the rest of the world warms — a counterintuitive outcome of a warming climate that climate models have been projecting for decades. The full collapse of the AMOC remains a scenario of debate among climate scientists, with most current models considering it unlikely before 2100 but not impossible.",
  },
  {
    kind: "image",
    art: "article-thermohaline-circulation",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Thermohaline_Circulation_2.png/1280px-Thermohaline_Circulation_2.png",
    caption:
      "The thermohaline circulation (global ocean conveyor belt) — connecting all five oceans, it distributes heat across the planet and drives climate patterns on every continent.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "ecosystem", text: "The Southern Ocean Ecosystem" },
  {
    kind: "paragraph",
    text: "Antarctic krill (Euphausia superba) are tiny crustaceans roughly 6 centimetres long that exist in swarms so dense they can be detected by satellite as red patches across the ocean surface. They are the foundation of the Southern Ocean food web: penguins, crabeater seals, leopard seals, Antarctic toothfish, albatrosses, and baleen whales — including the blue whale, the largest animal ever to have lived — all depend on krill as a primary food source. The Southern Ocean produces an estimated 379 million tonnes of krill annually, making it the largest biomass of any single animal species on the planet. Krill feed on phytoplankton that bloom in the nutrient-rich upwellings around the circumpolar current; as ocean warming and acidification alter the phytoplankton base and sea ice availability that krill use for shelter and early-stage feeding, the consequences cascade upward through the entire food web.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Antarctica's ice sheet holds approximately 26.5 million cubic kilometres of ice — about 70 percent of the world's fresh water. If it melted entirely, global sea levels would rise by approximately 58 metres. Even a partial collapse of the West Antarctic Ice Sheet — considered by glaciologists to be at risk of irreversible instability — could raise sea levels by 3 to 5 metres over centuries.",
  },

  { kind: "heading", id: "acidification", text: "Ocean Acidification" },
  {
    kind: "paragraph",
    text: "Since the beginning of the industrial era, the world's oceans have absorbed approximately 30 percent of anthropogenic CO₂ emissions — a process that has slowed atmospheric warming but fundamentally altered ocean chemistry. When CO₂ dissolves in seawater, it forms carbonic acid, lowering the pH of the ocean. Since 1750, average ocean pH has dropped from 8.2 to 8.1 — a seemingly small change that represents a 30 percent increase in hydrogen ion concentration. Shell-forming organisms — corals, molluscs, sea urchins, certain plankton — depend on carbonate ions to build their structures; acidification reduces carbonate availability and weakens or dissolves these structures. The Southern Ocean is both the ocean that absorbs the most CO₂ per unit area and the most vulnerable to acidification, because cold water absorbs CO₂ more readily and already has lower natural carbonate levels.",
  },
  {
    kind: "paragraph",
    text: "The consequences for marine biodiversity are severe and already measurable. The pteropod — a tiny swimming sea snail that forms shells of aragonite, one of the most acid-sensitive forms of calcium carbonate — has been found in the Southern Ocean with visibly dissolving shells. Pteropods are a key food source for salmon, herring, whales, and seabirds; their decline would propagate throughout the food web. The Great Barrier Reef has experienced four mass bleaching events since 2016, driven by marine heatwaves that push coral beyond their thermal tolerance — and bleached corals are less able to calcify and recover under acidified conditions. Acidification and warming act as compounding stressors, and their combined effect is projected to render many current reef locations uninhabitable for reef-building corals by mid-century.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The Southern Ocean absorbs approximately 40 percent of all CO₂ taken up by the world's oceans each year, despite covering only 6 percent of ocean area. It also absorbs about 75 percent of the ocean's heat uptake from anthropogenic warming — making it the most important thermal and chemical buffer for the global climate, and the ocean most visibly showing the effects of that absorption.",
  },

  { kind: "heading", id: "plastic-pollution", text: "Plastic Pollution by Ocean" },
  {
    kind: "paragraph",
    text: "The ocean's gyre systems — large rotating current systems driven by wind and Coriolis force — concentrate floating plastic waste in five major accumulation zones. The Great Pacific Garbage Patch, located between Hawaii and California in the North Pacific Gyre, is the largest, estimated at around 1.6 million square kilometres — roughly twice the size of Texas — and containing an estimated 80,000 tonnes of plastic. The patches are not solid islands of waste; they are regions of elevated microplastic concentration where plastic fragments, broken down by UV radiation and wave action, float suspended in the upper water column. Fishing line, bottles, packaging, fibres from synthetic clothing, and nurdles (pre-production plastic pellets) all contribute. Five main gyres accumulate plastic: North Pacific, South Pacific, North Atlantic, South Atlantic, and Indian Ocean.",
  },
  {
    kind: "paragraph",
    text: "The Southern Ocean, long considered pristine because of its remoteness, has been found to contain significant microplastic concentrations. Samples taken from the far south — areas rarely visited by commercial shipping or fishing vessels — contain microplastics at densities higher than many closer-to-shore ocean regions. The source is partly long-range atmospheric transport, partly ocean circulation bringing material from the north, and partly the growing fisheries industry in southern waters. Krill have been found with microplastics in their digestive systems, which suggests the contamination is entering the food web at its most fundamental level. The irony that the ocean defined by its remoteness and ecological integrity is found to be contaminated by distant human activity is a stark illustration of how interconnected the global ocean is.",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "An estimated 8 million tonnes of plastic enter the ocean each year — equivalent to dumping a rubbish truck's worth every minute. Of the roughly 150 million tonnes of plastic already in the ocean, around 70 percent has sunk to the seafloor. The Great Pacific Garbage Patch alone contains an estimated 1.8 trillion pieces of plastic.",
  },

  { kind: "heading", id: "why-fifth-matters", text: "Why a Fifth Ocean Matters Scientifically" },
  {
    kind: "paragraph",
    text: "Naming matters for protection. The Commission for the Conservation of Antarctic Marine Living Resources (CCAMLR), established in 1982, manages fishing and conservation in the Southern Ocean specifically because its waters are ecologically distinct and politically sensitive under the Antarctic Treaty system. With formal recognition of the Southern Ocean as a fifth ocean, its conservation status becomes easier to communicate, monitor, and enforce. Marine Protected Areas (MPAs) in the Southern Ocean — including the Ross Sea MPA, established in 2016 as the world's largest MPA at that time — are defined by coordinates in what is now unambiguously the Southern Ocean, making their boundaries legally and cartographically clear. The krill fishery, increasingly commercially significant, is regulated by CCAMLR catch limits that are periodically updated based on stock assessments of what is now formally 'Southern Ocean' krill.",
  },
  {
    kind: "paragraph",
    text: "Scientific monitoring is also directly affected. Oceanographers and climate scientists model the world's ocean systems using defined geographic regions; treating Southern Ocean waters as extensions of the Atlantic, Pacific, and Indian made model domains awkward and database conventions inconsistent. With formal recognition, research programmes, data archives, and international scientific collaboration on Southern Ocean-specific phenomena — thermohaline overturn, sea ice dynamics, carbon flux, krill ecology — can operate from shared geographic definitions. The boundary at 60° south is now the same line on every map, in every database, and in every climate model, which makes comparison and synthesis across research teams significantly more straightforward.",
  },

  { kind: "heading", id: "roaring-forties", text: "Navigation and the Roaring Forties" },
  {
    kind: "paragraph",
    text: "The Southern Ocean's uninterrupted wind fetch — no land mass at any longitude to slow or redirect the westerlies — produces the most consistently violent sea conditions on Earth. Sailors named the latitude bands: the Roaring Forties (40°–50° south), the Furious Fifties (50°–60°), and the Screaming Sixties (60°–70°). For the sailing ships of the nineteenth century following the Clipper Route from Europe to Australia and back, these latitudes offered the fastest passage — wind and current pushing ships eastward at great speed — at the price of extreme danger from wave heights that regularly exceeded 10 metres and storm systems that formed and intensified without warning. The same conditions make the Southern Ocean inhospitable to regular commercial shipping today. Vessels bound for Antarctica from South America still face some of the roughest crossings in global navigation.",
  },
  {
    kind: "image",
    art: "article-southern-ocean-storm",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Southern_Ocean_storm.jpg/1280px-Southern_Ocean_storm.jpg",
    caption:
      "A storm system over the Southern Ocean — with no land to interrupt the westerly winds at any longitude, wave heights regularly exceed 10 metres and storms form rapidly.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "arctic-ocean", text: "The Arctic Ocean: The Shallowest and Smallest" },
  {
    kind: "paragraph",
    text: "The Arctic Ocean is the world's smallest and shallowest ocean, with an average depth of just 1,205 metres compared to the Pacific's 4,080 metres. Its most distinctive feature is seasonal sea ice cover, which historically reached a maximum winter extent of roughly 15 million square kilometres before shrinking to a minimum of 6–7 million in late summer. Since satellite records began in 1979, September sea ice extent has declined by approximately 13 percent per decade. The Arctic is warming two to three times faster than the global average — a phenomenon called Arctic amplification — driven by the ice-albedo feedback loop: as ice melts, it exposes darker ocean water that absorbs more solar radiation, causing further warming and further melting. By the 2030s or 2040s, the Arctic Ocean is expected to experience ice-free summers for the first time in recorded human history.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The Arctic Ocean is the only ocean that freezes over in winter. It is also the only ocean that is almost entirely surrounded by land — the continents of North America, Europe, and Asia ring it from almost every direction, and it connects to the Pacific only through the narrow Bering Strait (85 km wide) and to the Atlantic through the wider Greenland-Iceland-Norwegian passage.",
  },

  { kind: "heading", id: "four-vs-five", text: "Four-Ocean World vs. Five-Ocean World" },
  {
    kind: "dualCompare",
    title: "What changed when the Southern Ocean was recognised",
    leftTitle: "Four-Ocean World",
    leftItems: [
      "Southern waters divided among Atlantic, Pacific, and Indian Oceans.",
      "No unified legal or scientific boundary for Antarctic marine systems.",
      "Cartographers used different southern boundary lines in different maps.",
      "Antarctic Circumpolar Current split across three official ocean bodies.",
      "Conservation programmes lacked a single agreed-upon regional identity.",
      "Students learned that water south of 60°S was simply the southern tip of other oceans.",
    ],
    rightTitle: "Five-Ocean World",
    rightItems: [
      "Southern Ocean defined at 60°S, giving a clear, consistent boundary.",
      "Unified identity for CCAMLR conservation management and marine law.",
      "All maps, databases, and models share the same Southern Ocean definition.",
      "Antarctic Circumpolar Current is fully contained within one ocean body.",
      "Krill fishery, MPAs, and climate research have a shared geographic framework.",
      "Recognition aligns official cartography with what oceanographers always knew.",
    ],
  },

  {
    kind: "heading",
    id: "ocean-conservation",
    text: "Ocean Conservation and the High Seas Treaty",
  },
  {
    kind: "paragraph",
    text: "In March 2023, after nearly two decades of negotiation, the United Nations reached agreement on the High Seas Treaty — officially the Treaty on the High Seas (Agreement Under UNCLOS) — which for the first time creates a legal framework for creating Marine Protected Areas in international waters. This is significant because approximately 64 percent of the ocean lies beyond national jurisdiction, in the high seas, where fishing, mining, and shipping have previously been subject only to fragmented sectoral agreements rather than a unified conservation instrument. The Southern Ocean is particularly relevant: vast areas of its waters are beyond any national jurisdiction, and the krill fishery that operates there is one of the most commercially significant high-seas fisheries in the world. Full ratification and implementation of the High Seas Treaty would give the Southern Ocean's MPA network a legal basis that extends beyond the Antarctic Treaty system.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The five-ocean framework is not just cartographic tidiness — it has direct consequences for conservation, science, and international law. Naming the Southern Ocean separately makes it easier to protect, study, and regulate, because it gives a distinct geographic identity to water bodies that are genuinely distinct in their physical properties, ecology, and environmental role.",
  },

  ...editorialClosing({
    conclusion:
      "The Southern Ocean's formal recognition in 2021 was less a discovery than a long-overdue cartographic revision. Oceanographers had understood the circumpolar current's defining role for over a century; the delay was institutional inertia and cartographic convention reinforced by the 1953 IHO decision. What the recognition underlines is that ocean classification is a human system applied to a continuous body of water, and the Southern Ocean's distinctiveness — defined by current rather than by land — is a useful reminder that geography's categories are sometimes imposed on nature rather than read from it. The ocean does not care what we call it; the naming decision matters for how well we protect what it contains.",
    remember:
      "The Southern Ocean was formally recognised by National Geographic and the IHO in 2021. Its boundary is 60° south latitude. The Antarctic Circumpolar Current — the world's largest by volume transport (173 Sverdrups) — defines it oceanographically. It is the most important carbon and heat sink per unit area of any ocean.",
    quizTopic: "oceans and marine geography",
  }),

  {
    kind: "crossLinks",
    title: "Related articles",
    links: [
      {
        label: "The Nile and the Amazon: which is longest?",
        href: "/geolibrary/article/the-nile-and-the-amazon",
        description: "River systems that ultimately flow into the Southern and other oceans.",
      },
      {
        label: "How the Himalayas keep growing",
        href: "/geolibrary/article/how-the-himalayas-keep-growing",
        description:
          "Tectonic processes that also shaped the Southern Ocean's formation via continental separation.",
      },
      {
        label: "Megacities and the limits of growth",
        href: "/geolibrary/article/megacities-and-the-limits-of-growth",
        description:
          "Sea-level rise from Southern Ocean ice melt processes directly threatens coastal megacities.",
      },
    ],
  },
];
