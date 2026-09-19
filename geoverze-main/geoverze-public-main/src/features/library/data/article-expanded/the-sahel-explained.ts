import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  // Block 1
  {
    kind: "paragraph",
    text: "The word Sahel comes from the Arabic sāḥil, meaning coast or shore. Seen from the Sahara, the description is exact: the Sahel is the shoreline of a sea of sand, a 5,400 km belt of semi-arid scrubland and grassland where rainfall becomes possible again and agriculture returns. It stretches from Senegal on the Atlantic to Eritrea on the Red Sea, crossing some of the most contested and climate-vulnerable terrain on the continent. For most of recorded history, the Sahel was not a periphery but a highway — the corridor along which empires rose on the wealth of trans-Saharan trade, and through which the medieval world's greatest fortunes in gold and salt moved.",
  },

  // Block 2
  { kind: "heading", id: "geography-and-extent", text: "Geography and extent" },
  // Block 3
  {
    kind: "paragraph",
    text: "The Sahel is defined by rainfall rather than political borders. The canonical boundaries are the 200 mm and 600 mm annual isohyets — lines of equal precipitation — with the true desert beginning where rain drops below 200 mm and the wetter Sudan savanna zone beginning above 600 mm. Within those bounds the landscape transitions from near-desert in the north, where shrubs and grasses survive on brief, unpredictable rains, to more stable agricultural land in the south, where millet and sorghum farming has fed generations of Sahelian communities. The dominant vegetation is acacia woodland — thorny, sparse, and extraordinarily well-adapted to drought — interspersed with perennial grasses whose root systems survive dry seasons that would kill most plants.",
  },
  // Block 4
  {
    kind: "facts",
    title: "The Sahel at a glance (2024)",
    facts: [
      { label: "Length", value: "~5,400 km (Atlantic to Red Sea)" },
      { label: "Width", value: "~300–500 km" },
      { label: "Annual rainfall", value: "200–600 mm, single wet season" },
      { label: "Countries in the core Sahel", value: "Senegal, Mauritania, Mali, Burkina Faso, Niger, Chad, Sudan" },
      { label: "Estimated population", value: "~150 million (2024)" },
      { label: "Population growth rate", value: "Among highest globally, ~3%/year" },
    ],
  },
  // Block 5
  {
    kind: "image",
    art: "article-sahel-landscape",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Sahel_Belt.jpg/1280px-Sahel_Belt.jpg",
    caption: "Typical Sahel vegetation — sparse acacia scrub between sandy patches, photographed in Niger.",
    credit: "Wikimedia Commons / Public Domain",
  },

  // Block 6
  { kind: "heading", id: "great-empires", text: "The great Sahelian empires" },
  // Block 7
  {
    kind: "paragraph",
    text: "The Sahel's aridity hides a rich political history. For over a millennium, from roughly 300 CE to 1600 CE, the region was the heartland of a succession of powerful West African empires that controlled the trans-Saharan trade routes linking the gold-producing forests of the south to the North African and Mediterranean worlds to the north. The Ghana Empire — confusingly, centred in modern southeastern Mauritania and western Mali, not in modern Ghana — dominated this trade from around 400 CE to 1100 CE. The empire levied taxes on all gold and salt caravans passing through its territory, accumulating wealth that astonished Arab travellers who recorded their observations. Al-Bakri, writing in 1068, described the Ghanaian king's court as capable of fielding 200,000 warriors and surrounded by gold ornaments beyond counting.",
  },
  // Block 8
  {
    kind: "paragraph",
    text: "The Mali Empire succeeded the Ghana Empire and reached its apogee in the 14th century under Mansa Musa I, who ruled from roughly 1312 to 1337. His 1324–25 pilgrimage to Mecca remains one of the most remarkable journeys in medieval history: he travelled with an entourage estimated at 60,000 people, a personal retinue of 12,000 slaves each carrying four pounds of gold, and 80 camels each loaded with 300 pounds of gold dust. On arrival in Cairo, Musa distributed so much gold that he caused severe inflation — estimates suggest he introduced so much gold into the Egyptian economy that its value fell by 10–25 percent and took over a decade to recover. Timbuktu, under Mali and later Songhai rule, became a major centre of Islamic scholarship, hosting three great mosques and universities with perhaps 25,000 students at their peak.",
  },
  // Block 9
  {
    kind: "paragraph",
    text: "The Songhai Empire, which absorbed Mali's territories in the 15th century, was the largest empire in African history at its peak under Askia Muhammad (r. 1493–1528). It controlled territory stretching from the Atlantic coast to what is now northern Nigeria, and its administrative sophistication — with governors, tax collectors, and a professional army — rivalled any contemporary state anywhere in the world. The empire collapsed in 1591 when a Moroccan expeditionary force of 4,000 soldiers, equipped with gunpowder weapons, crossed the Sahara and routed the Songhai cavalry. The invasion destroyed the centralised political order that had protected trans-Saharan trade for centuries, fragmenting the Sahel into smaller polities that were subsequently vulnerable to slave raiders and later to European colonial penetration.",
  },
  // Block 10
  {
    kind: "image",
    art: "article-timbuktu-sankore-mosque",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Sankore_mosque2.jpg/1280px-Sankore_mosque2.jpg",
    caption: "The Sankore Mosque in Timbuktu, Mali — centre of one of the medieval world's great universities, funded by Saharan trade wealth.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },
  // Block 11
  {
    kind: "timeline",
    title: "The Sahel: from empire to crisis (600–2024)",
    events: [
      { date: "~400 CE", text: "Ghana Empire emerges in the western Sahel; controls gold-salt trade routes." },
      { date: "1068", text: "Arab geographer al-Bakri describes Ghana Empire's capital as one of the world's great cities." },
      { date: "1235", text: "Mali Empire founded by Sundiata Keita after defeating the Ghana Empire at the Battle of Kirina." },
      { date: "1324", text: "Mansa Musa's pilgrimage to Mecca; his gold distribution crashes Cairo's economy." },
      { date: "1375", text: "Songhai Empire expands to become the largest state in African history under Sunni Ali." },
      { date: "1591", text: "Moroccan invasion ends Songhai Empire; trans-Saharan trade networks fragment." },
      { date: "1884–85", text: "Berlin Conference divides the Sahel among France, Britain, Portugal; borders ignore ethnic/ecological realities." },
      { date: "1960", text: "Wave of Sahelian independence — Mali, Niger, Senegal, Burkina Faso, Chad, Mauritania." },
      { date: "1968", text: "Start of catastrophic Sahel drought; rains fail for five consecutive years." },
      { date: "1973", text: "~100,000 deaths; pastoral economies collapse; political crisis in Niger, Mali, Chad." },
      { date: "1984–85", text: "Second major drought and famine; ~1 million deaths across Sahel and Ethiopia." },
      { date: "2007", text: "African Union launches the Great Green Wall initiative." },
      { date: "2012", text: "Tuareg rebellion and jihadist takeover of northern Mali; ECOWAS and France intervene 2013." },
      { date: "2020–2023", text: "Military coups in Mali, Guinea, Burkina Faso, Niger; French forces expelled from the Sahel." },
    ],
  },

  // Block 12
  { kind: "heading", id: "rainfall-variability", text: "Rainfall variability: the governing force" },
  // Block 13
  {
    kind: "paragraph",
    text: "More than any other factor, interannual rainfall variability defines Sahelian life. The West African Monsoon, which drives most of the region's rain, shifts north and south depending on sea surface temperatures in the Gulf of Guinea and, over longer cycles, in the Atlantic as a whole. The 1970s and 1980s Sahel drought was not simply the Sahara expanding southward — it was a sustained anomaly in monsoon positioning driven partly by sea surface temperature patterns and partly by land degradation that reduced evapotranspiration and suppressed local rainfall recycling.",
  },
  // Block 14
  {
    kind: "callout",
    variant: "geography-note",
    text: "The Sahara is not steadily advancing into the Sahel. The desert boundary fluctuates with rainfall — satellite data from 1982 to 2015 showed net vegetation greening across much of the Sahel as rainfall partially recovered after the droughts of the 1970s–80s. The relationship is dynamic, not a one-way march.",
  },

  // Block 15
  { kind: "heading", id: "1968-drought", text: "The great droughts of the 1960s–1980s" },
  // Block 16
  {
    kind: "paragraph",
    text: "From 1968 to 1974, rainfall across the Sahel fell to levels not recorded in the instrumental record. The drought was ultimately attributed to a combination of cooler-than-normal sea surface temperatures in the North Atlantic, a weakened West African Monsoon, and land degradation that had reduced the vegetation cover available to recycle moisture back into the atmosphere. Pastoralists who had survived previous dry years by moving their herds were hemmed in by new national borders, sedentary settlements on former pasture lands, and government policies that discouraged nomadic movement. Approximately 100,000 to 250,000 people died across Niger, Mali, Mauritania, Burkina Faso, Chad, and Ethiopia between 1968 and 1974, with an estimated 3.5 million livestock killed in Niger alone.",
  },
  // Block 17
  {
    kind: "paragraph",
    text: "The political consequences were as severe as the humanitarian ones. The 1968–74 drought contributed to coups in Mali (1968), Mauritania (1978), and Chad (destabilisation throughout the 1970s), and fatally undermined Emperor Haile Selassie's government in Ethiopia (overthrown 1974). A second major drought hit in 1983–84, culminating in the 1984–85 famine that killed an estimated 1 million people and permanently changed how international humanitarian organisations operated. The 1984 Band Aid fundraising effort and the 1985 Live Aid concert were direct responses. The famines also drove foundational changes in food security monitoring: the Famine Early Warning Systems Network (FEWS NET), established in 1985 by the US Agency for International Development, traces its origins directly to the failures of early warning before the Sahel famines.",
  },
  // Block 18
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "The 1968–73 Sahel drought killed between 100,000 and 250,000 people and wiped out an estimated 30–50% of the Sahelian livestock herd — the principal source of wealth and nutrition for millions of pastoralists. Niger, at the drought's epicentre, lost roughly 40% of its cattle population.",
  },

  // Block 19
  { kind: "heading", id: "desertification", text: "Desertification: how land degrades" },
  // Block 20
  {
    kind: "paragraph",
    text: "Desertification — the degradation of dryland into less productive land — is not simply a matter of rainfall declining. The process combines climate variability with human pressure in a feedback loop that can be self-reinforcing. In the Sahel, the mechanism runs as follows: population growth increases the demand for fuelwood, agricultural land and pasture; trees are cut, fallow periods are shortened, and livestock densities exceed what the land can support. Loss of vegetation exposes soil to wind and rain erosion, reducing its organic matter and water retention. The degraded soil grows less vegetation, which further reduces evapotranspiration, which reduces local rainfall recycling, which depresses vegetation growth further. The UNCCD (United Nations Convention to Combat Desertification) estimates that approximately 5.5 billion hectares of land globally are degraded, with drylands like the Sahel disproportionately affected.",
  },
  // Block 21
  {
    kind: "callout",
    variant: "key-idea",
    text: "Desertification is not the Sahara marching south at a measurable rate. It is localised soil degradation triggered by the interaction of climate variability with overgrazing, deforestation, and unsustainable cultivation. The UNCCD estimates that 12 million hectares of productive land are lost to desertification globally each year — an area the size of Benin.",
  },

  // Block 22
  { kind: "heading", id: "great-green-wall", text: "The Great Green Wall" },
  // Block 23
  {
    kind: "paragraph",
    text: "Launched by the African Union in 2007, the Great Green Wall began as an ambitious proposal to plant an actual belt of trees 15 km wide across the entire continent — an ecological firebreak against desert advance. The concept was refined as implementation revealed that monoculture plantations in semi-arid environments tend to fail without sustained intervention. The programme evolved into something more pragmatic: a mosaic of farmer-managed natural regeneration, water-harvesting earthworks called demi-lunes and zaï pits, community grazing management, and restored agricultural land.",
  },
  // Block 24
  {
    kind: "paragraph",
    text: "By 2023 approximately 18 million hectares of degraded land had been restored under the initiative's umbrella, against a target of 100 million hectares by 2030. Ethiopia accounts for a large fraction of the completed area, having planted over five billion trees in a single coordinated national campaign in 2019. The approach in the Sahel countries has increasingly focused on re-establishing native woody vegetation that already exists in seeds and root systems in degraded soils — regeneration rather than planting from scratch. The potential carbon sequestration from full implementation has been estimated at up to 250 million tonnes of CO₂ annually, making it one of the most cost-effective nature-based climate solutions identified at continental scale.",
  },
  // Block 25
  {
    kind: "image",
    art: "article-great-green-wall-niger",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Zai_pits_Niger.jpg/1280px-Zai_pits_Niger.jpg",
    caption: "Zaï pits in southern Niger — traditional water-harvesting technique scaled under the Great Green Wall programme.",
    credit: "Wikimedia Commons / Public Domain",
  },

  // Block 26
  { kind: "heading", id: "traditional-land-management", text: "Ancient solutions for modern problems" },
  // Block 27
  {
    kind: "paragraph",
    text: "Long before the Great Green Wall, Sahelian farmers had developed sophisticated techniques for coaxing life from degraded soils. The zaï system — used for centuries in Burkina Faso, Niger and Mali — involves digging small planting pits 20–30 cm wide and 10–15 cm deep in a regular grid before the rains arrive. Each pit collects water during downpours and is seeded with manure and organic material that attracts termites, whose burrowing loosens the hard soil crust. A single season of zaï can transform barren laterite into productive sorghum or millet fields. Studies conducted in the 1990s found that zaï pits increased crop yields by 30–120% on degraded soils compared to conventional surface planting.",
  },
  // Block 28
  {
    kind: "paragraph",
    text: "Farmer-Managed Natural Regeneration (FMNR) is perhaps the most transformative technique to emerge from the Sahel. Rather than planting new trees — which requires nurseries, labour, and ongoing watering — FMNR protects and prunes existing tree stumps and root systems that have survived in degraded soils. The approach was popularised in Niger by Yacouba Sawadogo, a farmer in the Zinder region who began protecting natural regrowth on his degraded land in the 1980s. By allowing trees to regrow, Sawadogo's fields retained soil moisture, reduced erosion, and eventually supported crops between the trees. By the early 2000s, satellite imagery showed that an estimated 5 million hectares of southern Niger had undergone spontaneous regreening — one of the largest environmental recoveries ever documented in Africa, driven almost entirely by farmers acting independently of government programmes.",
  },
  // Block 29
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Yacouba Sawadogo was known in his village as 'the man who stopped the desert'. Ignored by government extension workers and mocked by neighbours when he began digging zaï pits and protecting trees in the 1980s, his approach had spread to millions of hectares by the 2000s. He was awarded the Right Livelihood Award in 2018.",
  },

  // Block 30
  { kind: "heading", id: "niger-river", text: "The Niger: lifeblood of the Sahel" },
  // Block 31
  {
    kind: "paragraph",
    text: "The Niger River defies expectations for a West African river. At 4,180 km it is Africa's third-longest river, but what makes it remarkable is its course: it rises in the mountains of Guinea, only 250 km from the Atlantic Ocean, then flows north-east away from the sea deep into the Sahel — reaching within 100 km of Timbuktu in Mali before turning south-east and eventually emptying into the Gulf of Guinea in Nigeria, 4,000 km from its source. This paradoxical inland turn, towards the most arid parts of the continent, reflects the river's geological age: the Niger established its course when the Sahara was wetter, and has maintained it as conditions dried.",
  },
  // Block 32
  {
    kind: "paragraph",
    text: "The most important feature of the Niger for the Sahel is its inland delta in central Mali — a vast seasonal wetland of 80,000 km² known as the Macina or the Niger Inland Delta. Between July and December, the river spreads across a flat alluvial plain, creating a labyrinth of channels, lakes and floodplains that support extraordinary biodiversity and agriculture. An estimated 1.5 million people live in and around the delta, depending on its seasonal fisheries (which rank among the most productive freshwater fisheries in Africa), its rice cultivation on recession floodplains, and its dry-season pasture for the 2 million cattle and sheep that graze it annually. Climate change, upstream water withdrawals, and the construction of the Sélingué and Markala dams have reduced peak flood levels in the delta by an estimated 30% since 1960.",
  },
  // Block 33
  {
    kind: "image",
    art: "article-niger-inland-delta",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/NigerInlandDelta.png/1280px-NigerInlandDelta.png",
    caption: "The Niger Inland Delta (Macina) in central Mali — an 80,000 km² seasonal wetland supporting 1.5 million people.",
    credit: "NASA / Wikimedia Commons / Public Domain",
  },

  // Block 34
  { kind: "heading", id: "sahel-countries", text: "Countries of the Sahel" },
  // Block 35
  {
    kind: "table",
    title: "Core Sahel countries: key statistics (2024 estimates)",
    columns: ["Country", "Area (km²)", "Population", "Capital", "Approx. annual rainfall"],
    rows: [
      ["Senegal", "196,722", "18.3 million", "Dakar", "300–1,200 mm (varies N-S)"],
      ["Mali", "1,240,192", "23.5 million", "Bamako", "200–700 mm in Sahel zone"],
      ["Burkina Faso", "274,200", "23.3 million", "Ouagadougou", "300–900 mm"],
      ["Niger", "1,267,000", "27.2 million", "Niamey", "150–800 mm"],
      ["Chad", "1,284,000", "18.3 million", "N'Djamena", "150–1,000 mm"],
      ["Sudan", "1,861,484", "47.6 million", "Khartoum", "100–600 mm in Sahel zone"],
      ["Mauritania", "1,030,700", "4.9 million", "Nouakchott", "100–400 mm"],
    ],
  },
  // Block 36
  {
    kind: "paragraph",
    text: "The core Sahel countries share structural vulnerabilities that compound their climate exposure. They rank among the world's least developed nations on the UNDP Human Development Index: Niger consistently appears in last or second-to-last place globally. All have young, rapidly growing populations — Niger's fertility rate of approximately 7.1 children per woman is the highest recorded anywhere in the world — and urbanisation is accelerating, with Niamey and Ouagadougou among Africa's fastest-growing cities. This demographic trajectory is placing growing pressure on agricultural land, water resources, and government services in countries that already struggle to deliver basic public goods.",
  },

  // Block 37
  { kind: "heading", id: "agriculture-and-food", text: "Agriculture in a margin environment" },
  // Block 38
  {
    kind: "paragraph",
    text: "Sahelian farmers have adapted to variability over centuries. The dominant crops — pearl millet, sorghum, cowpea and groundnuts — are drought-tolerant by selection. Agropastoral systems blend cropping with livestock herding: in wet years cattle graze the north, in dry years herders move south onto agricultural lands. This flexibility, codified in customary agreements between farming and herding communities, is the Sahel's original climate adaptation strategy. The breakdown of those agreements under population pressure and government land policies that privilege settled agriculture has been a persistent driver of conflict since the 1970s.",
  },
  // Block 39
  {
    kind: "callout",
    variant: "history-note",
    text: "The Famine of 1984–85, which killed an estimated 1 million people across the Sahel and Ethiopia, followed a decade of below-average rainfall. It prompted the transformation of international food aid and early-warning systems, and remains the benchmark event in Sahelian climate-crisis history.",
  },

  // Block 40
  { kind: "heading", id: "lake-chad-decline", text: "Lake Chad: the disappearing inland sea" },
  // Block 41
  {
    kind: "paragraph",
    text: "Lake Chad was once one of Africa's largest freshwater bodies, covering up to 26,000 km² in wet periods. By 2024 it covered around 1,500 km² — a contraction of roughly 90 percent since the 1960s. The decline reflects both lower rainfall in its basin and dramatically increased irrigation withdrawals from the Chari and Logone rivers that feed it. Nigeria, Niger, Chad and Cameroon share its shores; an estimated 40 million people depend on its water, fisheries, and lakebed agricultural land.",
  },
  // Block 42
  {
    kind: "image",
    art: "article-lake-chad-decline",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Lake_Chad_by_NASA_1972-2001.jpg/1280px-Lake_Chad_by_NASA_1972-2001.jpg",
    caption: "NASA satellite composites showing Lake Chad's dramatic contraction between 1972 and 2001.",
    credit: "NASA Earth Observatory / Public Domain",
  },
  // Block 43
  {
    kind: "paragraph",
    text: "The human consequences of Lake Chad's shrinkage are among the most tangible climate-impact stories anywhere in the world. The lake's retreat has eliminated livelihoods for hundreds of thousands of fishermen, converted lakebed into contested agricultural land claimed simultaneously by farmers, pastoralists and former fishing communities, and driven large-scale displacement. The Boko Haram insurgency, which has killed over 35,000 people and displaced 2.5 million in the Lake Chad Basin since 2009, has been directly linked by researchers to competition over the lake's shrinking resources. Young men in fishing communities that no longer have fish to catch and farming communities that no longer have water to irrigate represent exactly the demographic from which Boko Haram and affiliated groups recruit.",
  },
  // Block 44
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Lake Chad in numbers: 26,000 km² at its 1963 peak; ~1,500 km² in 2024 — a 94% reduction. 40 million people depend on it across four countries. Irrigation withdrawals account for roughly 50% of the decline; reduced rainfall for the other 50%.",
  },
  // Block 45
  {
    kind: "facts",
    title: "Lake Chad: then and now",
    facts: [
      { label: "Surface area in 1963", value: "~26,000 km² (larger than the US state of New Hampshire)" },
      { label: "Surface area in 2024", value: "~1,500 km² (~94% reduction)" },
      { label: "Countries sharing the lake", value: "Nigeria, Niger, Chad, Cameroon" },
      { label: "People dependent on the lake", value: "~40 million" },
      { label: "Primary cause of shrinkage", value: "Reduced rainfall (~50%) + increased irrigation withdrawals (~50%)" },
      { label: "Boko Haram deaths since 2009", value: ">35,000; 2.5 million displaced in Lake Chad Basin" },
    ],
  },

  // Block 46
  { kind: "heading", id: "conflict-and-governance", text: "Climate, governance and insecurity" },
  // Block 47
  {
    kind: "paragraph",
    text: "The Sahel contains seven of the world's twenty most fragile states by various governance indices. Weak state capacity, competition over shrinking resources, and displacement of farming and herding communities create conditions in which armed groups recruit easily. The region's security situation deteriorated sharply after the 2011 collapse of the Libyan state released large quantities of weapons into the Saharan arms market. By the early 2020s, Mali, Burkina Faso, Niger, and Chad were each experiencing substantial insurgent activity, and several had experienced military coups. French counterinsurgency operations under Operation Barkhane, active from 2014 to 2022, were unable to suppress the insurgencies and were eventually expelled from Mali (2022), Burkina Faso (2023), and Niger (2023).",
  },
  // Block 48
  {
    kind: "dualCompare",
    title: "Sahel challenge: two interconnected crises",
    leftTitle: "Climate pressures",
    leftItems: [
      "Average temperature rising faster than global mean",
      "Growing seasons becoming shorter and less predictable",
      "Lake Chad has shrunk by ~90% since 1963",
      "Desertification affecting ~12 million hectares globally/year",
      "Glacial retreat reducing Saharan oasis water tables",
    ],
    rightTitle: "Governance pressures",
    rightItems: [
      "Seven of the world's twenty most fragile states",
      "Four military coups in three countries, 2020–2023",
      "Displacement: 3+ million internally displaced in Burkina Faso (2024)",
      "Jihadist insurgencies active across six countries",
      "French and European military forces expelled 2022–23",
    ],
  },

  // Block 49
  { kind: "heading", id: "boko-haram-jnim", text: "The security crisis: armed groups and displacement" },
  // Block 50
  {
    kind: "paragraph",
    text: "Boko Haram — whose Arabic name roughly translates as 'Western education is forbidden' — was founded in northeastern Nigeria around 2002 and launched its violent insurgency in 2009 under the leadership of Mohammed Yusuf, who was killed by Nigerian security forces that year. The group subsequently split into factions, the largest being the Islamic State West Africa Province (ISWAP), and spread its operations into Niger, Chad and Cameroon. The Lake Chad Basin became its primary theatre of operations. The group's strategy exploited pre-existing tensions between settled farmers and mobile herders competing for resources that climate change was making increasingly scarce. It offered young men without income, land or prospects an identity, an income, and a weapon.",
  },
  // Block 51
  {
    kind: "paragraph",
    text: "In the central Sahel — Mali, Burkina Faso, and Niger — the dominant insurgent coalition is JNIM (Jamā'at Nusrat al-Islam wal-Muslimīn), formed in 2017 as an al-Qaeda affiliate merging several existing Sahelian jihadist groups. By 2023, JNIM controlled or threatened substantial portions of central and northern Mali, northern Burkina Faso, and parts of Niger. The displacement figures are staggering: Burkina Faso had over 2 million internally displaced persons (IDPs) by early 2024 — roughly 10% of the country's population — making it one of the fastest-growing displacement crises in the world. Farmer-herder conflicts, often framed in ethnic terms between Dogon farmers and Fulani (Peul) pastoralists, intersect with and sometimes fuel the jihadist insurgencies without being identical to them.",
  },
  // Block 52
  {
    kind: "callout",
    variant: "history-note",
    text: "Farmer-herder conflict in the Sahel predates modern jihadist movements by centuries — but its intensity has escalated dramatically since the 1970s as population growth, climate change, and land policy have shrunk the resource base. The traditional diplomatic mechanisms between Fulani pastoralists and sedentary farmers — seasonal agreements over pasture access and crop residue grazing — are collapsing under pressure.",
  },

  // Block 53
  { kind: "heading", id: "climate-projections", text: "What the climate models say" },
  // Block 54
  {
    kind: "paragraph",
    text: "The IPCC's Sixth Assessment Report (AR6, 2022) projected with high confidence that the Sahel will warm at a rate higher than the global mean — estimates suggest 1.5 to 2 times the global average warming rate. At 1.5°C of global warming, mean annual temperatures across the central Sahel are projected to rise by approximately 2–2.5°C relative to pre-industrial levels. At 3°C of global warming — a scenario that current emissions trajectories do not yet rule out — Sahel temperatures would rise by 4–5°C in the hottest months, pushing many areas beyond physiological tolerance thresholds for outdoor agricultural labour during peak season.",
  },
  // Block 55
  {
    kind: "paragraph",
    text: "Precipitation projections for the Sahel are the subject of more scientific uncertainty than temperature projections. Some climate models project a wetter Sahel as rising temperatures intensify the monsoon; others project a drier one as large-scale atmospheric circulation shifts move the monsoon track south. The most recent ensemble projections suggest that while total annual rainfall may increase modestly, its variability will also increase — meaning more extreme wet events and longer dry spells within the same season, making agricultural planning harder even if average rainfall remains stable or increases. The West African Monsoon's sensitivity to both global sea surface temperatures and local land surface conditions means that regional-scale land restoration — such as the Great Green Wall — could meaningfully reduce warming and variability through its effects on evapotranspiration.",
  },
  // Block 56
  {
    kind: "callout",
    variant: "key-idea",
    text: "The Sahel's climate future is not determined solely by global emissions. Regional land management — whether the soil is bare or vegetated, whether trees are cut or protected — creates local climate feedbacks that amplify or dampen global trends. This makes the Great Green Wall and FMNR not merely ecological interventions but climate interventions with measurable effects on regional rainfall.",
  },

  // Block 57
  { kind: "heading", id: "looking-forward", text: "Reasons for cautious optimism" },
  // Block 58
  {
    kind: "paragraph",
    text: "Alongside the daunting list of challenges, the Sahel also offers some of the most compelling evidence anywhere in the world that environmental recovery is possible even in severely degraded landscapes. The satellite-documented regreening of southern Niger — where an estimated 5 million hectares of degraded land recovered between 1985 and 2005 largely through FMNR — demonstrates that degraded soil, once given protection from overgrazing and cutting, often carries the biological potential to recover remarkably quickly. Rainfall returned to near-normal levels after 1990, but the recovery was much more extensive than rainfall alone could explain; the land management changes drove most of the visible vegetation rebound.",
  },
  // Block 59
  {
    kind: "paragraph",
    text: "International commitment to the Sahel has also deepened since the 2010s, though implementation has repeatedly lagged behind pledges. The 2021 One Planet Summit saw donor nations pledge USD 14.3 billion to the Great Green Wall through 2025. The World Food Programme and UN agencies have invested heavily in early-warning systems, cash-transfer programmes, and climate-smart agriculture extension services. Perhaps most importantly, Sahelian farmers themselves — not waiting for government or international intervention — have continued expanding FMNR, zaï systems, and traditional water-harvesting practices across millions of hectares. The solutions to the Sahel's challenges are, in large measure, already known. The question is whether governance, funding, and security will allow them to be applied at the necessary scale.",
  },
  // Block 60
  {
    kind: "image",
    art: "article-sahel-regreening",
    externalSrc: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/Farmer_managed_natural_regeneration.jpg/1280px-Farmer_managed_natural_regeneration.jpg",
    caption: "Farmer-Managed Natural Regeneration (FMNR) in Niger — protected trees regrow on degraded farmland, restoring soil moisture and yields.",
    credit: "World Vision / Wikimedia Commons / CC BY 2.0",
  },

  {
    kind: "dualCompare",
    title: "The Sahel: two futures",
    leftTitle: "High-risk trajectory (3°C warming, governance failure)",
    leftItems: [
      "Sahelian temperatures rise 4–5°C above pre-industrial by 2100",
      "Lake Chad disappears entirely; 40 million people lose water source",
      "Displacement of 50–100 million people by mid-century",
      "Agricultural collapse in Niger, Chad, and Burkina Faso",
      "Continued jihadist expansion into uncontrolled territory",
    ],
    rightTitle: "Recovery trajectory (1.5°C warming, governance improvement)",
    rightItems: [
      "Great Green Wall reaches 100 million ha by 2030; rainfall recycling improves",
      "FMNR and zaï systems restore millions of hectares of degraded farmland",
      "Lake Chad stabilised by transboundary water agreements",
      "Food security strengthened by climate-smart agriculture",
      "Community-led land management reduces farmer-herder conflict",
    ],
  },

  // Blocks from editorialClosing:
  ...editorialClosing({
    conclusion:
      "The Sahel is a zone where climate variability, population growth, land tenure disputes, and state fragility interact in ways that resist simple narratives. It is neither straightforwardly doomed nor straightforwardly recoverable. The vegetation recoveries documented by satellite since the 1980s show that the land is resilient when rainfall cooperates and when farmers are empowered to manage it sustainably. The governance crises of the 2020s show that rainfall and land management alone are not enough. Understanding the Sahel requires holding both realities simultaneously — and knowing the deep history of empire, trade, and adaptation that preceded the crises of the modern era.",
    remember:
      "The Sahel is defined by 200–600 mm annual rainfall. The Sahara boundary is not steadily advancing — it fluctuates with rainfall. Lake Chad has lost ~94% of its surface area since 1963. The Mali Empire under Mansa Musa was among the wealthiest states in medieval world history. FMNR has driven regreening of 5 million hectares in Niger with minimal outside intervention.",
    quizTopic: "African climate, history and geography",
  }),
];
