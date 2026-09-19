import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "Natural borders wander. Rivers meander, ridgelines curve, watersheds dip and rise — and for most of human history, borders followed those features because geography was the only surveying tool available. A straight border is therefore an anomaly. It signals that someone drew a line on a map in a room far from the landscape, usually at a negotiating table in a European capital, and that the people living along that line had no say in the outcome. Wherever you see a perfectly geometric boundary on a political map, you are looking at an act of power: someone had the authority to treat a landscape as a blank canvas and someone else — usually millions of people — did not.",
  },

  { kind: "heading", id: "what-makes-a-line-straight", text: "What makes a border straight" },
  {
    kind: "paragraph",
    text: "Geometric borders follow parallels of latitude, meridians of longitude, or fixed compass bearings. They appear as straight lines on flat maps because they are mathematical constructs imposed on geography. The engineering required to mark them on the ground is considerable: a parallel must be re-measured every few kilometres because the Earth's curvature means a simple linear mark does not maintain constant latitude. Early surveys used astronomical observation — noting the elevation of Polaris at night — to re-establish position. Later surveys used theodolites and triangulation chains, and today GPS verification is routine but no less laborious. The border corridor between the United States and Canada — a six-metre cleared swath through old-growth Pacific Northwest forest known as The Slash — must be permanently maintained to remain visible on the ground.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "A parallel of latitude appears straight on a flat map but is a curve on the globe. A meridian of longitude is a great circle arc. 'Straight border' on a map always means 'geometric border' — but which geometry depends on which map projection you are reading.",
  },

  { kind: "heading", id: "berlin-conference", text: "The Berlin Conference of 1884–85" },
  {
    kind: "paragraph",
    text: "In November 1884, Otto von Bismarck convened a conference in Berlin that would determine the fate of an entire continent. Fourteen European nations — plus the Ottoman Empire — gathered to formalise the rules by which they would partition Africa. No African representative attended. The conference lasted until February 1885 and produced the General Act of Berlin, which established the principle of 'effective occupation': a European power could claim African territory only if it maintained a physical presence there. The immediate effect was an arms race of colonisation. By 1914, only two African polities remained formally independent: Ethiopia and Liberia. All the rest had been absorbed into European empires, their internal boundaries drawn in European capitals by men who had often never visited the territories they were dividing.",
  },
  {
    kind: "image",
    art: "berlin-conference-painting",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/56/Kongokonferenz.jpg/1280px-Kongokonferenz.jpg",
    caption:
      "The Berlin Conference of 1884–85. Fourteen European nations negotiated Africa's partition without a single African representative present at the table.",
    credit: "Adolf Oberländer / Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The Berlin Conference did not itself draw Africa's borders — it established the framework for doing so. The actual boundary negotiations took place in hundreds of bilateral treaties over the following 30 years, conducted almost entirely between European foreign offices rather than on the ground.",
  },
  {
    kind: "paragraph",
    text: "The consequences of partition are still being measured. Africa's 55 modern states have inherited borders that cross an estimated 10,000 ethnic groups, with many groups split across two, three, or four national boundaries. The Maasai of East Africa live across Kenya and Tanzania. The Somali people are divided among Somalia, Ethiopia, Kenya, and Djibouti — a partition that directly fuelled the Ogaden War (1977–78) and decades of regional instability. The Lozi people of southern Africa live across Zambia, Zimbabwe, Namibia, and Botswana. Colonial partition did not merely inconvenience existing communities: in many cases it created permanent minority populations, divided resource systems, and set the conditions for post-independence civil wars.",
  },

  { kind: "heading", id: "africa-partition-numbers", text: "Africa's partition in numbers" },
  {
    kind: "facts",
    title: "The Scramble for Africa — key statistics",
    facts: [
      {
        label: "Nations at Berlin Conference",
        value: "14 European + Ottoman Empire (no Africans)",
      },
      {
        label: "African territory colonised by 1914",
        value: "~90% (Ethiopia and Liberia remained independent)",
      },
      { label: "Estimated ethnic groups divided", value: "10,000+ across colonial boundaries" },
      {
        label: "Proportion of Africa's borders that are geometric",
        value: "~44% follow straight lines (parallels/meridians)",
      },
      {
        label: "African nations gained independence by 1975",
        value: "Most between 1956 and 1975; 17 in 1960 alone",
      },
    ],
  },

  {
    kind: "heading",
    id: "famous-straight-borders-table",
    text: "Eight famous straight borders compared",
  },
  {
    kind: "table",
    title: "The world's most notable geometric borders",
    columns: ["Border", "Year Drawn", "Approx. Length", "Countries", "Colonial Power"],
    rows: [
      [
        "49th Parallel (US–Canada)",
        "1818 / 1846",
        "~3,200 km",
        "USA / Canada",
        "Britain (Oregon Treaty)",
      ],
      [
        "Durand Line (Afghanistan–Pakistan)",
        "1893",
        "~2,640 km",
        "Afghanistan / Pakistan",
        "British India",
      ],
      ["22°N Parallel (Egypt–Sudan)", "1899", "~1,100 km", "Egypt / Sudan", "Britain"],
      ["25°E Meridian (Libya–Egypt)", "1925", "~1,115 km", "Libya / Egypt", "Britain / Italy"],
      [
        "Caprivi Strip borders (Namibia-Zambia)",
        "1890",
        "~450 km strip",
        "Namibia, Zambia, Botswana",
        "Germany / Britain",
      ],
      ["Algeria–Mali border section", "1905", "~1,376 km", "Algeria / Mali", "France"],
      [
        "Sudan–Central African Republic border",
        "1924",
        "~1,165 km",
        "Sudan / CAR",
        "Britain / France",
      ],
      [
        "Western Australia–NT border",
        "1863",
        "~1,862 km",
        "WA / NT (Australia)",
        "British Colonial Office",
      ],
    ],
  },

  { kind: "heading", id: "49th-parallel", text: "The 49th parallel: the longest geometric border" },
  {
    kind: "paragraph",
    text: "The Canada–United States boundary along the 49th parallel runs approximately 3,200 km from the Pacific coast to the Lake of the Woods in Manitoba — making it the longest geometric border on a single parallel anywhere in the world. The boundary was established in two stages: the Convention of 1818 fixed the parallel from the Lake of the Woods to the Rocky Mountains, ending an ambiguous joint occupation arrangement left over from the 1783 Treaty of Paris. The Oregon Treaty of 1846 then extended the line west to the Pacific. British negotiators had hoped to push the boundary south to the Columbia River, which would have given Britain control of the Oregon Territory's most fertile land; American negotiators had campaigned on 54°40' ('Fifty-Four Forty or Fight'). The 49th parallel was a compromise that neither side fully wanted but both could accept.",
  },
  {
    kind: "image",
    art: "canada-us-border-slash",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Canada_US_border_from_space.jpg/1280px-Canada_US_border_from_space.jpg",
    caption:
      "The 49th parallel corridor — a six-metre cleared swath through Pacific Northwest forest, visible from space, marking the world's longest geometric border on a single parallel.",
    credit: "NASA / Wikimedia Commons / Public Domain",
  },
  {
    kind: "facts",
    title: "49th parallel — key measurements",
    facts: [
      { label: "Total length along the parallel", value: "~3,200 km" },
      { label: "Treaty establishing eastern section", value: "Convention of 1818" },
      { label: "Treaty establishing western section", value: "Oregon Treaty, 1846" },
      {
        label: "Width of The Slash (cleared corridor)",
        value: "6 metres, continuously maintained",
      },
      { label: "Physical boundary monuments", value: "Over 900 markers" },
      {
        label: "Notable exception to straight line",
        value: "Point Roberts, Washington (US territory south of the parallel)",
      },
    ],
  },

  {
    kind: "heading",
    id: "libya-sudan-border",
    text: "The Libya–Sudan border: a line through the Libyan Desert",
  },
  {
    kind: "paragraph",
    text: "The border between Libya and Sudan follows the 25th meridian of longitude for much of its length — a perfectly straight line running north–south through some of the most inhospitable terrain on Earth. The line was established during British and Italian colonial negotiations in the 1920s. No joint survey of the territory was conducted. The diplomats working in Rome and London used French cartographic data from earlier expeditions and agreed that the 25th meridian was a convenient division. The Libyan Desert along this line receives less than 25 millimetres of rainfall per year; the few Tuareg and Tebu communities who moved seasonally across the region were not consulted. The border has been described by historians as a line drawn on a map of a place neither party had visited.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The 25th meridian east appears three times in African border history: as part of the Libya–Egypt border, the Libya–Sudan border, and as a reference line in Chad–Sudan administrative agreements. It was convenient for European cartographers precisely because it was a round number on their longitude scales.",
  },

  { kind: "heading", id: "egypt-libya-border", text: "The Egypt–Libya border: 25°E again" },
  {
    kind: "paragraph",
    text: "The Egypt–Libya border follows the 25th meridian east almost entirely from the Mediterranean coast southward — a straight line of approximately 1,115 km. It was demarcated in stages during the 1920s as part of British-Italian spheres-of-influence agreements in North Africa. The line crosses entirely uninhabited desert for most of its length; there are no towns, roads, or settled communities along it. This makes it one of the few geometric borders whose arbitrariness is largely invisible to the people living near it — because almost nobody lives near it. The emptiness that made the line convenient to draw is the same emptiness that makes it mostly inconsequential in daily life, though it has taken on new significance as a transit corridor for migrants crossing the Sahara.",
  },

  { kind: "heading", id: "halaib-triangle", text: "The Hala'ib Triangle: when two lines conflict" },
  {
    kind: "paragraph",
    text: "Where the 22nd parallel meets the Red Sea coast, it creates one of Africa's most persistent territorial disputes. The 1899 Anglo-Egyptian Condominium Agreement established the 22nd parallel as the administrative boundary between Egypt and Sudan. But in 1902, Britain drew a second, slightly different administrative line that moved the boundary south of the 22nd parallel near the coast, keeping nomadic Ababda and Bisharin communities — judged more closely linked to the Egyptian administration — within Egyptian territory. The result was two overlapping lines: Egypt claims the 1902 administrative boundary, which gives it the Hala'ib Triangle; Sudan claims the 1899 treaty line. Since 1995, Egypt has administered the triangle, but Sudan has never relinquished its claim. The dispute has never been adjudicated internationally.",
  },
  {
    kind: "image",
    art: "halaib-triangle-map",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8a/Halaib_Triangle_map.png/800px-Halaib_Triangle_map.png",
    caption:
      "The Hala'ib Triangle on the Red Sea coast — where the 22nd parallel (1899 treaty) and the 1902 administrative line diverge to create a contested zone between Egypt and Sudan.",
    credit: "Wikimedia Commons / Public Domain",
  },

  {
    kind: "heading",
    id: "caprivi-strip",
    text: "The Caprivi Strip: Germany's finger to the Zambezi",
  },
  {
    kind: "paragraph",
    text: "The Caprivi Strip — now officially Namibia's Zambezi Region — is one of the most visually striking products of colonial map-making. It is a narrow finger of territory approximately 450 km long and between 32 and 100 km wide, protruding east from Namibia between Botswana and Zambia to reach the Zambezi River. It was created by the 1890 Heligoland-Zanzibar Treaty, in which Germany and Britain divided their African interests. Germany received the strip specifically to give German South-West Africa access to the Zambezi and thereby — in theory — a trade route across the continent to the Indian Ocean. The strategic rationale never materialised: the Zambezi's Victoria Falls, just downstream, made navigation impossible. The strip was named after the German chancellor Leo von Caprivi who negotiated the deal.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The Heligoland-Zanzibar Treaty of 1890 was one of colonial history's more remarkable land-swaps: Britain ceded the North Sea island of Heligoland to Germany in exchange for recognition of British rights over Zanzibar and Uganda — and threw in the Caprivi Strip as a geographic convenience for German South-West Africa.",
  },
  {
    kind: "image",
    art: "caprivi-strip-map",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/Caprivi_Strip_%28Namibia%29.svg/1280px-Caprivi_Strip_%28Namibia%29.svg.png",
    caption:
      "The Caprivi Strip — a narrow corridor of Namibian territory reaching east to the Zambezi River, created by the 1890 Heligoland-Zanzibar Treaty so Germany could reach the river.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "durand-line", text: "The Durand Line: Afghanistan and Pakistan" },
  {
    kind: "paragraph",
    text: "On 12 November 1893, British India's Foreign Secretary Mortimer Durand signed an agreement with Amir Abdur Rahman Khan of Afghanistan establishing a boundary line through the Hindu Kush and the tribal territories of the North-West Frontier. The Durand Line runs approximately 2,640 km, cutting directly through the Pashtun homeland and dividing communities that had no concept of themselves as residents of two different nations. Britain's strategic purpose was to establish a buffer zone against Russian expansion in the Great Game's final demarcation. The Afghan amir reportedly signed under considerable pressure. Afghanistan has never formally accepted the Durand Line as a legal international boundary — every government in Kabul, from the amir's successors through successive republics to the Taliban, has maintained this position for 130 years.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The Durand Line split the Pashtun people — approximately 40–50 million today — between British India (now Pakistan) and Afghanistan. Pakistani Pashtuns are concentrated in Khyber Pakhtunkhwa; Afghan Pashtuns dominate southern and eastern Afghanistan. Their cultural and linguistic unity across the line has made it one of the world's most porous and contested international borders.",
  },
  {
    kind: "image",
    art: "durand-line-map",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Durand_line_map_from_the_1906_imperial_gazetteer_of_India.jpg/1280px-Durand_line_map_from_the_1906_imperial_gazetteer_of_India.jpg",
    caption:
      "The Durand Line as mapped in the 1906 Imperial Gazetteer of India. The boundary divided the Pashtun homeland and has never been accepted by Afghanistan as a permanent international border.",
    credit: "Imperial Gazetteer of India / Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "green-line-cyprus", text: "The Green Line in Cyprus" },
  {
    kind: "paragraph",
    text: "Cyprus's division is unlike the other borders in this article: it was not drawn to carve up territory between distant powers, but to freeze a military conflict in place. In July 1974, Turkey invaded northern Cyprus following a Greek Cypriot coup backed by the military junta in Athens. The United Nations negotiated a ceasefire, and the Green Line — named after a British officer's green pencil mark on a 1964 map of Nicosia — became a formal UN buffer zone (UNFICYP). The line divides the island roughly 37%/63% (Turkish Cypriots in the north, Greek Cypriots in the south) and cuts directly through Nicosia, making it one of the world's last divided capital cities. The Turkish Republic of Northern Cyprus declared independence in 1983 but is recognised only by Turkey.",
  },
  {
    kind: "image",
    art: "nicosia-buffer-zone",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Nicosia_buffer_zone.jpg/1280px-Nicosia_buffer_zone.jpg",
    caption:
      "The UN buffer zone running through Nicosia — the Green Line that has divided Cyprus's capital since 1974, patrolled by UN peacekeepers for over 50 years.",
    credit: "Wikimedia Commons / CC BY-SA 3.0",
  },

  {
    kind: "heading",
    id: "why-straight-borders-cause-conflicts",
    text: "Why straight borders cause conflicts today",
  },
  {
    kind: "paragraph",
    text: "The Sahel — the semi-arid belt stretching across Africa from Senegal to Sudan — has become the world's most active conflict zone in the early 21st century. Nearly every Sahel crisis has roots in the colonial border system. Mali's civil war involved Tuareg rebels whose territorial claims cross into Niger, Algeria, and Libya — nations created by lines that ignored Tuareg political structures entirely. Boko Haram's insurgency in the Lake Chad Basin operates across Nigeria, Niger, Chad, and Cameroon precisely because the porous geometric borders of the region cannot be effectively policed, and because the communities on either side share more in common with each other than with their respective national capitals. The Kurdish question similarly involves a people of roughly 30–40 million divided among Turkey, Iraq, Syria, and Iran by borders drawn after World War I without Kurdish representation.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The Organisation of African Unity's 1964 Cairo Declaration committed newly independent African states to respecting inherited colonial borders — even arbitrary ones — on the grounds that reopening boundary negotiations would produce endless conflict. This 'uti possidetis' principle has preserved most borders but also preserved many injustices.",
  },
  {
    kind: "paragraph",
    text: "The Kashmir dispute is another inheritance of geometric thinking. The 1947 Partition of British India was conducted by Cyril Radcliffe, a barrister who had never visited India, in just 36 days. The Radcliffe Line divided Punjab and Bengal along lines ostensibly based on religious demographics, but drawn under impossible time pressure and with massive humanitarian consequences. The resulting Line of Control in Kashmir has never become a formal international boundary and remains one of the world's most militarised borders, with nuclear-armed forces on both sides. India and Pakistan have fought three wars over territory whose borders were drawn by a man working from 1941 census maps in a New Delhi bungalow.",
  },

  {
    kind: "heading",
    id: "natural-borders",
    text: "Natural borders: rivers, mountains, and coasts",
  },
  {
    kind: "paragraph",
    text: "Natural borders are not necessarily more peaceful than geometric ones — rivers shift course, mountain passes change hands, and coastlines erode — but they tend to be more legible to the people living near them. The Rhine has served as a cultural boundary between Germanic and Romance-language populations for over 2,000 years. The Pyrenees divide France from Spain along a watershed that has served as a cultural boundary since Roman times. The Himalayas form the most formidable natural border in the world, separating the Indian subcontinent from the Tibetan Plateau along a range of peaks that reaches 8,000 metres. The Mekong River defines stretches of the borders between Laos and Thailand, and between Myanmar and Laos — a natural feature that simultaneously connects and divides the communities along its banks.",
  },
  {
    kind: "dualCompare",
    title: "Geometric borders vs natural borders",
    leftTitle: "Geometric borders",
    leftItems: [
      "Follow parallels, meridians, or compass bearings",
      "Created at negotiating tables, often without local input",
      "Concentrated in Africa, North America, Australia, Central Asia",
      "May split communities, grazing routes, and watersheds",
      "Precise in description but often ambiguous on the ground",
      "Frequently inherited from colonial powers",
    ],
    rightTitle: "Natural borders",
    rightItems: [
      "Follow rivers, ridgelines, coastlines, or watersheds",
      "Emerge from geography and long customary use",
      "Concentrated in Europe, mountainous Asia, South America",
      "Reflect terrain but can shift as rivers migrate",
      "Culturally legible but technically imprecise",
      "River borders create shared resources — and shared disputes",
    ],
  },

  {
    kind: "heading",
    id: "when-straight-borders-work",
    text: "When straight borders actually work",
  },
  {
    kind: "paragraph",
    text: "Australia's internal state borders are almost entirely geometric — and are almost entirely uncontested. The 129th meridian east forms the bulk of the Western Australia–Northern Territory border; the 26th parallel separates Western Australia from South Australia across hundreds of kilometres of desert. These lines have never been the cause of armed conflict because settlement patterns were established after the lines were drawn, meaning communities grew up on one side or the other rather than being divided by them. The same logic applies to most US state borders in the West: the straight lines between Nevada, Utah, and Arizona were drawn before significant non-indigenous settlement. The key variable is whether the line was imposed on an existing, organised population — as in Africa — or preceded the population it would govern.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Wyoming and Colorado are the only US states whose borders are entirely defined by geometric lines — parallels and meridians — with no natural features at all. Colorado's boundary was established in 1861, Wyoming's in 1868, both before significant Euro-American settlement. Their near-perfect rectangles are visible at a glance on any map of the United States.",
  },

  {
    kind: "heading",
    id: "surveying-without-visiting",
    text: "Drawing borders without visiting them",
  },
  {
    kind: "paragraph",
    text: "Many of Africa's borders were drawn by officials who had never visited the territories they were dividing. The Anglo-French agreement of 1890 that fixed much of the boundary between what is now Mali, Niger, and Nigeria was negotiated in London and Paris by men working from incomplete explorers' maps. Some surveys were simply projected from known coastal points: if a line was established at the coast, it was assumed to continue at the same bearing or coordinate inland without field verification. When boundary commissions later tried to demarcate these lines on the ground, they frequently discovered that the 'line' crossed impassable terrain, split settlements, or simply could not be located precisely. Several borders in the central Sahara have segments that were never formally demarcated on the ground at all.",
  },

  {
    kind: "heading",
    id: "timeline-berlin-to-independence",
    text: "From Berlin to independence: a timeline",
  },
  {
    kind: "timeline",
    title: "The colonial partition of Africa and its aftermath",
    events: [
      {
        date: "1884–85",
        text: "Berlin Conference establishes rules for European colonisation of Africa; 14 nations negotiate territorial spheres of influence with no African representation.",
      },
      {
        date: "1890",
        text: "Heligoland-Zanzibar Treaty between Britain and Germany creates the Caprivi Strip and adjusts East African borders.",
      },
      {
        date: "1893",
        text: "Mortimer Durand draws the Durand Line between British India and Afghanistan, dividing the Pashtun homeland.",
      },
      {
        date: "1899",
        text: "Anglo-Egyptian Condominium establishes the 22nd parallel as the Egypt–Sudan boundary; a 1902 adjustment later creates the Hala'ib Triangle dispute.",
      },
      {
        date: "1910–1914",
        text: "Most of Africa is fully incorporated into European empires following the Scramble; formal border surveys, where conducted at all, proceed under colonial administration.",
      },
      {
        date: "1947",
        text: "Radcliffe Line partitions British India into India and Pakistan in 36 days; triggers the largest forced migration in human history and sets up three future wars.",
      },
      {
        date: "1957",
        text: "Ghana's independence begins the era of African decolonisation; 17 African nations gain independence in 1960 alone.",
      },
      {
        date: "1964",
        text: "OAU Cairo Declaration: African states agree to respect colonial-era borders as inherited — enshrining uti possidetis as continental policy.",
      },
      {
        date: "1974",
        text: "Turkish invasion of Cyprus freezes the Green Line as a UN-patrolled buffer, dividing Nicosia.",
      },
      {
        date: "1990s–present",
        text: "Sahel conflict intensifies along colonial borders: Mali, Burkina Faso, Niger, Chad all face insurgencies whose geography follows the partition map.",
      },
    ],
  },

  { kind: "heading", id: "ethnic-groups-and-borders", text: "10,000 ethnic groups, 195 countries" },
  {
    kind: "paragraph",
    text: "Africa contains approximately 2,000 distinct ethnic groups; the world as a whole has between 5,000 and 10,000 depending on how ethnicity and language are defined. There are only 195 internationally recognised sovereign states. The mismatch between ethnic communities and national borders is therefore universal — but it is most acute where borders were drawn without reference to existing communities. Scholars of African political development have documented that countries whose ethnic boundaries are most misaligned with colonial borders have, on average, experienced more civil conflict, more coups, and weaker state institutions than those where colonial lines happened to approximate community boundaries. This is not determinism — governance, resource distribution, and historical contingency all matter — but the map is not neutral.",
  },
  {
    kind: "image",
    art: "africa-partition-map-1913",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/Scramble_for_Africa_1880_to_1913.png/800px-Scramble_for_Africa_1880_to_1913.png",
    caption:
      "The Scramble for Africa from 1880 to 1913 — European colonisation of the continent proceeded with extraordinary speed, leaving almost no territory outside colonial control within three decades.",
    credit: "Wikimedia Commons / Public Domain",
  },

  {
    kind: "heading",
    id: "sahel-fragility",
    text: "The Sahel: where straight lines meet human fragility",
  },
  {
    kind: "paragraph",
    text: "No region illustrates the long-term consequences of geometric borders more starkly than the Sahel. Stretching from Senegal to Eritrea, the Sahel is home to approximately 150 million people from dozens of ethnic and linguistic communities, most of whose traditional territories cross modern national borders. The Tuareg of the central Sahara are perhaps the most dramatic example: their customary territory encompasses parts of Mali, Niger, Algeria, Libya, and Burkina Faso — five separate nations, none of which considers Tuareg interests central to its national identity. The 2012 Tuareg rebellion in northern Mali, which precipitated a military coup in Bamako and eventually drew French military intervention that lasted a decade, can be traced directly to the mismatch between political geography and cultural geography that the Berlin Conference set in motion.",
  },

  {
    kind: "heading",
    id: "colonial-powers-profiles",
    text: "The colonial powers and their border legacies",
  },
  {
    kind: "profileStrip",
    title: "Who drew which lines",
    profiles: [
      {
        name: "Britain",
        theme: "ochre",
        text: "Drew or influenced over 40% of Africa's borders. Created the Durand Line (1893), the Egypt–Sudan boundary (1899), and oversaw the Radcliffe partition of India (1947). British borders often followed rivers or mountains where convenient but used geometric lines across desert territories.",
      },
      {
        name: "France",
        theme: "navy",
        text: "The dominant colonial power in West and Central Africa, with territories from the Mediterranean to the Congo. French borders were drawn largely in Paris during negotiations with Britain, with minimal ground survey. The borders of Mali, Niger, Senegal, and Chad all reflect French administrative logic.",
      },
      {
        name: "Germany",
        theme: "slate",
        text: "Though Germany lost its colonies after World War I, the borders it drew in South-West Africa (Namibia), East Africa (Tanzania), and Togo and Cameroon remained. The Caprivi Strip was Germany's most architecturally distinctive border creation — a geographic absurdity born from strategic wishful thinking.",
      },
    ],
  },

  {
    kind: "heading",
    id: "future-of-borders",
    text: "The future of borders: dissolving and hardening",
  },
  {
    kind: "paragraph",
    text: "The European Union represents the most ambitious attempt in human history to dissolve the significance of national borders between sovereign states. The Schengen Area, now covering 27 countries, has eliminated passport controls across most of Europe, enabling 400 million people to move freely across borders that were, within living memory, fortified and deadly. The border between Germany and France — which twice in the 20th century was the front line of world wars — is now marked by a sign and a change in road markings. At the same time, the world has seen a proliferation of walls and barriers: the US–Mexico barrier, Hungary's border fence, India's line of control fencing, Morocco's sand wall in the Sahara. The straight line drawn on a map is becoming, in many places, a physical structure on the ground.",
  },
  {
    kind: "callout",
    variant: "by-the-numbers",
    text: "As of 2024, there are over 70 border walls and fences around the world — more than three times the number that existed in 1990. The total length of these barriers exceeds 40,000 km, roughly equivalent to the Earth's circumference at the equator.",
  },
  {
    kind: "paragraph",
    text: "The paradox of 21st-century borders is that they are simultaneously less meaningful and more enforced than at any point in modern history. For holders of passports from wealthy nations, borders are mainly administrative formalities. For refugees, economic migrants, and people whose ethnic communities straddle the line, borders can be existential barriers. The straight lines drawn in the 19th century did not create this inequality, but they encoded it in geography — and geography is extraordinarily persistent.",
  },

  { kind: "heading", id: "reading-a-border-map", text: "How to read a border on a map" },
  {
    kind: "paragraph",
    text: "The next time you look at a political map of Africa or Central Asia and see a perfectly straight line, you are looking at a historical document as much as a geographical one. That line encodes the power relationships of its era: who was strong enough to draw it, who was absent from the negotiation, and what the drawers knew or cared about the territory they were dividing. A line along a parallel was convenient for cartography. A line along a river was convenient for administration. Neither was drawn with much thought for the millions of people who would spend their lives on one side of it or the other. Geography did not draw these borders. History did.",
  },

  ...editorialClosing({
    conclusion:
      "Geometric borders are honest in exactly one sense: they reveal when political power overrode geography. The 49th parallel was a diplomatic compromise between empires that neither side fully wanted. African parallels and meridians were imposed from European capitals on people who had no representation at the table. The Durand Line divided a people who have refused to accept it for 130 years. Understanding these lines is the first step to understanding why so many of the world's most persistent conflicts take the shapes they do on a map.",
    remember:
      "The 49th parallel is the world's longest geometric border on a single parallel (~3,200 km). Africa has the world's highest proportion of geometric borders (~44% follow straight lines) — a direct legacy of the 1884–85 Berlin Conference. The Durand Line (1893) dividing Afghanistan and Pakistan has never been formally accepted by Afghanistan.",
    quizTopic: "borders and political geography",
  }),
];
