import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "A list of 1,223 sites sounds like a catalogue of trophies. But the UNESCO World Heritage List does something more consequential than celebrate: it constrains. Once a site earns inscription, the country responsible for it must demonstrate, through regular reports and international scrutiny, that nothing incompatible with its Outstanding Universal Value is being built, demolished, or degraded nearby. That obligation has stopped motorways, reversed dam projects, and forced governments to tear down ferry terminals. Understanding how a site gets onto the list — and what happens after — is understanding one of the most consequential bureaucratic instruments in global conservation.",
  },
  {
    kind: "image",
    art: "article-abu-simbel-temples",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Panorama_Abu_Simbel_Oct_2007.jpg/1280px-Panorama_Abu_Simbel_Oct_2007.jpg",
    caption:
      "Abu Simbel temples, Egypt — the international campaign to save them from the Aswan Dam reservoir directly inspired the 1972 World Heritage Convention.",
    credit: "Wikimedia Commons / CC BY-SA 2.0",
  },

  { kind: "heading", id: "convention-1972", text: "The World Heritage Convention 1972" },
  {
    kind: "paragraph",
    text: "The story of the Convention begins with water and stone. In the 1950s, Egypt decided to build the Aswan High Dam across the Nile, which would raise a reservoir that would submerge Abu Simbel — two rock-cut temples commissioned by Ramesses II in the 13th century BC. The temples were among the most important monuments in the world, and Egypt did not have the resources to save them alone. UNESCO organised an international campaign in 1960, raising funds from over fifty countries and engineering an operation that cut the temples from the cliff face and reassembled them, block by block, on higher ground. The project took nine years and cost USD 80 million. When it finished, the lesson was clear: heritage of universal importance required universal responsibility.",
  },
  {
    kind: "paragraph",
    text: "At the 1972 Stockholm Conference on the Human Environment, UNESCO adopted the Convention Concerning the Protection of the World Cultural and Natural Heritage. It entered into force in 1975. Today, 194 states are parties to the Convention — more than have ratified many United Nations treaties — making it one of the most universally adopted international instruments in existence. The Convention defines what counts as cultural and natural heritage, establishes a World Heritage Fund, creates the World Heritage Committee, and commits signatory states to protect not just their own heritage but to cooperate in protecting the world's. The idea that heritage transcends national sovereignty was radical in 1972. Fifty years later, it remains contested wherever development and inscription collide.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The Abu Simbel relocation remains one of the largest and most complex archaeological rescue operations ever undertaken. Engineers moved 20 blocks weighing up to 30 tonnes each, reassembling them so precisely that the original solar alignment — which illuminates the inner sanctuary twice a year — was preserved within one day's accuracy on the calendar.",
  },

  { kind: "heading", id: "ten-criteria", text: "Ten Criteria for Outstanding Universal Value" },
  {
    kind: "paragraph",
    text: "A site must demonstrate Outstanding Universal Value (OUV) to earn inscription. OUV is defined by meeting at least one of ten criteria, divided into six cultural (i–vi) and four natural (vii–x). The criteria were refined over decades and consolidated into their current form in 2005. Every nomination dossier must make an explicit argument for which criteria apply and why, supported by comparative analysis showing the site is not merely significant within its country but measured against the best examples of its type anywhere on Earth.",
  },

  { kind: "heading", id: "cultural-criteria", text: "Cultural Criteria i–vi: The Human Record" },
  {
    kind: "paragraph",
    text: "Criterion i covers masterpieces of human creative genius. This is the most restrictive threshold — reserved for works whose formal or artistic achievement is genuinely singular. The Sydney Opera House (inscribed 2007) meets it because Jørn Utzon's shell-roof structure redefined what was architecturally possible in concrete and represented a creative leap with few precedents. The Sistine Chapel ceiling (within Vatican City, inscribed 1984) meets it because Michelangelo's work transformed the vocabulary of Western religious painting in a way that reverberated for centuries. A building that is beautiful and nationally significant will not suffice; it must be a genuine turning point in human creative history.",
  },
  {
    kind: "paragraph",
    text: "Criterion ii recognises sites that exhibit an important interchange of human values over a span of time or within a cultural area of the world. The Silk Roads network (inscribed as a serial site 2014) meets this criterion because the exchange of goods along those routes was inseparable from the exchange of technologies, religions, languages, and artistic styles across Eurasia. Angkor Wat (Cambodia, inscribed 1992) meets criteria i, ii, iii, and iv simultaneously — Khmer temple architecture synthesised Indian cosmological principles with local Cambodian traditions to produce a built form found nowhere else, while its construction spread architectural and hydraulic engineering techniques across Southeast Asia.",
  },
  {
    kind: "paragraph",
    text: "Criterion iii designates sites that bear unique testimony to a cultural tradition or civilisation that has disappeared or is at risk. The archaeological ruins of Pompeii and Herculaneum (Italy, inscribed 1997) meet it because the catastrophic preservation caused by Vesuvius's 79 CE eruption left a snapshot of Roman daily life — food, graffiti, furniture, bodies — that no other site provides. Auschwitz-Birkenau (Poland, inscribed 1979) meets it as testimony to industrialised genocide: the physical infrastructure of systematic mass murder, preserved as evidence for what the twentieth century was capable of.",
  },
  {
    kind: "paragraph",
    text: "Criterion iv identifies outstanding examples of a type of building, architectural ensemble, or landscape that illustrates a significant stage in human history. The Egyptian Pyramids (inscribed 1979) represent the pinnacle of Old Kingdom funerary architecture. The Taj Mahal (India, inscribed 1983) is the consummate example of Mughal architectural achievement. The criteria demand that the site be judged not merely in isolation but against the best examples of its type globally — a standard that disqualifies many excellent but not uniquely outstanding buildings.",
  },
  {
    kind: "paragraph",
    text: "Criterion v covers outstanding examples of a traditional human settlement, land use, or sea use that represents a culture — especially one rendered vulnerable by the impact of irreversible change. Venice and its Lagoon (Italy, inscribed 1987) is perhaps the archetype: a city built on water that developed unique urban and architectural traditions shaped entirely by its aquatic environment, and which now faces existential threat from rising sea levels and mass tourism. The Rice Terraces of the Philippine Cordilleras (Philippines, inscribed 1995) represent 2,000 years of rice-farming tradition that shaped entire mountainsides and sustained specific community structures — both now at risk as younger generations migrate to cities.",
  },
  {
    kind: "paragraph",
    text: "Criterion vi — the most controversial and restrictive in practice — designates sites directly or tangibly associated with events, living traditions, ideas, or beliefs of outstanding universal significance. UNESCO guidelines explicitly state that this criterion should be used only in 'exceptional circumstances' and 'preferably in combination with other criteria.' The reasoning is that almost any site could be argued to be associated with significant events if the argument is stretched far enough. Sites meeting criterion vi alone are almost never inscribed. Hiroshima Peace Memorial (Japan, inscribed 1996) meets it on the strength of its direct, physical association with the first use of an atomic weapon in warfare.",
  },

  { kind: "heading", id: "natural-criteria", text: "Natural Criteria vii–x: Earth and Ecology" },
  {
    kind: "paragraph",
    text: "Criterion vii addresses exceptional natural beauty or aesthetic importance. The Grand Canyon (USA, inscribed 1979) meets it because its layered colour bands and sheer vertical scale produce a landscape that, in UNESCO's words, is 'an unsurpassed natural spectacle.' Victoria Falls (Zimbabwe/Zambia, inscribed 1989) meets it as one of the world's largest waterfalls by volume, producing a curtain of water and mist visible from 50 kilometres. The criterion requires that the beauty be not merely national but genuinely superlative at a global scale.",
  },
  {
    kind: "paragraph",
    text: "Criterion viii identifies outstanding examples representing major stages of Earth's history, including the record of life, significant ongoing geological processes, or geomorphic features. The Galápagos Islands (Ecuador, one of the first sites inscribed in 1978) demonstrate ongoing volcanic island formation and the evolutionary divergence of species in isolation. The Dolomites (Italy, inscribed 2009) represent a fossil reef from the Triassic period exposed by Alpine uplift — a geological record of an ancient sea embedded in a mountain range.",
  },
  {
    kind: "paragraph",
    text: "Criterion ix covers outstanding examples representing significant ongoing ecological and biological processes in the evolution and development of terrestrial, freshwater, coastal, and marine ecosystems. The Serengeti National Park (Tanzania, inscribed 1981) meets it because the wildebeest migration — one to two million animals following rain and grass across 40,000 square kilometres seasonally — is the largest terrestrial mammal migration on Earth and an ongoing ecological process of extraordinary scale. The Amazon's Jaú National Park meets it because Amazonian biodiversity and ecological processes remain active laboratories of evolution.",
  },
  {
    kind: "paragraph",
    text: "Criterion x designates the most important natural habitats for in-situ conservation of biological diversity, including threatened species of outstanding universal value from science or conservation standpoints. The Great Barrier Reef (Australia, inscribed 1981) is the criterion's paradigm case: 2,300 kilometres of living reef supporting 1,500 species of fish, 4,000 mollusk species, and hundreds of coral species. As climate change bleaches the reef at unprecedented rates, the site now sits on the borderline of the Danger List, and Australia has repeatedly had to justify why it should not be added.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Most inscribed sites meet more than one criterion. The Inca Historic Sanctuary of Machu Picchu (Peru) meets criteria i, iii, vii, and ix — cultural achievement, unique civilisational testimony, exceptional beauty, and significant ecological processes all in one mountain citadel. Sites meeting both cultural and natural criteria are officially classified as Mixed Heritage sites.",
  },

  { kind: "heading", id: "notable-sites-table", text: "Ten Notable Sites and Their Criteria" },
  {
    kind: "table",
    title: "Selected World Heritage Sites by criteria and year of inscription",
    columns: ["Site", "Country", "Year Inscribed", "Criteria Met", "Category"],
    rows: [
      ["Galápagos Islands", "Ecuador", "1978", "vii, viii, ix, x", "Natural"],
      ["Pyramids of Giza (Memphis)", "Egypt", "1979", "i, iii, vi", "Cultural"],
      ["Great Barrier Reef", "Australia", "1981", "vii, viii, ix, x", "Natural"],
      ["Serengeti National Park", "Tanzania", "1981", "vii, x", "Natural"],
      ["Taj Mahal", "India", "1983", "i, ii", "Cultural"],
      ["Angkor Wat", "Cambodia", "1992", "i, ii, iii, iv", "Cultural"],
      ["Auschwitz-Birkenau", "Poland", "1979", "vi", "Cultural"],
      ["Machu Picchu", "Peru", "1983", "i, iii, vii, ix", "Mixed"],
      ["Stonehenge", "United Kingdom", "1986", "i, ii, iii", "Cultural"],
      ["Yellowstone National Park", "USA", "1978", "vii, viii, ix, x", "Natural"],
    ],
  },

  { kind: "heading", id: "nomination-process", text: "The Nomination Process Step by Step" },
  {
    kind: "paragraph",
    text: "The route to inscription is long by design. A state party must first place a potential site on its Tentative List — a national inventory of candidates — and the site must remain there for at least one year before a formal nomination can begin. Most sites wait far longer: the average time between Tentative List entry and final inscription is seven years, and many sites have waited fifteen or more. The purpose of the waiting period is to allow states to prepare documentation, consult with communities, and assess whether the site genuinely meets the global standard rather than simply being nationally cherished.",
  },
  {
    kind: "list",
    ordered: true,
    items: [
      "Place site on the national Tentative List — minimum 1 year before nomination can proceed.",
      "Commission comparative study: show the site is exceptional globally, not just nationally.",
      "Define boundaries and buffer zones: the exact extent of what will be protected.",
      "Prepare the nomination dossier (typically 300–800 pages): history, significance, management plan, protection legislation, condition assessment, and conservation history.",
      "Submit dossier to the World Heritage Centre by 1 February of the evaluation year.",
      "ICOMOS (cultural) or IUCN (natural) carries out independent field evaluation — a team visits the site, interviews officials and communities, and reviews the file.",
      "Advisory body submits its recommendation: Inscribe, Refer (return for more information), Defer (fundamental issues), or Not Inscribe.",
      "World Heritage Committee considers the case at its annual session (June–July): 21 elected member states vote.",
    ],
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "The average nomination dossier runs 500 pages. Preparing one typically costs between USD 500,000 and USD 2 million in professional fees, travel, and documentation — a sum that creates a systematic disadvantage for smaller and poorer states, whose capacity to prepare competitive dossiers is limited.",
  },

  { kind: "heading", id: "world-heritage-committee", text: "The World Heritage Committee" },
  {
    kind: "paragraph",
    text: "The 21-member World Heritage Committee is the governing body of the Convention, elected by state parties for four-year terms. Membership rotates, though influential countries use diplomatic leverage to maintain seats more often than the rotation rules intend. The Committee meets once a year, typically in late June or July, alternating between UNESCO headquarters in Paris and host cities. Sessions last up to ten days and cover hundreds of agenda items: new nominations, state of conservation reports, reactive monitoring, budget decisions, and policy debate. In practice, the Committee has a long history of overriding advisory body recommendations — particularly to inscribe sites that ICOMOS or IUCN recommended deferring — under diplomatic pressure from the nominating state and its allies.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "In some Committee sessions, bloc voting — where regional groups of countries support each other's nominations in exchange for reciprocal support — has led to criticism that the inscription process is more diplomatic than scientific. Several studies have found that nominating countries with Committee seats have statistically higher inscription rates than those without.",
  },

  { kind: "heading", id: "natural-cultural-mixed", text: "Natural, Cultural, and Mixed Sites" },
  {
    kind: "facts",
    title: "World Heritage Register composition (2024)",
    facts: [
      { label: "Total inscribed sites", value: "1,223" },
      { label: "Cultural sites", value: "952 (77.8%)" },
      { label: "Natural sites", value: "231 (18.9%)" },
      { label: "Mixed sites (both categories)", value: "40 (3.3%)" },
      { label: "Sites on the Danger List", value: "56" },
      { label: "Countries represented", value: "167" },
      { label: "State parties to Convention", value: "195" },
    ],
  },
  {
    kind: "image",
    art: "article-great-barrier-reef",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/Great_Barrier_Reef_2090_Nevit.jpg/1280px-Great_Barrier_Reef_2090_Nevit.jpg",
    caption:
      "The Great Barrier Reef, Australia — inscribed 1981, meeting all four natural criteria (vii–x), it is the world's largest coral reef system and faces severe threat from climate-driven bleaching.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  { kind: "heading", id: "countries-most-sites", text: "Countries with the Most Sites" },
  {
    kind: "paragraph",
    text: "The geographic distribution of World Heritage Sites is heavily skewed toward Europe and East Asia. Italy leads with 58 inscribed sites — a reflection of the extraordinary density of Roman, medieval, and Renaissance monuments across the peninsula, as well as the country's long experience in preparing technically sophisticated nomination dossiers. China follows with 57 sites, representing the systematic inscription of imperial palaces, classical gardens, ancient towns, and natural landscapes across its territory. Germany has 52 sites and France 52, both with deep institutional investment in heritage management. Spain rounds out the top five with 50, drawing on Moorish, Roman, and Baroque monuments as well as natural parks. The entire African continent south of the Sahara — 48 countries covering one-fifth of the Earth's land surface — has fewer inscribed sites than Italy alone.",
  },
  {
    kind: "facts",
    title: "Countries with most World Heritage Sites (2024)",
    facts: [
      { label: "Italy", value: "58 sites" },
      { label: "China", value: "57 sites" },
      { label: "Germany", value: "52 sites" },
      { label: "France", value: "52 sites" },
      { label: "Spain", value: "50 sites" },
      { label: "India", value: "42 sites" },
      { label: "Mexico", value: "35 sites" },
    ],
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Italy (58 sites) has more World Heritage Sites than all of Sub-Saharan Africa combined. The 1994 Global Strategy specifically aimed to redress this imbalance by encouraging nominations from under-represented regions, cultural categories, and heritage types — but progress has been slow.",
  },

  { kind: "heading", id: "danger-list", text: "The List of World Heritage in Danger" },
  {
    kind: "paragraph",
    text: "Sites can be placed on the List of World Heritage in Danger when they face serious threats to the values for which they were inscribed. The threats may be natural — flooding, earthquakes, climate-driven habitat change — or human: armed conflict, uncontrolled urbanisation, destructive infrastructure projects, or lack of management resources. As of 2024, 56 sites appear on the Danger List. The list is not a punishment: it is designed to mobilise international attention, technical assistance, and emergency funding. In practice, Danger List status can focus diplomatic pressure on governments to reverse damaging decisions, or alternatively, create embarrassment that motivates action. Syria currently has six sites on the Danger List, including the ancient cities of Aleppo and Damascus, damaged or threatened by the civil war that began in 2011.",
  },
  {
    kind: "paragraph",
    text: "The Danger List is also used proactively, as a lever. When governments announce plans that would compromise a site's integrity — a road through a protected zone, a high-rise development in a historic skyline, a dam upstream from an inscribed river valley — UNESCO can threaten Danger List inscription to force reconsideration. Austria altered plans for the Vienna Stadtpark and delayed the construction of a high-rise at Heumarkt for years after the historic centre was added to the Danger List in 2017. The threat of listing, and the diplomatic embarrassment it represents, sometimes achieves what the formal listing itself would not.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The Arabian Oryx Sanctuary in Oman became the first site ever delisted from the World Heritage register in 2007 — not because of external threats, but because Oman voluntarily reduced the protected area by 90 percent to allow oil exploration. The Committee delisted the site by majority vote, a decision that remains controversial as a precedent for what economic interests can override.",
  },

  { kind: "heading", id: "removals", text: "Sites Removed from the Register" },
  {
    kind: "paragraph",
    text: "Only three sites have been fully removed from the World Heritage List. The Arabian Oryx Sanctuary (Oman) was delisted in 2007 after the protected area was reduced by 90 percent for oil exploration. The Dresden Elbe Valley (Germany) lost its status in 2009 after local authorities built a four-lane bridge directly through the protected river landscape despite sustained Committee warnings spanning six years. Liverpool Maritime Mercantile City (United Kingdom) was delisted in 2021 following the approval and partial construction of a major waterfront development — including an arena and hotel complex — that the Committee judged incompatible with the site's integrity. Each removal followed years of reactive monitoring, heritage missions, and diplomatic correspondence before a vote was taken.",
  },
  {
    kind: "image",
    art: "article-liverpool-albert-dock",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Albert_Dock%2C_Liverpool.jpg/1280px-Albert_Dock%2C_Liverpool.jpg",
    caption:
      "Liverpool's Albert Dock — part of the Maritime Mercantile City that was removed from the World Heritage List in 2021, one of only three sites ever delisted.",
    credit: "Wikimedia Commons / CC BY 2.0",
  },

  { kind: "heading", id: "tourism-paradox", text: "Machu Picchu and the Tourism Paradox" },
  {
    kind: "paragraph",
    text: "Inscription is supposed to protect sites. The paradox is that the UNESCO label also markets them. Before Machu Picchu (Peru, inscribed 1983) became internationally famous, the site received a few thousand visitors a year, most of them arriving on foot via the four-day Inca Trail. By the early 2000s, visitor numbers exceeded 400,000 per year. By 2019, they exceeded 1.5 million. The infrastructure built to receive tourists — a town, a hotel, a railway, a helicopter service — sits in the lower valley in ways that conservation managers consider incompatible with the site's integrity. The Inca Trail now requires booking months in advance with strict daily limits, and UNESCO has repeatedly urged Peru to impose visitor caps on the citadel itself.",
  },
  {
    kind: "paragraph",
    text: "The tourism paradox is not unique to Machu Picchu. Venice, Angkor, Stonehenge, the Galápagos Islands, and the Old Town of Dubrovnik all report that inscription accelerated visitor growth beyond what heritage management plans anticipated. The increased income is real and often supports maintenance and employment in communities that depend on tourism economically. But the physical wear on monuments, the displacement of residents by tourism infrastructure, and the erosion of the cultural practices that made a site significant in the first place are equally real costs. UNESCO has begun requiring visitor management plans as part of nomination dossiers, precisely because inscription without management planning creates the damage it was meant to prevent.",
  },
  {
    kind: "image",
    art: "article-machu-picchu",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Machu_Picchu%2C_Peru.jpg/1280px-Machu_Picchu%2C_Peru.jpg",
    caption:
      "Machu Picchu, Peru — inscribed in 1983 and now receiving over one million visitors per year, it is the paradigm case of the inscription-driven tourism paradox.",
    credit: "Wikimedia Commons / CC BY 2.0",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Machu Picchu received approximately 4,000 visitors per year before international recognition grew in the 1970s. By 2019, annual visits exceeded 1.57 million — a 400-fold increase. UNESCO's own management guidelines suggest a sustainable visitor capacity of 2,500 per day; on peak days, three times that number have arrived.",
  },

  { kind: "heading", id: "great-wall", text: "The Great Wall: A Serial Site of Universal Scale" },
  {
    kind: "paragraph",
    text: "The Great Wall of China (inscribed 1987) is perhaps the world's most recognisable cultural monument, but its inscription is not straightforward. What is called 'the Great Wall' is actually a series of walls, barriers, watchtowers, and fortifications built across many dynasties over approximately 2,000 years. The total length of all wall sections has been estimated at over 21,000 kilometres. The inscription was granted under criteria i, ii, iii, iv, and vi, recognising its extraordinary architectural achievement, its testimony to the political history of Chinese civilisation, and its status as a work of fortification architecture with no peer anywhere on Earth. Less than 10 percent of the surviving wall is in good condition; most is deteriorated or unprotected.",
  },
  {
    kind: "image",
    art: "article-great-wall-china",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/The_Great_Wall_of_China_at_Jinshanling-edit.jpg/1280px-The_Great_Wall_of_China_at_Jinshanling-edit.jpg",
    caption:
      "The Great Wall at Jinshanling, China — inscribed 1987 under five criteria, spanning over 21,000 kilometres of fortifications built across two millennia of Chinese history.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  { kind: "heading", id: "politics-of-heritage", text: "The Politics of Heritage" },
  {
    kind: "paragraph",
    text: "No aspect of the World Heritage process is more politically charged than the inscription — or attempted inscription — of sites whose political status is disputed. Jerusalem's Old City was nominated by Jordan in 1981 and inscribed over Israeli objection, which had argued the site could only be nominated by the state with sovereignty over it. The same session placed Jerusalem on the Danger List — the only site to be added to the Danger List at the same time as inscription. The listing remains contested decades later. Israel and the United States have periodically reduced their UNESCO funding contributions or withdrawn from the organisation partly in response to what they characterise as politically motivated decisions over Palestinian and Israeli heritage.",
  },
  {
    kind: "paragraph",
    text: "Small island states and Pacific nations are systematically under-represented on the World Heritage List. Several factors compound: the cost of nomination dossiers relative to national budgets, the lack of specialist heritage professionals with experience navigating UNESCO's bureaucratic requirements, the dominance of the OUV framework by categories — ancient monuments, classical architecture, biodiversity hotspots — that do not easily capture Pacific and Oceanic heritage types such as navigational knowledge, cosmological landscapes, and living oral traditions. The Global Strategy launched in 1994 acknowledged these structural gaps, but the list's composition has not fundamentally changed in response.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The Auschwitz-Birkenau inscription involved a naming dispute that lasted years. Poland and Jewish organisations disagreed over whether the site should be named 'Auschwitz' — the German name for the Polish city of Oświęcim — or whether a more descriptive or historically accurate title should be used. The Committee eventually settled on the dual name 'Auschwitz Birkenau, German Nazi Concentration and Extermination Camp (1940–1945)' — one of the longest official site names in the register.",
  },

  { kind: "heading", id: "rejections-controversies", text: "Notable Rejections and Controversies" },
  {
    kind: "paragraph",
    text: "Liverpool's failed attempt to save its inscription is the most documented recent controversy. After years of warnings about the proposed waterfront development at Bramley-Moore Dock (an arena complex), the Committee voted 13 to 5 to delist the city in 2021. The UK government had argued the development would have negligible impact on the site's values; UNESCO's advisory mission report disagreed, finding that the proposed structures would permanently impair the historic dock landscape. The vote was the third full delisting in Convention history and the first involving a G7 country.",
  },
  {
    kind: "paragraph",
    text: "The Sagrada Família in Barcelona presents a different kind of controversy. Antoni Gaudí's unfinished basilica is one of the most visited buildings in Europe, and Barcelona has repeatedly proposed it for inscription. ICOMOS has repeatedly found that the ongoing construction — still active, with completion not expected until the 2030s — creates uncertainties about the final form of the structure that make assessment of OUV premature. UNESCO criteria generally require that the significance being evaluated already exists, not that it will exist when construction is eventually complete. The Sagrada Família's case — a 140-year construction project — tests the limits of what 'existing heritage' means.",
  },
  {
    kind: "paragraph",
    text: "The Liangzhu Archaeological Site in China (inscribed 2019) illustrates the opposite: an initially unsuccessful nomination that eventually succeeded after years of additional research. China's first attempts to nominate Liangzhu — a Neolithic city site dating to 3300–2300 BC with evidence of advanced rice farming, jade culture, and urban planning — were deferred partly because comparative analysis with other early urban sites in the region was insufficient. The eventual successful dossier incorporated years of additional excavation and academic comparison. The lesson was that a nomination deferred is not necessarily a nomination denied; it is an invitation to strengthen the argument.",
  },

  {
    kind: "heading",
    id: "intangible-heritage",
    text: "Intangible Cultural Heritage vs. World Heritage",
  },
  {
    kind: "paragraph",
    text: "The World Heritage Convention protects physical places and monuments. A parallel UNESCO instrument — the 2003 Convention for the Safeguarding of the Intangible Cultural Heritage (ICH) — protects practices, expressions, knowledge, and skills. The two systems operate separately. Tango (Argentina and Uruguay), the Mediterranean diet, Noh theatre (Japan), Mongolian traditional ger craftsmanship, and Falconry across multiple countries all appear on the ICH Representative List. A cultural practice associated with a World Heritage Site — the rituals performed at Angkor, the music played in Vienna's coffee houses, the fishing techniques of the Galápagos — may be separately protected under ICH without having any formal link to the site's inscription.",
  },
  {
    kind: "list",
    items: [
      "UNESCO's Representative List of Intangible Cultural Heritage (2024): 677 inscribed elements across 140 countries.",
      "Examples: Tango (Argentina/Uruguay, 2009), Mediterranean diet (multi-country, 2013), Noh theatre (Japan, 2008), Falconry (multi-country, 2016), Reggae music (Jamaica, 2018).",
      "ICH inscription does not protect a physical site — it recognises living practices and knowledge systems.",
      "Critics argue that inscribing a practice can freeze it, turn it into a tourist performance, or create disputes over which community 'owns' it.",
      "The two instruments combined — World Heritage + ICH — represent UNESCO's attempt to protect both the places and the practices that make human culture.",
    ],
  },

  { kind: "heading", id: "after-inscription", text: "What Happens After Inscription" },
  {
    kind: "paragraph",
    text: "Inscription is not the end of the process — it is the beginning of an obligation. Every inscribed site must submit periodic reports to UNESCO on a six-year cycle, documenting the state of conservation, management effectiveness, and any changes to the factors affecting OUV. If UNESCO's World Heritage Centre or an advisory body identifies a specific threat — a proposed development, environmental degradation, conflict damage — it can trigger reactive monitoring, which involves correspondence, site missions, and ultimately the threat of Danger List inscription. States have sometimes received dozens of letters over many years about the same threat before the Committee takes formal action. The process is designed to be diplomatic and incremental, which makes it slow but which also keeps states engaged rather than withdrawing.",
  },

  {
    kind: "timeline",
    title: "Key moments in World Heritage history",
    events: [
      {
        date: "1960",
        text: "UNESCO launches international campaign to save Abu Simbel temples threatened by Aswan High Dam reservoir.",
      },
      {
        date: "1968",
        text: "Relocation of Abu Simbel temples completed after nine years at a cost of USD 80 million, setting the model for international heritage cooperation.",
      },
      {
        date: "1972",
        text: "World Heritage Convention adopted at UNESCO General Conference in Paris; enters into force 1975.",
      },
      {
        date: "1978",
        text: "First twelve sites inscribed, including Galápagos Islands, Simien National Park, Kraków Old Town, and the Quito colonial city.",
      },
      {
        date: "1981",
        text: "Jerusalem's Old City inscribed by Jordan and immediately placed on the Danger List — still there today.",
      },
      {
        date: "1994",
        text: "Global Strategy launched to address Eurocentric imbalance; under-represented regions and heritage types actively encouraged to nominate.",
      },
      {
        date: "2007",
        text: "Arabian Oryx Sanctuary (Oman) becomes the first site ever removed from the World Heritage List.",
      },
      {
        date: "2009",
        text: "Dresden Elbe Valley (Germany) delisted after a four-lane bridge was built through the protected landscape over Committee objections.",
      },
      {
        date: "2021",
        text: "Liverpool Maritime Mercantile City (UK) delisted due to waterfront development; National Geographic officially recognises Southern Ocean as fifth ocean.",
      },
      {
        date: "2024",
        text: "Total sites reaches 1,223 across 167 countries, with 56 currently on the List of World Heritage in Danger.",
      },
    ],
  },

  {
    kind: "image",
    art: "article-stonehenge-wiltshire",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Stonehenge2007_07_30.jpg/1280px-Stonehenge2007_07_30.jpg",
    caption:
      "Stonehenge, England — inscribed 1986 as part of the Stonehenge, Avebury and Associated Sites serial property, meeting criteria i, ii, and iii for its Neolithic ceremonial landscape.",
    credit: "Wikimedia Commons / CC BY-SA 2.0",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The World Heritage List is a political and bureaucratic instrument as much as a conservation tool. Inscription mobilises international attention and sometimes resources, but does not guarantee funding, end development threats, or freeze tourism. It gives countries a label, an obligation to report, and a set of international expectations they must manage.",
  },

  ...editorialClosing({
    conclusion:
      "The World Heritage Convention works best when the threat of losing inscription is credible and the international community is willing to act on it. The three delistings since 2007 have established that removal is possible, even if rare. What the process cannot do is substitute for national political will: a government determined to develop a site can delay, negotiate, and absorb UNESCO criticism for years before the Committee acts. The list is less a wall than a window — it lets the world look in, and makes doing damage in plain sight considerably more complicated.",
    remember:
      "Meeting at least one of ten criteria (six cultural, four natural) is required for inscription. Italy leads with 58 sites. Only three sites have ever been fully removed. The Danger List currently includes 56 sites. The average nomination dossier takes seven or more years from Tentative List to inscription.",
    quizTopic: "UNESCO heritage and conservation",
  }),

  {
    kind: "crossLinks",
    title: "Related articles",
    links: [
      {
        label: "The landmarks everyone misplaces",
        href: "/geolibrary/article/the-landmarks-everyone-misplaces",
        description:
          "Many mislocated landmarks are World Heritage Sites — knowing their actual geography sharpens quiz accuracy.",
      },
      {
        label: "The Nile and the Amazon: which is longest?",
        href: "/geolibrary/article/the-nile-and-the-amazon",
        description:
          "Both river basins contain multiple World Heritage Sites — and both face threats.",
      },
      {
        label: "How the Himalayas keep growing",
        href: "/geolibrary/article/how-the-himalayas-keep-growing",
        description:
          "The Himalayan parks include several World Heritage natural sites tied to active tectonic processes.",
      },
    ],
  },
];
