import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "The first megacity in history was probably London in the 1820s, when its population crossed ten million people and it became the first urban agglomeration in recorded history to reach that threshold. Today there are approximately 35 megacities. By 2050 there may be 50. The question geographers, urban planners, and engineers keep asking is not merely how big a city can get, but what it costs to keep it running — in water, in energy, in food, in political will — and which physical constraints no amount of money can ultimately override. The answer, consistently, is that geography determines the upper limit, and that the most pressing geographical constraint is not land but water.",
  },

  { kind: "heading", id: "what-defines-a-megacity", text: "What defines a megacity" },
  {
    kind: "paragraph",
    text: "The United Nations defines a megacity as an urban agglomeration with more than 10 million inhabitants. The ten million threshold is analytically convenient but somewhat arbitrary — there is no fundamental change in how cities function at precisely this population level. What the threshold captures is a scale at which urban systems behave qualitatively differently: infrastructure demands become non-linear, governance complexity reaches a different order, and the city's relationship with its surrounding region, water supply, and food production changes. The distinction between city proper and urban agglomeration matters enormously for comparative analysis. Tokyo's administrative area (the Tokyo Metropolis) holds approximately 13.9 million people. The Greater Tokyo Area — including Yokohama, Kawasaki, Saitama, and surrounding prefectures — holds approximately 37.4 million. This is the agglomeration figure most commonly cited, and it is the scale at which infrastructure planning must operate.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "City proper vs. urban agglomeration matters for every megacity comparison. New York City proper has about 8.3 million people — not a megacity by the UN definition. The New York metropolitan area has about 20 million. Delhi city proper has about 3 million. The Delhi urban agglomeration has about 33 million. Always check which figure is being cited.",
  },

  { kind: "heading", id: "megacities-today", text: "The world's megacities today" },
  {
    kind: "paragraph",
    text: "As of 2024, the world has approximately 35 urban agglomerations that exceed 10 million people. Two thirds are in Asia, reflecting the continent's share of global population and its pace of industrialisation since 1980. The ranking is dominated by the Global South, with Tokyo — a wealthy developed country exception — remaining the single largest. Africa, which currently has only Lagos and Cairo among the very largest, will dramatically expand its megacity count by 2050 as its population continues to grow faster than any other continent.",
  },
  {
    kind: "table",
    title: "Top 15 urban agglomerations by population (2024 estimates)",
    columns: [
      "Rank",
      "City / Agglomeration",
      "Country",
      "Population (millions)",
      "Primary geographic challenge",
    ],
    rows: [
      ["1", "Tokyo–Yokohama", "Japan", "~37.4", "Earthquake / tsunami risk; ageing population"],
      ["2", "Delhi", "India", "~33.0", "Air quality, groundwater depletion, heat stress"],
      ["3", "Shanghai", "China", "~28.5", "Coastal flooding, subsidence, pollution"],
      ["4", "Dhaka", "Bangladesh", "~22.5", "Flooding, cyclone risk, garment-industry labour"],
      ["5", "São Paulo", "Brazil", "~22.4", "Inequality, water supply, sprawl"],
      ["6", "Mexico City", "Mexico", "~22.0", "Lake-bed subsidence (50 cm/yr in some areas)"],
      ["7", "Cairo", "Egypt", "~21.3", "Nile water dependence, desert heat, overpopulation"],
      ["8", "Beijing", "China", "~21.3", "Water scarcity, air pollution, political pressure"],
      ["9", "Mumbai", "India", "~20.7", "Monsoon flooding, coastal exposure, informal settlements"],
      ["10", "Osaka", "Japan", "~19.0", "Ageing population, earthquake risk"],
      ["11", "Chongqing", "China", "~18.6", "Rapid growth, inland flooding, geography"],
      ["12", "Kinshasa", "DRC", "~17.1", "Extreme poverty, governance, infrastructure deficit"],
      ["13", "Lagos", "Nigeria", "~15.9", "Coastal flooding, informality, infrastructure gap"],
      ["14", "Istanbul", "Turkey", "~15.6", "North Anatolian Fault, earthquake risk"],
      ["15", "Karachi", "Pakistan", "~15.4", "Water supply, heat stress, political instability"],
    ],
  },

  { kind: "heading", id: "geography-of-growth", text: "The geography of megacity growth" },
  {
    kind: "paragraph",
    text: "Megacities cluster in Asia for reasons rooted in physical geography. River deltas and coastal plains — the Ganges-Brahmaputra delta (Dhaka), the Yangtze delta (Shanghai), the Pearl River delta (Guangzhou), the Mekong delta (Ho Chi Minh City) — concentrate agriculture, trade, and population. Monsoon climates provide reliable seasonal rainfall that supports dense rice agriculture, enabling the population densities from which megacities grow. Coastal locations reduce transport costs and enable port-based industrialisation. The megacities of South Asia and Southeast Asia are, in most cases, simply the most recent phase of population concentrations that have been developing in their physical settings for centuries or millennia. Africa's megacities, by contrast, are largely a product of rapid 20th and 21st-century rural-to-urban migration, growing faster than the infrastructure and formal employment base that supported Asian megacity development.",
  },
  {
    kind: "image",
    art: "article-tokyo-shinjuku-skyline",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Skyscrapers_of_Shinjuku_2009_January.jpg/1280px-Skyscrapers_of_Shinjuku_2009_January.jpg",
    caption:
      "Shinjuku district, Tokyo — the world's largest urban agglomeration at ~37.4 million people, and a model of high-density, transit-oriented urban function.",
    credit: "Wikimedia Commons / CC BY 2.0",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Africa will have the world's fastest-growing megacities between 2024 and 2050. Kinshasa (DRC), Dar es Salaam (Tanzania), Lagos (Nigeria), Luanda (Angola), and Abidjan (Côte d'Ivoire) are all on trajectories toward or past 20 million. Unlike Asian megacity growth, much of this is population growth rather than economic migration — the cities are growing before the formal employment base is ready for them.",
  },

  { kind: "heading", id: "tokyo", text: "Tokyo: the megacity that functions" },
  {
    kind: "paragraph",
    text: "Tokyo is the world's largest urban agglomeration at approximately 37.4 million people, and the most frequently cited example that a city of extreme scale can function efficiently. Its success rests on three foundations: the world's most extensive and punctual metro and rail network (approximately 12 million metro trips per day, with average delays measured in seconds per year), a culture of civic discipline that enables extremely high population densities without proportional increases in disorder, and decades of engineering investment in disaster resilience. Tokyo sits at the junction of three tectonic plates and has suffered catastrophic earthquakes in 1923 and 1995. The Metropolitan Area Outer Underground Discharge Channel — completed in 2006 — is a 6.3 km underground system of five vertical shafts and a 177 m-long pressure adjustment tank that captures floodwater from Tokyo's rivers and diverts it to the Edo River, preventing the urban flooding that regularly struck the city before its construction.",
  },
  {
    kind: "image",
    art: "article-tokyo-flood-tunnel",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/G-Cans_Project.jpg/1280px-G-Cans_Project.jpg",
    caption:
      "Tokyo's Metropolitan Area Outer Underground Discharge Channel — one of the world's largest flood control systems, diverting excess river water through underground tunnels to prevent urban flooding.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Tokyo's rail network carries approximately 40 million passenger trips per day across all modes. The Shinjuku station alone handles an estimated 3.5 million passengers daily — the world's busiest railway station. Tokyo's metro network delay average is under 1 minute per trip per year — a benchmark no other megacity comes close to matching.",
  },

  { kind: "heading", id: "delhi", text: "Delhi: the fastest-growing megacity" },
  {
    kind: "paragraph",
    text: "Delhi is projected to overtake Tokyo as the world's largest urban agglomeration sometime in the late 2020s. It is already the world's most polluted major capital city: PM2.5 particulate levels during Delhi's winter inversion season routinely reach 10–15 times the WHO safe limit, driven by vehicle emissions, coal-fired power, industrial activity, and smoke from agricultural burning in neighbouring Punjab and Haryana. The city's groundwater aquifers are being depleted far faster than they are recharged — some projections suggest the Delhi aquifer could be effectively exhausted by the 2030s. Infrastructure is severely stressed: Delhi's water distribution system covers only about 50% of the city with formal piped supply, with the rest relying on tanker trucks, boreholes, and informal distribution. Delhi's master plan 2041 acknowledges all of these pressures but its implementation remains contested.",
  },
  {
    kind: "image",
    art: "article-delhi-smog",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Delhi_smog.jpg/1280px-Delhi_smog.jpg",
    caption:
      "Smog over Delhi — the combination of vehicle emissions, industrial pollution, and agricultural burning creates some of the world's worst urban air quality, particularly in winter.",
    credit: "Wikimedia Commons / CC BY 2.0",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Delhi's air quality index (AQI) reaches 'hazardous' levels (above 300) for an estimated 40–60 days per year. The WHO recommends annual average PM2.5 of 5 µg/m³. Delhi's annual average PM2.5 is approximately 92 µg/m³ — 18 times the WHO guideline. Breathing Delhi's air during winter is estimated to reduce life expectancy by 10 years for long-term residents.",
  },

  { kind: "heading", id: "lagos", text: "Lagos: Africa's rising megacity" },
  {
    kind: "paragraph",
    text: "Lagos is the largest city in Africa and one of the fastest-growing in the world. It sits on a coastal lagoon at the edge of the Gulf of Guinea, roughly at sea level — an extraordinarily vulnerable position for a city of 15+ million that is growing by approximately 700,000 people per year. Much of Lagos's growth is informal: the city has no comprehensive planning system that functions at the pace of its expansion, and large portions of its population live in informal settlements without formal water, sanitation, or electricity connections. Makoko, a settlement of an estimated 300,000 people built on stilts over the Lagos Lagoon, is one of the world's largest floating informal settlements. Eko Atlantic City, a new land reclamation project on the Bight of Benin, is being built as a planned financial district — but its cost means it will serve the city's elite rather than its millions of low-income residents.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "According to some demographic projections, Lagos could become the world's most populous city by 2100, with a population of 85–100 million in the greater metropolitan area. Nigeria's total population is projected to reach 400–500 million by 2100, and Lagos captures a disproportionate share of its urbanisation. At current growth rates, Lagos adds a city the size of Liverpool every month.",
  },

  { kind: "heading", id: "sao-paulo", text: "São Paulo: South America's urban powerhouse" },
  {
    kind: "paragraph",
    text: "São Paulo (22.4 million in the metropolitan area) is the economic engine of South America's largest country and one of the world's wealthiest megacities in absolute terms — its GDP is larger than that of Argentina. It is also a city of extreme inequality: the Gini coefficient of São Paulo's income distribution is one of the highest of any major city. The city's famous helicopter culture reflects this inequality directly: São Paulo has one of the world's largest urban helicopter fleets, estimated at over 2,000 aircraft, used by wealthy residents to bypass the daily gridlock that the city's car-oriented growth model has generated. In 2014–2015, São Paulo experienced a severe water crisis when the Cantareira reservoir system — which supplies approximately 45% of the metropolitan area — fell to 3% capacity, forcing water rationing and revealing the fragility of the city's water infrastructure relative to its size.",
  },
  {
    kind: "image",
    art: "article-sao-paulo-skyline",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Sao_Paulo_-_Bela_Vista.jpg/1280px-Sao_Paulo_-_Bela_Vista.jpg",
    caption:
      "São Paulo's Bela Vista district — South America's largest city, with some of the world's most extreme wealth inequality visible in the contrast between high-rises and favelas.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "São Paulo has over 2,000 registered helicopters — the largest urban helicopter fleet in the world. The city is the largest helicopter market outside the United States. Wealthy residents and businesses use helicopters to bypass São Paulo's catastrophic traffic: the city regularly records over 300 km of gridlock during peak hours.",
  },

  { kind: "heading", id: "dhaka", text: "Dhaka: the world's most densely populated megacity" },
  {
    kind: "paragraph",
    text: "Dhaka, the capital of Bangladesh, is the world's most densely populated megacity at approximately 44,000 people per km² in the metropolitan area — compared to Tokyo at around 6,000/km² and London at around 5,700/km². This extreme density is the result of Bangladesh's geography: a low-lying river delta country with limited land above flood level, and one of the highest national population densities in the world. Dhaka sits at the confluence of several major Bangladeshi rivers, less than 10 m above sea level across most of its area. The garment industry, which employs several million workers in and around Dhaka, is the economic engine of the city's growth — Bangladesh produces approximately 8% of global garment exports. Sea-level rise presents an existential threat: projections suggest that 17% of Bangladesh's land area could be submerged by 2050 under moderate warming scenarios, driving tens of millions of climate migrants toward Dhaka and other cities.",
  },
  {
    kind: "image",
    art: "article-dhaka-density",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Dhaka_City.jpg/1280px-Dhaka_City.jpg",
    caption:
      "Dhaka from above — the world's most densely populated megacity at approximately 44,000 people per km², at severe risk from sea-level rise and river flooding.",
    credit: "Wikimedia Commons / CC BY-SA 2.0",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Bangladesh's average elevation is approximately 12 m above sea level, but large areas of the country are less than 3 m above sea level — including much of the Ganges-Brahmaputra delta. A 1 m sea level rise combined with increased cyclone intensity would threaten approximately 10 million people with regular inundation. Dhaka would be under increasing flooding pressure well before the sea level reaches its coordinates.",
  },

  { kind: "heading", id: "physical-limits", text: "The physical limits of cities" },
  {
    kind: "paragraph",
    text: "Cities face hard physical limits that economic growth cannot override indefinitely. Water supply is typically the most binding: a megacity requires roughly 150–200 litres per person per day for basic urban function, meaning a 20-million-person city needs 3–4 billion litres daily. When the natural water system within economic extraction distance cannot supply this volume — whether due to depletion, pollution, or inadequate rainfall — the city confronts a ceiling that money alone cannot push through indefinitely without massive infrastructure investment. Cape Town's 2018 near-miss with 'Day Zero' — when the city came within three weeks of shutting off municipal taps to its 4.6 million residents — demonstrated this limit vividly. Las Vegas (Nevada, USA) faces a similar constraint: it depends almost entirely on Lake Mead, which fell to record low levels in 2021–2022 due to climate change and overuse across the Colorado River basin.",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Cape Town's 2018 'Day Zero' crisis: the city's six major reservoirs fell to below 13.5% combined capacity. At the crisis peak, residents were restricted to 50 litres per day per person (normal usage ~150 litres). 'Day Zero' — when taps would be shut off — was avoided only by emergency conservation that cut total consumption by 50%. The city of 4.6 million was within weeks of collecting water from communal distribution points.",
  },

  { kind: "heading", id: "urban-heat-islands", text: "Urban heat islands in megacities" },
  {
    kind: "paragraph",
    text: "Every megacity creates its own microclimate, warmer than the surrounding countryside — the urban heat island (UHI) effect. Dark surfaces (asphalt, concrete) absorb solar radiation rather than reflecting it. Buildings trap heat between their walls. Air conditioning units expel heat into the street. Vehicles generate waste heat. The combination raises city temperatures by 2–5°C above surrounding rural areas, a differential that compounds with background climate change. Tokyo's urban heat island is one of the most studied: the city centre is measurably 2–3°C warmer on average than surrounding areas, with peak differentials of 7–8°C on still, clear summer nights. Heat island mitigation strategies include cool roofs (highly reflective surfaces), urban tree cover (each mature tree cools its immediate surroundings by 2–8°C through evapotranspiration), green roofs, and permeable paving that reduces heat absorption.",
  },
  {
    kind: "image",
    art: "article-urban-heat-island",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Urban_heat_island.svg/1280px-Urban_heat_island.svg",
    caption:
      "Urban heat island profile — cities are measurably warmer than surrounding countryside due to dark surfaces, buildings, vehicles, and reduced vegetation, typically by 2–5°C.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "At wet-bulb temperatures above 35°C — where the combination of heat and humidity prevents the human body from cooling by sweating — outdoor activity is physiologically impossible for more than a few hours. Wet-bulb temperatures approaching this limit have been recorded in Karachi, Mumbai, Dhaka, and parts of the Persian Gulf. Climate models suggest that without significant emissions reduction, several megacities may experience regular wet-bulb critical temperatures by the 2050s.",
  },

  {
    kind: "heading",
    id: "urban-geography-models",
    text: "Urban geography models: how megacities break the rules",
  },
  {
    kind: "paragraph",
    text: "Classic urban geography models were developed for mid-20th-century North American and European cities. The Burgess Concentric Zone Model (1925) proposed a central business district surrounded by rings of decreasing affluence — industry, then working-class housing, then middle-class suburbs. The Hoyt Sector Model (1939) modified this to allow affluent and industrial zones to develop in wedge-shaped sectors along transport corridors. The Harris and Ullman Multiple Nuclei Model (1945) recognised that large cities have several distinct centres — business, industrial, and residential — rather than one. Megacities in the developing world largely break all three models. Delhi, Lagos, and Dhaka have informal settlements that do not conform to any ring or sector pattern; wealthy enclaves sit adjacent to extreme poverty; transport corridors often follow colonial infrastructure rather than modern economic logic. These cities are better understood through the lens of geographic opportunity (access to water, flat land) and infrastructure investment than through models built for Chicago in 1925.",
  },
  {
    kind: "dualCompare",
    title: "Classic model vs. modern megacity reality",
    leftTitle: "Classic concentric zone model (Burgess 1925)",
    leftItems: [
      "Central business district at the core",
      "Factory/industry zone immediately surrounding CBD",
      "Working-class housing next, then middle-class suburbs",
      "Wealthiest residents furthest from centre",
      "Designed for Chicago — a planned, industrial North American city",
    ],
    rightTitle: "Typical Global South megacity pattern",
    rightItems: [
      "Multiple business nodes, not one CBD",
      "Wealthy enclaves often surrounded by informal settlements",
      "Industry scattered along colonial-era rail/road corridors",
      "Poorest residents occupy flood-prone, low-elevation peripheries",
      "No simple ring or sector structure — highly fragmented",
    ],
  },

  {
    kind: "heading",
    id: "smart-city-attempts",
    text: "Smart city attempts: top-down vs. organic growth",
  },
  {
    kind: "paragraph",
    text: "The appeal of building a city from scratch — avoiding the accumulated problems of existing megacities — has generated several high-profile planned city projects. Songdo International Business District in South Korea was built on 600 hectares of reclaimed land from 2003 onward, with fibre optic cables to every building, pneumatic waste disposal, integrated traffic management, and CCTV coverage. It remains well under-populated relative to its designed capacity: 300,000 residents were planned; fewer than 100,000 live there two decades on. NEOM in Saudi Arabia, announced in 2017 and including The Line — a proposed 170 km linear city 200 m wide and 500 m tall — has attracted attention for its ambition and scepticism about its feasibility. The consistent lesson from planned megacities is that top-down design struggles to replicate the organic attractors — economic opportunity, social networks, cultural anchors — that make existing cities function as human habitats.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Brasília, Brazil's purpose-built capital, was constructed from 1956–60 and is the most successful large planned city in the developing world. Yet Brasília's planned zones were immediately surrounded by satellite cities of lower-income residents who built the capital and could not afford to live in it — a pattern that has since grown to produce a metropolitan area of 4.8 million, with the informal periphery dwarfing the planned centre.",
  },

  {
    kind: "heading",
    id: "slums-informal",
    text: "Slums and informal settlements: a billion people",
  },
  {
    kind: "paragraph",
    text: "Approximately one billion people globally live in informal settlements — areas characterised by insecure tenure, inadequate infrastructure, and substandard housing. These settlements are not random: they cluster in flood-prone, steep, or otherwise undesirable land that the formal housing market did not develop, typically at the urban periphery or in geographic features (riverbanks, hillsides, industrial zones) that wealthier residents avoided. Dharavi in Mumbai, with an estimated 700,000–1 million residents packed into 2.1 km², is Asia's most densely populated informal settlement and also one of its most economically active: Dharavi generates an estimated $1 billion annually in informal economic output, from leather working and recycling to textile and pottery industries. Kibera in Nairobi, Rocinha in Rio de Janeiro, and Orangi Town in Karachi are similarly characterised by high economic activity and social cohesion alongside severe infrastructure deficits.",
  },
  {
    kind: "image",
    art: "article-dharavi-settlement",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Mumbai_India_Dharavi-Slum.jpg/1280px-Mumbai_India_Dharavi-Slum.jpg",
    caption:
      "Dharavi, Mumbai — one of Asia's largest informal settlements at 700,000–1 million residents in 2.1 km², and one of its most economically active, generating an estimated $1 billion annually.",
    credit: "Wikimedia Commons / CC BY-SA 2.0",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "Dharavi (Mumbai): ~700,000–1M people in 2.1 km² = ~333,000–476,000 people/km². By comparison, Manhattan has ~28,000/km². Kibera (Nairobi): ~250,000 residents in ~2.5 km². Rocinha (Rio de Janeiro): ~70,000–250,000 in 0.86 km² — the largest favela in Brazil. These densities exceed almost every formally planned urban district in the world.",
  },

  { kind: "heading", id: "jakarta-sinking", text: "Jakarta: a city sinking under its own weight" },
  {
    kind: "paragraph",
    text: "Jakarta, the capital of Indonesia and a metropolitan area of approximately 33 million people, is sinking at a rate of 1–25 cm per year depending on location, with North Jakarta having subsided by more than 4 metres in the past 30 years. The cause is groundwater extraction: Jakarta pumps billions of litres of water from underground aquifers annually because its river water is too polluted for domestic use, and the piped water system covers only about 40% of residents. Removing groundwater causes the clay soils above to compact and settle. The subsidence brings sea level closer to the land surface, making flooding more frequent even in years with normal rainfall. Tidal flooding (rob flooding) now regularly inundates North Jakarta districts that were above sea level as recently as the 1980s. Coastal protection structures designed for a certain sea level elevation are progressively undermined as the land sinks beneath them.",
  },
  {
    kind: "image",
    art: "article-jakarta-flooding",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a0/Jakarta_flood_2020.jpg/1280px-Jakarta_flood_2020.jpg",
    caption:
      "Flooding in North Jakarta — the result of land subsidence from groundwater extraction combined with seasonal monsoon flooding and gradual sea-level rise.",
    credit: "Wikimedia Commons / CC BY 2.0",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "North Jakarta subsidence rate: up to 25 cm per year in the fastest-sinking areas — among the fastest urban land subsidence rates in the world. Total subsidence since the 1970s in parts of North Jakarta: over 4 metres. At current rates, approximately 95% of North Jakarta could be below sea level by 2050, making it permanently vulnerable to tidal and storm flooding.",
  },

  {
    kind: "heading",
    id: "jakarta-nusantara",
    text: "Jakarta to Nusantara: the world's largest capital relocation",
  },
  {
    kind: "paragraph",
    text: "Indonesia announced in 2019 that it would relocate its national capital from Jakarta to a newly built city called Nusantara in the East Kalimantan province of Borneo. The decision reflected multiple pressures: Jakarta's subsidence and flooding risk, its chronic traffic congestion (among the worst in the world), its dependence on Java — an island with 57% of Indonesia's 275 million people on just 6.8% of its land area — and a desire to more equitably develop the eastern islands of the archipelago. Nusantara is being built in jungle on Borneo at an estimated cost of $32–35 billion. Construction began in 2022. The first government functions were planned to relocate by 2024, with a full capital transfer target of 2045 — Indonesia's centenary of independence. Whether Nusantara will succeed where previous planned capitals (Brasília, Canberra, Naypyidaw) have partially succeeded and partially struggled remains to be seen.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The world's most notable purpose-built capital cities include Brasília (Brazil, 1960), Canberra (Australia, 1927), Islamabad (Pakistan, 1967), Naypyidaw (Myanmar, 2006), and now Nusantara (Indonesia, in progress). Naypyidaw, built by Myanmar's military junta, is the starkest cautionary tale: it has wide boulevards, ministerial compounds, and official residences — but minimal organic economic or cultural life, with an estimated population of 1 million against an original plan for 10 million.",
  },

  {
    kind: "heading",
    id: "mexico-city-geology",
    text: "Mexico City: built on a drained lake, sinking on clay",
  },
  {
    kind: "paragraph",
    text: "Mexico City was built on the drained bed of Lake Texcoco, which the Aztec capital Tenochtitlán occupied as an island. After the Spanish conquest, the lake was progressively drained from the 17th century onward to create building land. The problem: the former lakebed consists of highly compressible lacustrine clay that settles and compacts as water is extracted from it. Mexico City is sinking at rates of up to 50 cm per year in some districts — the fastest urban subsidence rate in the world. Since 1900, parts of the city have sunk by more than 9 metres. The subsidence is highly uneven, causing buildings to tilt relative to each other and damaging the water, sewage, and drainage infrastructure that runs through the settled soils. The city's 22 million people depend on the same overextracted aquifer that is causing the subsidence, creating a self-reinforcing crisis.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The total subsidence in parts of Mexico City since 1900 exceeds 9 metres — meaning some districts are now 9 m lower than they were 120 years ago. The Metropolitan Cathedral in the historic centre has sunk unevenly, with one end subsiding faster than the other, requiring the injection of concrete under the less-sunk end to level it out. Mexico City's geology is one of the reasons the 1985 earthquake (magnitude 8.1) was so destructive: soft lake sediments amplified seismic waves dramatically.",
  },

  {
    kind: "heading",
    id: "future-megacities",
    text: "The future of megacities: climate threats and limits",
  },
  {
    kind: "paragraph",
    text: "Climate change threatens megacities along multiple vectors simultaneously. Coastal megacities — Bangkok, Jakarta, Shanghai, Miami, Dhaka, Mumbai — face combined threats of sea-level rise, increased storm surge, and land subsidence. Bangkok and Shanghai are already measurably closer to sea level than they were in the 1980s due to combined subsidence and sea-level rise. Inland megacities face heat stress, water scarcity, and food system disruption as agricultural productivity in surrounding regions declines under drought and extreme heat. The seismic risk of Istanbul, Tokyo, and Tehran adds another dimension: a major earthquake in any of these cities would cause casualties and economic disruption at a scale that would affect global supply chains for years. The pandemic of 2020–21 introduced a new consideration: the same density that makes megacities economically productive also makes them disproportionately vulnerable to airborne disease, and the remote work revolution it accelerated has produced measurable population shifts away from the very largest cities in the wealthiest countries.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The limits of megacity growth are geographic, not economic. Water supply, land subsidence, seismic risk, heat stress, and coastal flooding are physical constraints that money can mitigate but cannot eliminate. The megacities most likely to succeed in the long term are those that acknowledge their geographic constraints early enough to engineer around them — as Tokyo has done with earthquakes and floods — rather than those that continue to build as if the constraint does not exist.",
  },

  { kind: "heading", id: "megacity-footprints", text: "Megacity areas: size comparison" },
  {
    kind: "sizeComparison",
    title: "Urban agglomeration footprints (approximate built-up area)",
    items: [
      { label: "Greater Tokyo Area", areaKm2: 13500 },
      { label: "Greater New York", areaKm2: 11642 },
      { label: "Greater Los Angeles", areaKm2: 6299 },
      { label: "Greater Shanghai", areaKm2: 6341 },
      { label: "Greater Delhi NCR", areaKm2: 2072 },
      { label: "Greater London", areaKm2: 1572 },
      { label: "Greater São Paulo", areaKm2: 7947 },
      { label: "Greater Lagos", areaKm2: 1171 },
    ],
  },

  { kind: "heading", id: "megacity-timeline", text: "Timeline: from London to 2050" },
  {
    kind: "timeline",
    title: "The history and future of megacities",
    events: [
      {
        date: "~1820s",
        text: "London becomes the first city in history to reach approximately 1 million residents — and the first megacity (by some definitions, using metro-area population) around 10 million by 1900.",
      },
      {
        date: "1900",
        text: "Only London and New York exceed 5 million residents. Industrialisation is concentrating population in cities for the first time in history.",
      },
      {
        date: "1950",
        text: "New York and Tokyo are the first 10-million megacities. Global urban population is 30% of world total.",
      },
      {
        date: "1975",
        text: "Three megacities: Tokyo, New York, Mexico City. Global urban population reaches 38%.",
      },
      {
        date: "2000",
        text: "Eighteen megacities. Global urban population: 47% — near parity with rural population for first time.",
      },
      {
        date: "2007",
        text: "Tipping point: for the first time in history, more than half the world's population lives in urban areas.",
      },
      {
        date: "2024",
        text: "Approximately 35 megacities. Two thirds in Asia. Tokyo leads at 37.4 million. Global urban population: ~57%.",
      },
      {
        date: "2030 (projected)",
        text: "Approximately 43 megacities. African cities entering the top tier for the first time (Lagos, Kinshasa, Dar es Salaam).",
      },
      {
        date: "2050 (projected)",
        text: "Approximately 50 megacities. Africa hosts the most by number. Global urban population: ~68%.",
      },
    ],
  },

  { kind: "heading", id: "megacity-records", text: "Megacity records" },
  {
    kind: "facts",
    title: "Records and milestones in megacity geography",
    facts: [
      {
        label: "World's largest megacity (2024)",
        value: "Greater Tokyo: ~37.4 million — largest urban agglomeration in history",
      },
      {
        label: "World's most densely populated megacity",
        value: "Dhaka: ~44,000 people per km² in the agglomeration",
      },
      {
        label: "Fastest-growing megacity (2020s)",
        value: "Delhi — adding roughly 500,000 residents per year",
      },
      { label: "City sinking fastest", value: "Mexico City: up to 50 cm/year in some districts" },
      {
        label: "First million-person city in history",
        value: "Rome — approximately 1 million at the height of the empire, ~100 AD",
      },
      {
        label: "First 10-million megacity",
        value: "New York and Tokyo — both crossed threshold ~1950",
      },
    ],
  },

  ...editorialClosing({
    conclusion:
      "The megacity is the defining urban form of the twenty-first century, and its limits are primarily geographic rather than economic. Water supply, land subsidence, heat stress, seismic risk, and coastal flooding are physical constraints imposed by location, geology, and climate. Jakarta is sinking into the sea it was built beside. Mexico City is settling into the lake it displaced. Delhi's aquifer is emptying beneath the world's next largest city. Tokyo has spent decades engineering around its seismic and flood constraints — and remains the closest thing we have to proof that a city of 37 million can actually function. The question for every megacity that follows is whether its geography is a problem that can be engineered around, or a constraint that will ultimately enforce a ceiling.",
    remember:
      "There are approximately 35 megacities today vs. 3 in 1975. Tokyo (~37.4M) is the world's largest. Dhaka is the most densely populated at ~44,000/km². Jakarta is sinking up to 25 cm/year due to groundwater extraction. Africa will have the most megacities by 2050. Mexico City subsides up to 50 cm/year on former lake sediments.",
    quizTopic: "cities and urban geography",
  }),
];
