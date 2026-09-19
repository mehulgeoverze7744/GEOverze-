import type { ArticleBlock } from "../articles";

export const EUROPE_MICROSTATES_COUNTRIES: readonly ArticleBlock[] = [
  {
    kind: "heading",
    id: "vatican-city",
    text: "Vatican City — the world's smallest state",
  },
  {
    kind: "paragraph",
    text: "Vatican City is the world's smallest independent state by territory — approximately 0.44 km² within Rome. The modern state dates from the Lateran Treaty of 1929, which settled relations between Italy and the Holy See after decades of dispute over papal temporal rule. Vatican City is distinct from but closely linked to the Holy See, the ecclesiastical jurisdiction of the pope.",
  },
  {
    kind: "paragraph",
    text: "St Peter's Basilica and St Peter's Square dominate the state's physical and symbolic landscape. Pilgrimage, art and diplomacy radiate from this tiny enclave on a scale far exceeding its map outline. Museums, archives and the Vatican's role in international dialogue give it a global profile that many larger capitals would recognise.",
  },
  {
    kind: "image",
    art: "article-vatican",
    caption: "St Peter's Square and Basilica — ceremonial heart of Vatican City.",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Angelus_1637.jpg/1280px-Angelus_1637.jpg",
    credit: "Photo: Wikimedia Commons (public domain)",
  },
  {
    kind: "facts",
    title: "Vatican City",
    facts: [
      { label: "Area", value: "≈ 0.44 km²" },
      { label: "Capital", value: "Vatican City" },
      { label: "Established", value: "1929 (Lateran Treaty)" },
      { label: "Location", value: "Rome, Italy" },
    ],
  },
  {
    kind: "timeline",
    title: "Selected milestones",
    events: [
      { date: "1929", text: "Lateran Treaty creates Vatican City as a sovereign entity." },
      { date: "1984", text: "Revised concordat updates relations with Italy." },
      { date: "Present", text: "Holy See maintains diplomatic relations worldwide." },
    ],
  },
  {
    kind: "heading",
    id: "monaco",
    text: "Monaco — a country built around the coast",
  },
  {
    kind: "paragraph",
    text: "Monaco occupies about 2.02 km² on the Mediterranean, wedged between the Alps and the sea on the French Riviera. The Grimaldi family has been associated with the Rock since 1297, shaping a principality defined by cliffs, harbour access and proximity to France. Monaco-Ville crowns the rock; Monte Carlo spread eastward as tourism and finance grew.",
  },
  {
    kind: "paragraph",
    text: "Limited flat land forced vertical building and careful land reclamation. The casino era from 1863 onward linked Monaco's name to luxury travel, while constitutional development in 1911 and UN membership in 1993 marked its modern international standing. Customs union and neighbourhood ties with France remain central to daily life.",
  },
  {
    kind: "image",
    art: "article-monaco",
    caption: "Monaco's Mediterranean coastline — space is measured in metres, not kilometres.",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Monaco_Monte_Carlo_1.jpg/1280px-Monaco_Monte_Carlo_1.jpg",
    credit: "Photo: Wikimedia Commons (CC BY-SA 3.0)",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Steep coastline and extremely limited land area shaped Monaco into a dense, vertical city-state. Every metre of waterfront became strategically valuable for ports, promenades and development.",
  },
  {
    kind: "timeline",
    title: "Monaco — selected dates",
    events: [
      { date: "1297", text: "Grimaldi association with the Rock of Monaco begins." },
      { date: "1863", text: "Opening of the casino district linked to Monte Carlo." },
      { date: "1911", text: "First constitution promulgated." },
      { date: "1993", text: "Monaco joins the United Nations." },
    ],
  },
  {
    kind: "heading",
    id: "san-marino",
    text: "San Marino — a republic in the mountains",
  },
  {
    kind: "paragraph",
    text: "San Marino lies entirely within Italy, centred on Mount Titano and its three famous towers. Tradition attributes foundation to Saint Marinus around 301 CE; that date is culturally central, though documentary evidence for an organised community appears from 885 onward. The distinction between founding story and archival record matters for historians — and for understanding how myth and institution reinforce identity.",
  },
  {
    kind: "paragraph",
    text: "Medieval alliances, defensive height and a reputation for autonomy helped San Marino navigate Italian unification and twentieth-century Europe. Captains Regent and parliamentary structures embody a republican continuity rare among microstates. Today tourism and postage stamps supplement a small domestic economy, but geography still defines the skyline.",
  },
  {
    kind: "image",
    art: "article-san-marino",
    caption: "Guaita Tower on Mount Titano — defensive geography made visible.",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Guaita_Tower_San_Marino.jpg/1280px-Guaita_Tower_San_Marino.jpg",
    credit: "Photo: Wikimedia Commons (CC BY 2.0)",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "301 CE is traditionally associated with San Marino's foundation; documentary evidence for an organised community on Mount Titano appears much later.",
  },
  {
    kind: "timeline",
    title: "San Marino — selected dates",
    events: [
      { date: "301 CE (trad.)", text: "Traditional foundation linked to Saint Marinus." },
      { date: "885", text: "Early documentary reference to organised community." },
      { date: "1862", text: "Friendship and cooperation treaty with Italy." },
      { date: "Present", text: "UN member; republican institutions continue." },
    ],
  },
  {
    kind: "heading",
    id: "liechtenstein",
    text: "Liechtenstein — the Alpine microstate",
  },
  {
    kind: "paragraph",
    text: "Liechtenstein spans roughly 160 km² between Switzerland and Austria in the upper Rhine valley, with peaks rising into the Alps. The principality formed when the House of Liechtenstein consolidated the Lordship of Schellenberg and the County of Vaduz in 1719 — a political purchase shaped by Holy Roman Empire politics as much as by scenery.",
  },
  {
    kind: "paragraph",
    text: "Vaduz Castle overlooks the capital; the Rhine marks the western boundary. Without sea access, Liechtenstein developed close economic ties with neighbours, a diversified services sector and a distinctive monarchical identity. Alpine meadows, winter sport and manufacturing sit alongside finance in a compact national economy.",
  },
  {
    kind: "image",
    art: "article-liechtenstein",
    caption: "Vaduz Castle — symbol of princely continuity above the capital.",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Vaduz_Castle_situated_on_a_rock.jpg/1280px-Vaduz_Castle_situated_on_a_rock.jpg",
    credit: "Photo: Wikimedia Commons (CC BY-SA 3.0)",
  },
  {
    kind: "geoDiagram",
    title: "Liechtenstein between two neighbours",
    nodes: ["Switzerland", "Liechtenstein", "Austria"],
  },
  {
    kind: "heading",
    id: "malta",
    text: "Malta — the small island with a huge history",
  },
  {
    kind: "paragraph",
    text: "Malta's archipelago — about 316 km² — sits at a crossroads of Mediterranean shipping lanes. Human settlement stretches back more than 7,000 years, including remarkable megalithic temples predating Stonehenge. Phoenicians, Romans, Byzantines, Arabs, Normans, the Knights of St John, Napoleonic France and the British Empire each left layers of law, language and stone.",
  },
  {
    kind: "paragraph",
    text: "Valletta, built after the Great Siege of 1565, is a fortified baroque capital designed for defence and display. British rule from the nineteenth century connected Malta to wider imperial networks until independence in 1964 and republic status in 1974. Modern Malta balances tourism, services, shipping and EU membership while living with the memory of siege and survival.",
  },
  {
    kind: "paragraph",
    text: "Because Malta is larger than the other five states in this feature, it is easy to underestimate how small it remains by global standards — yet its harbour geography repeatedly made it worth contesting. Island size did not prevent Malta from becoming a pivot point of Mediterranean history.",
  },
  {
    kind: "image",
    art: "article-malta-valletta",
    caption: "Valletta's skyline and Grand Harbour — fortifications shaped by siege warfare.",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Valletta_skyline.jpg/1280px-Valletta_skyline.jpg",
    credit: "Photo: Wikimedia Commons (CC BY-SA 3.0)",
  },
  {
    kind: "image",
    art: "article-malta-temple",
    caption: "Megalithic temple heritage — Malta's prehistory predates many European capitals.",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Hagar_Qim_%28Malta%29.jpg/1280px-Hagar_Qim_%28Malta%29.jpg",
    credit: "Photo: Wikimedia Commons (CC BY-SA 3.0)",
  },
  {
    kind: "timeline",
    title: "Malta — selected milestones",
    events: [
      { date: "c. 3600 BCE", text: "Megalithic temple culture flourishes." },
      { date: "1530", text: "Knights of St John granted Malta." },
      { date: "1964", text: "Independence from the United Kingdom." },
      { date: "1974", text: "Republic proclaimed." },
      { date: "2004", text: "Malta joins the European Union." },
    ],
  },
  {
    kind: "heading",
    id: "andorra",
    text: "Andorra — a country between two giants",
  },
  {
    kind: "paragraph",
    text: "Andorra covers about 468 km² in the Pyrenees between France and Spain — the largest territory in this sextet, though still modest by any continental standard. Medieval pareatges in 1278 and 1288 underpinned shared sovereignty between the Bishop of Urgell and the French co-prince (historically linked to the Count of Foix, later the French head of state).",
  },
  {
    kind: "paragraph",
    text: "Andorra la Vella sits high in a valley network shaped by snow, streams and passes. Skiing, duty-free retail and mountain tourism dominate the modern economy, while Casa de la Vall and parish traditions recall centuries of local governance. Geography preserved a polity that might otherwise have been partitioned between neighbours.",
  },
  {
    kind: "image",
    art: "article-andorra",
    caption: "Andorra la Vella — capital in a high Pyrenean valley.",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Andorra_la_Vella_-_view.jpg/1280px-Andorra_la_Vella_-_view.jpg",
    credit: "Photo: Wikimedia Commons (CC BY-SA 3.0)",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Andorra's co-principality joins the Bishop of Urgell (Spain) and the President of France as co-princes — a medieval arrangement still reflected in its constitution.",
  },
];
