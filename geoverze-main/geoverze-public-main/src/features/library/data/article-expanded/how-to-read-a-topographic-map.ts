import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "A topographic map tells you not just where you are, but what the ground will do to your body when you walk it. It tells you whether the next kilometre is a gentle meadow or a cliff face, whether the stream you see on the map is flowing toward you or away, and whether the hillside you plan to descend has a cliff band halfway down that no satellite photograph would reveal. Topographic maps are the most information-dense two-dimensional representation of landscape ever devised — a skilled reader can extract terrain shape, slope angle, drainage direction, and approximate walking time from a well-made sheet. The core of it all comes down to one elegant rule: a contour line connects every point at the same elevation.",
  },

  { kind: "heading", id: "what-a-topo-map-is", text: "What a topographic map is" },
  {
    kind: "paragraph",
    text: "A topographic map is a two-dimensional representation of a three-dimensional landscape. Unlike a political map, which shows administrative boundaries and city names, or a satellite image, which shows reflected light from the surface, a topographic map encodes the shape of the land itself — its height, its slope, its drainage. The challenge is simple to state and the solution elegant: draw a line connecting every point on the ground that shares the same elevation. Repeat at regular vertical intervals. The result is a contour map. The technique emerged from military surveying in the 18th century — armies needed to know where cavalry could charge and where artillery could fire — and became formalised in the great national survey programmes of the 19th century: France's Carte de France (begun 1750), the British Ordnance Survey (founded 1791), and the Survey of India (begun 1802).",
  },
  {
    kind: "image",
    art: "article-topographic-map-example",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ae/Topographic_map_example.png/800px-Topographic_map_example.png",
    caption:
      "A standard topographic map excerpt — concentric loops for hills, V-shapes for valleys, densely packed lines for steep faces, and wide spacing for gentle slopes.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "A topographic map differs from a satellite image in one crucial way: it encodes invisible information. A satellite image shows surface texture and colour. A topographic map shows elevation — a third dimension that no photograph captures. LiDAR and terrain models can now generate contour maps automatically from aerial data, but the underlying principle — joining equal-elevation points — is unchanged from 1750.",
  },

  {
    kind: "heading",
    id: "the-contour-line",
    text: "The contour line: one rule that generates everything",
  },
  {
    kind: "paragraph",
    text: "A contour line is an isoline — a line of constant value. On a topographic map, that value is elevation above sea level (or above a defined datum). Three rules govern contour lines absolutely. First: they never cross. If two lines shared a point, that point would be simultaneously at two different elevations — physically impossible. Second: they never branch. Third: they always form closed loops somewhere in the world, because any ridge or valley, followed far enough, returns to its starting point. These three rules mean that all the terrain complexity you can see on a topographic map — summits, valleys, ridges, cliffs, saddles, hollows — is generated entirely by how closed loops of equal elevation arrange themselves relative to each other.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The three absolute rules of contour lines: (1) they never cross; (2) they never branch or split; (3) they always form closed loops, either within the map or beyond its edge. Every terrain feature — hill, valley, cliff, saddle — is produced by how these loops are spaced and shaped.",
  },

  {
    kind: "heading",
    id: "contour-interval",
    text: "Contour interval: reading the map's vertical resolution",
  },
  {
    kind: "paragraph",
    text: "The contour interval is the vertical distance between adjacent contour lines. It is fixed for a given map sheet and stated in the legend. Common intervals are 5 m for very flat country, 10 m for gently rolling terrain, 20 m for hilly landscapes, and 40 m or more for mountainous areas. The choice of interval reflects a compromise between detail and legibility: too small an interval on steep ground produces a sheet so densely lined it becomes unreadable; too large an interval on flat ground misses gentle features entirely. Every fifth contour line — at five times the contour interval — is drawn thicker and labelled with its elevation value. These are index contours, and they are the lines from which you read elevations directly. A point on an index contour labelled 300 m is at exactly 300 m; a point on the next unlabelled line above it (if the interval is 10 m) is at 310 m.",
  },
  {
    kind: "facts",
    title: "Topographic map essentials",
    facts: [
      {
        label: "Standard hiking interval (UK OS 1:25,000)",
        value: "10 m between contours; index contour every 50 m",
      },
      {
        label: "Standard hiking interval (USGS 1:24,000)",
        value: "20 ft (~6 m) in flat terrain; 40 ft (~12 m) in hilly terrain",
      },
      {
        label: "Index contour frequency",
        value: "Every 5th contour line — darker, labelled with elevation",
      },
      {
        label: "Form lines (dashed contours)",
        value: "Approximate or uncertain elevation — used where survey data is sparse",
      },
      {
        label: "Hachured contour",
        value:
          "Depression (closed low, like a volcanic crater or sinkhole) — tick marks point inward",
      },
      {
        label: "Grid square on OS 1:25,000",
        value: "1 km × 1 km (represented as 4 cm × 4 cm on paper)",
      },
    ],
  },

  { kind: "heading", id: "reading-slope", text: "Reading slope from contour spacing" },
  {
    kind: "paragraph",
    text: "Contour spacing tells you slope angle directly. Closely spaced contours mean a steep slope — the same elevation change packed into less horizontal distance. Widely spaced contours mean a gentle slope. Parallel, equally-spaced contours indicate a uniform slope — you are walking at a constant gradient. Contours that are tightly packed near the top and spread out lower down indicate a cliff above a gentle apron — a common pattern in glacially eroded mountains. Contours that are widely spaced at first and then suddenly closely packed indicate a gradual approach to a sharp drop. If contours merge so closely that they become a single thick line, you are looking at a cliff face that the standard interval cannot resolve — the map is telling you the terrain drops faster than the interval can capture.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The slope angle rule: the closer together the contour lines, the steeper the ground. When contours nearly touch or merge, the ground is essentially vertical. When contours are widely spaced — separated by centimetres on a 1:25,000 map — you are looking at nearly flat terrain. This is the single most useful skill for terrain assessment before a walk.",
  },

  { kind: "heading", id: "reading-water", text: "Reading water features on a topographic map" },
  {
    kind: "paragraph",
    text: "Rivers and streams shown in blue provide a cross-check on topography. A river always flows in a valley — a depression in the landscape — and contour lines must reflect this. When contours cross a river, they form a V-shape pointing upstream (toward higher elevation), because the valley walls are higher than the riverbed. This V-tip-upstream rule is one of the most reliable diagnostic patterns on any topographic map. To distinguish a valley (V points upstream, toward higher numbers) from a ridge (contours form a V pointing downstream, toward lower numbers), check which direction the V opens: toward the higher contours or the lower ones. Valleys open toward the lower terrain; ridges open toward the higher terrain. Meanders — large river bends — on a flat floodplain appear as widely spaced, gently curved contours, confirming a low-gradient, low-energy river.",
  },
  {
    kind: "image",
    art: "article-contour-valley-ridge",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Contour-lines-ridge-and-valley.png/800px-Contour-lines-ridge-and-valley.png",
    caption:
      "Contour V-shapes showing ridge (V opens toward higher ground) and valley (V tip points toward higher ground, upstream) — the essential diagnostic pair for terrain reading.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The V-points-upstream rule has one reliable exception: meanders on flat floodplains produce very gently curved contours rather than sharp V-shapes, because the valley is extremely wide relative to the channel. On flat terrain with a contour interval of 10 m, a river may be visible in blue without any visible contour deformation — the elevation change is too gradual for the interval to capture.",
  },

  { kind: "heading", id: "benchmarks", text: "Benchmarks and spot heights" },
  {
    kind: "paragraph",
    text: "Contour lines give approximate elevations — a point between two contours could be anywhere in the interval range. Spot heights provide precisely surveyed elevation values at specific points, shown as a dot or triangle with a number. Benchmarks (BMs) are physical markers cut into permanent structures — walls, bridge abutments, stone posts — and marked on Ordnance Survey maps with a small triangle symbol. The UK's Ordnance Survey established its network of 500,000 benchmarks over the 19th and 20th centuries, all tied to the Newlyn tidal gauge in Cornwall, which defines Ordnance Datum — the sea level reference for the entire country. Triangulation pillars (trig points) are the most visible form of benchmark: concrete pillars on hilltops, used in the original triangulation surveys, now largely superseded by GPS but retained on maps as useful navigation references.",
  },
  {
    kind: "image",
    art: "article-trig-point-pillar",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Trig_point_on_Mynydd_Mawr.jpg/800px-Trig_point_on_Mynydd_Mawr.jpg",
    caption:
      "A UK Ordnance Survey triangulation pillar — one of roughly 6,500 trig points placed on hilltops across Britain to establish the national survey network from the 1930s onward.",
    credit: "Wikimedia Commons / CC BY-SA 2.0",
  },

  { kind: "heading", id: "index-contours", text: "Index contours and form lines" },
  {
    kind: "paragraph",
    text: "Index contours are the thicker, labelled contour lines that appear every fifth contour interval. They allow rapid elevation reading without counting every line from a known point. On a 10 m interval map, index contours appear every 50 m: 100, 150, 200, 250 m and so on. On a 20 m interval map, they appear every 100 m. Reading elevation involves finding the nearest index contour below your point, counting up the number of unlabelled contours between it and your position, and multiplying by the contour interval. Form lines are dashed contours used in areas where the survey data is uncertain or the terrain too complex to represent accurately at the standard interval. They indicate that the exact elevation should be treated as approximate.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The Ordnance Survey's 1:25,000 Explorer maps use a 10 m contour interval with index contours every 50 m. On the 1:50,000 Landranger maps, the interval is also 10 m but the reduced scale makes contours appear more closely spaced for the same terrain. The USGS 7.5-minute topographic series uses a 10 ft (3 m) interval for flat areas and 40 ft (12 m) for mountainous terrain.",
  },

  { kind: "heading", id: "reading-summit", text: "Reading a summit" },
  {
    kind: "paragraph",
    text: "A summit appears on a topographic map as a series of nested closed ovals or loops, each loop representing a contour interval below the one inside it. The innermost, smallest loop marks the summit — or rather, the approximate zone of the summit. If a spot height is printed at the centre, that is the precisely surveyed height. If not, the summit lies somewhere within the innermost contour band, within one interval of the last labelled line. The shape of the loops reveals the summit's character: perfectly circular loops indicate a symmetrical cone; elongated loops indicate a ridge; closely spaced loops on one side indicate that the summit has a steep face on that side; widely spaced loops on the other side indicate a gentler approach.",
  },

  { kind: "heading", id: "reading-valley", text: "Reading a valley: U-shapes vs V-shapes" },
  {
    kind: "paragraph",
    text: "Valley cross-sections are one of the most geographically informative features on a topographic map. V-shaped valleys — where contours form tight V-shapes pointing upstream — indicate river-cut terrain, where the river has cut downward faster than the valley walls have eroded sideways. The narrowness indicates either a fast-cutting river in resistant rock, or a young landscape that has not had time to widen. U-shaped valleys — where contours form broad, open curves on either side of a flat valley floor — indicate glacial erosion. Glaciers erode through abrasion rather than the downward cutting of rivers, producing wide, flat-bottomed valleys with steep walls. The presence of U-shaped valleys on a topographic map tells you the landscape was glaciated during the last ice age, even if no glacier is present today.",
  },
  {
    kind: "dualCompare",
    title: "V-shaped vs. U-shaped valleys",
    leftTitle: "V-shaped valley (river-cut)",
    leftItems: [
      "Narrow, pointed base; steep sides",
      "Contours form tight V-shapes pointing upstream",
      "Formed by river downcutting in resistant rock",
      "Common in upland Britain, Appalachians, young mountain ranges",
      "Stream or river runs at the very bottom of the V",
    ],
    rightTitle: "U-shaped valley (glacial)",
    rightItems: [
      "Wide, flat base; steep, truncated spurs on sides",
      "Contours form broad open curves around a wide flat floor",
      "Formed by glacial erosion — abrasion and plucking",
      "Common in Alps, Rockies, Scottish Highlands, Scandinavia",
      "Often contains a lake (ribbon lake) or river misfit for the valley size",
    ],
  },

  { kind: "heading", id: "grid-references", text: "Grid references: locating any point precisely" },
  {
    kind: "paragraph",
    text: "Most topographic maps are overprinted with a grid — evenly spaced lines running east-west (eastings) and north-south (northings), dividing the map into squares. In the UK National Grid system, each grid square is 1 km × 1 km at the 1:25,000 scale, labelled with a two-letter prefix and numbered coordinates. A four-figure grid reference (e.g., SH7156) identifies a 1 km square. A six-figure grid reference (e.g., SH712563) identifies a 100 m square within that. A full eight-figure reference identifies a 10 m square — precise enough for a single building. The Universal Transverse Mercator (UTM) system used internationally divides the world into 60 zones and provides a similar coordinate system. Both systems require the same reading skill: eastings first, northings second — remembered by 'along the corridor, then up the stairs'.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The UK National Grid is entirely artificial: its origin point — the false origin — is an imaginary point southwest of the Isles of Scilly, chosen so that all grid coordinates across Britain are positive numbers. The true origin (0,0) is in the English Channel. This prevents negative coordinates anywhere on the British mainland.",
  },

  {
    kind: "heading",
    id: "magnetic-declination",
    text: "Magnetic declination: the compass correction",
  },
  {
    kind: "paragraph",
    text: "A compass needle points toward magnetic north — the location of the Earth's magnetic pole, which currently sits in northern Canada and drifts by roughly 50 km per year. Grid north is the direction of the map's vertical grid lines, which point toward the geographic North Pole only along specific meridians. The difference between magnetic north and grid north at a given location is magnetic declination (sometimes called magnetic variation). In western Europe, magnetic declination is currently a few degrees east — meaning magnetic north is slightly east of grid north, and a compass bearing must be adjusted accordingly. In eastern North America, magnetic declination is several degrees west. The error introduced by ignoring declination is approximately 9 m per 100 m of travel per degree of error — small over a field, significant over a mountain range.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Magnetic declination changes over time as the Earth's magnetic pole drifts. Maps more than ten years old may have declination values that are now incorrect by several degrees. In the UK, magnetic declination has been decreasing steadily — in 2024 it is approximately 0.5°W in southern England and about 2.5°W in Scotland. Always check the map's print date and use current declination data from the British Geological Survey or NOAA.",
  },

  { kind: "heading", id: "scale", text: "Scale: choosing the right map for the task" },
  {
    kind: "paragraph",
    text: "Map scale is the ratio of distance on paper to distance on the ground. A 1:25,000 map represents 25,000 cm of ground in every 1 cm on paper — meaning 1 cm = 250 m. A 1:50,000 map covers twice the ground in the same paper area but at half the detail. The choice of scale depends entirely on the task. Walkers and hillwalkers use 1:25,000 (the OS Explorer series) — detailed enough to show individual field boundaries, footpaths, and buildings. Mountain routes, military planning, and detailed off-road navigation use 1:25,000 or the tactical 1:50,000. Cycling and driving use 1:150,000 or 1:250,000. Strategic planning and overview mapping use 1:500,000 or smaller. A useful mnemonic for the OS Explorer 1:25,000: one grid square (4 cm on paper) is exactly 1 km of ground.",
  },
  {
    kind: "facts",
    title: "Map scale practical reference",
    facts: [
      {
        label: "1:25,000 (OS Explorer)",
        value: "1 cm = 250 m; 4 cm grid square = 1 km; best for walking, hiking",
      },
      {
        label: "1:50,000 (OS Landranger)",
        value: "1 cm = 500 m; 2 cm grid square = 1 km; walking, cycling, military",
      },
      { label: "1:100,000", value: "1 cm = 1 km; overview planning, cycle touring" },
      { label: "1:250,000 (OS Road)", value: "1 cm = 2.5 km; road driving, regional overview" },
      { label: "1:1,000,000 (ICAO air chart)", value: "1 cm = 10 km; aviation sectional charts" },
      {
        label: "1:24,000 (USGS 7.5-minute)",
        value: "1 inch = 2,000 ft; US standard hiking/survey scale",
      },
    ],
  },
  {
    kind: "image",
    art: "article-os-map-landranger",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/OS_OpenData_Landranger_style_map.jpg/1280px-OS_OpenData_Landranger_style_map.jpg",
    caption:
      "UK Ordnance Survey 1:50,000 Landranger-style map — one of the world's most recognisable and widely used topographic map traditions, in continuous production since the 1940s.",
    credit: "Wikimedia Commons / OGL v3.0",
  },

  { kind: "heading", id: "conventional-symbols", text: "Conventional symbols: the map's alphabet" },
  {
    kind: "paragraph",
    text: "Topographic maps use standardised symbols that vary by country but follow recognisable conventions. Blue encodes water: rivers, lakes, streams, marshland. Green encodes vegetation: woodland, orchards, scrub. Black encodes constructed features: buildings, roads, walls, power lines, railways. Brown encodes natural terrain: contour lines, sand, rock faces. Red or magenta often highlights primary roads or administrative boundaries. The key or legend, always printed on the map sheet, provides the full vocabulary. Spot heights are shown as dots or crosses with elevation numbers. Triangulation pillars appear as small triangles. Churches with towers appear differently from those with spires. Public footpaths, bridleways, and restricted byways each have distinct symbols on UK OS maps — important for access rights.",
  },
  {
    kind: "table",
    title: "Common topographic map symbols",
    columns: ["Symbol / convention", "Meaning", "Typical colour"],
    rows: [
      ["Closely packed brown lines", "Steep slope or cliff face", "Brown"],
      ["Concentric closed brown ovals", "Hill or summit", "Brown"],
      ["V-shapes in contours pointing uphill", "Valley or stream course", "Brown"],
      ["Hachured closed contour (tick marks inward)", "Depression or hollow", "Brown"],
      ["Blue line (solid)", "River or stream", "Blue"],
      ["Blue irregular shapes", "Lake, reservoir, or pond", "Blue"],
      ["Blue cross-hatching or reeds symbol", "Marsh or wetland", "Blue"],
      ["Green filled area", "Woodland or forest", "Green"],
      ["Black solid square", "Building or structure", "Black"],
      ["Black dashed line", "Footpath (public right of way)", "Black"],
      ["Black thicker line (double)", "Metalled road", "Black/red"],
      ["Small triangle with dot", "Triangulation pillar (trig point)", "Black"],
    ],
  },

  { kind: "heading", id: "relief-shading", text: "Relief shading: the intuitive layer" },
  {
    kind: "paragraph",
    text: "Contour lines show elevation precisely but require training to interpret intuitively. Relief shading — or hillshading — adds a visual layer that untrained readers interpret immediately. The technique assumes an imaginary light source, conventionally in the northwest corner of the map, and darkens slopes that face away from the light and lightens those facing it. The result mimics the appearance of a three-dimensional model viewed from above in oblique light. Swiss cartographers perfected hillshading in the 18th and 19th centuries — Eduard Imhof's work remains the benchmark — and the technique has been reproduced digitally through algorithms that simulate light across digital elevation models. A common reader error: when the light source is unconventional (not northwest), hills appear as valleys and vice versa. The human visual system defaults to assuming light comes from above-left, and any deviation confuses the terrain interpretation.",
  },
  {
    kind: "image",
    art: "article-relief-shaded-map",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Switzerland_topographic_map.png/1280px-Switzerland_topographic_map.png",
    caption:
      "Swiss topographic relief shading — the technique developed by Swiss cartographers in the 18th century, where light from the northwest casts shadows to reveal terrain intuitively.",
    credit: "Wikimedia Commons / Public Domain",
  },

  {
    kind: "heading",
    id: "digital-topo-maps",
    text: "Digital topographic maps: SRTM, LiDAR, and DEM",
  },
  {
    kind: "paragraph",
    text: "Digital elevation models (DEMs) are gridded data files storing elevation values for every cell across a geographic area. The Shuttle Radar Topography Mission (SRTM), conducted by NASA in February 2000, collected elevation data for virtually the entire Earth between 60°N and 56°S in 11 days using interferometric radar from the Space Shuttle Endeavour. The SRTM dataset, at 30 m horizontal resolution globally and 10 m in the US, is freely available and has become the foundation of most global terrain visualisations, including Google Earth's terrain layer. LiDAR (Light Detection And Ranging) produces much higher resolution DEMs — typically 0.5–2 m resolution — by firing laser pulses from aircraft and measuring return time. LiDAR can penetrate vegetation canopy and detect ground surface beneath forest, making it extraordinarily powerful for archaeological survey.",
  },
  {
    kind: "image",
    art: "article-srtm-global-dem",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Srtm_ramp2.world.21600x10800.jpg/1280px-Srtm_ramp2.world.21600x10800.jpg",
    caption:
      "NASA SRTM global digital elevation model — the entire Earth's terrain captured in 11 days in February 2000, now the foundation of most global terrain visualisations.",
    credit: "Wikimedia Commons / Public Domain (NASA)",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "The SRTM dataset covers 80% of Earth's land surface between 60°N and 56°S at 30 m horizontal resolution. The original mission collected approximately 9.8 terabytes of raw data over 11 days. At 10 m resolution (available for the US), a single 1-degree tile file (approximately 10,000 km²) contains 1 billion individual elevation measurements.",
  },

  { kind: "heading", id: "history-of-mapping", text: "The history of topographic mapping" },
  {
    kind: "paragraph",
    text: "Systematic topographic survey — covering an entire country at consistent scale and accuracy — is a product of the nation-state and the military-industrial era. France's Cassini map, surveyed between 1750 and 1815, was the first national topographic survey of a country, covering France at approximately 1:86,400 scale. The British Ordnance Survey was established in 1791, initially to map southern England for defence against a French invasion that never came. The Survey of India, begun in 1802 under William Lambton and continued by George Everest, measured the Indian subcontinent and produced the baseline trigonometric survey from which the height of the Himalayan peaks was eventually calculated — including Peak XV, renamed Everest in 1865. These surveys not only mapped territory; they transformed it politically, enabling taxation, border demarcation, and state control at a granularity that pre-modern governments could never achieve.",
  },
  {
    kind: "timeline",
    title: "History of topographic mapping",
    events: [
      {
        date: "1750",
        text: "France begins Cassini national survey — first systematic topographic mapping of an entire country.",
      },
      {
        date: "1791",
        text: "British Ordnance Survey established — initially to map southern England against French invasion threat.",
      },
      {
        date: "1802",
        text: "Survey of India begins under William Lambton — the Great Trigonometrical Survey, covering the subcontinent.",
      },
      {
        date: "1865",
        text: "Peak XV (Himalayas) officially named Everest — height calculated from Survey of India triangulation data.",
      },
      {
        date: "1930s–1950s",
        text: "UK trig point network established — 6,500 concrete pillars on hilltops, forming national geodetic framework.",
      },
      {
        date: "1972",
        text: "First Landsat satellite launched — beginning of systematic satellite earth observation for terrain mapping.",
      },
      {
        date: "1984",
        text: "GPS system declared operational — beginning of the end for traditional ground triangulation surveys.",
      },
      {
        date: "2000",
        text: "NASA SRTM mission maps 80% of Earth's surface at 30 m resolution in 11 days.",
      },
      {
        date: "2010s",
        text: "LiDAR surveys reveal hidden archaeological landscapes beneath forest canopy worldwide.",
      },
      {
        date: "2020s",
        text: "AI-assisted contour generation and 1 m resolution national DEMs become standard in many countries.",
      },
    ],
  },

  { kind: "heading", id: "lidar-hidden-landscapes", text: "LiDAR and hidden landscapes" },
  {
    kind: "paragraph",
    text: "LiDAR has transformed topographic survey and archaeology since the 2010s by revealing terrain that satellite imagery and standard photography cannot show. In 2010, LiDAR surveys of Angkor, Cambodia, revealed a vast urban grid hidden beneath the forest canopy — a settlement of at least 35 km² surrounding Angkor Wat that traditional survey had entirely missed. In 2018, LiDAR surveys of northern Guatemala revealed over 60,000 Maya structures hidden under the jungle, including interconnected cities, raised causeways, and agricultural terraces — quadrupling overnight the estimated complexity of Classic Maya civilisation. In the UK, LiDAR surveys have revealed hundreds of previously unknown Iron Age hillforts, Roman field systems, and medieval ridge-and-furrow cultivation patterns on upland moors that appeared featureless from the surface.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "LiDAR surveys of the Amazon basin in Brazil have revealed large, geometrically complex earthwork enclosures beneath the forest — some covering several square kilometres — built by pre-Columbian civilisations over 2,000 years ago. These structures, invisible on satellite imagery and inaccessible on foot, fundamentally change understanding of pre-Columbian population density and cultural sophistication in the Amazon.",
  },

  {
    kind: "heading",
    id: "real-world-applications",
    text: "Real-world applications of topographic maps",
  },
  {
    kind: "paragraph",
    text: "Topographic maps are the most practically versatile product of the surveying sciences. For walkers and mountaineers, they are the primary safety tool — enabling route planning, time estimation, emergency location identification, and terrain assessment before setting out. For engineers, they are the essential input for roads, pipelines, bridges, and buildings: every cut-and-fill calculation, every drainage plan, every foundation design begins with a topographic baseline. For flood risk assessment, detailed elevation models reveal which land lies within the floodplain of a river at various flow levels — information that drives insurance premiums, planning decisions, and emergency evacuation routes. For military planners, paper topographic maps remain in active use because digital systems fail under electronic warfare conditions.",
  },
  {
    kind: "list",
    items: [
      "Walking and mountaineering: terrain assessment, route timing, emergency navigation.",
      "Military: terrain analysis, cover and concealment assessment, line-of-sight calculation.",
      "Civil engineering: cut-and-fill design, road alignment, drainage planning.",
      "Flood risk mapping: identifying 1-in-100-year floodplain extents, escape routes.",
      "Archaeology: LiDAR-derived topography reveals buried and overgrown structures.",
      "Agriculture: contour ploughing, irrigation design, soil erosion risk mapping.",
      "Urban planning: slope analysis for development suitability, landslide risk.",
      "Utility infrastructure: pipeline and cable routing to minimise gradient and earthworks.",
    ],
  },

  { kind: "heading", id: "military-use", text: "Military use: why armies still teach paper maps" },
  {
    kind: "paragraph",
    text: "Modern militaries issue GPS devices, digital terrain systems, and smartphone-based tactical mapping as primary navigation tools. They also still teach paper map reading as a foundational skill. The reason is operational: GPS signals can be jammed, spoofed, or denied by an adversary. Satellite imagery requires processing and communication infrastructure that may not survive combat. A waterproof paper topographic map and a compass require no batteries, no satellites, no data connection, and cannot be hacked or interfered with electronically. Russian and Ukrainian forces in the 2022–24 conflict both reported extensive GPS jamming in contested areas, making paper maps and traditional navigation more practically relevant than at any time since the Cold War.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The Ordnance Survey was founded in 1791 specifically because the British government needed accurate maps of southern England to plan coastal defences against French invasion. The word 'ordnance' refers to military artillery — reflecting that the survey's original purpose was to support artillery placement, not civilian walking routes. The recreational and civilian applications came much later.",
  },

  {
    kind: "heading",
    id: "flood-risk-engineering",
    text: "Flood risk and engineering applications",
  },
  {
    kind: "paragraph",
    text: "Digital elevation models derived from LiDAR surveys are now the standard tool for flood risk mapping. By combining a high-resolution DEM with hydrological modelling — simulating how water moves across a landscape under various rainfall scenarios — planners can identify which properties lie within the 1-in-100-year or 1-in-1,000-year floodplain. A 1 m error in a DEM can determine whether a property is classified as flood-risk or not, with significant financial consequences. In the 2015 UK floods, post-event analysis showed that properties constructed in areas classified as low-risk had been built using outdated lower-resolution terrain data, and that the actual floodplain extended further than legacy mapping had indicated. LiDAR-based flood mapping has since been updated nationally in the UK to 25 cm resolution, the most detailed national flood risk dataset in the world.",
  },

  { kind: "heading", id: "practical-sequence", text: "A practical reading sequence in the field" },
  {
    kind: "paragraph",
    text: "When picking up a topographic map in the field, a consistent reading sequence prevents errors and builds situational awareness. First, orient the map: rotate it until the features on the paper match the landscape you can see in front of you — this is called setting the map. Second, identify your location using visible terrain features: a hilltop, stream junction, road bend, or building. Third, read the contour interval from the legend and identify the nearest index contour to your position. Fourth, check the magnetic declination diagram before using a compass — apply the correction to every bearing. Fifth, estimate distances using the scale bar or the grid square count. Sixth, read the terrain ahead: check for streams, ridges, slopes, and paths before you reach them. Setting the map — the first step — is the single most consistently skipped step by beginners, and its absence causes the majority of field navigation errors.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "Setting the map means rotating it until the features depicted match the landscape in front of you. With a set map, you can navigate without ever reading the scale or the legend, simply by matching shapes on paper to shapes on the ground. All skilled navigators do this automatically. All map-reading errors that involve going in the wrong direction begin with failing to set the map.",
  },

  ...editorialClosing({
    conclusion:
      "Topographic maps reward the effort of learning them with one of the most compact, information-dense representations of landscape ever devised. A skilled reader can extract terrain shape, slope angle, drainage direction, cliff locations, and approximate walking time from a well-made sheet. The contour principle takes ten minutes to learn and a lifetime to apply in the full variety of terrain that maps can represent. LiDAR has extended the principle into hidden landscapes — revealing cities, temples, and field systems that the naked eye and satellite camera never knew existed. From military planning to flood risk, from archaeological discovery to a weekend walk, topographic maps remain the most versatile and reliable geographical tool in existence.",
    remember:
      "Contour lines never cross. V-shapes pointing uphill indicate valleys; V-shapes pointing downhill indicate ridges. Closely packed contours mean steep terrain. Index contours (every 5th line) are labelled. Always check magnetic declination before compass work. The SRTM mission mapped 80% of Earth's surface in 11 days in 2000.",
    quizTopic: "maps and physical geography",
  }),
];
