import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  // Block 1
  {
    kind: "paragraph",
    text: "A capital is a job description, not a single city. When a country assigns its legislature to one place, its presidency to another, and its supreme court to a third, it is not confused — it is usually resolving a political crisis that happened a century ago. Splitting government functions across cities is more common than most atlas readers realise, and the logic behind each arrangement is almost always rooted in the specific tensions of the country's founding. From the windswept plains of South Africa's highveld to the Andean canyon of La Paz, and from the corridors of The Hague to a purpose-built island suburb outside Colombo, split capitals reveal the unfinished business of nations.",
  },

  // Block 2
  { kind: "heading", id: "the-job-description", text: "A capital is a role, not a place" },
  // Block 3
  {
    kind: "paragraph",
    text: "International law says nothing about capitals. The 1933 Montevideo Convention defines a state by population, territory, government and the capacity to enter relations with others — location of the seat of power is left entirely to the state itself. That flexibility is why the phrase 'the capital' is often technically wrong when applied to countries like South Africa or Bolivia. No single city holds all the mandates those words imply. Geography textbooks routinely list one city per country; the political reality is a good deal messier, shaped by civil wars, colonial compromises, ethnic rivalries, and occasionally the personal vanity of heads of state who wanted their birthplace on the map.",
  },
  // Block 4
  {
    kind: "callout",
    variant: "geography-note",
    text: "The United Nations uses the concept of a 'seat of government' rather than 'capital city' in many official registers, precisely because the two often diverge. The Netherlands' seat of government is The Hague; its constitutional capital is Amsterdam.",
  },
  // Block 5
  {
    kind: "image",
    art: "article-pretoria-union-buildings",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/UnionBuildingsPretoria.jpg/1280px-UnionBuildingsPretoria.jpg",
    caption: "The Union Buildings in Pretoria — seat of South Africa's executive since 1913.",
    credit: "Wikimedia Commons / Public Domain",
  },

  // Block 6
  {
    kind: "heading",
    id: "south-africa-model",
    text: "South Africa: the three-way compromise of 1910",
  },
  // Block 7
  {
    kind: "paragraph",
    text: "When Britain united the Cape Colony, Natal, the Transvaal and the Orange River Colony in 1910, each former colony expected a prize. Pretoria, the Boer administrative centre, received the executive presidency. Cape Town, the oldest and most established legislative city, kept Parliament. Bloemfontein, capital of the Orange Free State, was awarded the Appellate Division — today's Supreme Court of Appeal. The arrangement cost the new union three parallel bureaucracies and the expense of an annual ministerial migration between Pretoria and Cape Town when Parliament sits, but it has survived 115 years intact because the political cost of dismantling it would be even higher.",
  },
  // Block 8
  {
    kind: "facts",
    title: "South Africa's three capitals",
    facts: [
      { label: "Pretoria (Executive)", value: "Population ~2.5 million (2023)" },
      { label: "Cape Town (Legislative)", value: "Population ~4.6 million (2023)" },
      { label: "Bloemfontein (Judicial)", value: "Population ~430,000 (2023)" },
      { label: "Distance: Pretoria–Cape Town", value: "~1,460 km by road" },
    ],
  },
  // Block 9
  {
    kind: "paragraph",
    text: "The parliamentary migration is South Africa's most visible symbol of its split: every year when the National Assembly sits — broadly February through June — the President and Cabinet ministers relocate from Pretoria to Cape Town for the legislative session. Ministerial staff, security details, departmental documents and diplomatic schedules all shift 1,460 km south. Independent estimates place the annual cost of this logistical operation at between R300 million and R500 million. The South African Parliament has occasionally commissioned studies into consolidation, and each study reaches broadly the same conclusion: the political resistance from both Western Cape and Gauteng provincial interests makes any change more expensive than the status quo, however absurd that status quo looks on paper.",
  },
  // Block 10
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "South Africa spends an estimated R300–500 million per year on the annual Pretoria–Cape Town parliamentary migration — a 1,460 km relocation of ministers, staff, and security apparatus that has occurred every year since 1910.",
  },
  // Block 11
  {
    kind: "image",
    art: "article-cape-town-parliament",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Parliament_of_South_Africa_-_Cape_Town.jpg/1280px-Parliament_of_South_Africa_-_Cape_Town.jpg",
    caption:
      "The South African Parliament buildings in Cape Town, legislative home since the Union of 1910.",
    credit: "Wikimedia Commons / CC BY-SA 4.0",
  },

  // Block 12
  {
    kind: "heading",
    id: "south-africa-judicial",
    text: "Bloemfontein: the capital that gets overlooked",
  },
  // Block 13
  {
    kind: "paragraph",
    text: "Bloemfontein is the least famous of the three. Known locally as Mangaung — the isiSotho word for 'place of cheetahs' — it sits on the flat central highveld some 400 km south of Johannesburg. Its claim to national significance rests almost entirely on the Supreme Court of Appeal, South Africa's highest court for non-constitutional matters. The Constitutional Court, confusingly, sits in Johannesburg rather than Bloemfontein, a quirk introduced in the post-apartheid constitutional settlement. Bloemfontein also hosted the founding congress of the African National Congress in 1912, giving it a history-of-liberation significance that sits uneasily alongside its administrative modesty. For most South Africans, its capital status is a pub-quiz answer rather than a daily reality.",
  },

  // Block 14
  {
    kind: "heading",
    id: "bolivia-case",
    text: "Bolivia: constitutional memory and practical power",
  },
  // Block 15
  {
    kind: "paragraph",
    text: "Bolivia has two capitals that reflect a civil war fought between 1898 and 1899. Sucre was the original capital after independence in 1825, home to Congress and the judiciary. The city of La Paz had grown wealthy on silver and tin revenues, and its liberal factions pushed a federal arrangement that effectively moved executive and legislative power north. The compromise was cosmetic: Sucre retained its constitutional title and the Supreme Court, while La Paz became the seat of government and congress. At an altitude of 3,640 metres, La Paz is also the world's highest national seat of government — a geography fact with real consequences for anyone arriving from sea level.",
  },
  // Block 16
  {
    kind: "paragraph",
    text: "The altitude of La Paz is not merely a curiosity for acclimatisation guides. At 3,640 metres, atmospheric oxygen levels run roughly 40 percent lower than at sea level. Visitors commonly experience soroche — acute mountain sickness — within hours of arrival, with symptoms including headache, breathlessness and nausea. Political consequences follow: foreign diplomats and visiting dignitaries must build acclimatisation days into official schedules, and some medical conditions render high-altitude residence medically inadvisable. The suburb of El Alto, effectively part of greater La Paz, sits at 4,150 metres and is Bolivia's second-largest city. The geography of the Bolivian capital creates an altitude barrier that has no equivalent in any other national seat of government in the world.",
  },
  // Block 17
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The Federal War of 1898–99 lasted less than a year but permanently rewrote Bolivian political geography. The Liberal Party, backed by La Paz's tin-mining interests, defeated the Conservative Party of Sucre in a short but decisive conflict, shifting Congress northward. Sucre's consolation prize was permanent retention of the Supreme Court and the constitutional designation as capital.",
  },
  // Block 18
  {
    kind: "image",
    art: "article-la-paz-aerial",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b7/La_Paz%2C_Bolivia_%28cropped%29.jpg/1280px-La_Paz%2C_Bolivia_%28cropped%29.jpg",
    caption: "La Paz spread across a canyon at 3,640 m — the world's highest seat of government.",
    credit: "Wikimedia Commons / Public Domain",
  },
  // Block 19
  {
    kind: "facts",
    title: "Bolivia's two capitals compared",
    facts: [
      { label: "Sucre — constitutional capital", value: "Altitude 2,810 m; population ~290,000" },
      { label: "La Paz — seat of government", value: "Altitude 3,640 m; population ~835,000" },
      { label: "La Paz metro (inc. El Alto)", value: "~2.4 million" },
      { label: "Distance between cities", value: "~580 km by road" },
      { label: "Sucre designation", value: "Constitutional capital since 1825" },
    ],
  },

  // Block 20
  { kind: "heading", id: "sucre-white-city", text: "Sucre: the white city of independence" },
  // Block 21
  {
    kind: "paragraph",
    text: "Sucre retains a colonial grandeur that La Paz, buried in its canyon, cannot match. Its whitewashed baroque churches and colonial administrative buildings earned it UNESCO World Heritage designation in 1991. The Casa de la Libertad — originally the Jesuit university's graduation hall — was the room in which Bolivia's independence was declared on 6 August 1825 and where Simón Bolívar himself signed the founding documents. The Bolivian Constitution, which gave Sucre its permanent capital status, is displayed there. The city's Supreme Court of Justice continues to operate, serving as a daily reminder that La Paz's dominance is practical rather than constitutional. About one third of Bolivia's law students study in Sucre, and its legal-academic culture has survived the political loss of Congress by 125 years.",
  },

  // Block 22
  { kind: "heading", id: "netherlands-hague", text: "The Netherlands: a constitutional curiosity" },
  // Block 23
  {
    kind: "paragraph",
    text: "The Dutch arrangement is Europe's clearest example of the distinction between formal constitutional status and practical governance. Amsterdam is the constitutional capital — the monarch is inaugurated there, the constitution names it. The Hague is where Parliament sits, where every ministry operates, and where most foreign embassies maintain their missions. The split emerged gradually rather than by decree: Amsterdam was the commercial heart of the Dutch Republic, but The Hague had been the seat of the States-General since the sixteenth century, and neither city ever fully absorbed the other's function.",
  },
  // Block 24
  {
    kind: "callout",
    variant: "history-note",
    text: "The Hague hosts more international organisations per capita than anywhere else on earth, including the International Court of Justice and the International Criminal Court, partly because its status as a diplomatic rather than commercial city made it a politically neutral venue.",
  },
  // Block 25
  {
    kind: "paragraph",
    text: "The Hague's role as a diplomatic city predates international law itself. The States-General of the Dutch Republic convened there from 1585, and the city never developed as a major trading or manufacturing centre — making it politically neutral in ways that Amsterdam, with its vast commercial interests, could never be. The 1899 Hague Peace Conference established the Permanent Court of Arbitration, the world's oldest intergovernmental organisation for the resolution of international disputes, cementing the city's identity as a hub for the laws of nations. After World War II, the International Court of Justice took up residence in the Peace Palace — built in 1913 with funding from Andrew Carnegie — and the city's international legal vocation has only deepened since. The International Criminal Court opened there in 2002.",
  },
  // Block 26
  {
    kind: "facts",
    title: "International legal institutions in The Hague",
    facts: [
      {
        label: "International Court of Justice",
        value: "Founded 1945; 15 judges; main UN judicial organ",
      },
      { label: "International Criminal Court", value: "Founded 2002; 123 state parties" },
      {
        label: "Permanent Court of Arbitration",
        value: "Founded 1899; oldest intergovernmental dispute body",
      },
      {
        label: "Organisation for the Prohibition of Chemical Weapons",
        value: "HQ The Hague since 1997",
      },
      { label: "Europol", value: "EU law enforcement agency, The Hague since 1994" },
    ],
  },
  // Block 27
  {
    kind: "image",
    art: "article-the-hague-parliament",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Binnenhof_Hofvijver_2019.jpg/1280px-Binnenhof_Hofvijver_2019.jpg",
    caption:
      "The Binnenhof in The Hague — home of the Dutch Parliament since the sixteenth century.",
    credit: "Wikimedia Commons / Public Domain",
  },

  // Block 28
  { kind: "heading", id: "benin-two-cities", text: "Benin: Porto-Novo and Cotonou" },
  // Block 29
  {
    kind: "paragraph",
    text: "Benin presents one of West Africa's clearest capital splits. Porto-Novo is the constitutional capital — the name means 'New Port' in Portuguese, reflecting its founding as a slave-trade terminus — and it houses the National Assembly and the official presidential residence. Yet Cotonou, 30 km to the west on the Atlantic coast, is the country's economic engine: it holds the country's main port, most ministries, the international airport, the diplomatic community, and the overwhelming majority of foreign business. Cotonou has around three times the population of Porto-Novo. The arrangement echoes colonial inertia: Porto-Novo was the administrative centre under French rule, but Cotonou grew rapidly as the economic hub after independence in 1960, and neither city has been willing to cede its claim entirely.",
  },

  // Block 30
  {
    kind: "heading",
    id: "ivory-coast-basilica",
    text: "Côte d'Ivoire: the village that became a capital",
  },
  // Block 31
  {
    kind: "paragraph",
    text: "In 1983 Félix Houphouët-Boigny, Côte d'Ivoire's founding president, designated Yamoussoukro as the country's official capital — primarily because it was his birthplace village in the country's interior. The decision was largely symbolic: Abidjan, the coastal commercial metropolis of over five million people, retained its embassies, ministries, courts, and stock exchange. Yamoussoukro's most remarkable legacy is the Basilica of Our Lady of Peace, completed in 1989 at a cost estimated between USD 175 million and USD 300 million. At 158 metres to the tip of its cross, it is technically taller than St. Peter's Basilica in Rome and holds the Guinness World Record as the world's largest church by area. The Vatican agreed to its consecration on condition that a hospital be built next to it — a hospital Houphouët-Boigny largely failed to fund.",
  },
  // Block 32
  {
    kind: "image",
    art: "article-yamoussoukro-basilica",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Yamoussoukro_basilica.jpg/1280px-Yamoussoukro_basilica.jpg",
    caption:
      "The Basilica of Our Lady of Peace in Yamoussoukro — the world's largest church by area, consecrated 1990.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  // Block 33
  { kind: "heading", id: "sri-lanka-kotte", text: "Sri Lanka: parliament in a suburb" },
  // Block 34
  {
    kind: "paragraph",
    text: "Sri Lanka's capital arrangement is unusual for its sheer proximity: Sri Jayawardenepura Kotte, the official capital where Parliament sits, is a municipality barely 10 km east of Colombo's city centre. Parliament moved there in 1982 under President J. R. Jayawardene, who built a new parliamentary complex on a landscaped island in Diyawanna Lake. Colombo remains the country's commercial capital, the seat of most ministries, the Supreme Court, and the office of the President — making Kotte's parliamentary function something of an island of legislature surrounded by Colombo's practical dominance. For geography purposes, Sri Lanka therefore has a three-city configuration: Kotte as official capital, Colombo as the working governmental and commercial hub, and Kandy as the cultural-religious capital inland.",
  },

  // Block 35
  {
    kind: "heading",
    id: "malaysia-putrajaya",
    text: "Malaysia: Putrajaya and the administrative relocation",
  },
  // Block 36
  {
    kind: "paragraph",
    text: "Malaysia's Putrajaya was conceived in the early 1990s as both a practical and symbolic project. Prime Minister Mahathir Mohamad wanted to relieve Kuala Lumpur's chronic traffic congestion and to build a showcase federal capital that projected modernity, with the adjacent Cyberjaya technology zone. Construction began in 1995; the Prime Minister's Office relocated in 1999, and most federal ministries followed by the mid-2000s. The Perdana Putra (Prime Minister's Department), Putrajaya Mosque, and the Palace of Justice overlook an artificial lake in a city planned entirely from scratch. Kuala Lumpur, 25 km north, retains Parliament (the national legislature met there until its own Putrajaya facilities were completed), the Petronas Twin Towers, Bursa Malaysia, and the majority of international business activity. Legally, Kuala Lumpur remains the federal capital; Putrajaya is a separate federal territory designated as the administrative hub.",
  },
  // Block 37
  {
    kind: "image",
    art: "article-putrajaya-perdana",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Perdana_Putra.jpg/1280px-Perdana_Putra.jpg",
    caption:
      "Perdana Putra — Malaysia's Prime Minister's Department in Putrajaya, the purpose-built federal administrative capital.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  // Block 38
  { kind: "heading", id: "designed-splits", text: "Deliberate relocations" },
  // Block 39
  {
    kind: "paragraph",
    text: "Some splits are engineered rather than inherited. Tanzania officially designated Dodoma as capital in 1974 and has moved government offices there in stages, though Dar es Salaam remains the commercial and practical centre. Myanmar moved its capital from Yangon to the purpose-built Naypyidaw in 2005 with almost no public explanation — a relocation that combined centralised planning with strategic motivations still debated by analysts. The new city was reportedly sited inland partly for military-strategic reasons, designed to be harder to attack from the coast, and partly to project the ruling junta's control over the national interior.",
  },
  // Block 40
  {
    kind: "list",
    items: [
      "Malaysia: Kuala Lumpur (constitutional, commercial); Putrajaya (administrative, from 1999).",
      "Tanzania: Dodoma (official since 1974); Dar es Salaam (commercial anchor, most embassies).",
      "Myanmar: Naypyidaw (seat of government since 2005); Yangon (business, largest population).",
      "Indonesia: Jakarta (capital to 2024); Nusantara (new capital under construction on Borneo).",
      "Côte d'Ivoire: Yamoussoukro (official since 1983); Abidjan (seat of most government activity).",
    ],
  },

  // Block 41
  {
    kind: "heading",
    id: "capital-moves-history",
    text: "Countries that moved their capitals entirely",
  },
  // Block 42
  {
    kind: "paragraph",
    text: "The boldest capital transformations are complete relocations rather than functional splits. Brazil's decision to build Brasília is the most celebrated: President Juscelino Kubitschek pledged 'fifty years of progress in five' and commissioned Oscar Niemeyer and Lúcio Costa to design a city from scratch in the cerrado savanna of Goiás. Construction began in 1956; the capital transferred from Rio de Janeiro on 21 April 1960. The stated logic was developmental — moving the capital inland would draw population and investment away from the overcrowded coast — though Kubitschek's political ambitions, requiring a monument visible from abroad, were equally central. Brasília was inscribed as a UNESCO World Heritage Site in 1987, just 27 years after its construction, for its modernist urban planning.",
  },
  // Block 43
  {
    kind: "paragraph",
    text: "Kazakhstan moved its capital from Almaty to the steppe city then known as Akmola in 1997-98, later renamed Astana, then Nur-Sultan (after the long-serving president Nursultan Nazarbayev), and renamed Astana again in 2022 after Nazarbayev's fall from grace. The move was partly strategic — Almaty sits in the southeast, close to the Chinese border and far from Kazakhstan's Slavic north — and partly an exercise in nation-building, with Nur-Sultan's futuristic skyline serving as a physical claim to modernity. Myanmar's junta moved overnight from Yangon to Naypyidaw in November 2005, reportedly acting on a military astrologer's advice and giving civil servants two weeks' notice. The new city was built for a population of a million but initially housed only government staff; by 2024 its metropolitan population had reached roughly 1.2 million.",
  },
  // Block 44
  {
    kind: "callout",
    variant: "key-idea",
    text: "Purpose-built capitals share a common grammar: a grand axis, paired legislature buildings, an oversized ceremonial boulevard, and a deliberate distance from the country's commercial heartland. Brasília, Naypyidaw, Astana/Nur-Sultan, Putrajaya, and Nusantara all follow this template — capital as political statement, not organic urban growth.",
  },
  // Block 45
  {
    kind: "image",
    art: "article-brasilia-congress",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Congresso_Nacional.jpg/1280px-Congresso_Nacional.jpg",
    caption:
      "Oscar Niemeyer's National Congress in Brasília — symbol of Brazil's 1960 capital relocation from Rio de Janeiro.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  // Block 46
  { kind: "heading", id: "indonesia-nusantara", text: "Nusantara: a capital born from subsidence" },
  // Block 47
  {
    kind: "paragraph",
    text: "Indonesia's decision to build a new capital on Borneo is unusual in that its primary driver is environmental rather than political. Jakarta sits on swampy coastal land, draws groundwater at an unsustainable rate, and is sinking by up to 25 cm a year in its fastest-subsiding districts. Parts of North Jakarta are already below sea level. The government formally designated Nusantara as capital in 2022 and expects to transfer core government functions across the 2020s, though Jakarta will remain the country's economic engine and most populous city. The move echoes Brazil's construction of Brasília in the 1960s, which relocated the capital inland to promote economic development in the interior.",
  },
  // Block 48
  {
    kind: "image",
    art: "article-nusantara-site",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/IKN_Nusantara_aerial.jpg/1280px-IKN_Nusantara_aerial.jpg",
    caption: "The Nusantara site in East Kalimantan, Borneo, during early construction phases.",
    credit: "Wikimedia Commons / Public Domain",
  },

  // Block 49
  { kind: "heading", id: "comparison-table", text: "Multi-capital countries at a glance" },
  // Block 50
  {
    kind: "table",
    title: "Countries with divided capital functions (selected)",
    columns: [
      "Country",
      "Constitutional / Official Capital",
      "Seat of Government / Legislature",
      "Reason for split",
    ],
    rows: [
      [
        "South Africa",
        "Cape Town (legislature)",
        "Pretoria (executive) / Bloemfontein (judicial)",
        "1910 union compromise among four former colonies",
      ],
      [
        "Bolivia",
        "Sucre",
        "La Paz (executive + legislature)",
        "1898–99 Federal War; liberals moved congress north",
      ],
      [
        "Netherlands",
        "Amsterdam",
        "The Hague (parliament + ministries)",
        "Historical: States-General sat in The Hague since 1585",
      ],
      [
        "Malaysia",
        "Kuala Lumpur",
        "Putrajaya (federal administration)",
        "Purpose-built administrative capital from 1999",
      ],
      [
        "Côte d'Ivoire",
        "Yamoussoukro",
        "Abidjan (de facto seat of government)",
        "1983 designation by President Houphouët-Boigny",
      ],
      [
        "Benin",
        "Porto-Novo",
        "Cotonou (economic capital, most ministries)",
        "Colonial legacy; Cotonou grew as port hub",
      ],
      [
        "Sri Lanka",
        "Sri Jayawardenepura Kotte",
        "Colombo (commercial + most government)",
        "Parliament moved to Kotte in 1982",
      ],
      [
        "Tanzania",
        "Dodoma",
        "Dar es Salaam (commercial + diplomatic)",
        "Dodoma designated 1974; transition still incomplete",
      ],
      [
        "Myanmar",
        "Naypyidaw",
        "Naypyidaw (moved 2005)",
        "Full transfer, but Yangon remains commercial hub",
      ],
    ],
  },
  // Block 51
  {
    kind: "timeline",
    title: "A brief history of capital splits and moves",
    events: [
      {
        date: "1585",
        text: "Dutch States-General establishes permanent seat in The Hague, while Amsterdam remains commercial hub.",
      },
      { date: "1825", text: "Bolivia declares independence from Spain; Sucre named sole capital." },
      {
        date: "1898–99",
        text: "Bolivia's Federal War: La Paz liberals defeat Sucre conservatives; Congress moves to La Paz.",
      },
      {
        date: "1910",
        text: "Union of South Africa formed; Pretoria, Cape Town and Bloemfontein each receive a capital function.",
      },
      {
        date: "1960",
        text: "Brazil transfers capital from Rio de Janeiro to newly built Brasília, 956 km inland.",
      },
      {
        date: "1974",
        text: "Tanzania designates Dodoma as future capital; gradual transfer begins.",
      },
      {
        date: "1982",
        text: "Sri Lanka's Parliament formally relocates to Sri Jayawardenepura Kotte.",
      },
      {
        date: "1983",
        text: "Côte d'Ivoire's Houphouët-Boigny designates his home village Yamoussoukro as official capital.",
      },
      {
        date: "1997",
        text: "Kazakhstan transfers capital from Almaty to Akmola (later Astana, then Nur-Sultan, then Astana again).",
      },
      { date: "1999", text: "Malaysia's Putrajaya inaugurated as federal administrative capital." },
      {
        date: "2005",
        text: "Myanmar's military junta moves overnight from Yangon to purpose-built Naypyidaw.",
      },
      {
        date: "2022",
        text: "Indonesia designates Nusantara in East Kalimantan as new capital; construction under way.",
      },
    ],
  },

  // Block 52
  { kind: "heading", id: "why-it-persists", text: "Why splits survive" },
  // Block 53
  {
    kind: "paragraph",
    text: "Once government is embedded in a city — the law courts, the diplomatic missions, the parliamentary staff housing, the ministerial buildings — the transaction cost of consolidation is enormous. Bureaucracies resist relocation, diplomats prefer established infrastructure, and the city that would lose status resists politically. South Africa has discussed consolidating its capital for decades; the cost estimates routinely shelve the conversation. The split capital, once established, tends to calcify into something that later generations inherit as fact rather than choice.",
  },
  // Block 54
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "At least twelve countries operate with a formally divided capital function across executive, legislative and judicial branches located in different cities. A further fifteen have an official capital that differs from their largest or most governmentally active city.",
  },

  // Block 55
  { kind: "heading", id: "why-it-matters", text: "Why it matters beyond geography class" },
  // Block 56
  {
    kind: "paragraph",
    text: "Administrative efficiency is the most common argument against split capitals. Having ministries, courts, parliament, and the presidency in different cities multiplies communication costs, slows inter-departmental coordination, and creates ambiguity for citizens about where to take their business. South Africa's annual legislative migration is frequently cited by governance researchers as an example of inherited inefficiency that no democratic government has been willing to pay the political cost of fixing. In Bolivia, the distance between La Paz's executive and Sucre's judiciary creates practical delays in constitutional proceedings that a single-city capital would not produce.",
  },
  // Block 57
  {
    kind: "paragraph",
    text: "Yet split capitals also serve genuine political functions. South Africa's arrangement ensures that no single region — and no single ethnic or linguistic community — monopolises the full apparatus of national government. Bolivia's arrangement preserves Sucre's constitutional dignity and prevents the highland commercial city from exercising unchecked dominance. Benin's arrangement recognises that Porto-Novo's historical status, as the former seat of French colonial administration, carries legitimacy worth preserving even when Cotonou handles the practical work. Split capitals are, in many cases, visible evidence that national unity was not given but negotiated — and the negotiation is still ongoing.",
  },
  // Block 58
  {
    kind: "callout",
    variant: "key-idea",
    text: "A split capital is often a map of an unresolved argument: which region should dominate, whose history should be honored, which city was promised what in exchange for joining the union. Reading the capital arrangement tells you something about the founding compromise that a country's official history often omits.",
  },

  // Block 59
  { kind: "heading", id: "quiz-watch", text: "What this means for geography questions" },
  // Block 60
  {
    kind: "paragraph",
    text: "The gap between constitutional capitals and seats of government is one of the most productive sources of quiz error. Asking 'what is the capital of the Netherlands' yields Amsterdam from most respondents, but The Hague from anyone with government knowledge. Bolivia similarly trips up those who answer La Paz without knowing Sucre. Sri Lanka adds a third layer: Sri Jayawardenepura Kotte is the official capital, Colombo the commercial city, and Parliament sits in the official capital while most ministries remain in Colombo. These are not trick questions — they are accurate reflections of how politics actually distributes authority across geography.",
  },
  // Block 61
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Common quiz traps by country: Netherlands (Amsterdam vs The Hague), Bolivia (Sucre vs La Paz), South Africa (Pretoria vs Cape Town vs Bloemfontein), Malaysia (Kuala Lumpur vs Putrajaya), Côte d'Ivoire (Yamoussoukro vs Abidjan), Sri Lanka (Sri Jayawardenepura Kotte vs Colombo). All of these answers can be simultaneously correct depending on the question asked.",
  },

  // Block 62–65: editorialClosing (heading + paragraph + callout + didYouKnow = 4 blocks)
  ...editorialClosing({
    conclusion:
      "Split capitals are rarely accidents. They are the frozen residue of compromises made at moments of union, civil conflict, or deliberate relocation policy. Reading a capital correctly means asking not just 'where is it?' but 'which function?' — legislative, executive, or judicial. Countries that look to have one capital on a map often have two or three in practice, each defending its status against the others.",
    remember:
      "South Africa, Bolivia, the Netherlands, Malaysia, Côte d'Ivoire, Benin, and Sri Lanka all have split capital functions. The full list of countries where the official capital differs from the effective seat of government exceeds twenty. In geography, 'the capital' is always the beginning of an answer, rarely the end.",
    quizTopic: "capitals and government geography",
  }),
];
