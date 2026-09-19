import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "Length sounds like a simple fact. For rivers it is a methodological decision wrapped in geography: which tributary counts as the true headwater, how you trace a braided or seasonal reach, and what resolution your data uses to measure the final delta. The Nile–Amazon debate has run for well over a century precisely because each new survey technology reopens the headwater question, and each answer depends on choices the surveyors made. The two rivers are not simply longest-versus-largest — they represent fundamentally different hydrological systems, different civilisational histories, and today face different but equally existential threats. Comparing them is less about declaring a winner than understanding two of the planet's most consequential waterways on their own terms.",
  },

  { kind: "heading", id: "measurement-problem", text: "The measurement problem" },
  {
    kind: "paragraph",
    text: "To measure a river's length you must first define where it begins and where it ends. The end is usually easier — the river mouth, where freshwater meets the sea. Even this is contested for the Amazon, whose plume extends hundreds of kilometres into the Atlantic and whose delta braids across several outlets. The beginning is harder. A river has many tributaries; by convention the longest continuous watercourse from the most remote source to the sea defines the length. The trouble is that 'most remote' can be measured as greatest overland distance or greatest elevation difference, and these criteria produce different answers for both rivers. Modern satellite-derived terrain data — particularly the Shuttle Radar Topography Mission (SRTM) dataset, which mapped the Earth's surface at 30-metre resolution — has reopened source questions that 19th-century explorers thought they had settled.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The International Hydrological Programme of UNESCO uses 'greatest length of continuous watercourse' to measure rivers, but individual national survey bodies often apply their own conventions. Brazil's IBGE and Peru's IGN use different source definitions for the Amazon, producing official figures that differ by nearly 600 km.",
  },

  { kind: "heading", id: "nile-in-detail", text: "The Nile in detail" },
  {
    kind: "paragraph",
    text: "The Nile's conventional length of 6,650 km is measured from its most remote source — the Ruvyironza River in Burundi, a tributary of the Kagera River, which feeds Lake Victoria — to the Mediterranean coast near Alexandria. The Nile is actually two river systems joined: the White Nile, which drains the Great Lakes of East Africa and provides the base flow that keeps the river running year-round, and the Blue Nile, which originates at Lake Tana in the Ethiopian highlands and delivers roughly 85 percent of the Nile's total water volume during the Ethiopian summer monsoon. Both rivers converge at Khartoum, the capital of Sudan, where their different colours — the White Nile's grey-green versus the Blue Nile's blue-brown sediment load — are visible side by side for several kilometres before fully mixing.",
  },
  {
    kind: "image",
    art: "nile-khartoum-confluence",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Khartoum_-_Blue_and_White_Nile_confluence.jpg/1280px-Khartoum_-_Blue_and_White_Nile_confluence.jpg",
    caption: "The confluence of the Blue and White Nile at Khartoum, Sudan — where two river systems with different sources meet, their waters remaining visibly distinct for kilometres before mixing.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "facts",
    title: "The Nile — key statistics",
    facts: [
      { label: "Conventional length", value: "6,650 km" },
      { label: "Most remote source (White Nile)", value: "Ruvyironza River, Burundi (~2,000 m elevation)" },
      { label: "Blue Nile source", value: "Lake Tana, Ethiopia (~1,800 m elevation)" },
      { label: "Confluence of Blue and White Nile", value: "Khartoum, Sudan" },
      { label: "Annual discharge at mouth", value: "~2,830 m³/s (highly variable; near-zero some years)" },
      { label: "Basin area", value: "3.4 million km²" },
      { label: "Countries in basin", value: "11 (Burundi, DRC, Egypt, Eritrea, Ethiopia, Kenya, Rwanda, South Sudan, Sudan, Tanzania, Uganda)" },
    ],
  },

  { kind: "heading", id: "source-of-nile-debate", text: "The source of the Nile: a 2,000-year debate" },
  {
    kind: "paragraph",
    text: "The search for the Nile's source is one of the most consequential quests in the history of geography. Ptolemy, writing in the 2nd century AD, described 'Mountains of the Moon' south of the equator from which two lakes fed the Nile — a description that was dismissively ignored for 1,500 years and then vindicated in the 19th century when the Rwenzori Mountains and the East African Great Lakes were mapped. Richard Burton and John Hanning Speke led competing British expeditions in 1857–58: Speke correctly identified Lake Victoria as the Nile's primary reservoir, but Burton disputed his findings. Henry Morton Stanley settled the Lake Victoria question in 1875. The further problem — which stream feeding Lake Victoria is the most remote source — was only resolved with GPS survey in the early 2000s, pointing to the Rukarara tributary of the Kagera River in Rwanda as the furthest point from the Nile's mouth.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The Burton–Speke dispute ended tragically. The two men were scheduled to debate publicly on 16 September 1864. That morning, Speke — who was correct about Lake Victoria — died from a gunshot wound while hunting. Burton believed it was suicide; most historians consider it an accident. The source question was left unresolved for another decade.",
  },

  { kind: "heading", id: "blue-nile-ethiopia", text: "The Blue Nile: Ethiopia's gift to Egypt" },
  {
    kind: "paragraph",
    text: "The Blue Nile has one of the most important hydrological relationships in world geography: it originates in the Ethiopian highlands, rises dramatically during the Ethiopian summer monsoon (June–September), and delivers the massive sediment and nutrient load that made the Egyptian Nile Delta one of the most fertile agricultural zones in the ancient world. At its peak flow during the Ethiopian rains, the Blue Nile carries approximately 90 percent of the total Nile discharge. During the dry season it shrinks to a fraction of its monsoon volume. For ancient Egyptians, the 'inundation' — when the Blue Nile's monsoon surge reached the Egyptian floodplain — was the most important event in the agricultural calendar, reliable enough to structure the entire civil year around it for 3,000 years.",
  },

  { kind: "heading", id: "nile-delta", text: "The Nile Delta: the world's most famous delta" },
  {
    kind: "paragraph",
    text: "The Nile Delta is a triangular river delta — the shape that gave the Greek letter delta (Δ) its name in geographical usage. Formed over millions of years of sediment deposition, the delta stretches roughly 240 km along the Mediterranean coast and extends approximately 160 km inland. Today, the Nile splits into two main distributaries at Cairo: the Damietta branch to the east and the Rosetta branch to the west. In ancient times there were seven distributaries. The Aswan High Dam, completed in 1970, has dramatically reduced sediment delivery to the delta, causing it to erode at its edges — coastal communities that have existed for centuries are now threatened by Mediterranean encroachment. Alexandria, Egypt's second city and ancient Mediterranean hub, sits at the delta's western edge.",
  },
  {
    kind: "image",
    art: "nile-delta-from-space",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Nile_delta_from_orbit.jpg/800px-Nile_delta_from_orbit.jpg",
    caption: "The Nile Delta from orbit — the triangular green wedge against the Saharan beige is one of Earth's most recognisable features from space, representing one of the oldest continuously farmed landscapes on Earth.",
    credit: "NASA / Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "amazon-in-detail", text: "The Amazon in detail" },
  {
    kind: "paragraph",
    text: "The Amazon drains approximately 40 percent of the South American continent, carrying the combined rainfall of an area larger than Europe through a basin of roughly 7 million square kilometres. The river's headwaters lie in the Andes of Peru and Bolivia, where glacial meltwater and tropical rainfall combine to form the multiple tributaries that become the Amazon's main stem. The river flows roughly 6,400 km (conventional figure) or up to 6,992 km (with the extended Mantaro-source measurement) from the Andes to the Atlantic near Marajó Island. Unlike the Nile, which narrows to near-zero discharge in some dry-season years, the Amazon is so vast that its minimum flow exceeds most other rivers' maximum. Even at low water, the Amazon's main channel is several kilometres wide and 20–100 metres deep.",
  },
  {
    kind: "image",
    art: "amazon-river-plume",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Amazon_River_plume.jpg/1280px-Amazon_River_plume.jpg",
    caption: "The Amazon's freshwater plume extending into the Atlantic Ocean. The sediment-rich discharge is visible from space as a turbid wedge stretching hundreds of kilometres from the Brazilian coast.",
    credit: "NASA Earth Observatory / Public Domain",
  },
  {
    kind: "facts",
    title: "The Amazon — key statistics",
    facts: [
      { label: "Conventional length", value: "6,400 km (contested; up to 6,992 km with Mantaro source)" },
      { label: "Source (2007 survey)", value: "Mantaro River headwaters, Peru, ~5,170 m elevation" },
      { label: "Annual average discharge", value: "~209,000 m³/s" },
      { label: "Basin area", value: "7.0 million km² — 40% of South America" },
      { label: "Countries in basin", value: "9 (Bolivia, Brazil, Colombia, Ecuador, Guyana, Peru, Suriname, Venezuela, French Guiana)" },
      { label: "Share of global freshwater river discharge", value: "~20%" },
      { label: "Estimated fish species", value: "~3,000 (more than all Atlantic Ocean fish species)" },
    ],
  },

  { kind: "heading", id: "2007-survey", text: "The 2007 survey: Amazon takes the crown?" },
  {
    kind: "paragraph",
    text: "In 2007, a joint Brazilian and Peruvian scientific expedition used GPS receivers and Shuttle Radar Topography Mission (SRTM) satellite elevation data to trace the Amazon's headwaters with unprecedented precision. The team identified the Mantaro River in Peru — specifically a high-altitude tributary near the Nevado Yarupajá — as the Amazon's most remote source point at an elevation of approximately 5,170 metres. Using this source, the Amazon's total length was calculated at 6,992 km — significantly longer than the Nile's conventional 6,650 km. The finding was submitted to the Brazilian Institute of Geography and Statistics (IBGE) and the results were published in geoscience journals. However, the measurement has not been universally adopted: some researchers prefer the Apurimac River as the main headwater, which produces a shorter figure, and the Peruvian government uses yet another convention.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The Amazon's length controversy hinges on which Andean tributary to trace: the Ucayali-Apurimac route gives ~6,400 km; the Ucayali-Mantaro route traced in 2007 gives ~6,992 km. The Nile's 6,650 km is between these two figures. Until international survey bodies agree on a single Amazon headwater convention, both rivers can plausibly claim the record.",
  },

  { kind: "heading", id: "amazon-basin-scale", text: "The Amazon basin: scale that defies description" },
  {
    kind: "paragraph",
    text: "The Amazon basin is so vast that it contains the entire national territories of Bolivia, Colombia, Ecuador, Peru, Suriname, and French Guiana within or partly within its watershed — plus significant portions of Venezuela, Guyana, and 60 percent of Brazil. It receives an average of 2,000–3,000 mm of rainfall per year, compared to the Nile basin's average of well under 100 mm across its desert reaches. The basin contains more plant species (an estimated 40,000) than any other ecosystem on Earth, more bird species than any other region, and an estimated 10 percent of all species on the planet within its 7 million square kilometres. The river itself has more than 1,100 tributaries, 17 of which are over 1,500 km long — each tributary would rank among the major rivers of Europe.",
  },

  { kind: "heading", id: "flow-no-contest", text: "On volume, there is no contest" },
  {
    kind: "paragraph",
    text: "Whatever the outcome of the length debate, the Amazon's hydrological dominance is not in question. It discharges approximately 209,000 cubic metres of water per second into the Atlantic — roughly 74 times the Nile's average discharge. The Amazon carries around one fifth of all the river water that reaches the world's oceans. Its freshwater plume, detectable by satellite as a turbid brown expanse coloured by suspended sediment, extends over 300 km into the Atlantic Ocean and can be detected by ship instruments much further out. French explorer André de Brué in the 17th century reported that sailors could fill their freshwater barrels far out to sea by letting down buckets — the plume was so large and persistent that it dominated the ocean surface for hundreds of kilometres.",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Amazon discharge: ~209,000 m³/s. Nile discharge: ~2,830 m³/s. Ratio: the Amazon carries roughly 74 Niles' worth of water to the sea every second. The Amazon's annual discharge (~6.6 trillion m³) equals approximately 20% of all freshwater entering the world's oceans from all rivers combined.",
  },

  { kind: "heading", id: "rivers-compared", text: "The two rivers compared" },
  {
    kind: "dualCompare",
    title: "Nile vs Amazon — eight key dimensions",
    leftTitle: "Nile",
    leftItems: [
      "Length: ~6,650 km (conventional)",
      "Annual discharge: ~2,830 m³/s",
      "Basin: 3.4 million km² across 11 countries",
      "Flows through desert for most of its length",
      "Supported civilisation for 5,000+ years",
      "Highly regulated: Aswan High Dam (1970)",
      "Major threat: GERD dam politics, climate change",
      "Delta: eroding due to reduced sediment since 1970",
    ],
    rightTitle: "Amazon",
    rightItems: [
      "Length: 6,400–6,992 km (disputed)",
      "Annual discharge: ~209,000 m³/s",
      "Basin: 7.0 million km² across 9 countries",
      "Flows through world's largest tropical rainforest",
      "~20% of global freshwater river discharge",
      "Largely free-flowing; some dams (Balbina, Tucuruí)",
      "Major threat: deforestation nearing tipping point",
      "Delta: actively building; extends coastline measurably",
    ],
  },
  {
    kind: "table",
    title: "Nile vs Amazon — statistical comparison",
    columns: ["Metric", "Nile", "Amazon"],
    rows: [
      ["Conventional length", "6,650 km", "6,400 km (contested to 6,992 km)"],
      ["Basin area", "3.4 million km²", "7.0 million km²"],
      ["Annual discharge", "~2,830 m³/s", "~209,000 m³/s"],
      ["Countries in basin", "11", "9"],
      ["Source elevation", "~2,000 m (Ruvyironza)", "~5,170 m (Mantaro, Peru)"],
      ["Delta type", "River delta (eroding)", "Tidal delta + oceanic plume"],
      ["Fish species", "~320", "~3,000"],
      ["Population in basin", "~250 million", "~30–47 million"],
    ],
  },

  { kind: "heading", id: "nile-civilizations", text: "The Nile and civilisation: 5,000 years of hydraulic history" },
  {
    kind: "paragraph",
    text: "The Nile supported one of the world's first urban civilisations because its annual flood delivered nutrient-rich silt to otherwise desert land in a reliable, predictable cycle. Egyptian agriculture, architecture, and religion were all structured around the Nile's flood calendar. The Egyptians divided the year into three seasons: Akhet (inundation, June–September), Peret (growing season, October–February), and Shemu (harvest, March–May). Nilometers — graduated stone columns in the riverbed — measured the flood height and predicted agricultural yield, which determined tax rates. A flood that was too low meant famine; one that was too high destroyed embankments and irrigation systems. The perfect flood height was between 8 and 9 metres above the nilometer's zero mark at Memphis. Nubian kingdoms along the middle Nile — Kerma, Kush, Meroe — developed independently of and in complex interaction with Egypt, with their own hydraulic agricultural systems and trade networks.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The ancient Egyptian flood calendar divided the year into three seasons based entirely on the Nile's behaviour: Akhet (inundation), Peret (growing), and Shemu (harvest). This calendar was used for over 3,000 years with only minor revision. The predictability of the Nile's flood — fed by the Ethiopian monsoon thousands of kilometres upstream — made Egypt's agricultural economy uniquely stable in the ancient world.",
  },
  {
    kind: "image",
    art: "aswan-high-dam",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Aswan_High_Dam.JPG/1280px-Aswan_High_Dam.JPG",
    caption: "The Aswan High Dam, completed in 1970 — it ended the annual Nile flood cycle, eliminated silt delivery to the delta, and created Lake Nasser (550 km long), while requiring the relocation of Abu Simbel.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  { kind: "heading", id: "aswan-dam", text: "The Aswan High Dam: solving one problem, creating another" },
  {
    kind: "paragraph",
    text: "Gamal Abdel Nasser's decision to build the Aswan High Dam, completed in 1970, was one of the 20th century's most consequential hydrological decisions. The dam ended the annual flood cycle — solving flooding and creating year-round water storage — and enabled 365-day irrigation, dramatically expanding cultivated area. But it also blocked the ~130 million tonnes of silt the Blue Nile had delivered to the delta each year, causing the delta to begin eroding rather than building. Egyptian farmers now require artificial fertilisers to replace the nutrients the silt provided for free. The dam also required the relocation of 100,000 Nubian people from their ancestral villages along the river, and the salvage of the Abu Simbel temples (cut from the rock and reassembled 65 metres higher) in one of the greatest feats of archaeological engineering ever undertaken.",
  },

  { kind: "heading", id: "gerd-dam", text: "The GERD: Africa's biggest dam dispute" },
  {
    kind: "paragraph",
    text: "The Grand Ethiopian Renaissance Dam (GERD) on the Blue Nile, which began generating power in 2022 and reached full capacity in 2024, has become the most consequential geopolitical dispute in Africa. With a storage capacity of 74 billion cubic metres and a generating capacity of 6,450 megawatts, it is the largest hydroelectric dam in Africa. Ethiopia regards it as a sovereign development project essential to the country's electrification; Egypt regards it as an existential threat to its water security. Egypt's position is based on the 1959 Nile Waters Agreement with Sudan, which allocated 55.5 billion cubic metres per year to Egypt and 18.5 billion m³ to Sudan. The problem is that the 1959 agreement was signed without Ethiopia — which contributes approximately 85 percent of the Nile's total flow — and Ethiopia has never accepted it as binding.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The 1959 Nile Waters Agreement between Egypt and Sudan allocated 74 billion m³/year between the two countries — leaving nothing for the eight upstream states that also depend on the river, including Ethiopia, which provides 85% of the total flow. Ethiopia was not a party to the agreement and has consistently rejected it as a colonial-era document that violates its sovereignty over its own rivers.",
  },
  {
    kind: "image",
    art: "gerd-dam",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Grand_Ethiopian_Renaissance_Dam.jpg/1280px-Grand_Ethiopian_Renaissance_Dam.jpg",
    caption: "The Grand Ethiopian Renaissance Dam (GERD) on the Blue Nile — Africa's largest hydroelectric project, at the centre of an ongoing diplomatic dispute between Ethiopia, Egypt, and Sudan.",
    credit: "Wikimedia Commons / CC BY-SA 4.0",
  },

  { kind: "heading", id: "amazon-ecosystem", text: "The Amazon ecosystem: 10% of all life on Earth" },
  {
    kind: "paragraph",
    text: "The Amazon rainforest is the most biodiverse terrestrial ecosystem on the planet. It contains an estimated 10 percent of all species on Earth — approximately 40,000 plant species, 1,300 bird species, 3,000 freshwater fish species (more than the entire Atlantic Ocean), 430 mammal species, and an unknown but enormous number of insect species, with estimates running into the millions. The river system itself supports extraordinary adaptations: the boto (pink river dolphin) navigates flooded forests using echolocation to find fish among submerged tree roots. The arapaima, one of the world's largest freshwater fish at up to 3 metres and 200 kg, breathes air at the surface. Electric eels navigate the dark, oxygen-poor waters of blackwater tributaries using electric fields. Many fish species feed on fruits and seeds falling from flooded forest trees — making the trees and the river mutually dependent on each other's productivity.",
  },
  {
    kind: "image",
    art: "amazon-river-dolphin",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Boto_-_Inia_geoffrensis_%28Wikimedia_Commons%29.jpg/1280px-Boto_-_Inia_geoffrensis_%28Wikimedia_Commons%29.jpg",
    caption: "The boto (pink river dolphin) — one of the Amazon's most distinctive species, navigating the flooded forest using echolocation to hunt fish among submerged trees.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The Amazon River contains more fish species than the entire Atlantic Ocean. New species are still being described: scientists identify roughly 100–300 new Amazonian species each year. As of 2024, the total described species count for the Amazon basin exceeds 60,000, but total estimated species — including undescribed insects and microorganisms — may be 10 times higher.",
  },

  { kind: "heading", id: "flooded-forests", text: "Flooded forests: igapó and várzea" },
  {
    kind: "paragraph",
    text: "The Amazon's most distinctive ecological feature is its seasonally flooded forest. During the wet season (December–May in the western Amazon), river levels rise by 10–15 metres, submerging tens of millions of hectares of forest for four to seven months. Two types of flooded forest are ecologically distinct. Várzea is whitewater-flooded forest — inundated by nutrient-rich sediment-laden water from Andean tributaries. It is highly productive and supports the greatest fish diversity. Igapó is blackwater-flooded forest — inundated by nutrient-poor, acidic, tannin-rich water from the Guiana Shield. It appears to glow amber in the low light of submerged forest corridors. Fish have evolved to exploit both systems: many species time their breeding to the flood, using the forest floor as a nursery when it is submerged, and feeding on terrestrial fruits and insects that fall from the trees.",
  },

  { kind: "heading", id: "flying-rivers", text: "Flying rivers: how the Amazon makes its own rain" },
  {
    kind: "paragraph",
    text: "The Amazon rainforest does not merely receive rainfall — it substantially generates it. Trees in the Amazon basin transpire approximately 20 billion tonnes of water into the atmosphere each day, forming low-level clouds and returning precipitation to the forest in a cycle of moisture recycling. These 'flying rivers' — atmospheric rivers of water vapour flowing westward from the Atlantic and then southward over the Andes — supply rainfall to South American cities and agricultural regions far outside the Amazon basin itself. São Paulo, Brazil's largest city with 22 million people, depends partly on Amazon-generated rainfall for its water supply. Scientific modelling suggests that removing 25–40 percent of the Amazon's forest cover would disrupt this atmospheric circulation sufficiently to reduce rainfall across central and southern South America by 20–30 percent — affecting agriculture in Argentina, Bolivia, and southern Brazil.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Flying rivers carry more water than the Amazon River itself. The daily atmospheric moisture flux over the Amazon basin — approximately 20 billion tonnes of water vapour — exceeds the Amazon's own discharge (which averages about 15–18 billion tonnes per day at its mouth). The forest is simultaneously the world's largest river and the world's largest rainfall generator.",
  },

  { kind: "heading", id: "amazon-deforestation", text: "Amazon deforestation: racing toward the tipping point" },
  {
    kind: "paragraph",
    text: "Approximately 17 percent of the Amazon basin had been deforested as of 2024 — an area larger than France. The scientific consensus, based on modelling by Brazilian Earth-system scientists, suggests the system could cross a tipping point into a drier, savanna-like state if deforestation reaches 25–40 percent, at which point the self-sustaining rainfall cycle would no longer be able to maintain tropical forest across the basin. The 2019 dry season fires — many deliberately set to clear land under the Bolsonaro government's loosened enforcement policies — burned an area comparable to a European country in a single season. Following Luiz Inácio Lula da Silva's return to power in 2023, enforcement was strengthened and deforestation rates fell significantly, but scientists warn that the previous decade's losses cannot be reversed on political timescales.",
  },
  {
    kind: "image",
    art: "amazon-deforestation",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Deforestation_in_the_Amazon_-_Brazil.jpg/1280px-Deforestation_in_the_Amazon_-_Brazil.jpg",
    caption: "Deforestation at the Amazon frontier — the sharp boundary between intact rainforest and cleared cattle pasture is characteristic of the arc of deforestation in the Brazilian states of Pará and Mato Grosso.",
    credit: "Wikimedia Commons / CC BY 2.0",
  },

  { kind: "heading", id: "people-of-the-nile", text: "The people of the Nile: 250 million in the basin" },
  {
    kind: "paragraph",
    text: "The Nile basin is home to approximately 250 million people across 11 countries, making it one of the most densely populated river basins in the world relative to the river's size. Egypt alone has 105 million people, virtually all of them clustered within a few kilometres of the Nile or its delta — making Egypt simultaneously one of the most crowded and most empty countries on Earth. The Nile also flows through Khartoum (6 million), Juba, Kampala, and dozens of other cities. Sudan's agricultural economy depends almost entirely on the Nile's waters for irrigation. South Sudan, the world's newest nation (independent 2011), has vast Nile Basin territories but has experienced near-continuous civil conflict since independence, and manages almost none of the water infrastructure its geography would theoretically support.",
  },

  { kind: "heading", id: "people-of-the-amazon", text: "The people of the Amazon: 400 indigenous nations" },
  {
    kind: "paragraph",
    text: "The Amazon basin is home to approximately 30–47 million people, including more than 400 distinct indigenous peoples recognised by Brazilian law — the highest concentration of indigenous cultural diversity of any region on Earth. Brazil's FUNAI (National Indian Foundation) estimates that approximately 114 groups remain in voluntary isolation — having chosen not to make contact with the wider world. These 'uncontacted peoples' live within the Amazon's increasingly threatened protected territories. Non-indigenous settlement in the Amazon is concentrated in cities along the river: Manaus (2.1 million people, deep inside the forest), Belém (2.5 million, at the delta), Iquitos in Peru (500,000 people, accessible only by air or river — one of the largest cities in the world without road access).",
  },

  { kind: "heading", id: "nile-timeline", text: "Timeline: the Nile through history" },
  {
    kind: "timeline",
    title: "The Nile — key moments",
    events: [
      { date: "~3100 BC", text: "Unification of Upper and Lower Egypt under pharaonic rule, made possible by the Nile's predictable flood cycle and the delta's agricultural productivity." },
      { date: "~2560 BC", text: "Great Pyramid of Giza constructed using Nile transport for limestone blocks from Tura quarries." },
      { date: "~450 BC", text: "Herodotus travels the Nile, describes Egypt as 'the gift of the Nile' — a phrase that captures the civilisational dependence on annual flooding." },
      { date: "AD 1858", text: "Burton and Speke expedition reaches Lake Victoria; Speke correctly identifies it as the White Nile's primary reservoir, but Burton disputes the finding." },
      { date: "1875", text: "Henry Morton Stanley confirms Lake Victoria as the Nile's reservoir and identifies Ripon Falls (now submerged by Owen Falls Dam) as the outlet." },
      { date: "1970", text: "Aswan High Dam completed; ends annual Nile flood, eliminates silt delivery to delta, creates 550 km Lake Nasser, requires displacement of 100,000 Nubians." },
      { date: "2011", text: "Construction begins on the Grand Ethiopian Renaissance Dam (GERD) on the Blue Nile in Ethiopia." },
      { date: "2022–24", text: "GERD begins power generation and reaches full operation; Egypt–Ethiopia–Sudan diplomatic negotiations remain unresolved." },
    ],
  },

  { kind: "heading", id: "amazon-timeline", text: "Timeline: the Amazon through European eyes" },
  {
    kind: "timeline",
    title: "The Amazon — key moments",
    events: [
      { date: "1541–42", text: "Francisco de Orellana leads the first European navigation of the full Amazon, from the Napo River tributary to the Atlantic — a journey of over 6,000 km." },
      { date: "1639", text: "Pedro Teixeira leads the first upstream navigation of the Amazon from Belém to Quito, establishing Portuguese claims to the basin." },
      { date: "1799–1804", text: "Alexander von Humboldt explores the Orinoco-Amazon connection (the Casiquiare canal), establishing the scientific study of Amazonian hydrology." },
      { date: "1848–52", text: "Alfred Russel Wallace and Henry Walter Bates conduct biological surveys of the Amazon, documenting thousands of new species." },
      { date: "1960s", text: "Brazil begins constructing Trans-Amazonian Highway; large-scale deforestation begins along access roads." },
      { date: "1988", text: "Brazilian environmental activist Chico Mendes assassinated; his death galvanises global Amazon conservation movement." },
      { date: "2004", text: "PRODES deforestation monitoring system detects peak deforestation year: 27,000 km² lost in a single year." },
      { date: "2007", text: "Brazilian-Peruvian survey traces Amazon to Mantaro River source, measuring length at ~6,992 km — potentially longer than the Nile." },
      { date: "2019", text: "Unprecedented dry season fires burn ~9.7 million hectares of the Amazon under loosened enforcement policies." },
      { date: "2023", text: "Amazon deforestation in Brazil falls to lowest level in 15 years following change in government and enforcement policy." },
    ],
  },

  { kind: "heading", id: "climate-change-connections", text: "Climate change: both rivers under threat" },
  {
    kind: "paragraph",
    text: "The Nile and the Amazon face different but equally profound climate threats. The Nile is fed almost entirely by the Ethiopian and East African monsoon system; changes in East African rainfall — which are projected to become more variable under climate change — directly threaten the river's discharge. At the same time, the population depending on the Nile is projected to reach 400 million by 2050, dramatically increasing demand from a river system that is already fully allocated. The Amazon faces a different crisis: not the loss of its water source, but the destruction of the forest system that sustains its rainfall. Deforestation, combined with a warming climate that is drying the eastern Amazon, means that the two drivers of potential tipping are happening simultaneously — each accelerating the other.",
  },

  ...editorialClosing({
    conclusion:
      "The length debate between the Nile and the Amazon is genuinely unresolved and will remain so until international survey bodies agree on a single headwater convention for the Amazon. What is resolved is everything else: the Amazon carries 74 times more water, drains twice the area, sustains 10 percent of Earth's species, and generates its own rainfall in atmospheric rivers that sustain agriculture across a continent. The Nile's claim to significance lies not in volume but in history — 5,000 years of civilisation built on the reliability of an annual flood that a dam now regulates and a dam further upstream now threatens.",
    remember:
      "The Amazon discharges ~209,000 m³/s — roughly 74 times the Nile's ~2,830 m³/s — carrying ~20% of all river water entering the world's oceans. The length question remains open: conventional figures give the Nile 6,650 km vs the Amazon's 6,400 km, but the 2007 Mantaro-source survey extends the Amazon to ~6,992 km. The GERD dam on the Blue Nile, operational since 2022, is at the centre of the most significant water-rights dispute in Africa.",
    quizTopic: "rivers and hydrology",
  }),
];
