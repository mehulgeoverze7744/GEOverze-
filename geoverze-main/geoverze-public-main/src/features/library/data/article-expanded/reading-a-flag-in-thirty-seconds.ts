import type { ArticleBlock } from "@/features/library/data/articles";
import { editorialClosing } from "@/features/library/lib/article-content-utils";

export const BLOCKS: readonly ArticleBlock[] = [
  {
    kind: "paragraph",
    text: "Before the age of mass literacy, before universal translation software, before the emoji, flags were the fastest communication technology in the world. A ship's captain could identify a vessel's nationality from a kilometre away. A soldier could distinguish friend from enemy in the chaos of a battlefield. A diplomat could signal peaceful intent or imminent attack with a single piece of fabric. That communicative power has not diminished in the modern era — flags still trigger visceral responses, serve as rallying points, and carry centuries of encoded meaning. The remarkable thing is that this system is largely learnable: once you understand the structural families, roughly 80 percent of the world's 195 national flags become recognisable by pattern rather than by rote.",
  },

  { kind: "heading", id: "grammar-of-flags", text: "The grammar of flags" },
  {
    kind: "paragraph",
    text: "Vexillology — the study of flags — has a precise vocabulary drawn from medieval heraldry. The main body of a flag is the field. Symbols placed on the field are charges. The proportions of a flag are its ratio, expressed as height-to-width: the United Kingdom uses 1:2, most US state flags are 2:3, and Switzerland maintains the only square national flag at 1:1. The hoist is the edge attached to the flagpole; the fly is the free edge. A canton is the rectangular section in the upper-left corner of the hoist — the most prominent position on a flying flag. Ordinaries are the fundamental geometric divisions of a flag: horizontal stripes (fesses), vertical stripes (pallets), diagonal stripes (bends), and crosses. Colours in heraldry are called tinctures: gold (or), silver (argent), red (gules), blue (azure), green (vert), black (sable), and purple (purpure).",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "The asymmetry of flag design matters in practice: the canton — upper-left corner — receives the most visual attention when a flag flies. Important elements like the Union Jack in Commonwealth flags, or the star fields on the US and Australian flags, are always placed in the canton for maximum visibility.",
  },
  {
    kind: "facts",
    title: "Vexillology quick reference",
    facts: [
      { label: "Most common colour globally", value: "Red (appears in ~75% of national flags)" },
      { label: "Oldest current flag design", value: "Denmark (Dannebrog, ~1370)" },
      { label: "Only non-quadrilateral national flag", value: "Nepal (double pennant shape)" },
      { label: "Only square national flag", value: "Switzerland (1:1 ratio)" },
      { label: "Most stars on a national flag", value: "United States (50)" },
      {
        label: "Nearly identical pair",
        value: "Monaco and Indonesia (red over white, different ratios)",
      },
      { label: "Only flag with map of country on it", value: "Cyprus (gold silhouette on white)" },
    ],
  },

  { kind: "heading", id: "colour-meanings", text: "Colour in Western heraldic tradition" },
  {
    kind: "paragraph",
    text: "Medieval European heraldry assigned specific meanings to each tincture, and these meanings migrated into flag design as national symbols emerged. Gold (or) represented generosity and elevation of the mind; silver or white (argent) signified peace and sincerity. Red (gules) denoted military strength, hardiness in battle, and valor. Blue (azure) represented truth, loyalty, and vigilance. Green (vert) meant hope, joy, and loyalty in love; black (sable) signified grief and constancy in adversity. In practice, these meanings were often invoked retroactively — a government would choose colours that felt appropriate and later assign heraldic meanings to justify the choice. But the vocabulary persists in national anthems, official descriptions, and civic education around the world, giving a shared symbolic language to flag reading even when the original heraldic intent has been long forgotten.",
  },
  {
    kind: "list",
    items: [
      "Gold / Yellow — Wealth, generosity, and the sun (Ethiopia, Ukraine, Australia)",
      "White / Silver — Peace, sincerity, and purity (Japan, Georgia, Switzerland)",
      "Red — Valor, revolution, or the blood of independence (Turkey, China, France, Soviet successor states)",
      "Blue — Truth, loyalty, water, or freedom (United Nations, EU, Argentina, Greece)",
      "Green — Islam, agriculture, hope, or tropical nature (Saudi Arabia, Pakistan, Brazil, Nigeria)",
      "Black — African heritage, strength, determination, or historical loss (Germany, Papua New Guinea, Kenya)",
    ],
  },

  { kind: "heading", id: "tricolour-family", text: "The tricolour family: France's global export" },
  {
    kind: "paragraph",
    text: "France's 1794 tricolour — three equal vertical bands of blue, white, and red — is the most imitated flag design in history. The French Revolution exported the concept alongside its ideology, and tricolours proliferated across Europe as nationalist movements of the 18th and 19th centuries adopted the form while choosing different colours. Today, tricolours dominate European, African, and Latin American flag design. The key recognition rule is directional: a vertical tricolour typically signals French Revolutionary influence or a conscious invocation of it. A horizontal tricolour more often signals Central European, Slavic, or pan-Arab traditions. The distinction between vertical and horizontal tricolours was itself politicised: the Dutch tricolour (horizontal, adopted around 1572) predates the French, but the French vertical design became the revolutionary template.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "The French tricolour's blue and red were the colours of Paris; the white represented the Bourbon monarchy. The combination was intended to symbolise the reconciliation of Paris with the king — a compromise that the Revolution abandoned almost immediately while keeping the flag. The design survived the Terror, Napoleon, restoration, and five republics.",
  },
  {
    kind: "image",
    art: "french-tricolour",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c3/Flag_of_France.svg/1280px-Flag_of_France.svg.png",
    caption:
      "The French tricolour (1794) — the design that propagated across five continents as the template for national flags during the age of nationalism.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "nordic-cross", text: "The Nordic cross: seven centuries of asymmetry" },
  {
    kind: "paragraph",
    text: "The Nordic cross is an off-centre cross with the vertical bar positioned left of centre, closer to the hoist. It appears on the flags of Denmark, Norway, Sweden, Finland, Iceland, the Faroe Islands, and Åland — and several other Nordic-associated territories. The asymmetry is deliberately functional: when a flag flies, the hoist is stationary and the fly streams outward. An off-centre cross produces a more balanced visual weight in motion than a centred cross would. Denmark's Dannebrog, dating to at least 1370, is the oldest design still in national use anywhere in the world. According to tradition, it fell from the sky during the Battle of Lyndanisse in 1219 as a sign from God to the Danish crusaders.",
  },
  {
    kind: "image",
    art: "nordic-cross-denmark",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Flag_of_Denmark.svg/1280px-Flag_of_Denmark.svg.png",
    caption:
      "Denmark's Dannebrog — the original Nordic cross design, dating to at least 1370, making it the world's oldest national flag still in use.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "facts",
    title: "Nordic cross flags",
    facts: [
      { label: "Denmark (Dannebrog)", value: "Red field, white cross — the oldest design (~1370)" },
      { label: "Sweden", value: "Blue field, yellow/gold cross — since at least 1521" },
      { label: "Norway", value: "Red field, white-bordered blue cross — adopted 1821" },
      { label: "Finland", value: "White field, blue cross — adopted 1918 at independence" },
      { label: "Iceland", value: "Blue field, white-bordered red cross — adopted 1944" },
      {
        label: "Faroe Islands",
        value: "White field, red-bordered blue cross — unofficial since 1919, official 1948",
      },
    ],
  },

  { kind: "heading", id: "pan-african-colours", text: "Pan-African colours: Ethiopia's legacy" },
  {
    kind: "paragraph",
    text: "The pan-African colours — green, gold (or yellow), and red — derive from Ethiopia, the only African nation never fully colonised by a European power. Ethiopia's imperial flag combined these colours in a horizontal tricolour, and when African independence movements of the 1950s and 1960s needed a symbolically charged palette free from colonial association, they returned to Ethiopia as the precedent of successful Black sovereignty. Ghana's 1957 flag — the first sub-Saharan flag of an independent African state — placed the pan-African colours with a black star at the centre, the star representing African freedom. Dozens of nations followed. A parallel tradition runs through the Pan-African movement founded in the diaspora: Marcus Garvey's Universal Negro Improvement Association adopted red, black, and green in 1920, a combination that influenced Rastafarianism and remains distinct from the Ethiopian-derived green-gold-red.",
  },
  {
    kind: "callout",
    variant: "history-note",
    text: "Ethiopia's victory at the Battle of Adwa in 1896 — where Emperor Menelik II defeated the Italian army — made it a potent symbol for pan-African movements worldwide. The Ethiopian flag's colours were consciously chosen by African independence leaders as a rejection of the colonial palette and an assertion of African sovereignty with historical precedent.",
  },
  {
    kind: "image",
    art: "ethiopia-flag",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Flag_of_Ethiopia.svg/1280px-Flag_of_Ethiopia.svg.png",
    caption:
      "The flag of Ethiopia — whose green, gold, and red tricolour inspired the pan-African colour tradition adopted by more than 30 African nations after independence.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "list",
    items: [
      "Pan-African (green/gold/red): Ethiopia, Ghana, Guinea, Mali, Senegal, Cameroon, Guinea-Bissau, Burkina Faso, Rwanda, and many others.",
      "Pan-Arab (black/white/green/red): Egypt, Iraq, Jordan, Kuwait, Libya, Palestine, Sudan, Syria, UAE, Yemen.",
      "Pan-Slavic (blue/white/red): Russia, Serbia, Croatia, Slovakia, Slovenia, Czech Republic.",
      "Nordic cross (off-centre cross on field): Denmark, Norway, Sweden, Finland, Iceland.",
      "Union Jack in canton: Australia, New Zealand, Fiji, Tuvalu, Solomon Islands, and many territories.",
    ],
  },

  { kind: "heading", id: "pan-arab-colours", text: "Pan-Arab colours: the Arab Revolt of 1916" },
  {
    kind: "paragraph",
    text: "The pan-Arab colour scheme — black, white, green, and red — derives from the flag designed for the Arab Revolt of 1916, led by Sharif Hussein bin Ali of Mecca with British encouragement against Ottoman rule. The four colours were chosen to represent four Arab dynasties: black for the Abbasid Caliphate, white for the Umayyad Caliphate, green for the Fatimid Caliphate, and red for the Hashemite dynasty of Sharif Hussein. The combination spread across the Arab world as nationalist movements adopted it as a shared visual language of Arab unity. Jordan, Palestine, Kuwait, Sudan, Egypt, Iraq, Syria, UAE, and Yemen all use subsets of the four colours, though in varying arrangements — horizontal stripes, triangles, and different orderings — making pan-Arab flags a family of variations on a common theme rather than a single design.",
  },
  {
    kind: "image",
    art: "jordan-flag",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c0/Flag_of_Jordan.svg/1280px-Flag_of_Jordan.svg.png",
    caption:
      "The flag of Jordan — combining the pan-Arab colours (black, white, green horizontal stripes) with a red triangle and a white seven-pointed star representing the seven verses of Al-Fatiha.",
    credit: "Wikimedia Commons / Public Domain",
  },

  {
    kind: "heading",
    id: "star-and-crescent",
    text: "The star and crescent: symbol and misconception",
  },
  {
    kind: "paragraph",
    text: "The star and crescent is the most widely recognised symbol associated with Islam on national flags, appearing on the flags of Turkey, Pakistan, Malaysia, Tunisia, Algeria, Libya, Mauritania, Comoros, Azerbaijan, Uzbekistan, and Turkmenistan. Yet the symbol is not intrinsically Islamic — it predates the religion by over a thousand years. The crescent and star appeared on coins of the Byzantine Empire and was the emblem of Constantinople. When the Ottoman Turks captured Constantinople in 1453, they adopted the city's symbols, and the Ottoman Empire's military and administrative use of the star and crescent gave it an Islamic association by historical accident rather than religious prescription. This is why many Muslim-majority nations — Indonesia, Bangladesh, Iran, Saudi Arabia, and others — do not use it.",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Saudi Arabia's flag does not use the star and crescent at all. It features the Shahada — the Islamic profession of faith — in white Arabic script on a green field, with a sword below it. The Shahada's presence makes the flag one of the few national flags that is never flown at half-mast, as lowering the religious text would be considered disrespectful.",
  },
  {
    kind: "image",
    art: "turkey-flag",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/1280px-Flag_of_Turkey.svg.png",
    caption:
      "Turkey's flag — the star and crescent on a red field, derived from Ottoman imperial symbolism that itself inherited the emblem from Byzantine Constantinople.",
    credit: "Wikimedia Commons / Public Domain",
  },

  {
    kind: "heading",
    id: "crosses-on-flags",
    text: "The cross on flags: Scandinavian, Crusader, and humanitarian",
  },
  {
    kind: "paragraph",
    text: "The cross appears on national flags in several distinct traditions. The Nordic cross has already been discussed. The Greek cross — a plus-sign with equal arms — appears on the Swiss flag (white on red) and the Red Cross emblem, which was itself derived from the Swiss flag in 1863 as a tribute to Henri Dunant, the Swiss founder of the International Committee of the Red Cross. The St George's cross — a red cross on a white field — appears on the flag of England and the flag of Georgia, representing entirely different saints and traditions. Georgia's flag uses the St George's cross in combination with four smaller crosses in each quadrant — the 'Five Cross Flag' — representing the Five Holy Wounds of Christ in Georgian Orthodox tradition.",
  },
  {
    kind: "image",
    art: "georgia-flag",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Georgia.svg/1280px-Flag_of_Georgia.svg.png",
    caption:
      "The flag of Georgia — the 'Five Cross Flag' using the St George's cross with four additional crosses, representing the Five Holy Wounds in Georgian Orthodox tradition.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "stars-on-flags", text: "Stars: counting what they mean" },
  {
    kind: "paragraph",
    text: "Stars are the most common charge on national flags globally, and their meanings vary dramatically. The United States' 50 stars represent the 50 states of the Union, added incrementally as states joined — the current arrangement dates to 1960 when Hawaii was admitted. Australia's Southern Cross constellation appears on five national flags (Australia, New Zealand, Papua New Guinea, Samoa, and Brazil), representing the nations' location in the southern hemisphere. China's five stars represent the Communist Party and the four classes it claims to represent: the working class, the peasantry, the urban petty bourgeoisie, and the national bourgeoisie. The European Union's 12 stars are not counted to match any number of member states; the design's creator, Arsène Heitz, chose 12 as a symbol of completeness and perfection rooted in Christian symbolism.",
  },
  {
    kind: "facts",
    title: "Stars on national flags",
    facts: [
      { label: "United States", value: "50 stars — one per state, arranged in rows" },
      { label: "China", value: "5 stars — Communist Party + 4 social classes" },
      {
        label: "Australia",
        value: "6 stars — Southern Cross (5) + Commonwealth Star (1, for 6 states + territories)",
      },
      {
        label: "Brazil",
        value:
          "27 stars — each representing a state or federal district, forming constellation pattern",
      },
      {
        label: "European Union",
        value: "12 stars — symbol of perfection/completeness, not member count",
      },
      { label: "Israel", value: "Star of David — six-pointed, ancient Jewish symbol" },
    ],
  },

  {
    kind: "heading",
    id: "animals-and-symbols",
    text: "Animals and emblems: what creatures say about nations",
  },
  {
    kind: "paragraph",
    text: "Animals appear on national flags as charges laden with historical and dynastic meaning. The eagle is the most common heraldic bird: the United States uses a bald eagle (coat of arms reflected on some uses), Germany's federal eagle (Bundesadler) descends from the Holy Roman Empire, Mexico's eagle devouring a serpent on a cactus comes from Aztec mythology, Poland's white eagle has been the national symbol since the 12th century, and Albania's double-headed black eagle on red derives from the seal of the Albanian hero Gjergj Kastrioti (Skanderbeg). The double-headed eagle — symbolising rule over East and West — also appears on Montenegro's flag. The dragon appears on the Welsh flag (red dragon on white and green) and the Bhutan flag (thunder dragon Druk), representing completely different cultural traditions. The sun appears on the flags of Bangladesh (red disc), Kyrgyzstan (40-rayed sun representing the 40 tribes), and Uruguay.",
  },
  {
    kind: "list",
    items: [
      "Eagle: USA, Germany, Mexico, Poland, Albania, Montenegro, Egypt, Zambia — each with distinct style and symbolism.",
      "Lion: England, Scotland (lion rampant), Sri Lanka, Ethiopia, Morocco, Bulgaria — symbol of power and royalty.",
      "Dragon: Wales (red dragon) and Bhutan (golden thunder dragon Druk) — the only two national/sub-national flags with dragons.",
      "Sun: Bangladesh (red disc), Kyrgyzstan (40-rayed sun), Uruguay, Taiwan — often represents a new dawn or national founding.",
      "Double-headed eagle: Albania and Montenegro — derived from Byzantine and medieval Albanian heraldry.",
      "Cedar / Tree: Lebanon (cedar tree on white) — the Lebanese Cedar as national symbol and biblical reference.",
    ],
  },

  { kind: "heading", id: "maps-on-flags", text: "Maps on flags: geography as identity" },
  {
    kind: "paragraph",
    text: "A small but striking group of national flags carry an outline map of the country or territory on the flag itself. Cyprus's flag shows a gold silhouette of the island on a white field — the only United Nations member state whose flag depicts a map of the entire country. Kosovo's flag, adopted in 2008, shows a golden map of Kosovo's territory on a blue field with six white stars, a design influenced by the EU flag. The Falkland Islands' flag carries the territory's coat of arms including a depiction of the islands. Diego Garcia, a British territory, has a flag showing the atoll's distinctive fish-hook shape. Maps on flags are rare partly because they are geographically contentious: Kosovo's map includes territory also claimed by Serbia, and Cyprus's map depiction occurs in the context of an island divided between two communities.",
  },
  {
    kind: "callout",
    variant: "geography-note",
    text: "Antarctica has no official flag despite a number of proposed designs. The most widely used unofficial design — a white outline of the continent on a blue field — was created by Whitney Smith in 2002 and adopted by some research stations, but no international treaty designates an official flag for the continent.",
  },

  {
    kind: "heading",
    id: "flags-that-changed",
    text: "Flags that changed: history written in cloth",
  },
  {
    kind: "paragraph",
    text: "Flag changes are political events. When Libya's Muammar Gaddafi in 1977 replaced the country's flag with a plain green rectangle — the only solid-colour national flag in the world — it was a statement of pure revolutionary ideology (green representing Islam and Gaddafi's political theories). The flag lasted 34 years, until the 2011 revolution restored the pre-Gaddafi tricolour. South Africa's 1994 flag — replacing the apartheid-era orange-white-blue — was designed in six weeks under extraordinary political pressure as a bridge between the old and new, combining ANC colours (black, green, gold) with the old South African colours (red, white, blue). The design was intended as a temporary measure but became permanent. Myanmar changed its flag in 2010, abandoning the socialist-era design for a green-yellow-red tricolour with a white star — then reverted after the 2021 military coup to the old design.",
  },
  {
    kind: "timeline",
    title: "Major flag changes in modern history",
    events: [
      {
        date: "~1370",
        text: "Denmark adopts the Dannebrog — the oldest surviving national flag design still in use.",
      },
      {
        date: "1794",
        text: "France adopts the tricolour as the Revolutionary flag; the design begins spreading across Europe.",
      },
      {
        date: "1848",
        text: "Spring of Nations: Germany, Italy, Austria, Hungary, and others adopt tricolours during the wave of nationalist revolutions.",
      },
      {
        date: "1957",
        text: "Ghana's independence: first sub-Saharan African nation adopts the pan-African colours with a black star — the template for dozens of African flags.",
      },
      {
        date: "1977",
        text: "Libya adopts a completely plain green flag under Gaddafi — the world's only solid-colour national flag, lasting until 2011.",
      },
      {
        date: "1994",
        text: "South Africa adopts a new six-colour flag designed in six weeks to represent the post-apartheid transition.",
      },
      {
        date: "2011",
        text: "Libya's Gaddafi-era green flag is replaced by the pre-1969 tricolour following the Arab Spring revolution.",
      },
      {
        date: "2015–16",
        text: "New Zealand holds a two-stage referendum on replacing its flag; voters choose to retain the existing design with Union Jack.",
      },
      {
        date: "2017",
        text: "Mauritania adds red stripes at the top and bottom of its flag to symbolise the willingness to defend the country.",
      },
    ],
  },

  {
    kind: "heading",
    id: "hardest-flags-to-distinguish",
    text: "Flags that look identical: the hardest pairs",
  },
  {
    kind: "paragraph",
    text: "Flag confusion is not a trivial problem — diplomatic incidents have arisen from misidentification. The Ireland–Ivory Coast pair is perhaps the most persistent: Ireland's tricolour (green-white-orange, vertical) and Ivory Coast's flag (orange-white-green, vertical) are mirror images of each other. At a distance, without knowing the orientation, they are indistinguishable. Romania and Chad produce an even closer match — both have nearly identical blue-yellow-red vertical tricolours, and Chad unsuccessfully complained to the United Nations about the similarity when Romania registered its design. The Australia–New Zealand confusion stems from both flags sharing the Union Jack canton and the Southern Cross constellation, but on different background colours (blue vs. dark blue vs. red ensign versions).",
  },
  {
    kind: "table",
    title: "Ten flag pairs that confuse even experts",
    columns: ["Flag A", "Flag B", "What's the same", "How to tell them apart"],
    rows: [
      [
        "Ireland",
        "Ivory Coast",
        "Green, white, orange vertical tricolour",
        "Ireland: green on left (hoist); Ivory Coast: orange on left",
      ],
      [
        "Romania",
        "Chad",
        "Blue-yellow-red vertical tricolour",
        "Chad's blue is marginally darker; nearly impossible at distance",
      ],
      [
        "New Zealand",
        "Australia",
        "Union Jack canton + Southern Cross",
        "NZ: stars on blue; AUS: larger Commonwealth star, more stars",
      ],
      [
        "Monaco",
        "Indonesia",
        "Red over white horizontal bicolour",
        "Monaco ratio ~4:5; Indonesia ratio 2:3",
      ],
      [
        "Netherlands",
        "Luxembourg",
        "Red-white-blue horizontal tricolour",
        "Luxembourg's blue is paler; different proportions",
      ],
      [
        "Norway",
        "Iceland",
        "Nordic cross, red and blue",
        "Norway: red field, white-bordered blue cross; Iceland: blue field, white-bordered red cross",
      ],
      [
        "Colombia",
        "Ecuador",
        "Yellow-blue-red horizontal tricolour (same proportions)",
        "Ecuador has a coat of arms in the centre; Colombia does not",
      ],
      [
        "Mali",
        "Guinea",
        "Green-yellow-red vertical tricolour",
        "Mali: green on left; Guinea: red on left (mirror image)",
      ],
      [
        "Haiti",
        "Liechtenstein",
        "Blue over red horizontal bicolour",
        "Haiti has a coat of arms; Liechtenstein has a gold crown (added 1937)",
      ],
      [
        "Senegal",
        "Mali with star",
        "Green-yellow-red vertical tricolour",
        "Senegal has a green star in the yellow centre; Mali does not",
      ],
    ],
  },
  {
    kind: "dualCompare",
    title: "Two common identification traps",
    leftTitle: "Chad vs Romania",
    leftItems: [
      "Both: blue-yellow-red vertical bands",
      "Chad's blue is marginally darker in theory",
      "Chad adopted current design 1959; Romania's dates to 1848",
      "Chad complained to the UN — unsuccessfully",
      "At distance, virtually indistinguishable",
    ],
    rightTitle: "Monaco vs Indonesia",
    rightItems: [
      "Both: red over white horizontal bicolour",
      "Monaco ratio ~4:5; Indonesia ratio 2:3",
      "Monaco's design dates to 1881; Indonesia's to 1945",
      "Indonesia's flag was inspired by the 13th-century Majapahit Empire",
      "The proportional difference is the only reliable distinction",
    ],
  },

  {
    kind: "heading",
    id: "nepal-flag",
    text: "Nepal: the world's only non-rectangular national flag",
  },
  {
    kind: "paragraph",
    text: "Nepal's flag is the world's only national flag that is not a rectangle or square. It consists of two stacked pennants — a larger lower triangle surmounted by a smaller upper one — creating a double-pennant shape unique among sovereign nations. The flag's crimson field with blue border comes from the colours of ancient Nepalese kingdoms. The moon in the upper pennant represents the cool high Himalayas and the royal house; the sun in the lower pennant represents the heat of the lower regions and the warrior caste. The symbolism expresses the hope that Nepal will endure as long as the sun and moon exist in the sky. The flag's unique shape caused diplomatic complications when Nepal joined the United Nations in 1955, as standard flag-printing specifications assumed rectangular dimensions.",
  },
  {
    kind: "image",
    art: "nepal-flag",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9b/Flag_of_Nepal.svg/800px-Flag_of_Nepal.svg.png",
    caption:
      "Nepal's flag — the world's only non-quadrilateral national flag, a double-pennant shape representing the union of Nepal's Himalayan and lowland regions.",
    credit: "Wikimedia Commons / Public Domain",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "Nepal's flag is so geometrically specific that the country's constitution contains an appendix with the precise mathematical construction instructions — a diagram and a set of geometric rules specifying exactly how to draw the flag from first principles. It is one of the few flags in the world defined by a geometric proof.",
  },

  { kind: "heading", id: "flag-ratios", text: "Flag dimensions and ratios: why they vary" },
  {
    kind: "facts",
    title: "National flag proportions (width : length)",
    facts: [
      { label: "Switzerland", value: "1:1 (square — the only square national flag)" },
      { label: "Nepal", value: "Non-rectangular (unique double pennant)" },
      { label: "United Kingdom", value: "1:2" },
      { label: "United States", value: "10:19 (approximately 1:1.9)" },
      { label: "France / Germany / Italy", value: "2:3 (most common ratio globally)" },
      { label: "Denmark", value: "28:37 (approximately 3:4)" },
      { label: "Japan", value: "2:3" },
      { label: "Brazil", value: "7:10" },
      { label: "Saudi Arabia", value: "2:3" },
      { label: "Australia", value: "1:2" },
    ],
  },

  { kind: "heading", id: "union-jack-derivatives", text: "The Union Jack and its descendants" },
  {
    kind: "paragraph",
    text: "More than two dozen national and territorial flags incorporate the Union Jack of the United Kingdom in their canton — the upper-left rectangle. This signals British colonial administration at some point in the territory's history, though not necessarily ongoing political ties. Australia, New Zealand, Tuvalu, Fiji, and the Solomon Islands all retain the Union Jack canton in their current national flags. The design tells you immediately that you are looking at the British Pacific: almost every flag with a Union Jack canton in the southern hemisphere is a Pacific territory or former British colony in that region. New Zealand's 2015–2016 referendum — two rounds of public voting — chose to keep the existing design over a proposed silver fern replacement, though the debate revealed deep generational divisions about colonial symbolism.",
  },
  {
    kind: "image",
    art: "australia-flag",
    externalSrc:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Flag_of_Australia_%28converted%29.svg/1280px-Flag_of_Australia_%28converted%29.svg.png",
    caption:
      "Australia's flag — Union Jack in the canton, Commonwealth Star (seven-pointed) below it, and the Southern Cross on the fly half. The pattern identifies it as a British Pacific territory at a glance.",
    credit: "Wikimedia Commons / Public Domain",
  },

  { kind: "heading", id: "good-flag-design", text: "Why good flag design matters at a distance" },
  {
    kind: "paragraph",
    text: "The North American Vexillological Association's widely cited design principles hold that a good flag should be simple enough for a child to draw from memory, use meaningful symbolism, employ only two or three basic colours, avoid lettering or seals (which disappear at distance), and be distinctive enough not to be confused with other flags. National flags frequently violate several of these rules: dozens of flags include coats of arms or lettering that become illegible at 10 metres. Seventeen national flags use only horizontal stripes with no other charges, creating identification problems even for experienced vexillologists at speed. The flags of sub-Saharan Africa — where the pan-African colours mean many flags share the same palette — are the hardest group to distinguish without close inspection of proportions and the placement of charges.",
  },
  {
    kind: "callout",
    variant: "key-idea",
    text: "The five principles of good flag design (NAVA, 2001): 1) Keep it simple; 2) Use meaningful symbolism; 3) Use two or three basic colours; 4) No lettering or seals; 5) Be distinctive. Most national flags violate at least one. The flags of San Marino, Ecuador, Andorra, Bolivia, and Haiti all include coats of arms that become invisible from any meaningful distance.",
  },

  {
    kind: "heading",
    id: "supranational-flags",
    text: "Beyond nations: supranational and movement flags",
  },
  {
    kind: "paragraph",
    text: "Not all significant flags belong to nation-states. The United Nations flag — a white world map on a light blue field, showing the globe centred on the North Pole and surrounded by olive branches — is among the most internationally recognised non-national flags. The European Union flag, 12 gold stars on a blue field, was designed by Arsène Heitz and Rémy Heitz in 1955 and adopted as the EU symbol in 1985; the 12 stars deliberately do not correspond to any number of member states, instead representing completeness and unity. The Olympic flag — five interlocked rings in blue, yellow, black, green, and red on white — was designed by Pierre de Coubertin in 1913, with the colours chosen because at least one of them appears in every national flag in the world. The Rainbow Pride flag, created by Gilbert Baker in 1978, has become one of the most widely recognised non-national flags globally, each colour carrying specific meaning: red (life), orange (healing), yellow (sunlight), green (nature), blue (serenity), and violet (spirit).",
  },
  {
    kind: "callout",
    variant: "did-you-know",
    text: "The claim that the Olympic rings' five colours appear in every national flag in the world is a persistent myth. Several flags, including those of Mauritania and Bangladesh, use colours that are not among the five ring colours. Pierre de Coubertin made the claim in 1913 but it was based on incomplete data. The rings actually represent the five inhabited continents — Africa, the Americas, Asia, Europe, and Oceania.",
  },

  { kind: "heading", id: "reading-any-flag", text: "Reading any flag in 30 seconds: the method" },
  {
    kind: "paragraph",
    text: "Flag identification becomes systematic once you apply a consistent decision tree. Start with the flag's general structure: does it have a cross (Nordic cross, Greek cross, or diagonal cross)? If yes, you are looking at Scandinavia, Switzerland, or a British-tradition country. If no cross, does it have a canton with the Union Jack? Pacific/Commonwealth. Does it show a star and crescent? Muslim-majority tradition. Does it use only horizontal or vertical coloured stripes? Check pan-Arab (black/white/green/red) or pan-African (green/gold/red). Is there an unusual shape or a map? Nepal or Cyprus. Finally, refine by counting colours, checking for charges (stars, animals, coat of arms), and noting proportions. Most flags can be placed in the correct family within five seconds; the specific nation takes a few more.",
  },
  {
    kind: "list",
    ordered: true,
    items: [
      "Cross present? → Nordic (asymmetric), Greek/Swiss (centred), or diagonal. Identifies Scandinavia, Switzerland, Jamaica, and others.",
      "Union Jack in the upper-left canton? → Commonwealth or British Pacific territory. Australia, NZ, Fiji, Tuvalu, Solomon Islands.",
      "Star and crescent? → Ottoman-Islamic tradition. Turkey, Pakistan, Malaysia, Algeria, Tunisia, Libya, Azerbaijan.",
      "Stripes only (horizontal, no charges)? → Check colour set: black/white/green/red = pan-Arab; green/gold/red = pan-African; blue/white/red = pan-Slavic.",
      "Non-rectangular shape or map? → Nepal (double pennant) or Cyprus (gold map on white).",
      "Refinement step: count stars, identify animals, check proportion ratio, look for coat of arms. Narrows from family to specific nation.",
    ],
  },

  ...editorialClosing({
    conclusion:
      "A flag is a country's shortest possible sentence about itself. Learning the structural families — tricolour, Nordic cross, pan-African, pan-Arab, Union Jack derivative, star-and-crescent — turns a visual puzzle into a readable system. Within each family, the specific colours, charges, and proportions carry the historical detail. The grammar is consistent enough that a fluent reader can identify most of the world's 195 flags by pattern recognition rather than memorisation — and misidentify a surprising number that were designed to look dangerously similar.",
    remember:
      "Red is the world's most common flag colour (~75% of flags). The Nordic cross has the vertical bar positioned left of centre, not centred. Pan-African colours (green/gold/red) reference Ethiopia's imperial flag. Nepal's flag is the world's only non-rectangular national flag. The star and crescent was a Byzantine symbol before it became associated with Islam through the Ottoman Empire.",
    quizTopic: "flags and vexillology",
  }),
];
