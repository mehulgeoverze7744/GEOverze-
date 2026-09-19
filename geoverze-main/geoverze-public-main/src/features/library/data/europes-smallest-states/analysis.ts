import type { ArticleBlock } from "../articles";

export const EUROPE_MICROSTATES_ANALYSIS: readonly ArticleBlock[] = [
  {
    kind: "heading",
    id: "how-they-survived",
    text: "How did these countries survive?",
  },
  {
    kind: "paragraph",
    text: "None of the six followed an identical path. Empires rose and fell; borders were redrawn; wars skipped some valleys and engulfed others. What recurs is a combination of factors — rarely all at once — that made annexation costly, unnecessary or politically awkward.",
  },
  {
    kind: "facts",
    title: "Six reasons microstates endured",
    layout: "survival-cards",
    facts: [
      {
        label: "Geography",
        value:
          "Mount Titano, Pyrenean valleys and Alpine ridges raised the cost of conquest. Monaco's cliff and Malta's harbours turned location into leverage.",
      },
      {
        label: "Diplomacy",
        value:
          "Treaties, friendship pacts and careful neutrality let small states negotiate with France, Italy, Spain and wider European powers without surrendering identity.",
      },
      {
        label: "Dynastic continuity",
        value:
          "The Grimaldi in Monaco and the House of Liechtenstein provided institutional memory — rulers who outlasted individual emperors or prime ministers.",
      },
      {
        label: "Religious importance",
        value:
          "Vatican City's role as the centre of the Catholic Church gave the Holy See a global status that territorial size alone could never explain.",
      },
      {
        label: "Strategic location",
        value:
          "Malta's central Mediterranean position made it valuable to navies and traders — and sometimes worth defending rather than absorbing.",
      },
      {
        label: "Political institutions",
        value:
          "San Marino's republican councils and Andorra's co-principality created legal personalities that neighbours learned to deal with as facts on the ground.",
      },
    ],
  },
  {
    kind: "dualCompare",
    title: "Geography vs history",
    leftTitle: "Geography",
    leftItems: [
      "Mountains protected San Marino, Andorra and Liechtenstein",
      "Coast and cliffs defined Monaco",
      "Island harbours shaped Malta",
      "An enclave inside Rome defines Vatican City",
    ],
    rightTitle: "History",
    rightItems: [
      "Treaties and pareatges formalised shared rule",
      "Dynasties outlasted surrounding empires",
      "Religious authority predated modern borders",
      "Colonial and imperial handovers left some states intact",
    ],
  },
  {
    kind: "paragraph",
    text: "Geography alone did not guarantee survival — many mountainous regions were absorbed. History alone cannot explain a border without terrain that made enforcement difficult. The microstates that remain are points where physical setting and political choices aligned for long enough to become tradition.",
  },
  {
    kind: "heading",
    id: "where-on-the-map",
    text: "Where are Europe's microstates?",
  },
  {
    kind: "paragraph",
    text: "From the Mediterranean to the Alps, the six states cluster on Europe's margins and seams — coastlines, mountain passes and enclaves where larger countries meet. None possesses a vast hinterland; each is visible only when maps are drawn at continental scale.",
  },
  {
    kind: "image",
    art: "article-microstates-map",
    caption: "Approximate locations of Europe's six microstates on a continental map.",
    externalSrc: "/assets/geolibrary/collections/countries-of-europe.jpg",
    credit: "GEOlibrary editorial map art",
  },
  {
    kind: "heading",
    id: "how-small",
    text: "How small are they?",
  },
  {
    kind: "sizeComparison",
    title: "Land area compared (km²)",
    items: [
      { label: "Vatican City", areaKm2: 0.44 },
      { label: "Monaco", areaKm2: 2.02 },
      { label: "San Marino", areaKm2: 61 },
      { label: "Liechtenstein", areaKm2: 160 },
      { label: "Malta", areaKm2: 316 },
      { label: "Andorra", areaKm2: 468 },
    ],
  },
  {
    kind: "heading",
    id: "six-in-numbers",
    text: "The six states in numbers",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Population figures below use national or UN-style estimates circa 2023 unless noted. Rounded for readability; microstates change slowly but not never.",
  },
  {
    kind: "table",
    title: "Area, capital, population and government",
    columns: ["Country", "Area", "Capital", "Population (≈2023)", "Government"],
    rows: [
      ["Vatican City", "0.44 km²", "Vatican City", "764", "Elective monarchy (Holy See)"],
      ["Monaco", "2.02 km²", "Monaco", "38,400", "Constitutional monarchy"],
      ["San Marino", "61 km²", "San Marino", "33,600", "Parliamentary republic"],
      ["Liechtenstein", "160 km²", "Vaduz", "39,800", "Constitutional monarchy"],
      ["Malta", "316 km²", "Valletta", "542,000", "Parliamentary republic"],
      ["Andorra", "468 km²", "Andorra la Vella", "87,100", "Co-principality / parliament"],
    ],
  },
  {
    kind: "heading",
    id: "what-makes-each-different",
    text: "What makes each one different?",
  },
  {
    kind: "profileStrip",
    title: "Six identities in brief",
    profiles: [
      {
        name: "Vatican City",
        theme: "Religion",
        text: "Sovereign territory tied to the papacy and St Peter's — global Catholic leadership from fewer than half a square kilometre.",
      },
      {
        name: "Monaco",
        theme: "Coast & finance",
        text: "A Riviera principality where cliff-side urbanism, tourism and banking grew from Grimaldi rule and French neighbourhood ties.",
      },
      {
        name: "San Marino",
        theme: "Republican continuity",
        text: "Mount Titano republic with captains regent and a founding tradition that still shapes national pride.",
      },
      {
        name: "Liechtenstein",
        theme: "Alpine principality",
        text: "Rhine valley monarchy between Switzerland and Austria — industry and services in an Alpine setting.",
      },
      {
        name: "Malta",
        theme: "Mediterranean crossroads",
        text: "Fortified islands at the centre of Mediterranean routes — prehistory, knights and independence layered in stone.",
      },
      {
        name: "Andorra",
        theme: "Mountain co-principality",
        text: "Pyrenean valleys governed through shared medieval sovereignty — skiing and retail in a high-altitude capital.",
      },
    ],
  },
  {
    kind: "heading",
    id: "timeline-of-survival",
    text: "A timeline of survival",
  },
  {
    kind: "timeline",
    title: "Selected milestones across the six states",
    events: [
      { date: "301 CE (trad.)", text: "San Marino — traditional foundation date." },
      { date: "1297", text: "Monaco — Grimaldi association with the Rock." },
      { date: "1278 / 1288", text: "Andorra — pareatges shape co-principality." },
      { date: "1719", text: "Liechtenstein — principality formed from Schellenberg and Vaduz." },
      { date: "1929", text: "Vatican City — Lateran Treaty." },
      { date: "1964", text: "Malta — independence from Britain." },
      { date: "1993", text: "Monaco — joins the United Nations." },
    ],
  },
  {
    kind: "heading",
    id: "modern-economies",
    text: "Small states, modern economies",
  },
  {
    kind: "paragraph",
    text: "Today each microstate earns its living differently. Vatican City runs on donations, tourism and philately rather than conventional industry. Monaco depends on tourism, conferences, finance and high-value services tied to the Riviera. San Marino mixes tourism, light manufacturing and retail for visitors crossing from Italy.",
  },
  {
    kind: "paragraph",
    text: "Liechtenstein combines manufacturing, precision industry and financial services with Alpine tourism. Malta's economy spans shipping, gaming regulation, tourism and technology services in an EU member state. Andorra focuses on skiing, mountain hospitality and retail tourism between France and Spain.",
  },
  {
    kind: "paragraph",
    text: 'None of these paths is simply "rich" or "poor" in the abstract — each reflects contracts, treaties and specialisations negotiated over centuries. Small size pushed all six toward openness to neighbours and to niche roles in wider European markets.',
  },
  {
    kind: "didYouKnow",
    items: [
      "Vatican City is smaller than many city parks — about 0.44 km².",
      "Monaco is among the most densely populated sovereign states, with tens of thousands of residents in roughly 2 km².",
      "San Marino's traditional foundation date of 301 CE is honoured nationally, though early documents appear centuries later.",
      "Liechtenstein has no airport; residents use Switzerland's rail and road links.",
      "Malta's megalithic temples are among the oldest free-standing stone structures in the world.",
      "Andorra's heads of state include the Bishop of Urgell and the President of France as co-princes.",
      "Four of the six are landlocked or enclaved; only Monaco and Malta face open sea.",
      "Borders survived because neighbours often preferred stable arrangements to annexation costs.",
    ],
  },
  {
    kind: "heading",
    id: "conclusion",
    text: "Tiny on the map. Large in history.",
  },
  {
    kind: "paragraph",
    text: "These six countries show that maps can mislead. Area alone never told the full story of Vatican diplomacy, Maltese fortifications, San Marino's mountain republic, Liechtenstein's Alpine monarchy, Andorra's Pyrenean charter or Monaco's coastal reinvention.",
  },
  {
    kind: "paragraph",
    text: "Sovereignty persisted where institutions, geography and timing intersected — where empires had other priorities, or where absorption would have created more problems than it solved. Understanding microstates means reading both scale and context.",
  },
  {
    kind: "paragraph",
    text: "Explore the map. Understand the story. Know Earth.",
  },
  {
    kind: "crossLinks",
    title: "Continue in GEOlibrary",
    links: [
      {
        label: "Want to explore borders?",
        href: "/geolibrary/article/the-straightest-borders-on-earth",
        description: "Read how straight lines on maps encode politics and geography.",
      },
      {
        label: "Explore UNESCO heritage",
        href: "/geolibrary/article/how-unesco-picks-a-world-heritage-site",
        description: "See how outstanding universal value is debated on a global stage.",
      },
      {
        label: "Learn about capitals",
        href: "/geolibrary/article/why-some-countries-have-two-capitals",
        description: "Discover why some states split their capital functions across cities.",
      },
      {
        label: "Test your geography knowledge",
        href: "/play/quiz",
        description: "Practice Countries and related topics in Let's Play.",
      },
    ],
  },
];
